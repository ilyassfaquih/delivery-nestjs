import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    ManyToMany,
    JoinTable,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { Customer } from '../../customer/entities/customer.entity';
import { MenuItem } from '../../menu/entities/menu-item.entity';

/**
 * Delivery mode for an order.
 * Equivalent Spring Boot: DeliveryMode.java (enum)
 */
export enum DeliveryMode {
    DELIVERY = 'DELIVERY',
    PICKUP = 'PICKUP',
}

export enum PaymentMode {
    CARD = 'CARD',
    CASH = 'CASH',
}

export enum OrderStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    IN_TRANSIT = 'IN_TRANSIT',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}

/**
 * Represents a food order placed by a Customer.
 * An order contains one or more MenuItems.
 *
 * Equivalent Spring Boot: FoodOrder.java
 */
@Entity('food_order')
export class FoodOrder {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'delivery_time', nullable: false })
    deliveryTime: string; // Format "HH:mm"

    @Column({
        name: 'delivery_mode',
        type: 'enum',
        enum: DeliveryMode,
        nullable: false,
    })
    deliveryMode: DeliveryMode;

    @Column({
        name: 'payment_mode',
        type: 'enum',
        enum: PaymentMode,
        default: PaymentMode.CARD,
    })
    paymentMode: PaymentMode;

    @Column({ nullable: true })
    address: string;

    @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    latitude: number;

    @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    longitude: number;

    /**
     * @ManyToOne → Customer (equivalent to JPA @ManyToOne)
     * Each order belongs to one customer.
     */
    @ManyToOne(() => Customer, { eager: true })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    /**
     * @ManyToMany → MenuItem[] (equivalent to JPA @ManyToMany with @JoinTable)
     * An order can have multiple menu items.
     */
    @ManyToMany(() => MenuItem, { eager: true })
    @JoinTable({
        name: 'order_items',
        joinColumn: { name: 'order_id' },
        inverseJoinColumn: { name: 'menu_item_id' },
    })
    menuItems: MenuItem[];

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalPrice: number;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    /**
     * @ManyToOne → Customer (Driver)
     * Optional link to the driver executing the delivery.
     */
    @ManyToOne(() => Customer, { eager: true, nullable: true })
    @JoinColumn({ name: 'driver_id' })
    driver: Customer;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    /** Set when driver marks order as DELIVERED */
    @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
    deliveredAt: Date;
}
