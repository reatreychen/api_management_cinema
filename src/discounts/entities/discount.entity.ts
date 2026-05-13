import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
@Schema({ timestamps: true })
export class Discount {
  @Prop({ unique: true })
  discount_code: string;

  @Prop()
  description: string;

  @Prop({ enum: ['percentage', 'fixed'] })
  discount_type: string;

  @Prop()
  discount_value: number;

  @Prop()
  valid_from: string;

  @Prop()
  valid_to: string;

  @Prop()
  max_uses: number;

  @Prop({ default: 0 })
  times_used: number;

  @Prop({ default: true })
  is_active: boolean;
}
export const DiscountSchema = SchemaFactory.createForClass(Discount);
