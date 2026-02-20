import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

/**
 * Represents a registered customer who can place food orders.
 * The `code` is auto-generated on insert using a UUID.
 *
 * Equivalent Spring Boot: Customer.java (@Entity with @PrePersist)
 */
@Entity('customer')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  code: string;

  @Column({ name: 'first_name', nullable: false })
  firstName: string;

  @Column({ name: 'last_name', nullable: false })
  lastName: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  phone: string;

  @Column({ nullable: true })
  password: string;

  @Column({ default: 'CUSTOMER' })
  role: string;

  @Column({ default: false })
  isBanned: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * Generates a UUID-based customer code before inserting.
   * Equivalent to @PrePersist in JPA.
   */
  @BeforeInsert()
  generateCode() {
    if (!this.code) {
      this.code = uuidv4();
    }
  }
}
