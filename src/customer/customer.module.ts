import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';

/**
 * NestJS Module grouping all Customer-related components.
 *
 * NestJS Note:
 *   - Spring Boot doesn't have an explicit "module" concept — it auto-scans packages.
 *   - NestJS requires explicit Module declarations.
 *   - TypeOrmModule.forFeature([Customer]) registers the Customer entity's repository
 *     (equivalent to Spring's auto-generated JpaRepository).
 *   - exports: [TypeOrmModule] allows other modules to use the Customer repository.
 */
@Module({
    imports: [TypeOrmModule.forFeature([Customer])],
    controllers: [CustomerController],
    providers: [CustomerService],
    exports: [TypeOrmModule, CustomerService], // So OrderModule can inject CustomerRepository
})
export class CustomerModule { }
