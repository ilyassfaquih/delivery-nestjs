import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';

/**
 * REST controller for placing food orders.
 *
 * Equivalent Spring Boot: OrderController.java
 */
@Controller('api/orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    /**
     * Creates a new food order.
     * POST /api/orders
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createOrder(@Body() dto: CreateOrderDto) {
        return this.orderService.createOrder(dto);
    }
}
