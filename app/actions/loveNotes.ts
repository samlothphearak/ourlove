"use server";

import { prisma } from "@/lib/prisma";

export async function getLoveNotes() {
  try {
    const notes = await prisma.loveNote.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: notes };
  } catch (error: any) {
    console.error("Error fetching notes:", error);
    return { success: false, error: error.message };
  }
}

export async function createLoveNote(data: {
  title: string;
  content: string;
  reason?: string | null;
}) {
  try {
    const newNote = await prisma.loveNote.create({
      data: {
        title: data.title,
        content: data.content,
        reason: data.reason || null,
      },
    });
    return { success: true, data: newNote };
  } catch (error: any) {
    console.error("Error creating note:", error);
    return { success: false, error: error.message };
  }
}
