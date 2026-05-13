import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  customer_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Showtime' })
  showtime_id: Types.ObjectId;

  @Prop()
  booking_date: string;

  @Prop()
  total_amount: number;

  @Prop({ default: 'pending' })
  booking_status: string;

  @Prop()
  booking_reference: string;

  @Prop({ type: Types.ObjectId, ref: 'Discount', required: false })
  discount_id?: Types.ObjectId;

  @Prop()
  notes?: string;
}
export const BookingSchema = SchemaFactory.createForClass(Booking);

