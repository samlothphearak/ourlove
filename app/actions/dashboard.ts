"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// Fetch Dashboard Summary Stats & Data
export async function getDashboardData() {
  try {
    const [loveNotesCount, photoMemoriesCount, openLettersCount, goalsCount, recentMemories] =
      await Promise.all([
        prisma.loveNote.count(),
        prisma.photoMemory.count(),
        prisma.openWhenLetter.count(),
        prisma.goal.count(),
        prisma.photoMemory.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
            imageUrl: true,
            caption: true,
            createdAt: true,
          },
        }),
      ]);

    return {
      success: true,
      stats: {
        loveNotesCount,
        photoMemoriesCount,
        openLettersCount,
        goalsCount,
      },
      recentMemories,
    };
  } catch (error: any) {
    console.error("Error fetching dashboard data:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch dashboard data.",
    };
  }
}

// Add a New Photo Memory (Supports File Uploads & URLs)
export async function createPhotoMemory(formData: FormData) {
  try {
    const title = (formData.get("title") as string) || "";
    const date = (formData.get("date") as string) || "";
    const location = (formData.get("location") as string) || "";
    let imageUrl = (formData.get("imageUrl") as string) || "";
    const imageFile = formData.get("imageFile") as File | null;
    const caption = (formData.get("caption") as string) || "";
    const extendedMemory = (formData.get("extendedMemory") as string) || "";

    if (!title.trim()) {
      return { success: false, error: "Title is required." };
    }

    // Process uploaded image file if provided
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = imageFile.type || "image/jpeg";
      imageUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    }

    if (!imageUrl.trim()) {
      return { success: false, error: "Please upload an image file or provide an Image URL." };
    }

    const newMemory = await prisma.photoMemory.create({
      data: {
        title: title.trim(),
        date: date.trim(),
        location: location.trim(),
        imageUrl: imageUrl.trim(),
        caption: caption.trim(),
        extendedMemory: extendedMemory.trim(),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true, data: newMemory, message: "Photo memory created successfully!" };
  } catch (error: any) {
    console.error("Error creating photo memory:", error);
    return { success: false, error: error?.message || "Failed to create memory." };
  }
}

// Delete single photo memory
export async function deletePhotoMemory(id: number) {
  try {
    await prisma.photoMemory.delete({
      where: { id: Number(id) },
    });

    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true, message: "Photo memory deleted." };
  } catch (error: any) {
    console.error("Error deleting photo memory:", error);
    return {
      success: false,
      error: error?.message || "Failed to delete memory.",
    };
  }
}

// Fetch recent Love Notes for dashboard list
export async function getLoveNotes() {
  try {
    const notes = await prisma.loveNote.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        title: true,
        content: true,
        reason: true,
        createdAt: true,
      },
    });
    return { success: true, data: notes };
  } catch (error: any) {
    console.error("Error fetching love notes:", error);
    return { success: false, error: error?.message || "Failed to fetch love notes." };
  }
}

// Delete single Love Note
export async function deleteLoveNote(id: number) {
  try {
    await prisma.loveNote.delete({
      where: { id: Number(id) },
    });

    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true, message: "Love note deleted successfully." };
  } catch (error: any) {
    console.error("Error deleting love note:", error);
    return {
      success: false,
      error: error?.message || "Failed to delete love note.",
    };
  }
}

// Bulk delete all items in a category using Prisma
export async function bulkDeleteCategory(category: string) {
  try {
    switch (category) {
      case "Photo Memories":
        await prisma.photoMemory.deleteMany({});
        break;
      case "Love Notes":
        await prisma.loveNote.deleteMany({});
        break;
      case "Goals":
        await prisma.goal.deleteMany({});
        break;
      case "Open Letters":
        await prisma.openWhenLetter.deleteMany({});
        break;
      default:
        return { success: false, error: "Invalid category specified." };
    }

    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true, message: `All ${category} have been wiped.` };
  } catch (error: any) {
    console.error("Error performing bulk delete:", error);
    return {
      success: false,
      error: error?.message || "Failed bulk delete.",
    };
  }
}