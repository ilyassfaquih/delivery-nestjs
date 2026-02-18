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
@Injectable()
export class CustomerService {
    constructor(
        /**
         * Equivalent to: private final CustomerRepository customerRepository;
         * TypeORM Repository = Spring Data JpaRepository
         */
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
    ) { }

    /**
     * Creates a new customer from the given DTO.
     *
     * Equivalent to: customerMapper.toEntity(dto) → save → toResponseDto(saved)
     * In NestJS, we don't need MapStruct — we map manually (TypeScript makes it easy).
     */
    async createCustomer(dto: CreateCustomerDto) {
        // Create entity from DTO (equivalent to customerMapper.toEntity(dto))
        const customer = this.customerRepository.create({
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            phone: dto.phone,
        });

        // Save (equivalent to customerRepository.save(customer))
        const saved = await this.customerRepository.save(customer);

        // Return response (equivalent to customerMapper.toResponseDto(saved))
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
}
