import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const nominees = [
  { name: "Aarav Mehta", party: "Progress Alliance", position: 1 },
  { name: "Diya Rao", party: "People First", position: 2 },
  { name: "Kabir Sen", party: "Green Future", position: 3 },
  { name: "Meera Iyer", party: "Civic Voice", position: 4 },
  { name: "Rohan Kapoor", party: "Unity Front", position: 5 },
];

async function main() {
  const passwordHash = await bcrypt.hash(
    process.env.ADMIN_PASSWORD ?? "admin123",
    10
  );

  await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? "admin@voteflow.local" },
    update: {
      passwordHash,
      name: "Election Admin",
    },
    create: {
      email: process.env.ADMIN_EMAIL ?? "admin@voteflow.local",
      passwordHash,
      name: "Election Admin",
    },
  });

  for (const nominee of nominees) {
    await prisma.nominee.upsert({
      where: { position: nominee.position },
      update: nominee,
      create: nominee,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
