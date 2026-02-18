import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { FoodOrder } from './entities/food-order.entity';
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
    async createOrder(dto: CreateOrderDto) {
        // 1. Find customer by code (equivalent to customerRepository.findByCode())
        const customer = await this.customerRepository.findOne({
            where: { code: dto.customerCode },
        });

        if (!customer) {
            throw new BusinessException(
                'CUSTOMER_NOT_FOUND',
                `No customer found with code: ${dto.customerCode}`,
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

        // 3. Build and save order
        const order = this.orderRepository.create({
            customer,
            deliveryTime: dto.deliveryTime,
            deliveryMode: dto.deliveryMode,
            menuItems: items,
        });

        const saved = await this.orderRepository.save(order);

        // 4. Map to response DTO (equivalent to orderMapper.toResponseDto())
        return {
            id: saved.id,
            customerName: `${customer.firstName} ${customer.lastName}`,
            deliveryTime: saved.deliveryTime,
            deliveryMode: saved.deliveryMode,
            menuItemNames: items.map((item) => item.name),
            createdAt: saved.createdAt,
        };
    }
}
