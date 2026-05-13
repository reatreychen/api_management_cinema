import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Seat } from './entities/seat.entity';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { QuerySeatDto } from './dto/query-seat.dto';
import { BulkCreateSeatDto } from './dto/bulk-create-seat.dto';

@Injectable()
export class SeatsService {
  constructor(
    @InjectModel(Seat.name) private seatModel: Model<Seat>,
  ) { }

  async create(createSeatDto: CreateSeatDto) {
    try {
      // Check if seat already exists
      const existingSeat = await this.seatModel.findOne({
        theater_id: createSeatDto.theater_id,
        row_letter: createSeatDto.row_letter.toUpperCase(),
        seat_number: createSeatDto.seat_number,
      });

      if (existingSeat) {
        throw new BadRequestException(
          `Seat ${createSeatDto.row_letter}${createSeatDto.seat_number} already exists in this theater`
        );
      }

      const seat = await this.seatModel.create({
        ...createSeatDto,
        row_letter: createSeatDto.row_letter.toUpperCase(),
      });

      return {
        message: 'Seat created successfully',
        seat,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async bulkCreate(bulkCreateSeatDto: BulkCreateSeatDto) {
    try {
      const { theater_id, rows, seats_per_row, seat_type } = bulkCreateSeatDto;

      const seats: any[] = [];
      for (const row of rows) {
        for (let seatNum = 1; seatNum <= seats_per_row; seatNum++) {
          seats.push({
            theater_id: new Types.ObjectId(theater_id),
            row_letter: row.toUpperCase(),
            seat_number: seatNum,
            seat_type,
            is_active: true,
          });
        }
      }

      // Use insertMany with ordered: false to continue on duplicates
      const result: any = await this.seatModel.insertMany(seats, {
        ordered: false,
        rawResult: true
      }).catch(error => {
        // Handle duplicate key errors gracefully
        if (error.code === 11000) {
          return {
            insertedCount: error.result?.insertedCount || error.result?.nInserted || 0,
            insertedIds: error.insertedIds || [],
          };
        }
        throw error;
      });

      return {
        message: 'Seats created successfully',
        created: result.insertedCount !== undefined ? result.insertedCount : (Array.isArray(result) ? result.length : 0),
        total: seats.length,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(queryDto: QuerySeatDto) {
    try {
      const { theater_id, row_letter, seat_type, is_active, page = 1, limit = 50 } = queryDto;
      const skip = (page - 1) * limit;

      const filter: any = {};

      if (theater_id) {
        filter.theater_id = new Types.ObjectId(theater_id);
      }

      if (row_letter) {
        filter.row_letter = row_letter.toUpperCase();
      }

      if (seat_type) {
        filter.seat_type = seat_type;
      }

      if (is_active !== undefined) {
        filter.is_active = is_active;
      }

      const [seats, total] = await Promise.all([
        this.seatModel
          .find(filter)
          .populate('theater_id', 'name location')
          .skip(skip)
          .limit(limit)
          .sort({ row_letter: 1, seat_number: 1 })
          .lean()
          .exec(),
        this.seatModel.countDocuments(filter),
      ]);

      return {
        seats,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException('Error fetching seats');
    }
  }

  async findByTheater(theaterId: string) {
    try {
      const seats = await this.seatModel
        .find({ theater_id: new Types.ObjectId(theaterId) })
        .sort({ row_letter: 1, seat_number: 1 })
        .lean()
        .exec();

      // Group seats by row
      const seatsByRow = seats.reduce((acc, seat) => {
        if (!acc[seat.row_letter]) {
          acc[seat.row_letter] = [];
        }
        acc[seat.row_letter].push(seat);
        return acc;
      }, {} as Record<string, Seat[]>);

      return {
        theater_id: theaterId,
        totalSeats: seats.length,
        seatsByRow,
        rows: Object.keys(seatsByRow).sort(),
      };
    } catch (error) {
      throw new BadRequestException('Error fetching theater seats');
    }
  }


  async getTheaterCapacity(theaterId: string) {
    try {
      const seats = await this.seatModel
        .find({ theater_id: new Types.ObjectId(theaterId) })
        .sort({ row_letter: 1, seat_number: 1 })
        .lean()
        .exec();
      return seats.length;
    } catch (error) {
      throw new BadRequestException('Error fetching theater seats');
    }
  }

  async findOne(id: string) {
    try {
      const seat = await this.seatModel
        .findById(id)
        .populate('theater_id', 'name location')
        .lean()
        .exec();

      if (!seat) {
        throw new NotFoundException(`Seat with ID ${id} not found`);
      }

      return seat;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid seat ID');
    }
  }

  async update(id: string, updateSeatDto: UpdateSeatDto) {
    try {
      const existingSeat = await this.findOne(id);

      // Check for duplicate if row_letter or seat_number is being updated
      if (updateSeatDto.row_letter || updateSeatDto.seat_number) {
        const duplicateCheck = await this.seatModel.findOne({
          _id: { $ne: id },
          theater_id: existingSeat.theater_id,
          row_letter: (updateSeatDto.row_letter || existingSeat.row_letter).toUpperCase(),
          seat_number: updateSeatDto.seat_number || existingSeat.seat_number,
        });

        if (duplicateCheck) {
          throw new BadRequestException(
            `Seat ${updateSeatDto.row_letter || existingSeat.row_letter}${updateSeatDto.seat_number || existingSeat.seat_number} already exists`
          );
        }
      }

      const updateData = { ...updateSeatDto };
      if (updateSeatDto.row_letter) {
        updateData.row_letter = updateSeatDto.row_letter.toUpperCase();
      }

      const seat = await this.seatModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).populate('theater_id', 'name location');

      return {
        message: 'Seat updated successfully',
        seat,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async toggleStatus(id: string) {
    try {
      const seat = await this.findOne(id);
      const updatedSeat = await this.seatModel.findByIdAndUpdate(
        id,
        { is_active: !seat.is_active },
        { new: true }
      ).populate('theater_id', 'name location');

      if (!updatedSeat) {
        throw new NotFoundException(`Seat with ID ${id} not found`);
      }

      return {
        message: `Seat ${updatedSeat.is_active ? 'activated' : 'deactivated'} successfully`,
        seat: updatedSeat,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const seat = await this.seatModel.findByIdAndDelete(id);

      if (!seat) {
        throw new NotFoundException('Seat not found');
      }

      return {
        message: 'Seat deleted successfully',
        seat,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async bulkDelete(theaterId: string, rows?: string[]) {
    try {
      const filter: any = { theater_id: new Types.ObjectId(theaterId) };

      if (rows && rows.length > 0) {
        filter.row_letter = { $in: rows.map(r => r.toUpperCase()) };
      }

      const result = await this.seatModel.deleteMany(filter);

      return {
        message: 'Seats deleted successfully',
        deletedCount: result.deletedCount,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async bulkUpdate(theaterId: string, rows: string[], updateData: any) {
    try {
      const filter: any = { theater_id: new Types.ObjectId(theaterId) };

      if (rows && rows.length > 0) {
        filter.row_letter = { $in: rows.map(r => r.toUpperCase()) };
      }

      const result = await this.seatModel.updateMany(filter, updateData);

      return {
        message: 'Seats updated successfully',
        modifiedCount: result.modifiedCount,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getSeatStatistics(theaterId: string) {
    try {
      const stats = await this.seatModel.aggregate([
        { $match: { theater_id: new Types.ObjectId(theaterId) } },
        {
          $group: {
            _id: '$seat_type',
            count: { $sum: 1 },
            active: {
              $sum: { $cond: ['$is_active', 1, 0] }
            },
            inactive: {
              $sum: { $cond: ['$is_active', 0, 1] }
            }
          }
        }
      ]);

      const totalSeats = await this.seatModel.countDocuments({
        theater_id: new Types.ObjectId(theaterId)
      });

      return {
        theater_id: theaterId,
        totalSeats,
        byType: stats,
      };
    } catch (error) {
      throw new BadRequestException('Error fetching seat statistics');
    }
  }
}