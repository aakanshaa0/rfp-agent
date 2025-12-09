'use client';

import { useState, useEffect, FormEvent } from 'react';
import { api, setAuthToken } from '@/lib/api';

interface SignupLoginModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export default function SignupLoginModal({ open, onClose, initialMode = 'login' }: SignupLoginModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 900);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const response = await api.signup(email, password);
        setAuthToken(response.token);
        alert('Signup successful! Welcome to RFP Agent!');
      } else {
        const response = await api.login(email, password);
        setAuthToken(response.token);
        alert('Login successful!');
      }
      onClose();
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className={`bg-[#0A0A0A] rounded-xl border-2 border-cyan-neon shadow-neon-cyan w-full ${
          isMobile ? 'max-w-sm' : isTablet ? 'max-w-md' : 'max-w-lg'
        } relative animate-fadeIn`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-cyan-neon text-2xl cursor-pointer border-none bg-transparent transition-transform duration-300 hover:scale-110 hover:text-shadow-cyan"
        >
          ✕
        </button>

        {/* Header */}
        <div className="border-b-2 border-cyan-neon/30 p-6">
          <h2 className="font-orbitron text-2xl font-bold text-cyan-neon text-shadow-cyan text-center">
            {mode === 'login' ? 'Welcome Back' : 'Join RFP Agent'}
          </h2>
          <p className="text-gray-400 text-sm text-center mt-2">
            {mode === 'login' ? 'Login to continue' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-cyan-neon text-sm font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#1A1A1A] border-2 border-cyan-neon/30 rounded-lg px-4 py-3 text-white text-base transition-all duration-300 focus:outline-none focus:border-cyan-neon focus:shadow-neon-cyan"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-cyan-neon text-sm font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#1A1A1A] border-2 border-cyan-neon/30 rounded-lg px-4 py-3 text-white text-base transition-all duration-300 focus:outline-none focus:border-cyan-neon focus:shadow-neon-cyan"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-neon to-[#0080FF] text-white font-bold text-base py-3 px-6 rounded-lg border-2 border-cyan-neon shadow-neon-cyan transition-all duration-300 hover:scale-105 hover:shadow-neon-cyan-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? '⏳ Processing...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="border-t-2 border-cyan-neon/30 p-6 text-center">
          <p className="text-gray-400 text-sm">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-cyan-neon font-semibold border-none bg-transparent cursor-pointer transition-all duration-300 hover:text-shadow-cyan hover:underline"
            >
              {mode === 'login' ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
