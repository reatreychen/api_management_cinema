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
  Query,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { QueryMovieDto } from './dto/query-movie.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) { }

  @Post('create')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'poster', maxCount: 1 },
        { name: 'images', maxCount: 10 },
        { name: 'trailer', maxCount: 1 },
        { name: 'videos', maxCount: 5 },
      ],
      {
        limits: {
          fileSize: 500 * 1024 * 1024, // 500MB per file (for videos/trailers)
        },
      },
    ),
  )
  async create(
    @Body() createMovieDto: CreateMovieDto,
    @UploadedFiles()
    files: {
      poster?: Express.Multer.File[];
      images?: Express.Multer.File[];
      trailer?: Express.Multer.File[];
      videos?: Express.Multer.File[];
    },
  ) {
    return await this.moviesService.create(createMovieDto, files);
  }

  @Get('get-all')
  async findAll(@Query() queryDto: QueryMovieDto) {
    return await this.moviesService.findAll(queryDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.moviesService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'poster', maxCount: 1 },
        { name: 'images', maxCount: 10 },
        { name: 'trailer', maxCount: 1 },
        { name: 'videos', maxCount: 5 },
      ],
      {
        limits: {
          fileSize: 500 * 1024 * 1024, // 500MB per file (for videos/trailers)
        },
      },
    ),
  )
  async update(
    @Param('id') id: string,
    @Body() updateMovieDto: UpdateMovieDto,
    @UploadedFiles()
    files?: {
      poster?: Express.Multer.File[];
      images?: Express.Multer.File[];
      trailer?: Express.Multer.File[];
      videos?: Express.Multer.File[];
    },
  ) {
    return await this.moviesService.update(id, updateMovieDto, files);
  }

  @Delete(':id/image')
  async removeImage(@Param('id') movieId: string, @Body('imageUrl') imageUrl: string) {
    return await this.moviesService.removeImage(movieId, imageUrl);
  }

  @Delete(':id/video')
  async removeVideo(@Param('id') movieId: string, @Body('videoUrl') videoUrl: string) {
    return await this.moviesService.removeVideo(movieId, videoUrl);
  }

  @Delete(':id/poster')
  async removePoster(@Param('id') movieId: string) {
    return await this.moviesService.removePoster(movieId);
  }

  @Delete(':id/trailer')
  async removeTrailer(@Param('id') movieId: string) {
    return await this.moviesService.removeTrailer(movieId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.moviesService.remove(id);
  }
}
