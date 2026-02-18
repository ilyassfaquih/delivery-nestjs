import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';

/**
 * Service responsible for customer registration and retrieval.
 *
 * Equivalent Spring Boot: CustomerService.java
 *
 * NestJS Note:
 *   - @Service in Spring Boot → @Injectable() in NestJS
 *   - Both use dependency injection (constructor injection)
 *   - Spring uses @Autowired / @RequiredArgsConstructor
 *   - NestJS uses constructor + @InjectRepository for TypeORM repos
 */
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomerService {
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
    ) { }

    async createCustomer(dto: CreateCustomerDto) {
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const customer = this.customerRepository.create({
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            phone: dto.phone,
            password: hashedPassword,
        });

        const saved = await this.customerRepository.save(customer);

        return {
            id: saved.id,
            code: saved.code,
            firstName: saved.firstName,
            lastName: saved.lastName,
            email: saved.email,
            phone: saved.phone,
            createdAt: saved.createdAt,
        };
    }

    async findByEmail(email: string): Promise<Customer | null> {
        return this.customerRepository.findOne({ where: { email } });
    }
}
