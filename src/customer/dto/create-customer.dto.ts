import {
    IsNotEmpty,
    IsEmail,
    MinLength,
    MaxLength,
    Matches,
} from 'class-validator';

/**
 * DTO for creating a new customer.
 * Does not include `id` or `code` since those are generated server-side.
 *
 * Equivalent Spring Boot: CustomerDTO.java (record with Jakarta Validation)
 *
 * NestJS Note:
 *   - In Spring Boot, validation uses @Valid + Jakarta annotations
 *   - In NestJS, validation uses ValidationPipe + class-validator decorators
 *   - Same concept, different library!
 */
export class CreateCustomerDto {
    @IsNotEmpty({ message: 'First name is required' })
    @MinLength(2, { message: 'First name must be between 2 and 50 characters' })
    @MaxLength(50, { message: 'First name must be between 2 and 50 characters' })
    @Matches(/^[a-zA-Z\s\-']+$/, {
        message:
            'First name can only contain letters, spaces, hyphens, and apostrophes',
    })
    firstName: string;

    @IsNotEmpty({ message: 'Last name is required' })
    @MinLength(2, { message: 'Last name must be between 2 and 50 characters' })
    @MaxLength(50, { message: 'Last name must be between 2 and 50 characters' })
    @Matches(/^[a-zA-Z\s\-']+$/, {
        message:
            'Last name can only contain letters, spaces, hyphens, and apostrophes',
    })
    lastName: string;

    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email should be valid' })
    @MaxLength(100, { message: 'Email length cannot exceed 100 characters' })
    email: string;

    @IsNotEmpty({ message: 'Phone number is required' })
    @Matches(/^\+?[0-9. ()-]{7,25}$/, { message: 'Phone number is invalid' })
    phone: string;
}
