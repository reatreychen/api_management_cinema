import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking } from './entities/booking.entity';
import { ShowtimesService } from '../showtimes/showtimes.service';
import { SeatAvailabilitiesService } from '../seat_availabilities/seat_availabilities.service';
import { BookingDetailsService } from '../booking_details/booking_details.service';
import { SeatsService } from '../seats/seats.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    private showtimesService: ShowtimesService,
    private seatAvailabilitiesService: SeatAvailabilitiesService,
    private bookingDetailsService: BookingDetailsService,
    private seatsService: SeatsService,
  ) { }

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const { seat_ids, showtime_id, total_amount, ...bookingData } = createBookingDto;

    // 1. Verify showtime and decrement tickets (Atomic)
    await this.showtimesService.decrementAvailableTickets(showtime_id, seat_ids.length);

    // 2. Create Booking
    const bookingReference = this.generateReference();
    const booking = new this.bookingModel({
      ...bookingData,
      showtime_id: new Types.ObjectId(showtime_id),
      total_amount,
      booking_reference: bookingReference,
      booking_date: new Date().toISOString(),
      booking_status: 'pending',
    });
    const savedBooking = await booking.save();

    // 3. Create Booking Details and Update Seat Availabilities
    const bookingDetails: any[] = [];
    for (const seatId of seat_ids) {
      const seat = await this.seatsService.findOne(seatId);

      bookingDetails.push({
        booking_id: savedBooking._id.toString(),
        seat_id: seatId,
        ticket_price: total_amount / seat_ids.length, // Simple split for now
        seat_type: seat.seat_type,
        ticket_number: `${bookingReference}-${seat.row_letter}${seat.seat_number}`,
      });
    }

    await this.bookingDetailsService.createMany(bookingDetails);
    await this.seatAvailabilitiesService.updateStatuses(showtime_id, seat_ids, 'booked');

    return savedBooking;
  }

  private generateReference(): string {
    return 'BK-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingModel.find()
      .populate('customer_id')
      .populate('showtime_id')
      .lean()
      .exec() as any;
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingModel.findById(id)
      .populate('customer_id')
      .populate('showtime_id')
      .exec();

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async findByUser(userId: string): Promise<Booking[]> {
    return this.bookingModel.find({ customer_id: userId })
      .populate('showtime_id')
      .sort({ createdAt: -1 })
      .lean()
      .exec() as any;
  }

  async update(id: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const updated = await this.bookingModel
      .findByIdAndUpdate(id, updateBookingDto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return updated;
  }

  async updateStatus(id: string, status: string): Promise<Booking> {
    return this.update(id, { booking_status: status });
  }

  async remove(id: string): Promise<void> {
    const result = await this.bookingModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
  }
}
