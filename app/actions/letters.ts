"use server";

import { prisma } from "@/lib/prisma";

export async function getLetters() {
  try {
    const letters = await prisma.openWhenLetter.findMany({
      orderBy: { id: "asc" },
    });
    return { success: true, data: letters };
  } catch (error: any) {
    console.error("Error fetching letters:", error);
    return { success: false, error: error.message };
  }
}

export async function createLetter(data: {
  title: string;
  tag: string;
  content: string;
  bgGradient?: string;
}) {
  try {
    const letter = await prisma.openWhenLetter.create({
      data: {
        title: data.title,
        tag: data.tag,
        content: data.content,
        bgGradient: data.bgGradient || "from-rose-400 to-pink-500",
      },
    });
    return { success: true, data: letter };
  } catch (error: any) {
    console.error("Error creating letter:", error);
    return { success: false, error: error.message };
  }
}
