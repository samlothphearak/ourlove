"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getVirtualLoveStats() {
  try {
    let stats = await prisma.virtualLoveMeter.findFirst();

    if (!stats) {
      stats = await prisma.virtualLoveMeter.create({
        data: { hugCount: 0, kissCount: 0 },
      });
    }

    return { success: true, data: stats };
  } catch (error) {
    console.error("Failed to fetch virtual love stats:", error);
    return {
      success: false,
      error: "Unable to load virtual love stats.",
      data: null,
    };
  }
}

export async function sendVirtualLove(type: "hug" | "kiss") {
  try {
    let stats = await prisma.virtualLoveMeter.findFirst();

    if (!stats) {
      stats = await prisma.virtualLoveMeter.create({
        data: { hugCount: 0, kissCount: 0 },
      });
    }

    const updated = await prisma.virtualLoveMeter.update({
      where: { id: stats.id },
      data:
        type === "hug"
          ? { hugCount: stats.hugCount + 1 }
          : { kissCount: stats.kissCount + 1 },
    });

    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to update virtual love stats:", error);
    return {
      success: false,
      error: "Unable to update virtual love stats.",
      data: null,
    };
  }
}
