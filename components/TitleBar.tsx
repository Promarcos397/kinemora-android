import React from 'react';
import { useTitle } from '../context/TitleContext';

interface TitleBarProps {
    isOverlay?: boolean;
}

const TitleBar: React.FC<TitleBarProps> = ({ isOverlay = false }) => {
    const { pageTitle } = useTitle();
    const [isFullscreen, setIsFullscreen] = React.useState(false);

    React.useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const handleMinimize = () => window.electron?.minimize();
    const handleMaximize = () => window.electron?.maximize();
    const handleClose = () => window.electron?.close();

    if (isFullscreen) return null;

    return (
        <div
            className={`fixed top-0 left-0 right-0 h-8 flex items-center justify-between z-[200] select-none transition-colors duration-300 ${isOverlay ? 'bg-transparent hover:bg-black/50' : 'bg-[#0a0a0a]'}`}
            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        >
            {/* App Title */}
            <div className="flex items-center h-full px-3">
                <span className={`text-xs font-medium tracking-wide transition-colors ${isOverlay ? 'text-white/70 shadow-black drop-shadow-md' : 'text-gray-400'}`}>
                    Kinemora{pageTitle ? ` - ${pageTitle}` : ''}
                </span>
            </div>

            {/* Window Controls */}
            <div
                className="flex h-full"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
                {/* Minimize */}
                <button
                    onClick={handleMinimize}
                    className="w-12 h-full flex items-center justify-center hover:bg-white/10 transition-colors"
                    title="Minimize"
                >
                    <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor" className="text-gray-400">
                        <rect width="10" height="1" />
                    </svg>
                </button>

                {/* Maximize */}
                <button
                    onClick={handleMaximize}
                    className="w-12 h-full flex items-center justify-center hover:bg-white/10 transition-colors"
                    title="Maximize"
                >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" className="text-gray-400">
                        <rect x="0.5" y="0.5" width="9" height="9" strokeWidth="1" />
                    </svg>
                </button>

                {/* Close */}
                <button
                    onClick={handleClose}
                    className="w-12 h-full flex items-center justify-center hover:bg-red-600 transition-colors group"
                    title="Close"
                >
                    <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" className="text-gray-400 group-hover:text-white">
                        <line x1="1" y1="1" x2="9" y2="9" strokeWidth="1.2" />
                        <line x1="9" y1="1" x2="1" y2="9" strokeWidth="1.2" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default TitleBar;
