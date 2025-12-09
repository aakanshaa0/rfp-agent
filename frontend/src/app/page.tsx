'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaSearch, FaFileAlt, FaRobot, FaDollarSign, FaChartBar, FaCrown, FaBook, FaCalculator, FaFileSignature, FaChevronDown } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SignupLoginModal from '../components/SignupLoginModal';
import { getAuthToken } from '../lib/api';

export default function Home() {
  const [showHero, setShowHero] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'signup'>('login');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    setShowHero(true);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 900);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleOpenLogin = () => {
    setModalMode('login');
    setModalOpen(true);
  };

  const handleOpenSignup = () => {
    setModalMode('signup');
    setModalOpen(true);
  };

  const handleUploadClick = () => {
    const token = getAuthToken();
    if (token) {
      window.location.href = '/dashboard';
    } else {
      handleOpenLogin();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
      <Navbar onLoginClick={handleOpenLogin} onSignupClick={handleOpenSignup} />
      
      {/* Hero Section */}
      <div className="min-h-screen relative bg-[#0A0A0A] flex items-center">
        <div className="max-w-[1200px] mx-auto px-6 w-full">
          <div className={`flex items-center justify-between ${
            isMobile || isTablet ? 'flex-col-reverse' : 'flex-row'
          } gap-16 transition-opacity duration-900 ${showHero ? 'opacity-100' : 'opacity-0'}`}>
            
            <div className={`flex flex-col justify-center ${
              isMobile || isTablet ? 'flex-1 items-center text-center' : 'flex-[0_0_45%] items-start text-left'
            } z-[2]`}>
              <h1 className={`font-black ${
                isMobile ? 'text-4xl' : isTablet ? 'text-5xl' : 'text-6xl'
              } leading-tight text-white ${isMobile || isTablet ? 'mb-4' : 'mb-6'}`}>
                Automate Your RFP Response<br />
                <span className="text-cyan-neon">with AI Agents</span>
              </h1>
              <p className={`text-cyan-neon ${
                isMobile ? 'text-base' : isTablet ? 'text-lg' : 'text-xl'
              } ${isMobile || isTablet ? 'mb-6 px-2' : 'mb-8'}`}>
                Automate RFP pipeline from discovery to delivery. Scan portals, match products, and generate proposals with AI agents.
              </p>
              <button 
                onClick={handleUploadClick}
                className={`${
                  isMobile ? 'text-lg py-3 px-6 w-full max-w-[280px]' : isTablet ? 'text-xl py-3 px-8' : 'text-xl py-5 px-10'
                } rounded-lg bg-gradient-to-r from-cyan-neon to-[#0080FF] text-white font-bold border-2 border-cyan-neon shadow-neon-cyan transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-neon-cyan-lg`}
              >
                Upload RFP
              </button>
            </div>

            <div className={`${
              isTablet ? 'flex-1' : 'flex-[0_0_55%]'
            } flex justify-center items-center relative ${
              isTablet ? 'min-h-[240px]' : 'min-h-[400px]'
            } z-[1]`}>
              <div className={`relative ${
                isMobile ? 'w-full max-w-[300px]' : isTablet ? 'w-full max-w-[350px]' : 'w-full max-w-[500px]'
              } h-auto`}>
                <Image
                  src="/hero-image.png"
                  alt="RFP Agent AI"
                  width={500}
                  height={500}
                  className="w-full h-auto object-contain drop-shadow-[0_0_30px_rgba(0,255,255,0.4)]"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-20 px-6 bg-[#0A0A0A]">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-5xl font-bold text-center text-cyan-neon text-shadow-cyan mb-16">
            How It Works
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {[
              { step: '1', title: 'Portal Discovery', desc: 'Our Sales Agent scans predefined tender URLs continuously to identify new RFP opportunities with upcoming deadlines', Icon: FaSearch },
              { step: '2', title: 'Master Agent Coordination', desc: 'The Master Agent selects an RFP, creates role-specific summaries, and coordinates all specialized agents', Icon: FaFileAlt },
              { step: '3', title: 'Technical Processing', desc: 'Technical Agent reads RFP documents, extracts specifications, and matches products with calculated match percentages', Icon: FaRobot },
              { step: '4', title: 'Cost Calculation', desc: 'Pricing Agent computes complete project costs including product pricing, testing fees, and compliance requirements', Icon: FaDollarSign },
              { step: '5', title: 'Proposal Generation', desc: 'Proposal Generator Agent creates professionally formatted PDF proposals ready for tender submission', Icon: FaChartBar },
            ].map((item) => (
              <div key={item.step} className="bg-[#1A1A1A] border-2 border-cyan-neon/30 rounded-xl p-6 transition-all duration-300 hover:border-cyan-neon hover:shadow-neon-cyan hover:-translate-y-2">
                <div className="flex justify-center mb-3">
                  <item.Icon className="text-cyan-neon text-4xl" />
                </div>
                <div className="text-cyan-neon text-2xl font-bold mb-2 text-center">Step {item.step}</div>
                <h3 className="text-white text-lg font-bold mb-2 text-center">{item.title}</h3>
                <p className="text-gray-400 text-center text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Agents Section */}
      <div id="platforms" className="py-20 px-6 bg-[#0A0A0A]">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-5xl font-bold text-center text-magenta-neon text-shadow-magenta mb-16">
            Our AI Agents
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {[
              { 
                title: 'Master Agent (Orchestrator)', 
                role: 'Main coordinator and workflow manager',
                desc: 'Creates role-specific summaries, coordinates all agents, validates outputs, compiles final response',
                Icon: FaCrown, 
                color: 'cyan' 
              },
              { 
                title: 'Sales Agent (Discoverer)', 
                role: 'Opportunity identification and scanning',
                desc: 'Scans predefined URLs for RFPs, identifies submission deadlines, summarizes basic requirements',
                Icon: FaSearch, 
                color: 'magenta' 
              },
              { 
                title: 'Technical Agent (Matcher)', 
                role: 'Requirement analysis and product matching',
                desc: 'Reads RFP PDFs using PyPDF2, extracts technical specifications, calculates Spec Match percentages, recommends top 3 products',
                Icon: FaBook, 
                color: 'green' 
              },
              { 
                title: 'Pricing Agent (Calculator)', 
                role: 'Cost computation and financial analysis',
                desc: 'Calculates product costs, testing fees, certification expenses, generates complete price breakdown',
                Icon: FaCalculator, 
                color: 'orange' 
              },
              { 
                title: 'Proposal Generator Agent (Creator)', 
                role: 'Document preparation and formatting',
                desc: 'Creates professional PDF proposals with all matched products, pricing details, and compliance information',
                Icon: FaFileSignature, 
                color: 'cyan' 
              },
            ].map((agent, idx) => (
              <div 
                key={idx} 
                className={`bg-[#1A1A1A] border-2 ${
                  agent.color === 'cyan' ? 'border-cyan-neon/30 hover:border-cyan-neon hover:shadow-neon-cyan' :
                  agent.color === 'magenta' ? 'border-magenta-neon/30 hover:border-magenta-neon hover:shadow-neon-magenta' :
                  agent.color === 'green' ? 'border-green-neon/30 hover:border-green-neon hover:shadow-neon-green' :
                  'border-orange-500/30 hover:border-orange-500 hover:shadow-[0_0_20px_rgba(255,165,0,0.6)]'
                } rounded-xl p-6 transition-all duration-300 hover:-translate-y-2`}
              >
                <div className="flex justify-center mb-4">
                  <agent.Icon className={`text-5xl ${
                    agent.color === 'cyan' ? 'text-cyan-neon' :
                    agent.color === 'magenta' ? 'text-magenta-neon' :
                    agent.color === 'green' ? 'text-green-neon' :
                    'text-orange-500'
                  }`} />
                </div>
                <h3 className={`text-lg font-bold mb-2 text-center ${
                  agent.color === 'cyan' ? 'text-cyan-neon' :
                  agent.color === 'magenta' ? 'text-magenta-neon' :
                  agent.color === 'green' ? 'text-green-neon' :
                  'text-orange-500'
                }`}>{agent.title}</h3>
                <p className="text-white text-sm font-semibold mb-2 text-center">Role: {agent.role}</p>
                <p className="text-gray-400 text-sm leading-relaxed"><span className="font-semibold text-white">Function:</span> {agent.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="py-20 px-6 bg-[#0A0A0A]">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-5xl font-bold text-center text-green-neon text-shadow-green mb-16">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: 'What is the Agentic AI architecture?', a: 'We implement the exact Master Agent + Worker Agent architecture specified in EY Techathon 6.0, with five specialized agents coordinated by a Master Agent' },
              { q: 'How does the Sales Agent work?', a: 'The Sales Agent scans predefined tender portal URLs to discover new RFP opportunities and identifies those due within three months as required' },
              { q: 'What makes your product matching unique?', a: 'Our Technical Agent calculates precise Spec Match percentages showing exact compatibility between RFP requirements and your products, not just basic keyword matching' },
              { q: 'Can I see the complete workflow?', a: 'Yes, our dashboard shows real-time status of all five agents working together from portal discovery to proposal generation' },
              { q: 'Is this ready for enterprise use?', a: 'Built with scalable architecture using PostgreSQL, Node.js, and Python, following industry standards for tender processing' },
            ].map((faq, idx) => (
              <div key={idx} className="bg-[#1A1A1A] border border-green-neon/30 rounded-lg overflow-hidden hover:border-green-neon transition-all duration-300">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left transition-all duration-300 hover:bg-green-neon/5"
                >
                  <h3 className="text-green-neon text-lg font-bold pr-4">{faq.q}</h3>
                  <FaChevronDown 
                    className={`text-green-neon text-xl flex-shrink-0 transition-transform duration-300 ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-gray-400 text-sm leading-relaxed px-6 pb-6">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
      <SignupLoginModal open={modalOpen} onClose={() => setModalOpen(false)} initialMode={modalMode} />
    </div>
  );
}
