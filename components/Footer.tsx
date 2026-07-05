'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface ServiceZone {
  id: string;
  eircode_prefix: string;
  area_name: string;
  is_active: boolean;
  travel_surcharge: number;
}

export function Footer() {
  const [zones, setZones] = useState<ServiceZone[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);

  useEffect(() => {
    async function fetchZones() {
      try {
        const { data, error } = await supabase
          .from('service_zones')
          .select('id, eircode_prefix, area_name, is_active, travel_surcharge')
          .eq('is_active', true)
          .order('eircode_prefix', { ascending: true });

        if (!error && data) {
          setZones(data);
        }
      } catch (err) {
        // Fallback handled by placeholder
      } finally {
        setLoadingZones(false);
      }
    }
    fetchZones();
  }, []);

  const fallbackZones = [
    { eircode_prefix: 'P81', area_name: 'Bantry / West Cork', travel_surcharge: 15.00 },
    { eircode_prefix: 'P85', area_name: 'Clonakilty', travel_surcharge: 10.00 },
    { eircode_prefix: 'T12', area_name: 'Cork City North', travel_surcharge: 0.00 },
    { eircode_prefix: 'T23', area_name: 'Cork City South', travel_surcharge: 0.00 },
    { eircode_prefix: 'V92', area_name: 'Tralee / Kerry', travel_surcharge: 25.00 },
  ];

  const activeZones = zones.length > 0 ? zones : fallbackZones;

  return (
    <footer className="relative bg-[#000000] text-white font-sans border-t border-neutral-800 overflow-hidden">
      {/* Visual Accent Top Bar */}
      <div className="h-1.5 w-full bg-[#FECE14]" />

      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FECE14]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand & Purpose Column */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <span className="bg-[#FECE14] text-black p-2 rounded font-mono font-black tracking-tighter text-lg">
                SS
              </span>
              <span className="text-2xl font-black tracking-tight font-display text-white">
                sheep<span className="text-[#FECE14]">sheeran</span>
              </span>
            </div>
            
            <p className="text-neutral-400 text-sm leading-relaxed max-w-sm">
              The Cleanest Cut. The Cleanest Yard. Professional, reliable mobile sheep shearing across Cork and Munster. We handle your flock with expert care, maximize your wool value, and sweep the floor clean before we leave.
            </p>

            <div className="pt-2">
              <span className="inline-flex items-center space-x-2 text-xs font-mono font-semibold tracking-wider uppercase bg-neutral-900 border border-neutral-800 text-[#FECE14] px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                <span>Active Booking Season</span>
              </span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-6">
            <h3 className="text-[#FECE14] font-mono text-xs font-semibold tracking-widest uppercase">
              Service Directory
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#estimator" className="text-neutral-400 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 group-hover:bg-[#FECE14] mr-2.5 transition-colors" />
                  Flock Estimator Tool
                </a>
              </li>
              <li>
                <a href="#guarantee" className="text-neutral-400 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 group-hover:bg-[#FECE14] mr-2.5 transition-colors" />
                  Clean-Site Guarantee
                </a>
              </li>
              <li>
                <a href="#services" className="text-neutral-400 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 group-hover:bg-[#FECE14] mr-2.5 transition-colors" />
                  Rates & Services
                </a>
              </li>
              <li>
                <a href="#coverage" className="text-neutral-400 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 group-hover:bg-[#FECE14] mr-2.5 transition-colors" />
                  Eircode Checker
                </a>
              </li>
              <li>
                <a href="#portfolio" className="text-neutral-400 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 group-hover:bg-[#FECE14] mr-2.5 transition-colors" />
                  Wool Quality Gallery
                </a>
              </li>
              <li>
                <a href="#booking" className="text-neutral-400 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 group-hover:bg-[#FECE14] mr-2.5 transition-colors" />
                  Book On-Site Online
                </a>
              </li>
            </ul>
          </div>

          {/* Active Coverage Zones (Dynamic Database Output) */}
          <div className="space-y-6">
            <h3 className="text-[#FECE14] font-mono text-xs font-semibold tracking-widest uppercase">
              Munster Service Zones
            </h3>
            <div className="space-y-3">
              {loadingZones ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 bg-neutral-800 rounded w-3/4"></div>
                  <div className="h-4 bg-neutral-800 rounded w-5/6"></div>
                  <div className="h-4 bg-neutral-800 rounded w-2/3"></div>
                </div>
              ) : (
                <ul className="space-y-2.5 text-xs font-mono">
                  {activeZones.slice(0, 5).map((zone, idx) => (
                    <li key={idx} className="flex justify-between items-center border-b border-neutral-900 pb-1.5">
                      <span className="text-neutral-300 flex items-center">
                        <span className="text-[#FECE14] mr-1.5">[{zone.eircode_prefix}]</span>
                        <span className="text-neutral-400">{zone.area_name}</span>
                      </span>
                      <span className="text-neutral-500">
                        {zone.travel_surcharge === 0 ? (
                          <span className="text-[#16A34A] font-bold">€0 Surcharge</span>
                        ) : (
                          `+€${Number(zone.travel_surcharge).toFixed(0)} travel`
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-[11px] text-neutral-500 leading-relaxed pt-1">
                Active daily routes across West Cork, North Cork, East Cork & adjacent Munster areas.
              </p>
            </div>
          </div>

          {/* Trust Credentials & Contact */}
          <div className="space-y-6">
            <h3 className="text-[#FECE14] font-mono text-xs font-semibold tracking-widest uppercase">
              Our Professional Standards
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-white">100% Clean-Site Guarantee</h4>
                  <p className="text-xs text-neutral-400">Every single board swept perfectly before departure.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-white">Biosecure Sterilization</h4>
                  <p className="text-xs text-neutral-400">All handpieces and combs thoroughly disinfected between holdings.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-white">Fully Insured Yard Operations</h4>
                  <p className="text-xs text-neutral-400">Complete public and product liability coverage as standard.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-neutral-500 text-center sm:text-left space-y-1">
            <p>© 2024 sheepsheeran. All rights reserved.</p>
            <p>Based in Co. Cork, Ireland. Standard minimum call-out operations apply.</p>
          </div>

          <div className="flex items-center space-x-6">
            <a href="#booking" className="inline-flex items-center text-xs font-mono font-bold text-[#FECE14] hover:text-white transition-colors duration-200">
              Request Booking Slot
              <svg className="w-4 h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="p-2 bg-neutral-900 border border-neutral-800 rounded hover:bg-neutral-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FECE14]"
              aria-label="Back to top"
            >
              <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}