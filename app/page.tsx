import HomeStoryClient from "@/components/HomeStoryClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For My Favorite Person 💖",
  description: "A special surprise for Girlfriend Day.",
  openGraph: {
    title: "For My Favorite Person 💖",
    description: "A special surprise for Girlfriend Day.",
    type: "website",
  },
};

export const revalidate = 60;

export default function HomePage() {
  return <HomeStoryClient />;
}
