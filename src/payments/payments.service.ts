import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from './entities/payment.entity';
import { BookingsService } from '../bookings/bookings.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    private bookingsService: BookingsService,
  ) { }

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const transactionId = 'TXN-' + Math.random().toString(36).substring(2, 12).toUpperCase();

    const payment = new this.paymentModel({
      ...createPaymentDto,
      transaction_id: transactionId,
      payment_date: new Date().toISOString(),
      payment_status: 'completed',
    });

    const savedPayment = await payment.save();

    // Update booking status
    await this.bookingsService.updateStatus(createPaymentDto.booking_id, 'confirmed');

    return savedPayment;
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentModel.find().lean().exec() as any;
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentModel.findById(id).exec();
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async findByBooking(bookingId: string): Promise<Payment[]> {
    return this.paymentModel.find({ booking_id: bookingId }).lean().exec() as any;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const updated = await this.paymentModel
      .findByIdAndUpdate(id, updatePaymentDto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.paymentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
  }
}
