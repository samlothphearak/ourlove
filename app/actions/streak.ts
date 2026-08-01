"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Get or initialize streak data
export async function getStreakData() {
  try {
    let streak = await prisma.streak.findFirst();
    if (!streak) {
      streak = await prisma.streak.create({
        data: { currentStreak: 0, petExp: 0, petLevel: 1 },
      });
    }
    return streak;
  } catch (error) {
    console.error("Failed to fetch streak:", error);
    return { currentStreak: 0, petExp: 0, petLevel: 1, lastCheckIn: null };
  }
}

// Perform daily check-in
export async function checkInStreak() {
  try {
    let streak = await prisma.streak.findFirst();
    if (!streak) {
      streak = await prisma.streak.create({
        data: { currentStreak: 1, petExp: 15, petLevel: 1, lastCheckIn: new Date() },
      });
      revalidatePath("/");
      return streak;
    }

    const now = new Date();
    const last = streak.lastCheckIn ? new Date(streak.lastCheckIn) : null;

    if (last) {
      const diffTime = now.getTime() - last.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);

      // Already checked in today
      if (diffDays < 1 && now.getDate() === last.getDate()) {
        return streak;
      }

      // Checked in yesterday -> increment streak
      if (diffDays < 2) {
        streak.currentStreak += 1;
      } else {
        // Streak broken if missed a day
        streak.currentStreak = 1;
      }
    } else {
      streak.currentStreak = 1;
    }

    // Add Exp and handle Level ups (every 50 exp = +1 level)
    const newExp = streak.petExp + 15;
    let newLevel = streak.petLevel;
    if (newExp >= newLevel * 50) {
      newLevel += 1;
    }

    const updated = await prisma.streak.update({
      where: { id: streak.id },
      data: {
        currentStreak: streak.currentStreak,
        lastCheckIn: now,
        petExp: newExp,
        petLevel: newLevel,
      },
    });

    revalidatePath("/");
    return updated;
  } catch (error) {
    console.error("Failed to check in:", error);
    return null;
  }
}