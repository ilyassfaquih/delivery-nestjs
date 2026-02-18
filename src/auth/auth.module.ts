import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CustomerModule } from '../customer/customer.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
    imports: [
        CustomerModule,
        PassportModule,
        JwtModule.register({
            secret: 'secretKey', // In production, use environment variable
            signOptions: { expiresIn: '60m' },
        }),
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
