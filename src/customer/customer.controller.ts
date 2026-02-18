import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

/**
 * REST controller for customer registration.
 *
 * Equivalent Spring Boot: CustomerController.java
 *
 * NestJS Note:
 *   - @RestController → @Controller() (NestJS controllers return JSON by default)
 *   - @RequestMapping("/api/customers") → @Controller('api/customers')
 *   - @PostMapping → @Post()
 *   - @Valid @RequestBody → @Body() (ValidationPipe handles @Valid automatically)
 *   - ResponseEntity.status(201) → @HttpCode(201) or just return (NestJS POST = 201 by default)
 */
@Controller('api/customers')
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }

    /**
     * Registers a new customer.
     * POST /api/customers
     *
     * @param dto the customer creation payload (validated by ValidationPipe)
     * @returns HTTP 201 with the created customer
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createCustomer(@Body() dto: CreateCustomerDto) {
        return this.customerService.createCustomer(dto);
    }
}
