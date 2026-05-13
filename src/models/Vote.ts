import { Schema, model, Types } from "mongoose";

export type VoteDocument = {
    sessionId: string;
    nomineeId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
};

const voteSchema = new Schema<VoteDocument>(
    {
        sessionId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        nomineeId: {
            type: Schema.Types.ObjectId,
            ref: "Nominee",
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
        bufferCommands: false,
    }
);

export const Vote = model<VoteDocument>("Vote", voteSchema);
