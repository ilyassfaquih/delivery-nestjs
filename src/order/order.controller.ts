import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req, Get, Put, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

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

    // ── Driver Endpoints ──

    @Get('pending')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('DRIVER', 'ADMIN')
    async getPendingOrders() {
        return this.orderService.getPendingOrders();
    }

    @Get('my-deliveries')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('DRIVER')
    async getMyDeliveries(@Req() req: any) {
        return this.orderService.getMyDeliveries(req.user.userId);
    }

    @Get('delivery-history')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('DRIVER')
    async getDeliveryHistory(@Req() req: any) {
        return this.orderService.getDeliveryHistory(req.user.userId);
    }

    @Put(':id/accept')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('DRIVER')
    async acceptOrder(@Param('id') id: string, @Req() req: any) {
        return this.orderService.acceptOrder(Number(id), req.user.userId);
    }

    @Put(':id/status')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('DRIVER', 'ADMIN')
    async updateOrderStatus(
        @Param('id') id: string,
        @Req() req: any,
        @Body() dto: UpdateOrderStatusDto,
    ) {
        return this.orderService.updateOrderStatus(Number(id), req.user.userId, dto.status);
    }

    // ── Admin: orders by customer, deliveries by driver ──

    @Get('admin/customer/:customerId')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    async getOrdersByCustomer(@Param('customerId') customerId: string) {
        return this.orderService.getOrdersByCustomer(Number(customerId));
    }

    @Get('admin/drivers-deliveries')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    async getDriversWithDeliveries() {
        return this.orderService.getDriversWithDeliveries();
    }
}
