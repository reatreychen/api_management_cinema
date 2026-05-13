import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTheaterDto } from './dto/create-theater.dto';
import { UpdateTheaterDto } from './dto/update-theater.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Theater } from './entities/theater.entity';
import { Model } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class TheatersService {
  constructor(
    @InjectModel(Theater.name) private theaterModel: Model<Theater>,
    private cloudinaryService: CloudinaryService,
  ) { }

  async create(
    createTheaterDto: CreateTheaterDto,
    files: {
      image?: Express.Multer.File[];
    },
  ) {
    try {
      let imageUrl: string | undefined = undefined;
      let imagePublicId: string | undefined = undefined;

      // Upload image if provided
      if (files.image && files.image.length > 0) {
        const imageResult = await this.cloudinaryService.uploadImage(files.image[0]);
        imageUrl = imageResult.secure_url;
        imagePublicId = imageResult.public_id;
      }

      // Create theater with uploaded image URL
      const theater = await this.theaterModel.create({
        ...createTheaterDto,
        image: imageUrl,
        imagePublicId: imagePublicId,
      });

      if (!theater) {
        throw new HttpException('Theater not created', 400);
      }

      return {
        message: 'Theater created successfully',
        theater,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      const theaters = await this.theaterModel.find().lean().exec();
      return theaters;
    } catch (error) {
      throw new BadRequestException('Error fetching theaters');
    }
  }

  async findOne(id: string) {
    try {
      const theater = await this.theaterModel.findById(id).lean().exec();
      if (!theater) {
        throw new NotFoundException(`Theater with ID ${id} not found`);
      }
      return theater;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid theater ID');
    }
  }

  async update(
    id: string,
    updateTheaterDto: UpdateTheaterDto,
    files?: {
      image?: Express.Multer.File[];
    },
  ) {
    try {
      const existingTheater = await this.theaterModel.findById(id).select('+imagePublicId');
      if (!existingTheater) {
        throw new NotFoundException('Theater not found');
      }

      let imageUrl = existingTheater.image;
      let imagePublicId = existingTheater.imagePublicId;

      // Update image if new one is provided
      if (files?.image && files.image.length > 0) {
        // Delete old image from Cloudinary if exists
        if (existingTheater.imagePublicId) {
          await this.cloudinaryService.deleteFile(existingTheater.imagePublicId, 'image');
        }

        // Upload new image
        const imageResult = await this.cloudinaryService.uploadImage(files.image[0]);
        imageUrl = imageResult.secure_url;
        imagePublicId = imageResult.public_id;
      }

      const theater = await this.theaterModel.findByIdAndUpdate(
        id,
        {
          ...updateTheaterDto,
          image: imageUrl,
          imagePublicId: imagePublicId,
        },
        { new: true }, // Return updated document
      );

      return {
        message: 'Theater updated successfully',
        theater,
        success: true,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const theater = await this.theaterModel.findById(id).select('+imagePublicId');
      if (!theater) {
        throw new NotFoundException('Theater not found');
      }

      // Delete image from Cloudinary if exists
      if (theater.imagePublicId) {
        await this.cloudinaryService.deleteFile(theater.imagePublicId, 'image');
      }

      // Delete theater from database
      await this.theaterModel.findByIdAndDelete(id);

      return {
        message: 'Theater deleted successfully',
        theater,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }
}