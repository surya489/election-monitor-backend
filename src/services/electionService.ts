import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { prisma } from "../prisma.js";

export type ElectionResults = {
  totalVotes: number;
  nominees: Array<{
    id: string;
    name: string;
    party: string;
    position: number;
    voteCount: number;
  }>;
};

type NomineeWithVoteCount = {
  id: string;
  name: string;
  party: string;
  position: number;
  _count: {
    votes: number;
  };
};

export async function getElectionResults(): Promise<ElectionResults> {
  const nominees = (await prisma.nominee.findMany({
    orderBy: { position: "asc" },
    include: {
      _count: {
        select: { votes: true },
      },
    },
  })) as NomineeWithVoteCount[];

  const totalVotes = nominees.reduce(
    (sum: number, nominee: NomineeWithVoteCount) => sum + nominee._count.votes,
    0
  );

  return {
    totalVotes,
    nominees: nominees.map((nominee) => ({
      id: nominee.id,
      name: nominee.name,
      party: nominee.party,
      position: nominee.position,
      voteCount: nominee._count.votes,
    })),
  };
}

export async function castVote(sessionId: string, nomineeId: string) {
  try {
    await prisma.vote.create({
      data: {
        sessionId,
        nomineeId,
      },
    });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("SESSION_ALREADY_VOTED");
    }

    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      throw new Error("NOMINEE_NOT_FOUND");
    }

    throw error;
  }
}
