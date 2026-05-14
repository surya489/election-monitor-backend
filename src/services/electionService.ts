import { Types } from "mongoose";
import { Nominee } from "../models/Nominee.js";
import { Vote } from "../models/Vote.js";

const BALLOT_ORDER = ["DMK", "ADMK", "TVK", "NTK", "PMK"];
const BALLOT_QUERY_ABBREVIATIONS = [...BALLOT_ORDER, "AIADMK"];

function canonicalAbbreviation(abbreviation: string) {
  return abbreviation === "AIADMK" ? "ADMK" : abbreviation;
}

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
  const storedNominees = await Nominee.find({
    abbreviation: { $in: BALLOT_QUERY_ABBREVIATIONS },
  })
    .sort({ position: 1 })
    .lean();
  const nominees = BALLOT_ORDER.map((abbreviation) =>
    storedNominees.find(
      (nominee) => canonicalAbbreviation(nominee.abbreviation) === abbreviation
    )
  ).filter((nominee): nominee is NonNullable<typeof nominee> => Boolean(nominee));
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
    nominees: nominees.map((nominee, index) => ({
      id: nominee._id.toString(),
      abbreviation: canonicalAbbreviation(nominee.abbreviation),
      name: canonicalAbbreviation(nominee.name),
      fullName: nominee.fullName,
      party: nominee.party,
      leader: nominee.leader,
      symbol: nominee.symbol,
      position: index + 1,
      voteCount: countByNomineeId.get(nominee._id.toString()) ?? 0,
    })),
  };
}

export async function castVote(userId: string, nomineeId: string) {
  if (!Types.ObjectId.isValid(nomineeId)) {
    throw new Error("NOMINEE_NOT_FOUND");
  }

  const nominee = await Nominee.findById(nomineeId).select("_id abbreviation").lean();

  if (
    !nominee ||
    !BALLOT_ORDER.includes(canonicalAbbreviation(nominee.abbreviation))
  ) {
    throw new Error("NOMINEE_NOT_FOUND");
  }

  try {
    // Vote.userId has a unique index, so the database enforces one accepted
    // ballot per authenticated voter even if duplicate requests arrive quickly.
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
