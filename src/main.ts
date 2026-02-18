import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

/**
 * Application entry point.
 *
 * Equivalent Spring Boot: DeliveryApplication.java (main method)
 *
 * NestJS Note:
 *   - Spring Boot: SpringApplication.run(DeliveryApplication.class)
 *   - NestJS: NestFactory.create(AppModule)
 *
 *   - CORS in Spring Boot: CorsConfig.java (@Bean CorsFilter)
 *   - CORS in NestJS: app.enableCors({ ... })
 *
 *   - Validation in Spring Boot: automatic with @Valid
 *   - Validation in NestJS: app.useGlobalPipes(new ValidationPipe())
 *
 *   - Exception handling in Spring Boot: @RestControllerAdvice (auto-detected)
 *   - Exception handling in NestJS: app.useGlobalFilters(new GlobalExceptionFilter())
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ─── Enable CORS (equivalent to CorsConfig.java) ──────────────
  app.enableCors({
    origin: ['http://localhost:4200'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // ─── Enable Validation (equivalent to @Valid in Spring Boot) ───
  // This makes class-validator decorators work on all DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true, // Auto-transform payloads to DTO instances
    }),
  );

  // ─── Register Global Exception Filter ─────────────────────────
  // Equivalent to @RestControllerAdvice in Spring Boot
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ─── Start server on port 3000 (Spring Boot uses 8080) ────────
  await app.listen(3000);
  console.log('🚀 NestJS Delivery API running on http://localhost:3000');
}
bootstrap();
