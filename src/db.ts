import mongoose from "mongoose";

export async function connectDatabase() {
    const mongoUri =
        process.env.MONGODB_URI ?? "mongodb://localhost:27017/election_monitor";

    mongoose.set("strictQuery", true);

    await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 15000,
    });
}
