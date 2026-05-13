import { Schema, model } from "mongoose";

export type AdminDocument = {
    email: string;
    passwordHash: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
};

const adminSchema = new Schema<AdminDocument>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
        bufferCommands: false,
    }
);

export const Admin = model<AdminDocument>("Admin", adminSchema);
