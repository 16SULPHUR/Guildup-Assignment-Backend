// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    userId: string;
    name: string;
    email: string;
    password?: string; // Make password optional for retrieval, but required for creation
    phone: string;
    location?: string;
    profileImage?: string;
    createdAt: Date;
    // Methods
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    userId: { type: String, unique: true, default: () => uuidv4() },
    name: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },
    password: { type: String, required: true, select: false }, // select: false hides it by default
    phone: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    profileImage: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
});

// Pre-save hook to hash password
UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);