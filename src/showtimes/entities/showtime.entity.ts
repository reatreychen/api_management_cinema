import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Showtime extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Movie' })
  movie_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Theater' })
  theater_id: Types.ObjectId;

  @Prop()
  show_date: string;

  @Prop()
  show_time: string;

  @Prop()
  end_time: string;

  @Prop()
  price_standard: number;

  @Prop()
  price_premium: number;

  @Prop()
  ticket_count_available: number;

  @Prop({ default: 'scheduled' })
  status: string;
}
export const ShowtimeSchema = SchemaFactory.createForClass(Showtime);
