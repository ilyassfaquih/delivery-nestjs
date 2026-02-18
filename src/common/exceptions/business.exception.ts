import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Exception thrown when a business rule is violated.
 * Carries an error code and a human-readable description.
 *
 * Equivalent Spring Boot: BusinessException.java
 *
 * NestJS Note:
 *   - Spring Boot uses RuntimeException + @ControllerAdvice to catch it
 *   - NestJS uses HttpException (or extends it) + Exception Filters
 *   - HttpException already carries the HTTP status, so we add errorCode on top
 */
export class BusinessException extends HttpException {
    public readonly errorCode: string;
    public readonly errorDescription: string;

    constructor(
        errorCode: string,
        errorDescription: string,
        httpStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    ) {
        super(errorDescription, httpStatus);
        this.errorCode = errorCode;
        this.errorDescription = errorDescription;
    }
}
