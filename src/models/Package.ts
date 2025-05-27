import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IPackage extends Document {
    packageId: string;
    title: string;
    courses: mongoose.Schema.Types.ObjectId[];
    creatorId: mongoose.Schema.Types.ObjectId;
    image?: string;
    createdAt: Date;
    // For bonus: total price can be calculated or stored
    // baseTotalPriceUSD?: number;
}

const PackageSchema: Schema = new Schema({
    packageId: { type: String, unique: true, default: () => uuidv4() },
    title: { type: String, required: true, trim: true },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPackage>('Package', PackageSchema);