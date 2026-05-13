import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { SeatsService } from './seats.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { QuerySeatDto } from './dto/query-seat.dto';
import { BulkCreateSeatDto } from './dto/bulk-create-seat.dto';

@Controller('seats')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) { }

  @Post('create')
  async create(@Body() createSeatDto: CreateSeatDto) {
    return await this.seatsService.create(createSeatDto);
  }

  @Post('bulk')
  async bulkCreate(@Body() bulkCreateSeatDto: BulkCreateSeatDto) {
    return await this.seatsService.bulkCreate(bulkCreateSeatDto);
  }

  @Get('get-all')
  async findAll(@Query() query: QuerySeatDto) {
    return await this.seatsService.findAll(query);
  }

  @Get('theater/:theaterId')
  async findByTheater(@Param('theaterId') theaterId: string) {
    return await this.seatsService.findByTheater(theaterId);
  }

  @Get('statistics/:theaterId')
  async getStatistics(@Param('theaterId') theaterId: string) {
    return await this.seatsService.getSeatStatistics(theaterId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.seatsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateSeatDto: UpdateSeatDto) {
    return await this.seatsService.update(id, updateSeatDto);
  }

  @Patch(':id/toggle')
  async toggleStatus(@Param('id') id: string) {
    return await this.seatsService.toggleStatus(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.seatsService.remove(id);
  }

  @Delete('bulk/:theaterId')
  async bulkDelete(
    @Param('theaterId') theaterId: string,
    @Body('rows') rows?: string[]
  ) {
    return await this.seatsService.bulkDelete(theaterId, rows);
  }

  @Patch('bulk/update/:theaterId')
  async bulkUpdate(
    @Param('theaterId') theaterId: string,
    @Body() data: { rows: string[]; updateData: any }
  ) {
    return await this.seatsService.bulkUpdate(theaterId, data.rows, data.updateData);
  }
}