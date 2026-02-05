import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import OnboardingSelection from './components/OnboardingSelection';
import MobileHomePage from './pages/MobileHomePage';
import MobileSearchPage from './pages/MobileSearchPage';
import MobileWatchPage from './pages/MobileWatchPage';
import MobileSettingsPage from './pages/MobileSettingsPage';

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
      {/* Main pages with bottom nav - all self-contained */}
      <Route path="/" element={<AppLayout><MobileHomePage /></AppLayout>} />
      <Route path="/home" element={<AppLayout><MobileHomePage /></AppLayout>} />
      <Route path="/reads" element={<AppLayout><MobileHomePage initialFilter="reads" /></AppLayout>} />
      <Route path="/new-popular" element={<AppLayout><MobileHomePage initialFilter="new" /></AppLayout>} />
      <Route path="/my-list" element={<AppLayout><MobileHomePage initialFilter="mylist" /></AppLayout>} />
      <Route path="/series" element={<AppLayout><MobileHomePage initialFilter="series" /></AppLayout>} />
      <Route path="/films" element={<AppLayout><MobileHomePage initialFilter="films" /></AppLayout>} />
      <Route path="/search" element={<AppLayout><MobileSearchPage /></AppLayout>} />

      {/* Full screen pages (no bottom nav) */}
      <Route path="/watch/:type/:id" element={<MobileWatchPage />} />
      <Route path="/settings/*" element={<MobileSettingsPage />} />

      {/* Fallback */}
      <Route path="*" element={<AppLayout><MobileHomePage /></AppLayout>} />
    </Routes>
  );
}
