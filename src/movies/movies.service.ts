import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { QueryMovieDto } from './dto/query-movie.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class MoviesService {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<Movie>,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async create(
    createMovieDto: CreateMovieDto,
    files: {
      poster?: Express.Multer.File[];
      images?: Express.Multer.File[];
      trailer?: Express.Multer.File[];
      videos?: Express.Multer.File[];
    },
  ) {
    try {

      // Upload all files in parallel for maximum speed
      const [
        posterResult,
        imageResults,
        videoResults,
        trailerResult,
      ] = await Promise.all([
        files.poster && files.poster.length > 0
          ? this.cloudinaryService.uploadImage(files.poster[0])
          : Promise.resolve(null),
        files.images && files.images.length > 0
          ? Promise.all(files.images.map(file => this.cloudinaryService.uploadImage(file)))
          : Promise.resolve([]),
        files.videos && files.videos.length > 0
          ? Promise.all(files.videos.map(file => this.cloudinaryService.uploadVideo(file)))
          : Promise.resolve([]),
        files.trailer && files.trailer.length > 0
          ? this.cloudinaryService.uploadVideo(files.trailer[0])
          : Promise.resolve(null),
      ]);

      const posterUrl = posterResult?.secure_url;
      const posterPublicId = posterResult?.public_id;
      const imageUrls = (imageResults as any[]).map(r => r.secure_url);
      const imagesPublicIds = (imageResults as any[]).map(r => r.public_id);
      const videoUrls = (videoResults as any[]).map(r => r.secure_url);
      const videosPublicIds = (videoResults as any[]).map(r => r.public_id);
      const trailerUrl = (trailerResult as any)?.secure_url;
      const trailerPublicId = (trailerResult as any)?.public_id;

      const movie = await this.movieModel.create({
        title: createMovieDto.title,
        genre: createMovieDto.genre,
        description: createMovieDto.description,
        duration_minutes: createMovieDto.duration_minutes,
        rating: createMovieDto.rating,
        language: createMovieDto.language,
        release_date: new Date(createMovieDto.release_date),
        poster_url: posterUrl,
        posterPublicId: posterPublicId,
        images: imageUrls,
        imagesPublicIds: imagesPublicIds,
        videos: videoUrls,
        videosPublicIds: videosPublicIds,
        trailer_url: trailerUrl,
        trailerPublicId: trailerPublicId,
      });

      return {
        message: 'Movie created successfully',
        movie,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(queryDto: QueryMovieDto) {
    try {
      const { search, genre, rating, language, page = 1, limit = 10 } = queryDto;
      const skip = (page - 1) * limit;

      const filter: any = {};

      if (search) {
        filter.$text = { $search: search };
      }

      if (genre) {
        filter.genre = genre;
      }

      if (rating) {
        filter.rating = rating;
      }

      if (language) {
        filter.language = language;
      }

      const [movies, total] = await Promise.all([
        this.movieModel
          .find(filter)
          .skip(skip)
          .limit(limit)
          .sort({ release_date: -1 })
          .lean()
          .exec(),
        this.movieModel.countDocuments(filter),
      ]);

      return {
        movies,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException('Error fetching movies');
    }
  }

  async findOne(id: string) {
    try {
      const movie = await this.movieModel.findById(id).lean().exec();
      if (!movie) {
        throw new NotFoundException(`Movie with ID ${id} not found`);
      }
      return movie;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid movie ID');
    }
  }

  async update(
    id: string,
    updateMovieDto: UpdateMovieDto,
    files?: {
      poster?: Express.Multer.File[];
      images?: Express.Multer.File[];
      trailer?: Express.Multer.File[];
      videos?: Express.Multer.File[];
    },
  ) {
    try {
      const existingMovie = await this.movieModel
        .findById(id)
        .select('+posterPublicId +imagesPublicIds +trailerPublicId +videosPublicIds')
        .exec();

      if (!existingMovie) {
        throw new NotFoundException('Movie not found');
      }

      const updateData: any = { ...updateMovieDto };

      if (updateData.release_date) {
        updateData.release_date = new Date(updateData.release_date);
      }

      // Delete old poster/trailer and upload new files all in parallel
      const [
        newPosterResult,
        newImageResults,
        newVideoResults,
        newTrailerResult,
      ] = await Promise.all([
        // Poster: delete old then upload new
        files?.poster && files.poster.length > 0
          ? (existingMovie.posterPublicId
            ? this.cloudinaryService.deleteFile(existingMovie.posterPublicId, 'image')
            : Promise.resolve(null)
          ).then(() => this.cloudinaryService.uploadImage(files!.poster![0]))
          : Promise.resolve(null),

        // Additional images
        files?.images && files.images.length > 0
          ? Promise.all(files.images.map(file => this.cloudinaryService.uploadImage(file)))
          : Promise.resolve([]),

        // Additional videos
        files?.videos && files.videos.length > 0
          ? Promise.all(files.videos.map(file => this.cloudinaryService.uploadVideo(file)))
          : Promise.resolve([]),

        // Trailer: delete old then upload new
        files?.trailer && files.trailer.length > 0
          ? (existingMovie.trailerPublicId
            ? this.cloudinaryService.deleteFile(existingMovie.trailerPublicId, 'video')
            : Promise.resolve(null)
          ).then(() => this.cloudinaryService.uploadVideo(files!.trailer![0]))
          : Promise.resolve(null),
      ]);

      if (newPosterResult) {
        updateData.poster_url = (newPosterResult as any).secure_url;
        updateData.posterPublicId = (newPosterResult as any).public_id;
      }
      if ((newImageResults as any[]).length > 0) {
        updateData.images = [...existingMovie.images, ...(newImageResults as any[]).map(r => r.secure_url)];
        updateData.imagesPublicIds = [...(existingMovie.imagesPublicIds || []), ...(newImageResults as any[]).map(r => r.public_id)];
      }
      if ((newVideoResults as any[]).length > 0) {
        updateData.videos = [...existingMovie.videos, ...(newVideoResults as any[]).map(r => r.secure_url)];
        updateData.videosPublicIds = [...(existingMovie.videosPublicIds || []), ...(newVideoResults as any[]).map(r => r.public_id)];
      }
      if (newTrailerResult) {
        updateData.trailer_url = (newTrailerResult as any).secure_url;
        updateData.trailerPublicId = (newTrailerResult as any).public_id;
      }

      const movie = await this.movieModel.findByIdAndUpdate(id, updateData, { new: true });

      return {
        message: 'Movie updated successfully',
        movie,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async removeImage(movieId: string, imageUrl: string) {
    try {
      const movie = await this.movieModel
        .findById(movieId)
        .select('+imagesPublicIds')
        .exec();

      if (!movie) {
        throw new NotFoundException('Movie not found');
      }

      const imageIndex = movie.images.indexOf(imageUrl);
      if (imageIndex === -1) {
        throw new NotFoundException('Image not found in movie');
      }

      // Delete from Cloudinary
      const publicId = movie.imagesPublicIds[imageIndex];
      if (publicId) {
        await this.cloudinaryService.deleteFile(publicId, 'image');
      }

      // Remove from arrays
      movie.images.splice(imageIndex, 1);
      movie.imagesPublicIds.splice(imageIndex, 1);
      await movie.save();

      return {
        message: 'Image removed successfully',
        movie,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async removeVideo(movieId: string, videoUrl: string) {
    try {
      const movie = await this.movieModel
        .findById(movieId)
        .select('+videosPublicIds')
        .exec();

      if (!movie) {
        throw new NotFoundException('Movie not found');
      }

      const videoIndex = movie.videos.indexOf(videoUrl);
      if (videoIndex === -1) {
        throw new NotFoundException('Video not found in movie');
      }

      // Delete from Cloudinary
      const publicId = movie.videosPublicIds[videoIndex];
      if (publicId) {
        await this.cloudinaryService.deleteFile(publicId, 'video');
      }

      // Remove from arrays
      movie.videos.splice(videoIndex, 1);
      movie.videosPublicIds.splice(videoIndex, 1);
      await movie.save();

      return {
        message: 'Video removed successfully',
        movie,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async removePoster(movieId: string) {
    try {
      const movie = await this.movieModel
        .findById(movieId)
        .select('+posterPublicId')
        .exec();

      if (!movie) {
        throw new NotFoundException('Movie not found');
      }

      if (!movie.poster_url) {
        throw new BadRequestException('Movie does not have a poster');
      }

      // Delete from Cloudinary
      if (movie.posterPublicId) {
        await this.cloudinaryService.deleteFile(movie.posterPublicId, 'image');
      }

      // Clear fields
      movie.poster_url = undefined;
      movie.posterPublicId = undefined;
      await movie.save();

      return {
        message: 'Poster removed successfully',
        movie,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async removeTrailer(movieId: string) {
    try {
      const movie = await this.movieModel
        .findById(movieId)
        .select('+trailerPublicId')
        .exec();

      if (!movie) {
        throw new NotFoundException('Movie not found');
      }

      if (!movie.trailer_url) {
        throw new BadRequestException('Movie does not have a trailer');
      }

      // Delete from Cloudinary
      if (movie.trailerPublicId) {
        await this.cloudinaryService.deleteFile(movie.trailerPublicId, 'video');
      }

      // Clear fields
      movie.trailer_url = undefined;
      movie.trailerPublicId = undefined;
      await movie.save();

      return {
        message: 'Trailer removed successfully',
        movie,
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
      const movie = await this.movieModel
        .findById(id)
        .select('+posterPublicId +imagesPublicIds +trailerPublicId +videosPublicIds')
        .exec();

      if (!movie) {
        throw new NotFoundException('Movie not found');
      }

      // Delete poster
      if (movie.posterPublicId) {
        await this.cloudinaryService.deleteFile(movie.posterPublicId, 'image');
      }

      // Delete all images
      if (movie.imagesPublicIds && movie.imagesPublicIds.length > 0) {
        await Promise.all(
          movie.imagesPublicIds.map(publicId =>
            this.cloudinaryService.deleteFile(publicId, 'image')
          )
        );
      }

      // Delete trailer
      if (movie.trailerPublicId) {
        await this.cloudinaryService.deleteFile(movie.trailerPublicId, 'video');
      }

      // Delete all videos
      if (movie.videosPublicIds && movie.videosPublicIds.length > 0) {
        await Promise.all(
          movie.videosPublicIds.map(publicId =>
            this.cloudinaryService.deleteFile(publicId, 'video')
          )
        );
      }

      await this.movieModel.findByIdAndDelete(id);

      return {
        message: 'Movie deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }
}