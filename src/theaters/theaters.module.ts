import { Module } from '@nestjs/common';
import { TheatersService } from './theaters.service';
import { TheatersController } from './theaters.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Theater, TheaterSchema } from './entities/theater.entity';

import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Theater.name, schema: TheaterSchema },
    ]),
    CloudinaryModule,
  ],
  controllers: [TheatersController],
  providers: [TheatersService],
})
export class TheatersModule { }
