import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeatAvailabilitiesService } from './seat_availabilities.service';
import { CreateSeatAvailabilityDto } from './dto/create-seat_availability.dto';
import { UpdateSeatAvailabilityDto } from './dto/update-seat_availability.dto';

@Controller('seat-availabilities')
export class SeatAvailabilitiesController {
  constructor(private readonly seatAvailabilitiesService: SeatAvailabilitiesService) { }

  @Post()
  create(@Body() createSeatAvailabilityDto: CreateSeatAvailabilityDto) {
    return this.seatAvailabilitiesService.create(createSeatAvailabilityDto);
  }

  @Get()
  async findAll() {
    return await this.seatAvailabilitiesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.seatAvailabilitiesService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateSeatAvailabilityDto: UpdateSeatAvailabilityDto) {
    return await this.seatAvailabilitiesService.update(id, updateSeatAvailabilityDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.seatAvailabilitiesService.remove(id);
  }
}
