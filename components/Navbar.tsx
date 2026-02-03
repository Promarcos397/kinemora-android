import React, { useState } from 'react';
import { GearIcon, ListIcon, XIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import SearchBar from './SearchBar';

interface NavbarProps {
  isScrolled: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const KinemoraLogo = ({ className, onClick }: { className?: string, onClick?: () => void }) => (
  <svg
    viewBox="0 0 600 150"
    className={className}
    onClick={onClick}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <path id="kinemoraArc" d="M 0 150 Q 300 125 600 150" />
      <filter id="hardShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feFlood floodColor="black" floodOpacity="0.5" />
        <feComposite operator="in" in2="SourceGraphic" />
        <feOffset dx="3" dy="3" />
        <feGaussianBlur stdDeviation="2" />
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <text
      width="600"
      fill="#E50914"
      fontFamily="'Bebas Neue', Impact, sans-serif"
      fontSize="110"
      letterSpacing="4"
      filter="url(#hardShadow)"
      style={{ textTransform: "uppercase" }}
    >
      <textPath href="#kinemoraArc" startOffset="50%" textAnchor="middle" spacing="auto">
        KINEMORA
      </textPath>
    </text>
  </svg>
);

const Navbar: React.FC<NavbarProps> = ({ isScrolled, searchQuery, setSearchQuery, activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const navItems = [
    { id: 'home', label: t('nav.home') },
    { id: 'tv', label: t('nav.shows') },
    { id: 'movies', label: t('nav.movies') },
    { id: 'reads', label: t('reads.title') },
    { id: 'new', label: t('nav.newPopular') },
    { id: 'list', label: t('nav.myList') },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSearchQuery('');
  };

  return (
    <nav
      className={`fixed top-8 w-full z-[80] transition-all duration-500 
        px-6 py-3 md:px-14 md:py-4 lg:px-20 lg:py-5
        ${isScrolled || mobileMenuOpen ? 'bg-[#141414] shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 md:space-x-8">
          <KinemoraLogo
            className="h-5 sm:h-7 md:h-9 lg:h-10 cursor-pointer drop-shadow-lg transition-transform hover:scale-105 -mt-2 relative z-10"
            onClick={() => handleTabClick('home')}
          />

          <ul className="hidden md:flex space-x-4 lg:space-x-6 text-xs lg:text-sm font-medium text-gray-300">
            {navItems.map((item) => (
              <li
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`cursor-pointer transition hover:scale-105 ${activeTab === item.id ? 'text-white font-bold' : 'hover:text-gray-400'}`}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center space-x-2 md:space-x-6">
          {/* Extracted Search Bar Component - Hidden in Settings */}
          {activeTab !== 'settings' && (
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          )}

          {/* Settings Icon - Replaces Notification Bell and Profile */}
          <div className="hidden md:flex items-center ml-2">
            <GearIcon
              size={24}
              weight="fill"
              className={`cursor-pointer hover:rotate-90 transition-transform duration-500 ${activeTab === 'settings' ? 'text-red-600' : 'text-white'}`}
              onClick={() => handleTabClick('settings')}
            />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center ml-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <XIcon size={24} className="text-white cursor-pointer" /> : <ListIcon size={24} className="text-white cursor-pointer" />}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#141414] border-t border-gray-800 flex flex-col items-center py-6 space-y-6 animate-fadeIn shadow-2xl h-screen">
          {navItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`text-lg font-medium ${activeTab === item.id ? 'text-white font-bold' : 'text-gray-400'}`}
            >
              {item.label}
            </div>
          ))}
          {/* Mobile Settings Option */}
          <div
            onClick={() => handleTabClick('settings')}
            className={`text-lg font-medium ${activeTab === 'settings' ? 'text-white font-bold' : 'text-gray-400'}`}
          >
            Settings
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;