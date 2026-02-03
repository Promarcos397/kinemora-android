import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import OnboardingSelection from './components/OnboardingSelection';

// Pages - using correct file names
import MobileHomePage from './pages/MobileHomePage';
import MoviesPage from './pages/MoviesPage';
import TVShowsPage from './pages/TVShowsPage';
import NewPopularPage from './pages/NewPopularPage';
import MyListPage from './pages/MyListPage';
import ReadsPage from './pages/ReadsPage';
import SettingsPage from './pages/SettingsPage';
import WatchPage from './pages/WatchPage';
import ReaderPage from './pages/ReaderPage';
import SearchResultsPage from './pages/SearchResultsPage';

/**
 * App Layout - Wraps content with BottomNav
 */
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {children}
      <BottomNav />
    </div>
  );
}

/**
 * Main App Component
 * Note: GlobalProvider and HashRouter are in index.tsx
 */
export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if first launch
  useEffect(() => {
    const onboardingComplete = localStorage.getItem('kinemora-onboarding-complete');
    if (!onboardingComplete) {
      setShowOnboarding(true);
    }
  }, []);

  // Show onboarding if needed
  if (showOnboarding) {
    return (
      <OnboardingSelection
        onComplete={() => setShowOnboarding(false)}
      />
    );
  }

  return (
    <Routes>
      {/* Main pages with bottom nav */}
      <Route path="/" element={<AppLayout><MobileHomePage /></AppLayout>} />
      <Route path="/movies" element={<AppLayout><MoviesPage /></AppLayout>} />
      <Route path="/tv-shows" element={<AppLayout><TVShowsPage /></AppLayout>} />
      <Route path="/new-popular" element={<AppLayout><NewPopularPage /></AppLayout>} />
      <Route path="/my-list" element={<AppLayout><MyListPage /></AppLayout>} />
      <Route path="/reads" element={<AppLayout><ReadsPage /></AppLayout>} />
      <Route path="/search" element={<AppLayout><SearchResultsPage /></AppLayout>} />

      {/* Full screen pages (no bottom nav) */}
      <Route path="/watch/:type/:id" element={<WatchPage />} />
      <Route path="/reader/:provider/:bookId/:chapterId" element={<ReaderPage />} />
      <Route path="/settings/*" element={<SettingsPage />} />

      {/* Fallback */}
      <Route path="*" element={<AppLayout><MobileHomePage /></AppLayout>} />
    </Routes>
  );
}
