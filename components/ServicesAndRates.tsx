'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

interface ServiceZone {
  id: string;
  eircode_prefix: string;
  area_name: string;
  is_active: boolean;
  travel_surcharge: number;
}

export function ServicesAndRates() {
  // Database State
  const [zones, setZones] = useState<ServiceZone[]>([]);
  const [loadingZones, setLoadingZones] = useState<boolean>(true);

  // Estimator State
  const [breedType, setBreedType] = useState<'lowland' | 'mountain' | 'pedigree'>('lowland');
  const [serviceType, setServiceType] = useState<'shearing' | 'crutching'>('shearing');
  const [flockSize, setFlockSize] = useState<number>(75);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Fetch Service Zones on Mount
  useEffect(() => {
    async function fetchZones() {
      try {
        const { data, error } = await supabase
          .from('service_zones')
          .select('*')
          .eq('is_active', true)
          .order('eircode_prefix', { ascending: true });

        if (!error && data) {
          // Map database numeric fields correctly
          const mappedZones: ServiceZone[] = data.map((z: any) => ({
            id: z.id,
            eircode_prefix: z.eircode_prefix,
            area_name: z.area_name,
            is_active: !!z.is_active,
            travel_surcharge: Number(z.travel_surcharge) || 0,
          }));
          setZones(mappedZones);
        }
      } catch (err) {
        console.error('Error fetching service zones:', err);
      } finally {
        setLoadingZones(false);
      }
    }
    fetchZones();
  }, []);

  // Dynamic Estimation Calculations
  const estimation = useMemo(() => {
    let minPricePerHead = 0;
    let maxPricePerHead = 0;
    let minTotal = 0;
    let maxTotal = 0;
    let minHours = 0;
    let maxHours = 0;

    // Time calculations (minutes per sheep)
    let minTimePerSheep = 1.5;
    let maxTimePerSheep = 2.5;

    if (serviceType === 'shearing') {
      if (breedType === 'pedigree') {
        minPricePerHead = 10.0;
        maxPricePerHead = 15.0;
        minTimePerSheep = 8.0;
        maxTimePerSheep = 12.0;
      } else if (breedType === 'mountain') {
        // Mountain/Blackface sheep rates
        if (flockSize <= 50) {
          minPricePerHead = 4.0;
          maxPricePerHead = 5.0;
        } else if (flockSize <= 150) {
          minPricePerHead = 3.7;
          maxPricePerHead = 4.7;
        } else {
          minPricePerHead = 2.7;
          maxPricePerHead = 3.7;
        }
        minTimePerSheep = 2.0;
        maxTimePerSheep = 3.0;
      } else {
        // Lowland / Commercial
        if (flockSize <= 50) {
          minPricePerHead = 3.5;
          maxPricePerHead = 4.5;
        } else if (flockSize <= 150) {
          minPricePerHead = 3.5;
          maxPricePerHead = 4.5;
        } else {
          minPricePerHead = 2.5;
          maxPricePerHead = 3.5;
        }
        minTimePerSheep = 1.2;
        maxTimePerSheep = 1.8;
      }
    } else {
      // Crutching & Dagging
      minPricePerHead = 1.5;
      maxPricePerHead = 2.0;
      minTimePerSheep = 0.6;
      maxTimePerSheep = 1.0;
    }

    // Calculate totals
    minTotal = flockSize * minPricePerHead;
    maxTotal = flockSize * maxPricePerHead;

    // Enforce Minimum Call-Out Fee (€150)
    const isMinApplied = minTotal < 150;
    if (minTotal < 150) minTotal = 150;
    if (maxTotal < 150) maxTotal = 150;

    // Calculate duration in hours
    const totalMinMinutes = flockSize * minTimePerSheep;
    const totalMaxMinutes = flockSize * maxTimePerSheep;
    
    // Add setup/cleanup buffer time (approx 30 mins)
    minHours = Math.max(0.5, Math.round(((totalMinMinutes + 30) / 60) * 10) / 10);
    maxHours = Math.max(0.7, Math.round(((totalMaxMinutes + 30) / 60) * 10) / 10);

    return {
      minPrice: Math.round(minTotal),
      maxPrice: Math.round(maxTotal),
      minHours,
      maxHours,
      isMinApplied,
    };
  }, [breedType, serviceType, flockSize]);

  // Static FAQ Copy
  const faqs = [
    {
      q: 'How do I need to prepare my sheep before you arrive?',
      a: 'Your sheep must be completely dry. Shearing wet sheep is dangerous for the shearer, ruins the wool quality, and can cause health issues for the animal. Please yard your sheep or keep them shed-sheltered for at least 12 hours before our scheduled arrival.',
    },
    {
      q: 'Do you provide the wool sacks?',
      a: 'No, farmers must provide their own wool sacks (packs). However, we will professionally pack and press the wool into your provided sacks as part of our clean-up guarantee.',
    },
    {
      q: 'What power requirements do you have?',
      a: 'We operate a fully mobile rig. Ideally, we require access to a standard 220V power outlet near the shearing area. If your pens are isolated without power, please let us know in advance so we can bring our own generator.',
    },
  ];

  return (
    <section id="services" className="bg-[#FFFFFF] text-[#111827] py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block */}
        <div className="text-center mb-16">
          <span className="inline-block bg-[#FECE14] text-[#000000] font-mono text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
            WHAT WE OFFER
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#000000] tracking-tight mb-4">
            Transparent Rates. Expert Execution.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            No hidden fees, no surprises. We offer straightforward pricing structures tailored to your flock size and service needs.
          </p>
        </div>

        {/* 3-Column Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          
          {/* Card 1: Commercial */}
          <div className="border-2 border-black rounded-2xl p-8 bg-white flex flex-col justify-between hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-black text-[#FECE14] text-xs font-mono py-1 px-4 rounded-bl-lg font-bold">
              POPULAR
            </div>
            <div>
              <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#FECE14]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-2">Commercial Flock</h3>
              <p className="text-sm text-gray-500 mb-6 font-mono">From €2.50 to €4.50 per head</p>
              
              <p className="text-gray-600 mb-6 text-sm">
                The core service for commercial sheep farmers across Munster. Designed for speed, animal safety, and optimal wool yield.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-start text-sm">
                  <span className="text-[#16A34A] mr-2">✓</span>
                  <span><strong>Best For:</strong> Commercial ewes, hoggets, and rams (Texel, Suffolk, Mule, Blackface, etc.).</span>
                </div>
                <div className="flex items-start text-sm">
                  <span className="text-[#16A34A] mr-2">✓</span>
                  <span>Full shearing, wool rolling, clean-up, and packing.</span>
                </div>
                <div className="flex items-start text-sm">
                  <span className="text-[#16A34A] mr-2">✓</span>
                  <span><strong>Large Flocks (151+):</strong> €2.50 - €3.50 / head.</span>
                </div>
              </div>
            </div>
            <a href="#booking-form" className="w-full text-center py-3 bg-black text-white hover:bg-[#FECE14] hover:text-black font-bold rounded-lg transition-colors duration-200">
              Book Commercial
            </a>
          </div>

          {/* Card 2: Pedigree */}
          <div className="border border-gray-200 rounded-2xl p-8 bg-white flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
            <div>
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-2">Pedigree & Show Prep</h3>
              <p className="text-sm text-gray-500 mb-6 font-mono">From €10.00 per head</p>
              
              <p className="text-gray-600 mb-6 text-sm">
                Precision custom shearing for pedigree breeders who need their stock looking immaculate for sales, shows, or breed inspections.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-start text-sm">
                  <span className="text-[#16A34A] mr-2">✓</span>
                  <span><strong>Best For:</strong> Pedigree rams, ewes, and show lambs requiring styled cuts.</span>
                </div>
                <div className="flex items-start text-sm">
                  <span className="text-[#16A34A] mr-2">✓</span>
                  <span>High-precision styling, careful hand-trimming, and detailed structural shaping.</span>
                </div>
                <div className="flex items-start text-sm">
                  <span className="text-[#16A34A] mr-2">✓</span>
                  <span>Highlights the breed's best physical characteristics.</span>
                </div>
              </div>
            </div>
            <a href="#booking-form" className="w-full text-center py-3 bg-gray-100 hover:bg-black hover:text-white text-black font-bold rounded-lg transition-colors duration-200">
              Book Pedigree Prep
            </a>
          </div>

          {/* Card 3: Crutching */}
          <div className="border border-gray-200 rounded-2xl p-8 bg-white flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
            <div>
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-2">Crutching & Dagging</h3>
              <p className="text-sm text-gray-500 mb-6 font-mono">From €1.50 per head</p>
              
              <p className="text-gray-600 mb-6 text-sm">
                An essential preventative health service to protect your flock from flystrike and prepare ewes for clean lambing.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-start text-sm">
                  <span className="text-[#16A34A] mr-2">✓</span>
                  <span><strong>Best For:</strong> Pre-lambing ewes or flocks during high-risk flystrike seasons.</span>
                </div>
                <div className="flex items-start text-sm">
                  <span className="text-[#16A34A] mr-2">✓</span>
                  <span>Clean removal of dirty wool from around the tail, hind legs, and udder.</span>
                </div>
                <div className="flex items-start text-sm">
                  <span className="text-[#16A34A] mr-2">✓</span>
                  <span>Minimum call-out fees apply to ensure travel efficiency.</span>
                </div>
              </div>
            </div>
            <a href="#booking-form" className="w-full text-center py-3 bg-gray-100 hover:bg-black hover:text-white text-black font-bold rounded-lg transition-colors duration-200">
              Book Crutching
            </a>
          </div>

        </div>

        {/* Dynamic Flock Estimator Widget */}
        <div className="bg-[#111827] text-white rounded-3xl p-8 lg:p-12 mb-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#FECE14] to-transparent opacity-10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Estimator Controls */}
            <div className="lg:col-span-7">
              <span className="text-[#FECE14] font-mono text-xs font-bold uppercase tracking-widest block mb-2">
                INTERACTIVE ESTIMATOR
              </span>
              <h3 className="text-3xl font-extrabold text-white mb-6">
                Get an Instant Estimate
              </h3>
              <p className="text-gray-400 mb-8 text-sm max-w-xl">
                Adjust the options below to match your flock size and breed type. Instantly calculate estimated duration and target cost ranges.
              </p>

              {/* Step 1: Breed Selection */}
              <div className="mb-6">
                <label className="block text-xs font-mono font-bold text-gray-400 uppercase mb-3">
                  1. Select Your Breed Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setBreedType('lowland')}
                    className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 border ${
                      breedType === 'lowland'
                        ? 'bg-[#FECE14] text-black border-[#FECE14]'
                        : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    Lowland / Commercial
                  </button>
                  <button
                    onClick={() => setBreedType('mountain')}
                    className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 border ${
                      breedType === 'mountain'
                        ? 'bg-[#FECE14] text-black border-[#FECE14]'
                        : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    Mountain / Blackface
                  </button>
                  <button
                    onClick={() => setBreedType('pedigree')}
                    className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 border ${
                      breedType === 'pedigree'
                        ? 'bg-[#FECE14] text-black border-[#FECE14]'
                        : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    Pedigree / Show Prep
                  </button>
                </div>
              </div>

              {/* Step 2: Service Selection */}
              <div className="mb-8">
                <label className="block text-xs font-mono font-bold text-gray-400 uppercase mb-3">
                  2. Select Your Service
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setServiceType('shearing')}
                    className={`py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 border ${
                      serviceType === 'shearing'
                        ? 'bg-[#FECE14] text-black border-[#FECE14]'
                        : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    Full Shearing
                  </button>
                  <button
                    onClick={() => setServiceType('crutching')}
                    className={`py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 border ${
                      serviceType === 'crutching'
                        ? 'bg-[#FECE14] text-black border-[#FECE14]'
                        : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    Crutching / Dagging
                  </button>
                </div>
              </div>

              {/* Step 3: Slider */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-mono font-bold text-gray-400 uppercase">
                    3. Adjust Flock Size
                  </label>
                  <span className="text-2xl font-black text-[#FECE14] font-mono">
                    {flockSize} <span className="text-sm font-normal text-white">Head</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="5"
                  value={flockSize}
                  onChange={(e) => setFlockSize(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#FECE14]"
                />
                <div className="flex justify-between text-xs text-gray-500 font-mono mt-2">
                  <span>10 Sheep</span>
                  <span>250 Sheep</span>
                  <span>500+ Sheep</span>
                </div>
              </div>

            </div>

            {/* Dynamic Output Display Card */}
            <div className="lg:col-span-5 bg-black border-2 border-gray-800 rounded-2xl p-6 lg:p-8 flex flex-col justify-between h-full">
              <div>
                <h4 className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-4">
                  Estimated Pricing & Duration
                </h4>

                {/* Price Output */}
                <div className="mb-6">
                  <span className="text-sm text-gray-400 block">Estimated Price Range</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl lg:text-5xl font-extrabold text-[#FECE14] tracking-tight">
                      €{estimation.minPrice} - €{estimation.maxPrice}
                    </span>
                  </div>
                  {estimation.isMinApplied && (
                    <span className="text-xs text-[#D97706] font-mono mt-1 block">
                      *Minimum Call-out rate (€150) applied
                    </span>
                  )}
                </div>

                {/* Duration Output */}
                <div className="mb-6 border-t border-gray-800 pt-6">
                  <span className="text-sm text-gray-400 block">Estimated Duration</span>
                  <span className="text-2xl font-bold text-white">
                    {estimation.minHours === estimation.maxHours 
                      ? `${estimation.minHours} Hour` 
                      : `${estimation.minHours} to ${estimation.maxHours} Hours`}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Includes setup and meticulous clean sweep.
                  </p>
                </div>

                {/* Inclusion List */}
                <ul className="space-y-2 mb-8 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-[#16A34A]">✓</span> Professional certified master shearer
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#16A34A]">✓</span> Calm, low-stress animal handling
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#16A34A]">✓</span> Complete post-shear board sweep & clean-up
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#16A34A]">✓</span> Wool packed neatly into your sacks
                  </li>
                </ul>
              </div>

              <a
                href="#booking-form"
                className="w-full text-center py-4 bg-[#FECE14] text-black font-extrabold rounded-xl hover:bg-white transition-colors duration-200 uppercase tracking-wider text-sm shadow-md"
              >
                Book This Estimate
              </a>
            </div>

          </div>
        </div>

        {/* Call-out Rates & Minimums + Live Database Zones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24 items-start">
          
          {/* Minimum booking structure */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-black">Call-Out Rates & Minimums</h3>
            <p className="text-gray-600">
              To keep our business sustainable and cover travel overheads across Cork and Munster, we operate with a clear minimum booking structure:
            </p>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-black text-[#FECE14] rounded-lg shrink-0 font-mono font-bold text-sm">
                  €150
                </div>
                <div>
                  <h4 className="font-bold text-black text-lg">Minimum Call-Out Fee</h4>
                  <p className="text-sm text-gray-600">Covers up to 30 commercial sheep for standard shearing. Ensures viability for remote runs.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-black text-[#FECE14] rounded-lg shrink-0 font-mono font-bold text-sm">
                  €0+
                </div>
                <div>
                  <h4 className="font-bold text-black text-lg">Travel Surcharges</h4>
                  <p className="text-sm text-gray-600">Calculated dynamically based on your Eircode routing key. Locations within our primary Cork zones carry a €0 surcharge.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Coverage Zones from Database */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-black">Active Coverage Zones</h3>
            <p className="text-gray-600">
              We regularly route through the following Munster regions. See live surcharges below:
            </p>

            {loadingZones ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-10 bg-gray-100 rounded-lg" />
                <div className="h-10 bg-gray-100 rounded-lg" />
                <div className="h-10 bg-gray-100 rounded-lg" />
              </div>
            ) : zones.length > 0 ? (
              <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                {zones.map((zone) => (
                  <div key={zone.id} className="flex justify-between items-center p-4 bg-white hover:bg-gray-50 transition-colors">
                    <div>
                      <span className="inline-block bg-black text-[#FECE14] font-mono text-xs font-bold px-2 py-0.5 rounded mr-2">
                        {zone.eircode_prefix}
                      </span>
                      <span className="text-sm font-semibold text-gray-800">{zone.area_name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                      {zone.travel_surcharge === 0 ? 'No Surcharge' : `+€${zone.travel_surcharge.toFixed(2)} Travel`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl text-center text-gray-500 text-sm">
                No active service zones loaded. We cover all of Co. Cork and surrounding areas.
              </div>
            )}
            <p className="text-xs text-gray-400">
              *Remote Munster zones may incur a travel fee to cover transit time. Group booking with neighbors to waive fees!
            </p>
          </div>

        </div>

        {/* Services FAQ Accordion */}
        <div className="border-t border-gray-200 pt-16">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-black text-center mb-12">
              Services FAQ
            </h3>

            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl overflow-hidden bg-white"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full flex justify-between items-center p-6 text-left focus:outline-none focus:ring-2 focus:ring-[#FECE14] focus:ring-offset-2"
                      aria-expanded={isOpen}
                    >
                      <span className="font-bold text-lg text-black pr-4">
                        {faq.q}
                      </span>
                      <span className="shrink-0 text-black">
                        {isOpen ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12M6 12h12" />
                          </svg>
                        )}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                        >
                          <div className="p-6 pt-0 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}