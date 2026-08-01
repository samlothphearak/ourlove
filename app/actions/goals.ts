"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getGoals() {
  try {
    return await prisma.goal.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch goals:", error);
    return [];
  }
}

export async function addGoal(text: string) {
  try {
    if (!text || !text.trim()) return null;
    const newGoal = await prisma.goal.create({
      data: { text: text.trim() },
    });
    revalidatePath("/");
    return newGoal;
  } catch (error) {
    console.error("Failed to add goal:", error);
    return null;
  }
}

export async function toggleGoal(id: string, completed: boolean) {
  try {
    const updated = await prisma.goal.update({
      where: { id },
      data: { completed },
    });
    revalidatePath("/");
    return updated;
  } catch (error) {
    console.error("Failed to toggle goal:", error);
    return null;
  }
}