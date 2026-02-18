import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerModule } from './customer/customer.module';
import { MenuModule } from './menu/menu.module';
import { OrderModule } from './order/order.module';

/**
 * Root application module.
 *
 * Equivalent Spring Boot: DeliveryApplication.java + application.properties
 *
 * NestJS Note:
 *   - Spring Boot auto-configures database from application.properties
 *   - NestJS uses TypeOrmModule.forRoot() with explicit configuration
 *   - Spring Boot auto-scans all @Entity, @Repository, @Service, @Controller
 *   - NestJS requires explicit imports of each module
 */
@Module({
  imports: [
    /**
     * Database configuration.
     * Equivalent to spring.datasource.* in application.properties
     */
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'ilyas',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'delivery_db',
      autoLoadEntities: true, // Auto-loads entities from forFeature()
      synchronize: true, // Auto-creates tables (equivalent to Liquibase in dev)
    }),

    // Import all feature modules
    CustomerModule,
    MenuModule,
    OrderModule,
  ],
})
export class AppModule { }
