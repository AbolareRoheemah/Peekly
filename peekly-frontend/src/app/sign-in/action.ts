"use server";

import { prisma } from "../../../lib/prisma";

export async function createUser(userId: string) {
  console.log("createUser");
  console.log("userId", userId);
  const user = await prisma.user.create({
    data: {
      id: userId,
    },
  });
  return user;
}
