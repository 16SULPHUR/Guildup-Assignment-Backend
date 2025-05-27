import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ICourse extends Document {
    courseId: string;
    title: string;
    description?: string;
    price: number; // base in USD
    image?: string;
    creatorId: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
}

const CourseSchema: Schema = new Schema({
    courseId: { type: String, unique: true, default: () => uuidv4() },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: [0, 'Price must be a positive number'] },
    image: { type: String, trim: true },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ICourse>('Course', CourseSchema);