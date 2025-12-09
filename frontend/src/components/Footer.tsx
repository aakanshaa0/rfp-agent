'use client';

import { useState, useEffect } from 'react';
import { GiRobotHelmet } from 'react-icons/gi';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

export default function Footer() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <footer className="bg-gradient-to-b from-[#0A0A0A] to-[#050505] text-white border-t-2 border-cyan-neon/30 py-12">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-4'} gap-8 mb-8`}>
          <div className={isMobile ? '' : 'md:col-span-2'}>
            <div className="flex items-center gap-2 mb-4">
              <GiRobotHelmet className="text-cyan-neon text-3xl" />
              <h3 className="font-orbitron text-2xl font-bold text-cyan-neon text-shadow-cyan">
                RFP Agent
              </h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-3 max-w-md">
              Complete Agentic AI solution for RFP automation following EY Techathon 6.0 specifications. Five specialized agents working in coordinated workflow.
            </p>
            <p className="text-gray-500 text-xs italic mb-4">
              Enterprise-grade tender automation with precision matching algorithms
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-cyan-neon hover:text-shadow-cyan transition-all duration-300">
                <FaGithub className="text-2xl" />
              </a>
              <a href="#" className="text-cyan-neon hover:text-shadow-cyan transition-all duration-300">
                <FaLinkedin className="text-2xl" />
              </a>
              <a href="#" className="text-cyan-neon hover:text-shadow-cyan transition-all duration-300">
                <FaTwitter className="text-2xl" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-rajdhani text-lg font-bold text-white mb-4 border-b border-cyan-neon/20 pb-2">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#how-it-works" 
                  className="text-gray-400 text-sm transition-all duration-300 hover:text-cyan-neon hover:text-shadow-cyan hover:translate-x-1 inline-block"
                >
                  → How It Works
                </a>
              </li>
              <li>
                <a 
                  href="#platforms" 
                  className="text-gray-400 text-sm transition-all duration-300 hover:text-cyan-neon hover:text-shadow-cyan hover:translate-x-1 inline-block"
                >
                  → AI Agents
                </a>
              </li>
              <li>
                <a 
                  href="#faq" 
                  className="text-gray-400 text-sm transition-all duration-300 hover:text-cyan-neon hover:text-shadow-cyan hover:translate-x-1 inline-block"
                >
                  → FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-rajdhani text-lg font-bold text-white mb-4 border-b border-cyan-neon/20 pb-2">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#" 
                  className="text-gray-400 text-sm transition-all duration-300 hover:text-cyan-neon hover:text-shadow-cyan hover:translate-x-1 inline-block"
                >
                  → Documentation
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-400 text-sm transition-all duration-300 hover:text-cyan-neon hover:text-shadow-cyan hover:translate-x-1 inline-block"
                >
                  → API Reference
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-400 text-sm transition-all duration-300 hover:text-cyan-neon hover:text-shadow-cyan hover:translate-x-1 inline-block"
                >
                  → Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-cyan-neon/20">
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} RFP Agent. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
