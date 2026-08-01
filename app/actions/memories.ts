"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPhotoMemories() {
  try {
    const memories = await prisma.photoMemory.findMany({
      orderBy: { createdAt: "asc" },
      take: 25,
      select: {
        id: true,
        title: true,
        date: true,
        location: true,
        imageUrl: true,
        caption: true,
        extendedMemory: true,
        deviceName: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return {
      success: true,
      data: memories,
      message: "Memories loaded successfully.",
    };
  } catch (error: any) {
    console.error("Error fetching photo memories:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch photo memories.",
    };
  }
}

export async function createPhotoMemory(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const date = (formData.get("date") as string) || "";
    const location = (formData.get("location") as string) || "";
    const caption = (formData.get("caption") as string) || "";
    const extendedMemory = (formData.get("extendedMemory") as string) || "";
    const deviceName =
      (formData.get("deviceName") as string) || "Unknown Device"; // 👈 Extracted deviceName
    const imageFile = formData.get("imageFile") as File | null;

    // 1. Validation Checks
    if (!title?.trim()) {
      return {
        success: false,
        error: "Title is required.",
      };
    }

    if (!imageFile || !(imageFile instanceof File) || imageFile.size === 0) {
      return {
        success: false,
        error: "Please select a valid image file.",
      };
    }

    // 2. Convert File object to Base64 string for Prisma database storage
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = imageFile.type || "image/jpeg";
    const imageUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;

    // 3. Save to Database via Prisma
    const memory = await prisma.photoMemory.create({
      data: {
        title: title.trim(),
        date: date.trim(),
        location: location.trim(),
        imageUrl: imageUrl,
        caption: caption.trim(),
        extendedMemory: extendedMemory.trim(),
        deviceName: deviceName.trim(),
      },
    });

    revalidatePath("/");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: memory,
      message: "Photo memory created successfully!",
    };
  } catch (error: any) {
    console.error("Error creating photo memory:", error);
    return {
      success: false,
      error: error?.message || "Failed to save photo memory. Please try again.",
    };
  }
}
