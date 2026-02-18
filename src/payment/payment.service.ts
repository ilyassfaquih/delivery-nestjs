import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
            // Let it use default or whatever is installed
        });
    }

    async createPaymentIntent(amount: number, currency: string) {
        return this.stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            automatic_payment_methods: { enabled: true },
        });
    }
}
