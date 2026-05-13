import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDatabase } from "./db.js";
import { Admin } from "./models/Admin.js";
import { Nominee } from "./models/Nominee.js";

dotenv.config();

const nominees = [
    { name: "Aarav Mehta", party: "Progress Alliance", position: 1 },
    { name: "Diya Rao", party: "People First", position: 2 },
    { name: "Kabir Sen", party: "Green Future", position: 3 },
    { name: "Meera Iyer", party: "Civic Voice", position: 4 },
    { name: "Rohan Kapoor", party: "Unity Front", position: 5 },
];

async function main() {
    await connectDatabase();

    const passwordHash = await bcrypt.hash(
        process.env.ADMIN_PASSWORD ?? "admin123",
        10
    );

    await Admin.updateOne(
        { email: process.env.ADMIN_EMAIL ?? "admin@voteflow.local" },
        {
            $set: {
                email: process.env.ADMIN_EMAIL ?? "admin@voteflow.local",
                passwordHash,
                name: "Election Admin",
            },
        },
        { upsert: true }
    );

    for (const nominee of nominees) {
        await Nominee.updateOne(
            { position: nominee.position },
            { $set: nominee },
            { upsert: true }
        );
    }
}

main()
    .then(async () => {
        await mongoose.disconnect();
        console.log("MongoDB seed completed");
    })
    .catch(async (error) => {
        console.error(error);
        await mongoose.disconnect();
        process.exit(1);
    });
