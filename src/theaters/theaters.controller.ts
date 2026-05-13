import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { TheatersService } from './theaters.service';
import { CreateTheaterDto } from './dto/create-theater.dto';
import { UpdateTheaterDto } from './dto/update-theater.dto';

@Controller('theaters')
export class TheatersController {
  constructor(private readonly theatersService: TheatersService) {}

  @Post('create')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
    ]),
  )
  async create(
    @Body() createTheaterDto: CreateTheaterDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
    },
  ) {
    return await this.theatersService.create(createTheaterDto, files);
  }

  @Get('get-all')
  async findAll() {
    return await this.theatersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.theatersService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id') id: string,
    @Body() updateTheaterDto: UpdateTheaterDto,
    @UploadedFiles()
    files?: {
      image?: Express.Multer.File[];
    },
  ) {
    return await this.theatersService.update(id, updateTheaterDto, files);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.theatersService.remove(id);
  }
}