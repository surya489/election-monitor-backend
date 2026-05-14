import type { Server } from "socket.io";
import type { ElectionResults } from "./services/electionService.js";

let socketServer: Server | null = null;

export function setSocketServer(io: Server) {
    socketServer = io;
}

export function emitResults(results: ElectionResults) {
    socketServer?.emit("results:update", results);
}
