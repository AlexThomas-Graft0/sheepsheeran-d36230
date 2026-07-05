'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

interface ServiceZone {
  id: string;
  eircode_prefix: string;
  area_name: string;
  is_active: boolean;
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeZones, setActiveZones] = useState<ServiceZone[]>([]);
  const [activeTab, setActiveTab] = useState('#estimator');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function fetchZones() {
      const { data, error } = await supabase
        .from('service_zones')
        .select('id, eircode_prefix, area_name, is_active')
        .eq('is_active', true);
      
      if (!error && data) {
        setActiveZones(data);
      }
    }
    fetchZones();
  }, []);

  const navItems = [
    { label: 'Flock Estimator', href: '#estimator' },
    { label: 'Our Standards', href: '#about' },
    { label: 'Services & Rates', href: '#services' },
    { label: 'Coverage Area', href: '#coverage' },
    { label: 'Our Work', href: '#portfolio' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Top micro-banner */}
      <div className="bg-[#000000] text-white text-xs py-2 px-4 border-b border-[#FECE14]/20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5 sm:gap-0 font-mono">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
            <span className="text-neutral-300">
              Active in <strong className="text-white">{activeZones.length || 5} Munster Zones</strong> (Cork, Kerry, Waterford, Limerick)
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#FECE14]">
            <span>🛡️ Fully Insured Public Liability</span>
            <span className="hidden md:inline">🧹 100% Post-Shear Clean Guarantee</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav
        className={`transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg py-3 border-b border-neutral-200/80'
            : 'bg-[#FDFBF7]/90 backdrop-blur-sm py-5 border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Logo */}
            <a
              href="#estimator"
              onClick={() => setActiveTab('#estimator')}
              className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FECE14] rounded-lg p-1"
              aria-label="sheepsheeran homepage"
            >
              <div className="relative w-10 h-10 rounded-xl bg-[#000000] flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
                {/* Clean golden shear-mark abstract icon */}
                <svg
                  className="w-6 h-6 text-[#FECE14] transition-transform duration-500 group-hover:rotate-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 2.122 3 3 0 004.243-2.122zm0-5.758a3 3 0 11-4.243-2.122 3 3 0 014.243 2.122z"
                  />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-tr from-[#FECE14]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-[#111827] leading-none font-sans">
                  sheep<span className="text-[#FECE14] bg-[#000000] px-1.5 py-0.5 rounded ml-0.5">sheeran</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mt-0.5">
                  Premium Mobile Shearing
                </span>
              </div>
            </a>

            {/* Desktop Nav Items */}
            <div className="hidden lg:flex items-center gap-1 bg-neutral-100 p-1.5 rounded-full border border-neutral-200/60">
              {navItems.map((item) => {
                const isActive = activeTab === item.href;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setActiveTab(item.href)}
                    className={`relative px-4 py-2 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FECE14] ${
                      isActive
                        ? 'text-[#000000] font-bold'
                        : 'text-neutral-600 hover:text-[#000000]'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeNavIndicator"
                        className="absolute inset-0 bg-white rounded-full shadow-sm"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </a>
                );
              })}
            </div>

            {/* Right Side CTA and Mobile Button */}
            <div className="flex items-center gap-3">
              <a
                href="#book"
                onClick={() => setActiveTab('#book')}
                className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-bold tracking-wide text-white bg-[#000000] hover:bg-neutral-800 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FECE14] shadow-sm"
              >
                Book On-Site
              </a>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-xl text-[#111827] hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FECE14]"
                aria-expanded={isOpen}
                aria-label="Toggle Navigation Menu"
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center gap-1.5">
                  <span
                    className={`h-0.5 w-6 bg-current rounded-full transition-all duration-300 ${
                      isOpen ? 'rotate-45 translate-y-2' : ''
                    }`}
                  />
                  <span
                    className={`h-0.5 w-6 bg-current rounded-full transition-all duration-200 ${
                      isOpen ? 'opacity-0' : ''
                    }`}
                  />
                  <span
                    className={`h-0.5 w-6 bg-current rounded-full transition-all duration-300 ${
                      isOpen ? '-rotate-45 -translate-y-2' : ''
                    }`}
                  />
                </div>
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden bg-white border-b border-neutral-200 overflow-hidden shadow-xl"
          >
            <div className="px-4 py-6 space-y-3 max-w-7xl mx-auto">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => {
                    setActiveTab(item.href);
                    setIsOpen(false);
                  }}
                  className={`block px-4 py-3 rounded-xl text-base font-bold tracking-wide transition-colors ${
                    activeTab === item.href
                      ? 'bg-[#FECE14]/10 text-[#000000] border-l-4 border-[#FECE14]'
                      : 'text-neutral-700 hover:bg-neutral-50 hover:text-[#000000]'
                  }`}
                >
                  {item.label}
                </a>
              ))}
              
              <div className="pt-4 border-t border-neutral-100 flex flex-col gap-3">
                <a
                  href="#book"
                  onClick={() => {
                    setActiveTab('#book');
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-center w-full py-3.5 px-4 rounded-xl text-base font-bold text-white bg-[#000000] hover:bg-neutral-800 transition-colors"
                >
                  Book On-Site Request
                </a>
                <div className="text-center text-xs text-neutral-500 font-medium py-1">
                  📍 Serving West Cork, North Cork, East Cork & adjacent zones
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}