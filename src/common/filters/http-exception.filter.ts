import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { BusinessException } from '../exceptions/business.exception';

/**
 * Global exception filter that catches all exceptions and returns
 * structured error responses matching the Spring Boot error format.
 *
 * Equivalent Spring Boot: GlobalExceptionHandler.java (@RestControllerAdvice)
 *
 * NestJS Note:
 *   - Spring Boot uses @ControllerAdvice + @ExceptionHandler methods
 *   - NestJS uses @Catch() decorator + ExceptionFilter interface
 *   - Same concept: centralized error handling
 *   - We register this globally in main.ts with app.useGlobalFilters()
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        // ─── Business Exception (like CUSTOMER_NOT_FOUND) ────────────
        if (exception instanceof BusinessException) {
            return response.status(exception.getStatus()).json({
                timestamp: new Date().toISOString(),
                status: exception.getStatus(),
                error: 'Business Error',
                code: exception.errorCode,
                message: exception.errorDescription,
            });
        }

        // ─── Validation Errors (from ValidationPipe) ─────────────────
        // Equivalent to @ExceptionHandler(MethodArgumentNotValidException.class)
        if (exception instanceof BadRequestException) {
            const exceptionResponse = exception.getResponse() as any;
            const messages = exceptionResponse.message;

            // class-validator returns an array of error messages
            if (Array.isArray(messages)) {
                const fieldErrors: Record<string, string> = {};
                messages.forEach((msg: string) => {
                    // Use the first word as field hint, or just add all messages
                    fieldErrors[msg] = msg;
                });

                return response.status(HttpStatus.BAD_REQUEST).json({
                    timestamp: new Date().toISOString(),
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Validation Failed',
                    code: 'INVALID_JSON',
                    message: 'One or more fields failed validation',
                    fieldErrors: messages,
                });
            }

            return response.status(HttpStatus.BAD_REQUEST).json({
                timestamp: new Date().toISOString(),
                status: HttpStatus.BAD_REQUEST,
                error: 'Bad Request',
                code: 'BAD_REQUEST',
                message: exceptionResponse.message || 'Bad request',
            });
        }

        // ─── Other HTTP Exceptions ───────────────────────────────────
        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            return response.status(status).json({
                timestamp: new Date().toISOString(),
                status,
                error: exception.name,
                code: 'HTTP_ERROR',
                message: exception.message,
            });
        }

        // ─── Unexpected Errors ───────────────────────────────────────
        // Equivalent to @ExceptionHandler(Exception.class)
        console.error('Unhandled exception:', exception);
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            timestamp: new Date().toISOString(),
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Internal Server Error',
            code: 'INTERNAL_ERROR',
            message: 'An unexpected internal error occurred',
        });
    }
}
