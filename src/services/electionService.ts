import { Types } from "mongoose";
import { Nominee } from "../models/Nominee.js";
import { Vote } from "../models/Vote.js";

export type ElectionResults = {
  totalVotes: number;
  nominees: Array<{
    id: string;
    abbreviation: string;
    name: string;
    fullName: string;
    party: string;
    leader: string;
    symbol: string;
    position: number;
    voteCount: number;
  }>;
};

export async function getElectionResults(): Promise<ElectionResults> {
  const nominees = await Nominee.find().sort({ position: 1 }).lean();
  const voteCounts = await Vote.aggregate<{ _id: Types.ObjectId; count: number }>([
    {
      $group: {
        _id: "$nomineeId",
        count: { $sum: 1 },
      },
    },
  ]);
  const countByNomineeId = new Map(
    voteCounts.map((voteCount) => [voteCount._id.toString(), voteCount.count])
  );

  const totalVotes = nominees.reduce(
    (sum, nominee) =>
      sum + (countByNomineeId.get(nominee._id.toString()) ?? 0),
    0
  );

  return {
    totalVotes,
    nominees: nominees.map((nominee) => ({
      id: nominee._id.toString(),
      abbreviation: nominee.abbreviation,
      name: nominee.name,
      fullName: nominee.fullName,
      party: nominee.party,
      leader: nominee.leader,
      symbol: nominee.symbol,
      position: nominee.position,
      voteCount: countByNomineeId.get(nominee._id.toString()) ?? 0,
    })),
  };
}

export async function castVote(userId: string, nomineeId: string) {
  if (!Types.ObjectId.isValid(nomineeId)) {
    throw new Error("NOMINEE_NOT_FOUND");
  }

  const nominee = await Nominee.findById(nomineeId).select("_id").lean();

  if (!nominee) {
    throw new Error("NOMINEE_NOT_FOUND");
  }

  try {
    await Vote.create({
      sessionId: userId,
      userId: new Types.ObjectId(userId),
      nomineeId: new Types.ObjectId(nomineeId),
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      throw new Error("USER_ALREADY_VOTED");
    }

    throw error;
  }
}

export async function getUserVote(userId: string) {
  const vote = await Vote.findOne({ userId }).select("nomineeId").lean();

  return vote?.nomineeId.toString() ?? null;
}
