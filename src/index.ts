import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { authRouter } from "./routes/auth.js";
import { electionRouter } from "./routes/election.js";
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

app.use("/api/auth", authRouter);
app.use("/api", electionRouter);

io.on("connection", async (socket) => {
    const token = socket.handshake.auth.token;

    try {
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
        res.status(500).json({ message: "Something went wrong" });
    }
);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
