// app/layout.tsx
// Root layout component with metadata and global providers
import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import ParticlesBackground from '@/components/ParticlesBackground';
import AudioToggle from '@/components/AudioToggle';
import Footer from '@/components/Footer';
import AICopilot from '@/components/ai/AICopilot';
import CursorGlow from '@/components/CursorGlow';
import { WatchlistProvider } from '@/context/WatchlistContext';

export const metadata: Metadata = {
  title: 'CineVerse — AI-Powered Series Discovery',
  description: 'Discover your next binge-worthy series with advanced AI recommendations in a retro sci-fi universe.',
  keywords: ['web series', 'TV shows', 'recommendations', 'AI', 'streaming', 'TMDB'],
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
        <WatchlistProvider>
          {/* Background particles */}
          <ParticlesBackground />
          
          {/* Custom cursor glow */}
          <CursorGlow />
          
          {/* Navigation */}
          <Navigation />
          
          {/* Main content */}
          <main className="relative z-10">
            {children}
          </main>

          {/* AI Copilot floating widget */}
          <AICopilot />
          
          {/* Audio toggle */}
          <AudioToggle />
          <Footer />
        </WatchlistProvider>
      </body>
    </html>
  );
}
