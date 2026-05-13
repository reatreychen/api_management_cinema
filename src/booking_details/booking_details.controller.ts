import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BookingDetailsService } from './booking_details.service';
import { CreateBookingDetailDto } from './dto/create-booking_detail.dto';
import { UpdateBookingDetailDto } from './dto/update-booking_detail.dto';

@Controller('booking-details')
export class BookingDetailsController {
  constructor(private readonly bookingDetailsService: BookingDetailsService) {}

  @Post()
  async create(@Body() createBookingDetailDto: CreateBookingDetailDto) {
    return await this.bookingDetailsService.create(createBookingDetailDto);
  }

  @Get()
  async findAll() {
    return await this.bookingDetailsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.bookingDetailsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBookingDetailDto: UpdateBookingDetailDto) {
    return await this.bookingDetailsService.update(id, updateBookingDetailDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.bookingDetailsService.remove(id);
  }
}
