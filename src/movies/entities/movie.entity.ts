import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Movie extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ type: [String], required: true })
  genre: string[];

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], select: false, default: [] })
  imagesPublicIds: string[];

  @Prop({ type: [String], default: [] })
  videos: string[];

  @Prop({ type: [String], select: false, default: [] })
  videosPublicIds: string[];

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true })
  duration_minutes: number;

  @Prop({ required: true })
  rating: string;

  @Prop({ required: true })
  language: string;

  @Prop({ required: true })
  release_date: Date;

  @Prop()
  trailer_url?: string;

  @Prop({ select: false })
  trailerPublicId?: string;

  @Prop()
  poster_url?: string;

  @Prop({ select: false })
  posterPublicId?: string;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
