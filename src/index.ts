import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { authRouter } from "./routes/auth.js";
import { connectDatabase } from "./db.js";
import { electionRouter } from "./routes/election.js";
import { setSocketServer } from "./realtime.js";
import { getElectionResults } from "./services/electionService.js";

dotenv.config();

const app = express();

const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true,
    },
});

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

app.use(express.json());

app.get("/", (_req, res) => {
    res.send("VoteFlow API Running...");
});
setSocketServer(io);

app.use("/api/auth", authRouter);
app.use("/api", electionRouter);

io.on("connection", async (socket) => {
    const token = socket.handshake.auth.token;

    try {
        // Admin dashboards connect with their JWT and receive the current
        // result snapshot immediately, then future updates after each vote.
        jwt.verify(String(token), process.env.JWT_SECRET ?? "dev-secret");
        socket.emit("results:update", await getElectionResults());
    } catch {
        socket.disconnect(true);
    }
});

app.use(
    (
        error: Error,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction
    ) => {
        console.error(error);

        if (error.name === "MongooseServerSelectionError") {
            return res.status(503).json({
                message:
                    "Database is not reachable. Start MongoDB and run the seed command.",
            });
        }

        res.status(500).json({
            message: "Something went wrong",
            error:
                process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
);

const PORT = process.env.PORT || 5000;

connectDatabase()
    .then(() => {
        console.log("MongoDB connected");
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    });
