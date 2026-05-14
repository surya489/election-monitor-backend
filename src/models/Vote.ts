import { Schema, model, Types } from "mongoose";

export type VoteDocument = {
    sessionId: string;
    userId: Types.ObjectId;
    nomineeId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
};

const voteSchema = new Schema<VoteDocument>(
    {
        sessionId: {
            type: String,
            required: true,
            trim: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
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

voteSchema.index({ sessionId: 1 });

export const Vote = model<VoteDocument>("Vote", voteSchema);
