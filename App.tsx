import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Mobile Pages
import MobileHomePage from './pages/MobileHomePage';
import MobileSearchPage from './pages/MobileSearchPage';
import MobileWatchPage from './pages/MobileWatchPage';
import MobileMyListPage from './pages/MobileMyListPage';
import MobileNewHotPage from './pages/MobileNewHotPage';
import MobileReadsPage from './pages/MobileReadsPage';
import MobileSettingsPage from './pages/MobileSettingsPage';
import MobileOnboarding from './pages/MobileOnboarding';

/**
 * Main App component with mobile-first routing.
 * Checks if onboarding is complete, redirects if not.
 */
export default function App() {
  const location = useLocation();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);

  // Check onboarding status on mount and route changes
  const checkOnboarding = useCallback(() => {
    const completed = localStorage.getItem('kinemora_onboarding_complete');
    setNeedsOnboarding(completed !== 'true');
  }, []);

  // Check on initial load
  useEffect(() => {
    checkOnboarding();
  }, [checkOnboarding]);

  // Re-check when navigating away from onboarding
  useEffect(() => {
    if (location.pathname !== '/onboarding') {
      checkOnboarding();
    }
  }, [location.pathname, checkOnboarding]);

  // Show loading while checking onboarding status
  if (needsOnboarding === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 bg-[#e50914] rounded flex items-center justify-center">
          <span className="text-white font-black text-2xl">K</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Onboarding - redirects to home after completion */}
      <Route
        path="/onboarding"
        element={<MobileOnboarding />}
      />

      {/* Main pages - redirect to onboarding if not complete */}
      <Route
        path="/"
        element={needsOnboarding ? <Navigate to="/onboarding" replace /> : <MobileHomePage />}
      />
      <Route
        path="/home"
        element={needsOnboarding ? <Navigate to="/onboarding" replace /> : <MobileHomePage />}
      />
      <Route path="/reads" element={<MobileReadsPage />} />
      <Route path="/new-hot" element={<MobileNewHotPage />} />
      <Route path="/my-list" element={<MobileMyListPage />} />

      {/* Filtered home views */}
      <Route path="/series" element={<MobileHomePage initialFilter="tv" />} />
      <Route path="/films" element={<MobileHomePage initialFilter="movies" />} />

      {/* Search */}
      <Route path="/search" element={<MobileSearchPage />} />

      {/* Full screen pages (no bottom nav) */}
      <Route path="/watch/:type/:id" element={<MobileWatchPage />} />
      <Route path="/settings/*" element={<MobileSettingsPage />} />

      {/* Fallback */}
      <Route
        path="*"
        element={needsOnboarding ? <Navigate to="/onboarding" replace /> : <MobileHomePage />}
      />
    </Routes>
  );
}
