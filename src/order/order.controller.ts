import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
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
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.CREATED)
    async createOrder(@Req() req: any, @Body() dto: CreateOrderDto) {
        return this.orderService.createOrder(req.user.userId, dto);
    }
}
