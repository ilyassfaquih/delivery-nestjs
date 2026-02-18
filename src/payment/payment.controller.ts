import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post('create-intent')
    // @UseGuards(JwtAuthGuard) // Protect this
    async createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
        return this.paymentService.createPaymentIntent(dto.amount, dto.currency);
    }
}
