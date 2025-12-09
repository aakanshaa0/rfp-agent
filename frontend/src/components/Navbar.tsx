'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAuthToken, removeAuthToken } from '../lib/api';
import { GiRobotHelmet } from 'react-icons/gi';

interface NavbarProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  showLogout?: boolean;
  onLogout?: () => void;
}

export default function Navbar({ onLoginClick, onSignupClick, showLogout = false, onLogout }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    const checkAuth = () => {
      const token = getAuthToken();
      setIsLoggedIn(!!token);
    };
    
    handleResize();
    checkAuth();
    window.addEventListener('resize', handleResize);
    
    const authInterval = setInterval(checkAuth, 1000);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(authInterval);
    };
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    setIsLoggedIn(false);
    window.location.href = '/';
    onLogout?.();
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0A0A0A] text-white border-b border-cyan-neon/30 shadow-neon-cyan">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex items-center justify-between min-h-16">
          <div className="flex items-center gap-2">
            <GiRobotHelmet className="text-cyan-neon text-4xl" />
            <Link 
              href="/" 
              className="font-orbitron font-extrabold tracking-wider text-cyan-neon no-underline text-2xl text-shadow-cyan"
            >
              RFP Agent
            </Link>
          </div>

          {!isMobile && (
            <div className="flex items-center gap-8">
              <a 
                href="#how-it-works" 
                className="text-white font-semibold text-base no-underline transition-all duration-300 hover:text-cyan-neon hover:text-shadow-cyan"
              >
                How It Works
              </a>
              <a 
                href="#platforms" 
                className="text-white font-semibold text-base no-underline transition-all duration-300 hover:text-cyan-neon hover:text-shadow-cyan"
              >
                Agents
              </a>
              <a 
                href="#faq" 
                className="text-white font-semibold text-base no-underline transition-all duration-300 hover:text-cyan-neon hover:text-shadow-cyan"
              >
                FAQ
              </a>
              {isLoggedIn && (
                <Link 
                  href="/dashboard" 
                  className="text-white font-semibold text-base no-underline transition-all duration-300 hover:text-cyan-neon hover:text-shadow-cyan"
                >
                  Dashboard
                </Link>
              )}
            </div>
          )}

          {!isMobile && (
            <div className="flex items-center gap-3">
              {(showLogout || isLoggedIn) ? (
                <button
                  onClick={handleLogout}
                  className="rounded-lg px-6 py-3 font-bold text-[1.05rem] text-magenta-neon border-2 border-magenta-neon bg-transparent cursor-pointer text-shadow-magenta shadow-[0_0_10px_rgba(255,0,255,0.3)] transition-all duration-300 hover:bg-magenta-neon/10 hover:shadow-neon-magenta-lg hover:text-shadow-cyan-lg"
                >
                  Logout
                </button>
              ) : (
                <>
                  <button
                    onClick={onLoginClick}
                    className="rounded-lg px-6 py-3 font-bold text-[1.05rem] text-cyan-neon border-2 border-cyan-neon bg-transparent cursor-pointer text-shadow-cyan-sm shadow-[0_0_10px_rgba(0,255,255,0.3)] transition-all duration-300 hover:bg-cyan-neon/10 hover:shadow-neon-cyan-lg hover:text-shadow-cyan-lg"
                  >
                    Login
                  </button>
                  <button
                    onClick={onSignupClick}
                    className="rounded-lg px-6 py-3 font-bold text-[1.05rem] text-white border-2 border-cyan-neon bg-gradient-to-r from-cyan-neon to-[#0080FF] cursor-pointer shadow-neon-cyan transition-all duration-300 hover:scale-105 hover:shadow-neon-cyan-lg"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          )}

          {isMobile && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-cyan-neon text-3xl cursor-pointer border-none bg-transparent p-2"
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          )}
        </div>

        {isMobile && isMenuOpen && (
          <div className="flex flex-col gap-4 py-6 border-t border-cyan-neon/30 animate-fadeIn">
            <a 
              href="#how-it-works" 
              className="text-white font-semibold text-base no-underline py-2 transition-all duration-300 hover:text-cyan-neon hover:text-shadow-cyan"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </a>
            <a 
              href="#platforms" 
              className="text-white font-semibold text-base no-underline py-2 transition-all duration-300 hover:text-cyan-neon hover:text-shadow-cyan"
              onClick={() => setIsMenuOpen(false)}
            >
              Agents
            </a>
            <a 
              href="#faq" 
              className="text-white font-semibold text-base no-underline py-2 transition-all duration-300 hover:text-cyan-neon hover:text-shadow-cyan"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </a>
            {isLoggedIn && (
              <Link 
                href="/dashboard" 
                className="text-white font-semibold text-base no-underline py-2 transition-all duration-300 hover:text-cyan-neon hover:text-shadow-cyan"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-cyan-neon/30">
              {(showLogout || isLoggedIn) ? (
                <button
                  onClick={handleLogout}
                  className="w-full rounded-lg px-6 py-3 font-bold text-base text-magenta-neon border-2 border-magenta-neon bg-transparent cursor-pointer text-shadow-magenta shadow-[0_0_10px_rgba(255,0,255,0.3)] transition-all duration-300"
                >
                  Logout
                </button>
              ) : (
                <>
                  <button
                    onClick={onLoginClick}
                    className="w-full rounded-lg px-6 py-3 font-bold text-base text-cyan-neon border-2 border-cyan-neon bg-transparent cursor-pointer text-shadow-cyan-sm shadow-[0_0_10px_rgba(0,255,255,0.3)] transition-all duration-300"
                  >
                    Login
                  </button>
                  <button
                    onClick={onSignupClick}
                    className="w-full rounded-lg px-6 py-3 font-bold text-base text-white border-2 border-cyan-neon bg-gradient-to-r from-cyan-neon to-[#0080FF] cursor-pointer shadow-neon-cyan transition-all duration-300"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
