import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodOrder } from './entities/food-order.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CustomerModule } from '../customer/customer.module';
import { MenuModule } from '../menu/menu.module';

/**
 * NestJS Module grouping all Order-related components.
 *
 * NestJS Note:
 *   - We must import CustomerModule and MenuModule to use their repositories.
 *   - In Spring Boot, @Autowired just finds any @Repository in the classpath.
 *   - In NestJS, you need explicit module imports. This is more strict but
 *     makes dependencies clearer!
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([FoodOrder]),
        CustomerModule, // Needed for CustomerRepository
        MenuModule, // Needed for MenuRepository
    ],
    controllers: [OrderController],
    providers: [OrderService],
})
export class OrderModule { }
