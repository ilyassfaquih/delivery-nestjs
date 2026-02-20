import {
    IsNotEmpty,
    IsEnum,
    IsArray,
    ArrayNotEmpty,
    IsNumber,
    Validate,
    IsOptional,
} from 'class-validator';
import { DeliveryMode, PaymentMode } from '../entities/food-order.entity';

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
    @IsOptional()
    address?: string;

    @IsOptional()
    @IsNumber({}, { message: 'Latitude must be a valid number' })
    latitude?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Longitude must be a valid number' })
    longitude?: number;

    @IsNotEmpty({ message: 'Delivery mode is required' })
    @IsEnum(DeliveryMode, { message: 'Delivery mode must be DELIVERY or PICKUP' })
    deliveryMode: DeliveryMode;

    @IsNotEmpty({ message: 'Payment mode is required' })
    @IsEnum(PaymentMode, { message: 'Payment mode must be CARD or CASH' })
    paymentMode: PaymentMode;

    @IsArray({ message: 'Menu item IDs must be an array' })
    @ArrayNotEmpty({ message: 'The order must contain at least one menu item' })
    @IsNumber({}, { each: true, message: 'Each menu item ID must be a number' })
    menuItemIds: number[];
}
