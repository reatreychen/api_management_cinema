import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Theater {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  location: string;

  @Prop()
  description?: string;

  @Prop()
  image?: string; // Cloudinary URL

  @Prop({ select: false }) // Hide from queries by default
  imagePublicId?: string; // Store publicId for deletion

  @Prop()
  capacity?: number;

  @Prop()
  type?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const TheaterSchema = SchemaFactory.createForClass(Theater);