import { Schema, model } from "mongoose";

export type NomineeDocument = {
    name: string;
    party: string;
    position: number;
    createdAt: Date;
    updatedAt: Date;
};

const nomineeSchema = new Schema<NomineeDocument>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        party: {
            type: String,
            required: true,
            trim: true,
        },
        position: {
            type: Number,
            required: true,
            unique: true,
            min: 1,
            max: 5,
        },
    },
    {
        timestamps: true,
        bufferCommands: false,
    }
);

export const Nominee = model<NomineeDocument>("Nominee", nomineeSchema);
