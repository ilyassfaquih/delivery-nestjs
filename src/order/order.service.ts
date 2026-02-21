import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { FoodOrder, OrderStatus } from './entities/food-order.entity';
import { Customer } from '../customer/entities/customer.entity';
import { MenuItem } from '../menu/entities/menu-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { BusinessException } from '../common/exceptions/business.exception';

/**
 * Service responsible for processing food orders.
 *
 * Equivalent Spring Boot: ReservationService.java
 *
 * NestJS Note:
 *   - In Spring Boot, we can inject repos from other packages automatically
 *   - In NestJS, we need to import the modules (CustomerModule, MenuModule)
 *     in OrderModule to access their repositories
 */
@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(FoodOrder)
        private readonly orderRepository: Repository<FoodOrder>,

        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,

        @InjectRepository(MenuItem)
        private readonly menuRepository: Repository<MenuItem>,
    ) { }

    /**
     * Creates a new food order for the customer identified by the given code.
     *
     * Equivalent to: ReservationService.createOrder()
     *
     * @throws BusinessException if the customer is not found
     * @throws BusinessException if no valid menu items are provided
     */
    async createOrder(userId: number, dto: CreateOrderDto) {
        // 0. Automate Delivery Time and Validate Business Hours
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        // Business hours are 08:00 - 00:00. This means it is closed from 00:01 to 07:59.
        // E.g. hours === 0 && minutes > 0 is closed (00:01 - 00:59)
        // E.g. hours >= 1 && hours <= 7 is closed.
        if ((hours === 0 && minutes > 0) || (hours >= 1 && hours <= 7)) {
            throw new BusinessException(
                'STORE_CLOSED',
                'The store is currently closed. Business hours are 08:00 - 00:00.',
                HttpStatus.BAD_REQUEST,
            );
        }

        const deliveryTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        // 1. Find customer by id
        const customer = await this.customerRepository.findOne({
            where: { id: userId },
        });

        if (!customer) {
            throw new BusinessException(
                'CUSTOMER_NOT_FOUND',
                `No customer found with id: ${userId}`,
                HttpStatus.NOT_FOUND,
            );
        }

        // 2. Find menu items by IDs (equivalent to menuRepository.findAllById())
        const items = await this.menuRepository.find({
            where: { id: In(dto.menuItemIds) },
        });

        if (items.length === 0) {
            throw new BusinessException(
                'INVALID_MENU_ITEMS',
                'None of the provided menu item IDs are valid',
                HttpStatus.BAD_REQUEST,
            );
        }

        // Create a mapped array that represents exactly what the customer ordered, including duplicates
        const orderedItems = dto.menuItemIds.map(id => {
            const item = items.find(i => i.id === id);
            if (!item) {
                throw new BusinessException(
                    'INVALID_MENU_ITEMS',
                    `Menu item ID ${id} is invalid or not available`,
                    HttpStatus.BAD_REQUEST,
                );
            }
            return item;
        });

        const totalPrice = orderedItems.reduce((sum, item) => sum + Number(item.price), 0);

        // 3. Build and save order
        const order = this.orderRepository.create({
            customer,
            deliveryTime,
            deliveryMode: dto.deliveryMode,
            paymentMode: dto.paymentMode,
            address: dto.deliveryMode === 'DELIVERY' ? dto.address : undefined,
            latitude: dto.deliveryMode === 'DELIVERY' ? dto.latitude : undefined,
            longitude: dto.deliveryMode === 'DELIVERY' ? dto.longitude : undefined,
            menuItems: orderedItems,
            totalPrice,
        });

        const saved = await this.orderRepository.save(order);

        // 4. Map to response DTO (equivalent to orderMapper.toResponseDto())
        return {
            id: saved.id,
            customerName: `${customer.firstName} ${customer.lastName}`,
            deliveryTime: saved.deliveryTime,
            deliveryMode: saved.deliveryMode,
            paymentMode: saved.paymentMode,
            menuItemNames: orderedItems.map((item) => item.name),
            totalPrice: saved.totalPrice,
            createdAt: saved.createdAt,
        };
    }

    // ── Driver Methods ──

    async getPendingOrders() {
        return this.orderRepository.find({
            where: { status: OrderStatus.PENDING },
            order: { createdAt: 'DESC' },
            relations: ['customer', 'menuItems', 'driver'],
        });
    }

    async getMyDeliveries(driverId: number) {
        return this.orderRepository.find({
            where: {
                driver: { id: driverId },
                status: In([OrderStatus.ACCEPTED, OrderStatus.IN_TRANSIT]),
            },
            order: { createdAt: 'DESC' },
            relations: ['customer', 'menuItems', 'driver'],
        });
    }

    async acceptOrder(orderId: number, driverId: number) {
        const order = await this.orderRepository.findOne({ where: { id: orderId } });
        if (!order) throw new BusinessException('NOT_FOUND', 'Order not found', HttpStatus.NOT_FOUND);

        if (order.status !== OrderStatus.PENDING) {
            throw new BusinessException('INVALID_STATE', 'Order is no longer pending', HttpStatus.BAD_REQUEST);
        }

        const driver = await this.customerRepository.findOne({ where: { id: driverId } });
        if (!driver || (driver.role !== 'DRIVER' && driver.role !== 'ADMIN')) {
            throw new BusinessException('UNAUTHORIZED', 'Invalid driver account', HttpStatus.UNAUTHORIZED);
        }

        order.driver = driver;
        order.status = OrderStatus.ACCEPTED;
        return this.orderRepository.save(order);
    }

    async updateOrderStatus(orderId: number, driverId: number, status: OrderStatus) {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['driver']
        });

        if (!order) throw new BusinessException('NOT_FOUND', 'Order not found', HttpStatus.NOT_FOUND);

        if (!order.driver || order.driver.id !== driverId) {
            throw new BusinessException('UNAUTHORIZED', 'Not assigned to this driver', HttpStatus.UNAUTHORIZED);
        }

        order.status = status;
        if (status === OrderStatus.DELIVERED) {
            order.deliveredAt = new Date();
        }
        return this.orderRepository.save(order);
    }

    async getDeliveryHistory(driverId: number) {
        return this.orderRepository.find({
            where: {
                driver: { id: driverId },
                status: OrderStatus.DELIVERED,
            },
            order: { deliveredAt: 'DESC' },
            relations: ['customer', 'menuItems', 'driver'],
        });
    }

    // ── Admin: orders by customer, deliveries by driver ──

    async getOrdersByCustomer(customerId: number) {
        return this.orderRepository.find({
            where: { customer: { id: customerId } },
            order: { createdAt: 'DESC' },
            relations: ['customer', 'menuItems', 'driver'],
        });
    }

    async getDriversWithDeliveries(): Promise<{ driver: Partial<Customer>; orders: FoodOrder[] }[]> {
        const delivered = await this.orderRepository.find({
            where: { status: OrderStatus.DELIVERED },
            order: { deliveredAt: 'DESC' },
            relations: ['customer', 'menuItems', 'driver'],
        });
        const byDriver = new Map<number, FoodOrder[]>();
        for (const order of delivered) {
            if (!order.driver) continue;
            const id = order.driver.id;
            if (!byDriver.has(id)) byDriver.set(id, []);
            byDriver.get(id)!.push(order);
        }
        return Array.from(byDriver.entries()).map(([driverId, orders]) => {
            const driver = orders[0]?.driver;
            return {
                driver: driver ? { id: driver.id, firstName: driver.firstName, lastName: driver.lastName, email: driver.email, phone: driver.phone } : { id: driverId },
                orders,
            };
        });
    }
}
