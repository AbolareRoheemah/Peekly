"use server";

import { prisma } from "../../../lib/prisma";

export async function createUser(userId: string, address: string) {
  console.log("createUser");
  console.log("userId", userId);
  console.log("address", address);
  
  // Use upsert to create user if doesn't exist, or update if exists
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {
      address: address, // Update address if user exists
    },
    create: {
      id: userId,
      address: address,
    },
  });
  return user;
}

export async function getUser(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    return { success: true, user };
  } catch (error) {
    console.error("Failed to get user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
