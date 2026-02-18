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

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
