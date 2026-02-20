import {
    IsNotEmpty,
    IsNumber,
    IsPositive,
    IsBoolean,
    MaxLength,
    IsOptional,
} from 'class-validator';

/**
 * DTO for creating or updating a menu item.
 *
 * Equivalent Spring Boot: MenuItemDTO.java
 */
export class CreateMenuItemDto {
    @IsNotEmpty({ message: 'Menu item name is required' })
    @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
    name: string;

    @IsNumber({}, { message: 'Price must be a number' })
    @IsPositive({ message: 'Price must be a positive value' })
    price: number;

    @IsBoolean({ message: 'Available must be a boolean' })
    available: boolean;

    @IsOptional()
    imageUrl?: string;
}
