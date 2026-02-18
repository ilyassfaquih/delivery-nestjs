import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePaymentIntentDto {
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsString()
    currency: string;
}
