import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Seat extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Theater', required: true })
  theater_id: Types.ObjectId;

  @Prop({ required: true, uppercase: true })
  row_letter: string;

  @Prop({ required: true })
  seat_number: number;

  @Prop({ 
    required: true,
    enum: ['standard', 'premium', 'vip', 'recliner'],
    default: 'standard'
  })
  seat_type: string;

  @Prop({ default: true })
  is_active: boolean;
}

export const SeatSchema = SchemaFactory.createForClass(Seat);

// Add compound index for unique seat identification
SeatSchema.index({ theater_id: 1, row_letter: 1, seat_number: 1 }, { unique: true });
// Index for queries
SeatSchema.index({ theater_id: 1, is_active: 1 });
SeatSchema.index({ seat_type: 1 });