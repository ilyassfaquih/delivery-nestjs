import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Represents an item on the restaurant menu.
 *
 * Equivalent Spring Boot: MenuItem.java
 */
@Entity('menu_item')
export class MenuItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    name: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    price: number;

    @Column({ default: true })
    available: boolean;
}
