import { Router } from "express";
import {
  requireAdmin,
  requireUser,
  type AuthenticatedRequest,
} from "../middleware/auth.js";
import { emitResults } from "../realtime.js";
import {
  castVote,
  getElectionResults,
  getUserVote,
} from "../services/electionService.js";

export const electionRouter = Router();

electionRouter.get("/nominees", async (_req, res, next) => {
  try {
    const results = await getElectionResults();
    return res.json({ nominees: results.nominees });
  } catch (error) {
    return next(error);
  }
});

electionRouter.post("/votes", requireUser, async (req, res, next) => {
  try {
    const auth = (req as AuthenticatedRequest).auth;
    const { nomineeId } = req.body as {
      nomineeId?: string;
    };

    if (!nomineeId || !auth) {
      return res
        .status(400)
        .json({ message: "Nominee and user token are required" });
    }

    await castVote(auth.id, nomineeId);
    const results = await getElectionResults();

    // Push fresh totals to connected dashboards immediately after a vote.
    emitResults(results);

    return res.status(201).json({
      message: "Vote recorded successfully",
      results,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_ALREADY_VOTED") {
      return res.status(409).json({ message: "This user has already voted" });
    }

    if (error instanceof Error && error.message === "NOMINEE_NOT_FOUND") {
      return res.status(404).json({ message: "Nominee not found" });
    }

    return next(error);
  }
});

electionRouter.get("/votes/me", requireUser, async (req, res, next) => {
  try {
    const auth = (req as AuthenticatedRequest).auth;

    if (!auth) {
      return res.status(401).json({ message: "User token is required" });
    }

    return res.json({ nomineeId: await getUserVote(auth.id) });
  } catch (error) {
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
