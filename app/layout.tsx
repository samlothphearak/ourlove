import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Background from '@/components/Background';
import "leaflet/dist/leaflet.css";

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'For My Favorite Person 💖',
  description: 'A special surprise for Girlfriend Day.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.className} min-h-full bg-love-gradient text-slate-800 antialiased select-none touch-manipulation relative overflow-x-hidden`}
      >
        {/* Fixed Ambient Background Elements */}
        <Background />

        {/* Content Container (z-10 puts it safely above the background) */}
        <main className="relative z-10 min-h-screen pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] px-4">
          {children}
        </main>
      </body>
    </html>
  );
}