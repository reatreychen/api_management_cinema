import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
@Schema({ timestamps: true })
export class BookingDetail {
  @Prop({ type: Types.ObjectId, ref: 'Booking' })
  booking_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Seat' })
  seat_id: Types.ObjectId;

  @Prop()
  ticket_price: number;

  @Prop()
  seat_type: string;

  @Prop({ unique: true })
  ticket_number: string;
}
export const BookingDetailSchema =
  SchemaFactory.createForClass(BookingDetail);
