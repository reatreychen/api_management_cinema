import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';
import { Model } from 'mongoose';
import { Showtime } from './entities/showtime.entity';
import { InjectModel } from '@nestjs/mongoose';

import { SeatAvailabilitiesService } from '../seat_availabilities/seat_availabilities.service';
import { SeatsService } from '../seats/seats.service';
import { QueryShowtimeDto } from './dto/query-showtime.dto';
import { CreateSeatAvailabilityDto } from '../seat_availabilities/dto/create-seat_availability.dto';

@Injectable()
export class ShowtimesService {
  constructor(
    @InjectModel(Showtime.name) private showtimeModel: Model<Showtime>,
    private seatAvailabilitiesService: SeatAvailabilitiesService,
    private seatsService: SeatsService,
  ) { }
  async create(createShowtimeDto: CreateShowtimeDto): Promise<Showtime> {
    // Validate that end_time is after show_time
    if (createShowtimeDto.show_time >= createShowtimeDto.end_time) {
      throw new BadRequestException('End time must be after show time');
    }

    // Get theater capacity if ticket_count_available not provided
    if (!createShowtimeDto.ticket_count_available) {
      const capacity = await this.seatsService.getTheaterCapacity(createShowtimeDto.theater_id.toString())
      createShowtimeDto.ticket_count_available = capacity;
    }

    const created = new this.showtimeModel(createShowtimeDto);
    const saved = await created.save();

    // Initialize seat availability for all active seats in the theater
    await this.initializeSeatAvailability(saved._id.toString(), createShowtimeDto.theater_id.toString());
    return saved;
  }

  async initializeSeatAvailability(showtimeId: string, theaterId: string): Promise<void> {
    const seatsData = await this.seatsService.findByTheater(theaterId);
    const availabilities: CreateSeatAvailabilityDto[] = [];

    for (const row of seatsData.rows) {
      for (const seat of seatsData.seatsByRow[row]) {
        availabilities.push({
          showtime_id: showtimeId,
          seat_id: (seat as any)._id.toString(),
          status: 'available',
        });
      }
    }

    if (availabilities.length > 0) {
      await this.seatAvailabilitiesService.createMany(availabilities);
    }
  }

  async findAll(query: QueryShowtimeDto): Promise<Showtime[]> {
    const filter: any = {};

    if (query.movie_id) {
      filter.movie_id = query.movie_id;
    }

    if (query.theater_id) {
      filter.theater_id = query.theater_id;
    }

    if (query.show_date) {
      filter.show_date = query.show_date;
    }
    if (query.status) {
      filter.status = query.status;
    }

    return this.showtimeModel
      .find(filter)
      .populate('movie_id', 'title')
      .populate('theater_id', 'name')
      .lean()
      .exec();

  }

  async findOne(id: string): Promise<Showtime> {
    const showtime = await this.showtimeModel
      .findById(id)
      .populate('movie_id')
      .populate('theater_id')
      .lean()
      .exec();

    if (!showtime) {
      throw new NotFoundException(`Showtime with ID ${id} not found`);
    }

    return showtime;
  }

  async findByMovie(movieId: string): Promise<Showtime[]> {
    return this.showtimeModel
      .find({ movie_id: movieId, status: { $ne: 'cancelled' } })
      .populate('theater_id')
      .sort({ show_date: 1, show_time: 1 })
      .lean()
      .exec();
  }


  async findByTheater(theaterId: string, date?: string): Promise<Showtime[]> {
    const filter: any = { theater_id: theaterId };

    if (date) {
      filter.show_date = date;
    }

    return this.showtimeModel
      .find(filter)
      .populate('movie_id')
      .sort({ show_date: 1, show_time: 1 })
      .lean()
      .exec();
  }


  async findByDate(date: string): Promise<Showtime[]> {
    return this.showtimeModel
      .find({ show_date: date, status: { $ne: 'cancelled' } })
      .populate('movie_id')
      .populate('theater_id')
      .sort({ show_time: 1 })
      .lean()
      .exec();
  }

  async findUpcoming(limit: number = 10): Promise<Showtime[]> {
    const today = new Date().toISOString().split('T')[0];

    return this.showtimeModel
      .find({
        show_date: { $gte: today },
        status: { $ne: 'cancelled' },
      })
      .populate('movie_id')
      .populate('theater_id')
      .sort({ show_date: 1, show_time: 1 })
      .limit(limit)
      .lean()
      .exec();
  }

  async update(id: string, updateDto: UpdateShowtimeDto): Promise<Showtime> {
    // Validate times if both are provided
    if (updateDto.show_time && updateDto.end_time) {
      if (updateDto.show_time >= updateDto.end_time) {
        throw new BadRequestException('End time must be after show time');
      }
    }

    const updated = await this.showtimeModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .populate('movie_id')
      .populate('theater_id')
      .exec();

    if (!updated) {
      throw new NotFoundException(`Showtime with ID ${id} not found`);
    }

    return updated;
  }

  async updateStatus(id: string, status: string): Promise<Showtime> {
    return this.update(id, { status });
  }

  async cancel(id: string): Promise<Showtime> {
    return this.updateStatus(id, 'cancelled');
  }

  async decrementAvailableTickets(id: string, count: number = 1): Promise<Showtime> {
    const showtime = await this.showtimeModel.findOneAndUpdate(
      { _id: id, ticket_count_available: { $gte: count } },
      { $inc: { ticket_count_available: -count } },
      { new: true }
    ).exec();

    if (!showtime) {
      const existing = await this.showtimeModel.findById(id).exec();
      if (!existing) {
        throw new NotFoundException(`Showtime with ID ${id} not found`);
      }
      throw new BadRequestException('Not enough tickets available');
    }

    return showtime;
  }

  async incrementAvailableTickets(id: string, count: number = 1): Promise<Showtime> {
    const showtime = await this.showtimeModel.findByIdAndUpdate(
      id,
      { $inc: { ticket_count_available: count } },
      { new: true }
    ).exec();

    if (!showtime) {
      throw new NotFoundException(`Showtime with ID ${id} not found`);
    }

    return showtime;
  }


  async remove(id: string): Promise<void> {
    const result = await this.showtimeModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Showtime with ID ${id} not found`);
    }
  }

  async getShowtimeWithAvailability(id: string): Promise<any> {
    const showtime = await this.findOne(id);
    const seatAvailability = await this.seatAvailabilitiesService.findByShowtime(id);

    return {
      ...showtime,
      seat_availability: seatAvailability,
      available_seats: seatAvailability.filter(sa => sa.status === 'available').length,
      reserved_seats: seatAvailability.filter(sa => sa.status === 'reserved').length,
      booked_seats: seatAvailability.filter(sa => sa.status === 'booked').length,
    };
  }
}
