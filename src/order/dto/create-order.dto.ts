import {
    IsNotEmpty,
    IsEnum,
    IsArray,
    ArrayNotEmpty,
    IsNumber,
    Validate,
} from 'class-validator';
import { DeliveryMode } from '../entities/food-order.entity';
import { IsValidDeliveryTime } from '../../common/validators/delivery-time.validator';

/**
 * DTO for placing a new food order.
 *
 * Equivalent Spring Boot: OrderRequestDTO.java
 *
 * NestJS Note:
 *   - @ValidDeliveryTime (custom Spring annotation) → @Validate(IsValidDeliveryTime) or custom decorator
 *   - @NotEmpty on List → @ArrayNotEmpty
 *   - @NotNull → @IsNotEmpty
 */
export class CreateOrderDto {
    @IsNotEmpty({ message: 'Customer code is required' })
    customerCode: string;

    @IsNotEmpty({ message: 'Delivery time is required' })
    @Validate(IsValidDeliveryTime, {
        message: 'Outside business hours (08:00 - 00:00)',
    })
    deliveryTime: string; // Format "HH:mm"

    @IsNotEmpty({ message: 'Delivery mode is required' })
    @IsEnum(DeliveryMode, { message: 'Delivery mode must be DELIVERY or PICKUP' })
    deliveryMode: DeliveryMode;

    @IsArray({ message: 'Menu item IDs must be an array' })
    @ArrayNotEmpty({ message: 'The order must contain at least one menu item' })
    @IsNumber({}, { each: true, message: 'Each menu item ID must be a number' })
    menuItemIds: number[];
}
