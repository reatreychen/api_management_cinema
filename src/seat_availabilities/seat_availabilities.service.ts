import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSeatAvailabilityDto } from './dto/create-seat_availability.dto';
import { UpdateSeatAvailabilityDto } from './dto/update-seat_availability.dto';
import { SeatAvailability } from './entities/seat_availability.entity';

@Injectable()
export class SeatAvailabilitiesService {
  constructor(
    @InjectModel(SeatAvailability.name) private seatAvailabilityModel: Model<SeatAvailability>,
  ) { }

  async create(createSeatAvailabilityDto: CreateSeatAvailabilityDto): Promise<SeatAvailability> {
    const createdSeatAvailability = new this.seatAvailabilityModel(createSeatAvailabilityDto);
    return createdSeatAvailability.save();
  }

  async createMany(createSeatAvailabilityDtos: CreateSeatAvailabilityDto[]): Promise<any> {
    return await this.seatAvailabilityModel.insertMany(createSeatAvailabilityDtos);
  }

  async findAll(): Promise<SeatAvailability[]> {
    return this.seatAvailabilityModel.find().exec();
  }

  async findOne(id: string): Promise<SeatAvailability> {
    const seatAvailability = await this.seatAvailabilityModel.findById(id).exec();
    if (!seatAvailability) {
      throw new NotFoundException(`SeatAvailability with ID ${id} not found`);
    }
    return seatAvailability;
  }

  async findByShowtime(showtimeId: string): Promise<SeatAvailability[]> {
    return this.seatAvailabilityModel.find({ showtime_id: showtimeId }).exec();
  }

  async updateStatuses(showtimeId: string, seatIds: string[], status: string): Promise<any> {
    return this.seatAvailabilityModel.updateMany(
      { showtime_id: showtimeId, seat_id: { $in: seatIds } },
      { status }
    ).exec();
  }

  async update(id: string, updateSeatAvailabilityDto: UpdateSeatAvailabilityDto): Promise<SeatAvailability> {
    const updatedSeatAvailability = await this.seatAvailabilityModel
      .findByIdAndUpdate(id, updateSeatAvailabilityDto, { new: true })
      .exec();
    if (!updatedSeatAvailability) {
      throw new NotFoundException(`SeatAvailability with ID ${id} not found`);
    }
    return updatedSeatAvailability;
  }

  async remove(id: string): Promise<void> {
    const result = await this.seatAvailabilityModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`SeatAvailability with ID ${id} not found`);
    }
  }
}
