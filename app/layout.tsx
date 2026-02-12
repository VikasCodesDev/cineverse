// app/layout.tsx
// Root layout component with metadata and global providers
import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import ParticlesBackground from '@/components/ParticlesBackground';
import AudioToggle from '@/components/AudioToggle';
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: 'CineVerse',
  description: 'AI-powered web series recommendations with retro sci-fi aesthetics',
  keywords: ['web series', 'TV shows', 'recommendations', 'AI', 'streaming'],
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {/* Background particles */}
        <ParticlesBackground />
        
        {/* Navigation */}
        <Navigation />
        
        {/* Main content */}
        <main className="relative z-10">
          {children}
        </main>
        
        {/* Audio toggle */}
        <AudioToggle />
        <Footer />
      </body>
    </html>
  );
}
