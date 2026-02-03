import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

interface MobileLayoutProps {
    children?: React.ReactNode;
}

/**
 * Mobile Layout with bottom navigation
 * No top navbar, no scrollbars, edge-to-edge design
 */
export default function MobileLayout({ children }: MobileLayoutProps) {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Main content area */}
            <main className="safe-area-bottom">
                {children || <Outlet />}
            </main>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    );
}
