import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true })
    username: string;
    @Prop({ required: true })
    password: string;
    @Prop({ required: true })
    email: string;
    @Prop({ type: String })
    image: string;
    @Prop({ required: true, enum: ['ADMIN', 'USER'], default: 'USER' })
    role: 'ADMIN' | 'USER' = 'USER';
    @Prop({ type: String, default: null })
    refreshToken: string | null;
    @Prop({ default: Date.now })
    createdAt: Date = new Date();
    @Prop({ default: Date.now })
    updatedAt: Date = new Date();
}
export const UserSchema = SchemaFactory.createForClass(User);
