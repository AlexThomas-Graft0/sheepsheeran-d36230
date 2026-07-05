'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

interface ServiceZone {
  id: string;
  eircode_prefix: string;
  area_name: string;
  is_active: boolean;
  travel_surcharge: number;
  created_at?: string;
}

export function ServiceAreaChecker() {
  const [zones, setZones] = useState<ServiceZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputEircode, setInputEircode] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  
  // Validation output states
  const [validationState, setValidationState] = useState<'idle' | 'primary' | 'secondary' | 'out_of_bounds'>('idle');
  const [matchedZone, setMatchedZone] = useState<ServiceZone | null>(null);

  // Custom Enquiry form states for out-of-bounds leads
  const [enquiryName, setEnquiryName] = useState('');
  const [enquiryEmail, setEnquiryEmail] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  // Fallback reference list to guarantee a rich experience even with empty database
  const fallbackZones: ServiceZone[] = [
    { id: '1', eircode_prefix: 'T12', area_name: 'Cork City North', is_active: true, travel_surcharge: 0 },
    { id: '2', eircode_prefix: 'T23', area_name: 'Cork City South', is_active: true, travel_surcharge: 0 },
    { id: '3', eircode_prefix: 'P81', area_name: 'Bantry / West Cork', is_active: true, travel_surcharge: 15 },
    { id: '4', eircode_prefix: 'P85', area_name: 'Clonakilty', is_active: true, travel_surcharge: 10 },
    { id: '5', eircode_prefix: 'V92', area_name: 'Tralee / Kerry', is_active: true, travel_surcharge: 25 },
    { id: '6', eircode_prefix: 'P72', area_name: 'Bandon', is_active: true, travel_surcharge: 0 },
    { id: '7', eircode_prefix: 'P75', area_name: 'Bantry', is_active: true, travel_surcharge: 15 },
    { id: '8', eircode_prefix: 'P51', area_name: 'Mallow / North Cork', is_active: true, travel_surcharge: 15 },
    { id: '9', eircode_prefix: 'P61', area_name: 'Fermoy', is_active: true, travel_surcharge: 10 },
    { id: '10', eircode_prefix: 'P25', area_name: 'Midleton', is_active: true, travel_surcharge: 0 },
    { id: '11', eircode_prefix: 'P24', area_name: 'Cobh', is_active: true, travel_surcharge: 0 },
    { id: '12', eircode_prefix: 'P36', area_name: 'Youghal', is_active: true, travel_surcharge: 15 },
    { id: '13', eircode_prefix: 'V93', area_name: 'South Kerry', is_active: true, travel_surcharge: 30 },
    { id: '14', eircode_prefix: 'V35', area_name: 'South Limerick', is_active: true, travel_surcharge: 30 },
  ];

  useEffect(() => {
    async function fetchZones() {
      try {
        const { data, error } = await supabase
          .from('service_zones')
          .select('id, eircode_prefix, area_name, is_active, travel_surcharge');
        
        if (!error && data && data.length > 0) {
          // Merge custom database zones with fallback zones, filtering out duplicates
          const dbPrefixes = new Set(data.map(z => z.eircode_prefix.toUpperCase()));
          const uniqueFallbacks = fallbackZones.filter(z => !dbPrefixes.has(z.eircode_prefix.toUpperCase()));
          setZones([...data, ...uniqueFallbacks]);
        } else {
          setZones(fallbackZones);
        }
      } catch (err) {
        console.error('Error fetching service zones:', err);
        setZones(fallbackZones);
      } finally {
        setLoading(false);
      }
    }
    fetchZones();
  }, []);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEircode.trim()) return;

    setIsChecking(true);
    setEnquirySuccess(false);

    // Extract first 3 characters, strip spaces, convert to uppercase
    const cleanPrefix = inputEircode.replace(/\s+/g, '').slice(0, 3).toUpperCase();

    // Simulate elite routing calculations for premium UX feel
    setTimeout(() => {
      const match = zones.find(z => z.eircode_prefix.toUpperCase() === cleanPrefix);

      if (match && match.is_active) {
        setMatchedZone(match);
        if (Number(match.travel_surcharge) === 0) {
          setValidationState('primary');
        } else {
          setValidationState('secondary');
        }
      } else {
        // Check standard Munster patterns manually for realistic fallback coverage checks
        const isKnownMunster = ['P72', 'P75', 'P81', 'P85', 'P51', 'P61', 'P25', 'P24', 'P36', 'T12', 'T23', 'V93', 'V94', 'V35'].includes(cleanPrefix);
        if (isKnownMunster) {
          // Treat as secondary zone with custom surcharge if not explicitly in database
          const temporaryZone: ServiceZone = {
            id: 'temp',
            eircode_prefix: cleanPrefix,
            area_name: 'Munster Regional Zone',
            is_active: true,
            travel_surcharge: 30
          };
          setMatchedZone(temporaryZone);
          setValidationState('secondary');
        } else {
          setMatchedZone(null);
          setValidationState('out_of_bounds');
        }
      }
      setIsChecking(false);
    }, 600);
  };

  const handleCustomEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryName || !enquiryEmail || !enquiryMessage) return;

    setSubmittingEnquiry(true);
    try {
      const { error } = await supabase
        .from('enquiries')
        .insert({
          name: enquiryName,
          email: enquiryEmail,
          phone: enquiryPhone,
          message: `[Eircode Checked: ${inputEircode.toUpperCase()}] - ${enquiryMessage}`,
        });

      if (!error) {
        setEnquirySuccess(true);
        setEnquiryName('');
        setEnquiryEmail('');
        setEnquiryPhone('');
        setEnquiryMessage('');
      } else {
        console.error('Error inserting enquiry:', error);
      }
    } catch (err) {
      console.error('Enquiry submission error:', err);
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  return (
    <section id="service-area" className="relative py-24 bg-[#FDFBF7] overflow-hidden">
      {/* Decorative premium background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FECE14]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-black/5 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-black bg-[#FECE14] uppercase mb-4">
            Coverage Map
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#111827] mb-6 font-display">
            Serving Cork &amp; Munster
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed font-sans">
            Enter the first three characters of your Eircode (e.g., <span className="font-mono font-bold bg-[#111827]/5 px-1.5 py-0.5 rounded">P81</span>, <span className="font-mono font-bold bg-[#111827]/5 px-1.5 py-0.5 rounded">T12</span>, <span className="font-mono font-bold bg-[#111827]/5 px-1.5 py-0.5 rounded">V94</span>) to instantly verify if we cover your area and check for any regional travel adjustments.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Interactive Widget */}
          <div className="lg:col-span-7 bg-black text-white rounded-3xl p-8 sm:p-10 shadow-2xl border-2 border-[#FECE14]/20 relative overflow-hidden">
            {/* Top design accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FECE14]" />
            
            <h3 className="text-2xl font-bold mb-2 text-white font-display">
              Eircode Coverage Validator
            </h3>
            <p className="text-gray-400 text-sm mb-8">
              Verify your farm location against our real-time regional route planner.
            </p>

            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label htmlFor="eircode-input" className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">
                  Enter Your Eircode Routing Key (First 3 Characters)
                </label>
                <div className="relative flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-grow">
                    <input
                      id="eircode-input"
                      type="text"
                      maxLength={3}
                      value={inputEircode}
                      onChange={(e) => setInputEircode(e.target.value.toUpperCase())}
                      placeholder="e.g., P81, T12, V94"
                      className="w-full bg-neutral-900 border-2 border-neutral-700 focus:border-[#FECE14] text-white text-xl font-mono font-semibold tracking-widest uppercase rounded-xl px-5 py-4 outline-none transition-all duration-200 placeholder-neutral-600 focus:ring-2 focus:ring-[#FECE14]/35"
                      required
                    />
                    {inputEircode && (
                      <button
                        type="button"
                        onClick={() => { setInputEircode(''); setValidationState('idle'); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                        aria-label="Clear input"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isChecking || !inputEircode}
                    className="bg-[#FECE14] text-black hover:bg-white active:scale-95 transition-all duration-150 font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 text-base font-display shadow-lg disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isChecking ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Verifying...</span>
                      </>
                    ) : (
                      'Verify Coverage'
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Verification State Animations */}
            <div className="mt-8 pt-8 border-t border-neutral-800 min-h-[220px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                
                {/* IDLE STATE */}
                {validationState === 'idle' && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center py-6 text-neutral-500"
                  >
                    <svg className="w-12 h-12 mx-auto mb-3 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm">Enter your Eircode routing key above to run a route calculation.</p>
                  </motion.div>
                )}

                {/* STATE A: SUCCESS (PRIMARY ZONE) */}
                {validationState === 'primary' && matchedZone && (
                  <motion.div
                    key="primary"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-6"
                  >
                    <div className="flex items-start gap-4 p-5 bg-[#16A34A]/10 border border-[#16A34A] rounded-2xl">
                      <div className="p-2.5 bg-[#16A34A] rounded-full text-white flex-shrink-0 mt-0.5">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-mono tracking-widest uppercase bg-[#16A34A] text-white px-2 py-0.5 rounded font-bold">
                          Primary Zone — {matchedZone.eircode_prefix}
                        </span>
                        <h4 className="text-xl font-bold text-white mt-2 font-display">
                          We’ve Got You Covered!
                        </h4>
                        <p className="text-gray-300 text-sm mt-1 leading-relaxed">
                          You are located within our Primary Service Zone (<strong className="text-white">{matchedZone.area_name}</strong>). There are <strong className="text-[#FECE14]">no travel surcharges</strong> for your area, and we have active routes running near you weekly.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-900/60 p-4 rounded-xl border border-neutral-800">
                      <div>
                        <span className="text-xs text-neutral-400 block uppercase">Travel Surcharge</span>
                        <span className="text-xl font-mono font-bold text-[#16A34A]">€0.00 (Waived)</span>
                      </div>
                      <a
                        href="#book-online"
                        className="bg-[#FECE14] text-black hover:bg-white px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-md inline-block font-display text-center"
                      >
                        Request Booking in This Zone
                      </a>
                    </div>
                  </motion.div>
                )}

                {/* STATE B: SUCCESS (SECONDARY ZONE) */}
                {validationState === 'secondary' && matchedZone && (
                  <motion.div
                    key="secondary"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-6"
                  >
                    <div className="flex items-start gap-4 p-5 bg-[#D97706]/10 border border-[#D97706] rounded-2xl">
                      <div className="p-2.5 bg-[#D97706] rounded-full text-white flex-shrink-0 mt-0.5">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-mono tracking-widest uppercase bg-[#D97706] text-white px-2 py-0.5 rounded font-bold">
                          Secondary Zone — {matchedZone.eircode_prefix}
                        </span>
                        <h4 className="text-xl font-bold text-white mt-2 font-display">
                          Coverage Confirmed (Secondary Zone)
                        </h4>
                        <p className="text-gray-300 text-sm mt-1 leading-relaxed">
                          We cover your area (<strong className="text-white">{matchedZone.area_name}</strong>), but a minor travel surcharge of <strong className="text-[#FECE14]">€{Number(matchedZone.travel_surcharge).toFixed(2)}</strong> applies to cover fuel and transit time. 
                          <span className="block mt-2 text-xs text-amber-400 font-semibold bg-amber-950/40 p-2 rounded border border-amber-900/50">
                            💡 Pro-Tip: Ask your neighbors if they need shearing done on the same day—we waive the travel fee for grouped bookings!
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-900/60 p-4 rounded-xl border border-neutral-800">
                      <div>
                        <span className="text-xs text-neutral-400 block uppercase">Travel Surcharge</span>
                        <span className="text-xl font-mono font-bold text-[#D97706]">€{Number(matchedZone.travel_surcharge).toFixed(2)}</span>
                      </div>
                      <a
                        href="#book-online"
                        className="bg-[#FECE14] text-black hover:bg-white px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-md inline-block font-display text-center"
                      >
                        Request Booking for This Zone
                      </a>
                    </div>
                  </motion.div>
                )}

                {/* STATE C: OUT OF BOUNDS */}
                {validationState === 'out_of_bounds' && (
                  <motion.div
                    key="out_of_bounds"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-6"
                  >
                    <div className="flex items-start gap-4 p-5 bg-[#DC2626]/10 border border-[#DC2626] rounded-2xl">
                      <div className="p-2.5 bg-[#DC2626] rounded-full text-white flex-shrink-0 mt-0.5">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-mono tracking-widest uppercase bg-[#DC2626] text-white px-2 py-0.5 rounded font-bold">
                          Outside Active Route
                        </span>
                        <h4 className="text-xl font-bold text-white mt-2 font-display">
                          Outside Our Active Service Area
                        </h4>
                        <p className="text-gray-300 text-sm mt-1 leading-relaxed">
                          We currently do not have active routes in your area (<strong className="text-white">{inputEircode.toUpperCase()}</strong>). However, if you have an exceptionally large flock (200+ head) or can organize multiple neighboring farms for a full day of shearing, we may be able to make a custom trip.
                        </p>
                      </div>
                    </div>

                    {/* Custom Enquiry Form */}
                    {!enquirySuccess ? (
                      <form onSubmit={handleCustomEnquiry} className="bg-neutral-900/80 p-6 rounded-2xl border border-neutral-800 space-y-4">
                        <h5 className="text-sm font-bold text-white uppercase tracking-wider">
                          Submit Custom Enquiry
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] text-gray-400 uppercase mb-1 font-semibold">Name *</label>
                            <input
                              type="text"
                              required
                              value={enquiryName}
                              onChange={(e) => setEnquiryName(e.target.value)}
                              placeholder="e.g. John Hegarty"
                              className="w-full bg-neutral-850 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#FECE14]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-400 uppercase mb-1 font-semibold">Phone</label>
                            <input
                              type="tel"
                              value={enquiryPhone}
                              onChange={(e) => setEnquiryPhone(e.target.value)}
                              placeholder="e.g. 087 123 4567"
                              className="w-full bg-neutral-850 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#FECE14]"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] text-gray-400 uppercase mb-1 font-semibold">Email Address *</label>
                          <input
                            type="email"
                            required
                            value={enquiryEmail}
                            onChange={(e) => setEnquiryEmail(e.target.value)}
                            placeholder="e.g. john@hegartyfarms.ie"
                            className="w-full bg-neutral-850 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#FECE14]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-gray-400 uppercase mb-1 font-semibold">Message &amp; Flock Details *</label>
                          <textarea
                            required
                            rows={3}
                            value={enquiryMessage}
                            onChange={(e) => setEnquiryMessage(e.target.value)}
                            placeholder="Please tell us your approximate flock size, breed, and any other details..."
                            className="w-full bg-neutral-850 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#FECE14] resize-none"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={submittingEnquiry}
                          className="w-full bg-[#FECE14] text-black hover:bg-white py-2.5 rounded-lg font-bold text-sm transition-all shadow-md disabled:opacity-50"
                        >
                          {submittingEnquiry ? 'Sending Enquiry...' : 'Submit Custom Enquiry'}
                        </button>
                      </form>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-6 bg-[#16A34A]/20 border border-[#16A34A] rounded-2xl text-center space-y-2"
                      >
                        <svg className="w-10 h-10 text-[#16A34A] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h5 className="text-white font-bold text-lg">Enquiry Received!</h5>
                        <p className="text-gray-300 text-sm">
                          Thank you. We will verify our schedules and contact you within 24 hours to see if we can accommodate your custom trip.
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Right Column: Dynamic Reference List & Visual Showcase */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Active Coverage Zones Reference List */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <h4 className="text-xl font-bold text-[#111827] mb-6 font-display flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-ping" />
                Active Reference Zones
              </h4>
              
              <div className="space-y-6">
                <div>
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">West Cork</h5>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-800 border border-gray-200">
                      Bandon <strong className="font-mono text-black ml-1.5">P72</strong>
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-800 border border-gray-200">
                      Clonakilty <strong className="font-mono text-black ml-1.5">P85</strong>
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-800 border border-gray-200">
                      Bantry <strong className="font-mono text-black ml-1.5">P75</strong>
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-800 border border-gray-200">
                      Skibbereen <strong className="font-mono text-black ml-1.5">P81</strong>
                    </span>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">North Cork</h5>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-800 border border-gray-200">
                      Mallow <strong className="font-mono text-black ml-1.5">P51</strong>
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-800 border border-gray-200">
                      Fermoy <strong className="font-mono text-black ml-1.5">P61</strong>
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-800 border border-gray-200">
                      Mitchelstown
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-800 border border-gray-200">
                      Charleville
                    </span>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">East Cork &amp; City</h5>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-800 border border-gray-200">
                      Midleton <strong className="font-mono text-black ml-1.5">P25</strong>
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-800 border border-gray-200">
                      Cobh <strong className="font-mono text-black ml-1.5">P24</strong>
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-800 border border-gray-200">
                      Youghal <strong className="font-mono text-black ml-1.5">P36</strong>
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-800 border border-gray-200">
                      Cork City <strong className="font-mono text-black ml-1.5">T12/T23</strong>
                    </span>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Adjacent Counties</h5>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-800 border border-gray-200">
                      South Kerry <strong className="font-mono text-black ml-1.5">V93</strong>
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-800 border border-gray-200">
                      West Waterford <strong className="font-mono text-black ml-1.5">P51</strong>
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-800 border border-gray-200">
                      South Limerick <strong className="font-mono text-black ml-1.5">V35</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Visual Card */}
            <div className="relative rounded-3xl overflow-hidden group shadow-xl h-64">
              <img
                src="https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80"
                alt="Sheep on Munster pasture"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-xs font-bold tracking-widest text-[#FECE14] uppercase">Munster Wide Routes</span>
                <p className="text-lg font-bold mt-1 font-display">Biosecure Equipment &amp; Rapid Service</p>
                <p className="text-xs text-gray-300 mt-1">We sterilize all trailers and handpieces between farms to protect against sheep scab and parasites.</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}