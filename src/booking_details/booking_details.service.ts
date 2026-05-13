import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BookingDetail } from './entities/booking_detail.entity';
import { CreateBookingDetailDto } from './dto/create-booking_detail.dto';
import { UpdateBookingDetailDto } from './dto/update-booking_detail.dto';

@Injectable()
export class BookingDetailsService {
  constructor(
    @InjectModel(BookingDetail.name) private bookingDetailModel: Model<BookingDetail>,
  ) { }

  async create(createBookingDetailDto: CreateBookingDetailDto): Promise<BookingDetail> {
    const created = new this.bookingDetailModel(createBookingDetailDto);
    return created.save();
  }

  async createMany(createBookingDetailDtos: CreateBookingDetailDto[]): Promise<any> {
    return this.bookingDetailModel.insertMany(createBookingDetailDtos);
  }

  async findAll(): Promise<BookingDetail[]> {
    return this.bookingDetailModel.find().lean().exec() as any;
  }

  async findByBooking(bookingId: string): Promise<BookingDetail[]> {
    return this.bookingDetailModel.find({ booking_id: bookingId }).lean().exec() as any;
  }

  async findOne(id: string): Promise<BookingDetail> {
    const detail = await this.bookingDetailModel.findById(id).exec();
    if (!detail) {
      throw new NotFoundException(`BookingDetail with ID ${id} not found`);
    }
    return detail;
  }

  async update(id: string, updateBookingDetailDto: UpdateBookingDetailDto): Promise<BookingDetail> {
    const updated = await this.bookingDetailModel
      .findByIdAndUpdate(id, updateBookingDetailDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`BookingDetail with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.bookingDetailModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`BookingDetail with ID ${id} not found`);
    }
  }
}
