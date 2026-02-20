import { Controller, Post, Body, HttpCode, HttpStatus, Get, Put, Param, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

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

    /**
     * Gets all registered customers (Admin only).
     * GET /api/customers
     */
    @Get()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    async getAllCustomers() {
        return this.customerService.findAll();
    }

    /**
     * Toggles a ban on a specific customer (Admin only).
     * PUT /api/customers/:id/ban
     */
    @Put(':id/ban')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    async toggleCustomerBan(@Param('id') id: string) {
        return this.customerService.toggleBan(+id);
    }
}
