import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDatabase } from "./db.js";
import { Admin } from "./models/Admin.js";
import { Nominee } from "./models/Nominee.js";
import { Vote } from "./models/Vote.js";

dotenv.config();

const nominees = [
    {
        abbreviation: "DMK",
        name: "DMK",
        fullName: "Dravida Munnetra Kazhagam",
        party: "Dravida Munnetra Kazhagam",
        leader: "M. K. Stalin",
        symbol: "Rising Sun",
        position: 1,
    },
    {
        abbreviation: "AIADMK",
        name: "AIADMK",
        fullName: "All India Anna Dravida Munnetra Kazhagam",
        party: "All India Anna Dravida Munnetra Kazhagam",
        leader: "Edappadi K. Palaniswami",
        symbol: "Two Leaves",
        position: 2,
    },
    {
        abbreviation: "TVK",
        name: "TVK",
        fullName: "Tamilaga Vettri Kazhagam",
        party: "Tamilaga Vettri Kazhagam",
        leader: "Vijay",
        symbol: "Whistle",
        position: 3,
    },
    {
        abbreviation: "BJP Tamil Nadu",
        name: "BJP Tamil Nadu",
        fullName: "Bharatiya Janata Party",
        party: "Bharatiya Janata Party",
        leader: "K. Annamalai",
        symbol: "Lotus",
        position: 4,
    },
    {
        abbreviation: "Congress",
        name: "Congress",
        fullName: "Indian National Congress",
        party: "Indian National Congress",
        leader: "K. Selvaperunthagai",
        symbol: "Hand",
        position: 5,
    },
    {
        abbreviation: "NTK",
        name: "NTK",
        fullName: "Naam Tamilar Katchi",
        party: "Naam Tamilar Katchi",
        leader: "Seeman",
        symbol: "Farmer",
        position: 6,
    },
    {
        abbreviation: "PMK",
        name: "PMK",
        fullName: "Pattali Makkal Katchi",
        party: "Pattali Makkal Katchi",
        leader: "Anbumani Ramadoss",
        symbol: "Mango",
        position: 7,
    },
    {
        abbreviation: "VCK",
        name: "VCK",
        fullName: "Viduthalai Chiruthaigal Katchi",
        party: "Viduthalai Chiruthaigal Katchi",
        leader: "Thol. Thirumavalavan",
        symbol: "Pot",
        position: 8,
    },
    {
        abbreviation: "AMMK",
        name: "AMMK",
        fullName: "Amma Makkal Munnettra Kazagam",
        party: "Amma Makkal Munnettra Kazagam",
        leader: "T. T. V. Dhinakaran",
        symbol: "Pressure Cooker",
        position: 9,
    },
    {
        abbreviation: "DMDK",
        name: "DMDK",
        fullName: "Desiya Murpokku Dravida Kazhagam",
        party: "Desiya Murpokku Dravida Kazhagam",
        leader: "Premalatha Vijayakanth",
        symbol: "Drum",
        position: 10,
    },
    {
        abbreviation: "MDMK",
        name: "MDMK",
        fullName: "Marumalarchi Dravida Munnetra Kazhagam",
        party: "Marumalarchi Dravida Munnetra Kazhagam",
        leader: "Vaiko",
        symbol: "Top",
        position: 11,
    },
    {
        abbreviation: "MNM",
        name: "MNM",
        fullName: "Makkal Needhi Maiam",
        party: "Makkal Needhi Maiam",
        leader: "Kamal Haasan",
        symbol: "Battery Torch",
        position: 12,
    },
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

    await Vote.deleteMany({});
    await Nominee.deleteMany({});

    for (const nominee of nominees) {
        await Nominee.updateOne(
            { abbreviation: nominee.abbreviation },
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
