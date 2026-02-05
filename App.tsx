import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Mobile Pages
import MobileHomePage from './pages/MobileHomePage';
import MobileSearchPage from './pages/MobileSearchPage';
import MobileWatchPage from './pages/MobileWatchPage';
import MobileMyListPage from './pages/MobileMyListPage';
import MobileNewHotPage from './pages/MobileNewHotPage';
import MobileReadsPage from './pages/MobileReadsPage';
import MobileSettingsPage from './pages/MobileSettingsPage';

/**
 * Main App component with mobile-first routing.
 * All pages are self-contained with their own navigation.
 * BrowserRouter and GlobalProvider are in index.tsx.
 */
export default function App() {
  return (
    <Routes>
      {/* Main pages with bottom nav */}
      <Route path="/" element={<MobileHomePage />} />
      <Route path="/home" element={<MobileHomePage />} />
      <Route path="/reads" element={<MobileReadsPage />} />
      <Route path="/new-hot" element={<MobileNewHotPage />} />
      <Route path="/my-list" element={<MobileMyListPage />} />

      {/* Filtered home views */}
      <Route path="/series" element={<MobileHomePage initialFilter="series" />} />
      <Route path="/films" element={<MobileHomePage initialFilter="films" />} />

      {/* Search */}
      <Route path="/search" element={<MobileSearchPage />} />

      {/* Full screen pages (no bottom nav) */}
      <Route path="/watch/:type/:id" element={<MobileWatchPage />} />
      <Route path="/settings/*" element={<MobileSettingsPage />} />

      {/* Fallback */}
      <Route path="*" element={<MobileHomePage />} />
    </Routes>
  );
}
