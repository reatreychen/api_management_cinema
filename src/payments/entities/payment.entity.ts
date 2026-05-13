import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Booking' })
  booking_id: Types.ObjectId;

  @Prop()
  payment_method: string;

  @Prop()
  amount: number;

  @Prop()
  payment_date: string;

  @Prop({ default: 'pending' })
  payment_status: string;

  @Prop()
  transaction_id: string;

  @Prop()
  notes?: string;
}
export const PaymentSchema = SchemaFactory.createForClass(Payment);

