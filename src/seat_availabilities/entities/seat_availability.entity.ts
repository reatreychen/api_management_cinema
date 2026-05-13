import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class SeatAvailability extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Showtime', index: true })
  showtime_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Seat' })
  seat_id: Types.ObjectId;

  @Prop({ enum: ['available', 'reserved', 'booked'], default: 'available' })
  status: string;
}
export const SeatAvailabilitySchema =
  SchemaFactory.createForClass(SeatAvailability);
