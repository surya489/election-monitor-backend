import { Schema, model } from "mongoose";

export type NomineeDocument = {
    abbreviation: string;
    name: string;
    fullName: string;
    party: string;
    leader: string;
    symbol: string;
    position: number;
    createdAt: Date;
    updatedAt: Date;
};

const nomineeSchema = new Schema<NomineeDocument>(
    {
        abbreviation: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        party: {
            type: String,
            required: true,
            trim: true,
        },
        leader: {
            type: String,
            required: true,
            trim: true,
        },
        symbol: {
            type: String,
            required: true,
            trim: true,
        },
        position: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    {
        timestamps: true,
        bufferCommands: false,
    }
);

nomineeSchema.index({ position: 1 });

export const Nominee = model<NomineeDocument>("Nominee", nomineeSchema);
