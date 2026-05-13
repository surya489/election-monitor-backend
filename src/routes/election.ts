import { Router } from "express";
import { io } from "../index.js";
import { requireAdmin } from "../middleware/auth.js";
import { castVote, getElectionResults } from "../services/electionService.js";

export const electionRouter = Router();

electionRouter.get("/nominees", async (_req, res, next) => {
  try {
    const results = await getElectionResults();
    return res.json({ nominees: results.nominees });
  } catch (error) {
    return next(error);
  }
});

electionRouter.post("/votes", async (req, res, next) => {
  try {
    const { nomineeId, sessionId } = req.body as {
      nomineeId?: string;
      sessionId?: string;
    };

    if (!nomineeId || !sessionId) {
      return res
        .status(400)
        .json({ message: "Nominee and session id are required" });
    }

    await castVote(sessionId, nomineeId);
    const results = await getElectionResults();

    // Push fresh totals to connected admin dashboards immediately after a vote.
    io.emit("results:update", results);

    return res.status(201).json({
      message: "Vote recorded successfully",
      results,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "SESSION_ALREADY_VOTED") {
      return res.status(409).json({ message: "This session has already voted" });
    }

    if (error instanceof Error && error.message === "NOMINEE_NOT_FOUND") {
      return res.status(404).json({ message: "Nominee not found" });
    }

    return next(error);
  }
});

electionRouter.get("/results", requireAdmin, async (_req, res, next) => {
  try {
    return res.json(await getElectionResults());
  } catch (error) {
    return next(error);
  }
});
