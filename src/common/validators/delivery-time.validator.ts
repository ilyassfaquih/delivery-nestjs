import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Custom validator that checks if delivery time is within business hours (08:00 - 00:00).
 *
 * Equivalent Spring Boot: DeliveryTimeValidator.java + @ValidDeliveryTime annotation
 *
 * NestJS Note:
 *   - In Spring Boot, we create a custom annotation + ConstraintValidator
 *   - In NestJS, we create a class implementing ValidatorConstraintInterface
 *   - Usage: @Validate(IsValidDeliveryTime) on the DTO field
 */
@ValidatorConstraint({ name: 'isValidDeliveryTime', async: false })
export class IsValidDeliveryTime implements ValidatorConstraintInterface {
    validate(time: string): boolean {
        if (!time) return true; // Let @IsNotEmpty handle null/empty

        // Parse "HH:mm" format
        const parts = time.split(':');
        if (parts.length !== 2) return false;

        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);

        if (isNaN(hours) || isNaN(minutes)) return false;
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return false;

        // Valid if exactly midnight (00:00) or at/after 08:00
        // This excludes the range 00:01 - 07:59
        if (hours === 0 && minutes === 0) return true; // midnight OK
        if (hours >= 8) return true; // 08:00+ OK
        return false; // 00:01 - 07:59 NOT OK
    }

    defaultMessage(): string {
        return 'Delivery time must be between 08:00 and 00:00 (midnight)';
    }
}
