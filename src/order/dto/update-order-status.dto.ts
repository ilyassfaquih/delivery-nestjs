import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../entities/food-order.entity';

export class UpdateOrderStatusDto {
    @IsNotEmpty()
    @IsEnum(OrderStatus, { message: 'Valid status required (PENDING, ACCEPTED, IN_TRANSIT, DELIVERED, CANCELLED)' })
    status: OrderStatus;
}
