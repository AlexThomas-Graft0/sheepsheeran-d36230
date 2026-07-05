'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  UserCheck, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle,
  Scissors,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface ServiceZone {
  id: string;
  eircode_prefix: string;
  area_name: string;
  is_active: boolean;
  travel_surcharge: number;
}

const FALLBACK_ZONES: ServiceZone[] = [
  { id: '1', eircode_prefix: 'T12', area_name: 'Cork City North', is_active: true, travel_surcharge: 0.00 },
  { id: '2', eircode_prefix: 'T23', area_name: 'Cork City South', is_active: true, travel_surcharge: 0.00 },
  { id: '3', eircode_prefix: 'P81', area_name: 'Bantry / West Cork', is_active: true, travel_surcharge: 15.00 },
  { id: '4', eircode_prefix: 'P85', area_name: 'Clonakilty', is_active: true, travel_surcharge: 10.00 },
  { id: '5', eircode_prefix: 'V92', area_name: 'Tralee / Kerry', is_active: true, travel_surcharge: 25.00 }
];

export function Hero() {
  // Tabs for the interactive widget
  const [activeTab, setActiveTab] = useState<'estimator' | 'slider'>('estimator');

  // Flock Estimator State
  const [breedType, setBreedType] = useState<'commercial' | 'mountain' | 'pedigree'>('commercial');
  const [serviceType, setServiceType] = useState<'full' | 'crutching'>('full');
  const [flockSize, setFlockSize] = useState<number>(75);
  const [selectedZone, setSelectedZone] = useState<string>('T12');
  const [zones, setZones] = useState<ServiceZone[]>([]);

  // Before/After Slider State
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Load active zones from database
  useEffect(() => {
    async function fetchZones() {
      try {
        const { data, error } = await supabase
          .from('service_zones')
          .select('*')
          .eq('is_active', true)
          .order('eircode_prefix', { ascending: true });
        if (data && !error) {
          setZones(data);
          if (data.length > 0) {
            setSelectedZone(data[0].eircode_prefix);
          }
        } else {
          setZones(FALLBACK_ZONES);
        }
      } catch {
        setZones(FALLBACK_ZONES);
      }
    }
    fetchZones();
  }, []);

  // Handle Before/After slider dragging
  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) handleSliderMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) handleSliderMove(e.clientX);
  };

  // Live dynamic calculation for estimate
  const getCalculatedEstimate = () => {
    let basePricePerHead = 3.50;
    let durationPerSheepMinutes = 2.0;

    if (serviceType === 'crutching') {
      basePricePerHead = 1.50;
      durationPerSheepMinutes = 1.0;
    } else {
      if (breedType === 'pedigree') {
        basePricePerHead = 10.00;
        durationPerSheepMinutes = 12.0;
      } else if (breedType === 'mountain') {
        if (flockSize <= 50) {
          basePricePerHead = 4.00;
        } else if (flockSize <= 150) {
          basePricePerHead = 3.50;
        } else {
          basePricePerHead = 2.80;
        }
        durationPerSheepMinutes = 2.2;
      } else { // commercial
        if (flockSize <= 50) {
          basePricePerHead = 4.50;
        } else if (flockSize <= 150) {
          basePricePerHead = 4.00;
        } else {
          basePricePerHead = 3.00;
        }
        durationPerSheepMinutes = 1.8;
      }
    }

    let rawCost = flockSize * basePricePerHead;
    const minFee = 150;
    if (rawCost < minFee) {
      rawCost = minFee;
    }

    const selectedZoneObj = zones.find(z => z.eircode_prefix === selectedZone);
    const surcharge = selectedZoneObj ? Number(selectedZoneObj.travel_surcharge) : 0;
    const totalCost = rawCost + surcharge;

    const rawDurationMins = (flockSize * durationPerSheepMinutes) + 45; // 45 mins setup & cleanup
    const durationHoursMin = Math.max(1, Math.round((rawDurationMins * 0.9) / 30) * 30 / 60);
    const durationHoursMax = Math.max(1.5, Math.round((rawDurationMins * 1.1) / 30) * 30 / 60);

    return {
      costMin: Math.floor(totalCost * 0.95),
      costMax: Math.ceil(totalCost * 1.05),
      durationMin: durationHoursMin,
      durationMax: durationHoursMax,
      surcharge
    };
  };

  const estimate = getCalculatedEstimate();

  const handleScrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen bg-[#FDFBF7] text-[#111827] overflow-hidden font-sans pt-16 pb-24 lg:pt-24 lg:pb-32">
      {/* Decorative premium grid and background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#FECE14_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-[0.15] pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#FECE14] opacity-[0.08] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#1E3F20] opacity-[0.04] blur-[100px] rounded-full pointer-events-none" />

      {/* Trust Bar Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#111827]/10 pb-6">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold tracking-widest bg-[#1E3F20] text-[#FECE14] px-3 py-1 rounded-full uppercase">
              ★ Active Booking Season
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs text-[#1A202C] font-semibold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#1E3F20]" /> Fully Insured Munster Public Liability
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FECE14]" /> 100% Biosecure Sterilization
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Headline copy, actions, and premium testimonial */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1E3F20]/5 border border-[#1E3F20]/15">
                <Scissors className="w-4 h-4 text-[#1E3F20]" />
                <span className="text-xs font-bold tracking-wider text-[#1E3F20] uppercase font-mono">
                  PREMIUM MOBILE SHEEP SHEARING
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1E3F20] leading-[1.1]">
                The Cleanest Cut. <br />
                <span className="text-[#111827] relative inline-block">
                  The Cleanest Yard.
                  <span className="absolute left-0 bottom-2 w-full h-2 bg-[#FECE14] -z-10 transform -rotate-1" />
                </span>
              </h1>
              
              <p className="text-base sm:text-lg text-[#1A202C] leading-relaxed max-w-2xl font-normal">
                Professional, reliable mobile sheep shearing across Cork and Munster. We handle your flock with expert care, maximize your wool value, and sweep the floor clean before we leave.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => {
                  setActiveTab('estimator');
                  handleScrollToId('interactive-panel');
                }}
                className="px-6 py-3.5 bg-[#FECE14] hover:bg-[#e0b40b] text-[#000000] font-bold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 duration-200 flex items-center gap-2 text-sm sm:text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FECE14] outline-none"
              >
                Estimate Your Flock Cost
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handleScrollToId('coverage')}
                className="px-6 py-3.5 bg-white hover:bg-zinc-50 border-2 border-[#1E3F20]/20 text-[#1E3F20] font-bold rounded-lg transition-all duration-200 flex items-center gap-2 text-sm sm:text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1E3F20]/20 outline-none"
              >
                Check Service Area
              </button>
            </div>

            {/* Premium client testimonial */}
            <div className="relative pt-8 border-t border-[#111827]/10">
              <div className="absolute -top-3 left-6 bg-[#FDFBF7] px-3 text-[#1E3F20]">
                <MessageSquare className="w-6 h-6 fill-current opacity-20" />
              </div>
              <blockquote className="text-sm sm:text-base italic text-[#1A202C] leading-relaxed">
                &ldquo;Most shearers leave your yard looking like a bomb went off. sheepsheeran arrived exactly when they said they would, sheared 120 ewes without a fuss, and left the shed cleaner than it was when they arrived. Absolute professionals. I won&apos;t use anyone else now.&rdquo;
              </blockquote>
              <div className="mt-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1E3F20] flex items-center justify-center text-[#FECE14] font-bold text-sm font-mono">
                  MO
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[#1E3F20]">Michael O&apos;Connor</p>
                  <p className="text-[11px] sm:text-xs text-[#1A202C]/70">Dairy & Sheep Farmer, Macroom, Co. Cork</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Premium Dynamic Widget Panel */}
          <div id="interactive-panel" className="lg:col-span-5 w-full scroll-mt-24">
            <div className="bg-white rounded-2xl shadow-xl border border-[#111827]/10 overflow-hidden">
              
              {/* Tab Switcher Header */}
              <div className="grid grid-cols-2 bg-zinc-100 border-b border-[#111827]/10 p-1">
                <button
                  onClick={() => setActiveTab('estimator')}
                  className={`py-3 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                    activeTab === 'estimator'
                      ? 'bg-white text-[#1E3F20] shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <Calculator className="w-4 h-4" />
                  Flock Estimator
                </button>
                <button
                  onClick={() => setActiveTab('slider')}
                  className={`py-3 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                    activeTab === 'slider'
                      ? 'bg-white text-[#1E3F20] shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Clean-Site Slider
                </button>
              </div>

              {/* Tab Content 1: Dynamic Flock Estimator */}
              {activeTab === 'estimator' && (
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#1E3F20] flex items-center gap-2">
                      Get an Instant Estimate
                    </h3>
                    <p className="text-xs text-[#1A202C]/70">
                      No hidden fees. Adjust options to match your flock.
                    </p>
                  </div>

                  {/* Breed Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block">
                      Select Your Breed Type:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'commercial', label: 'Lowland / Commercial' },
                        { id: 'mountain', label: 'Mountain / Blackface' },
                        { id: 'pedigree', label: 'Pedigree / Show Prep' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setBreedType(item.id as any)}
                          className={`p-2.5 rounded-lg text-[11px] sm:text-xs font-semibold border transition-all text-center flex flex-col justify-between h-14 ${
                            breedType === item.id
                              ? 'bg-[#1E3F20] text-white border-[#1E3F20]'
                              : 'bg-[#FDFBF7] text-zinc-700 border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <span className="block truncate w-full">{item.label.split(' / ')[0]}</span>
                          <span className="text-[9px] opacity-80 block truncate w-full">
                            {item.label.split(' / ')[1] || 'Custom'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Service Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block">
                      Select Your Service:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'full', label: 'Full Shearing', desc: 'Complete fleece' },
                        { id: 'crutching', label: 'Crutching / Dagging', desc: 'Tail & legs clean-up' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setServiceType(item.id as any)}
                          className={`p-2.5 rounded-lg text-xs font-semibold border transition-all text-left flex flex-col justify-between h-14 ${
                            serviceType === item.id
                              ? 'bg-[#1E3F20] text-white border-[#1E3F20]'
                              : 'bg-[#FDFBF7] text-zinc-700 border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <span className="font-bold">{item.label.split(' / ')[0]}</span>
                          <span className="text-[10px] opacity-80 block">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Range Slider for Flock Size */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                        Adjust Flock Size:
                      </label>
                      <span className="font-mono text-sm font-bold bg-[#FECE14]/20 text-[#1E3F20] px-2 py-0.5 rounded">
                        {flockSize} {flockSize === 500 ? '500+ Head' : 'Head'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="500"
                      step="5"
                      value={flockSize}
                      onChange={(e) => setFlockSize(Number(e.target.value))}
                      className="w-full accent-[#1E3F20] h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                      <span>10 sheep</span>
                      <span>250 sheep</span>
                      <span>500+ sheep</span>
                    </div>
                  </div>

                  {/* Eircode Zone Surcharge Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block">
                      Eircode Location (Travel Fee Check):
                    </label>
                    <select
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-zinc-200 bg-[#FDFBF7] text-xs font-semibold text-zinc-800 outline-none focus:ring-2 focus:ring-[#1E3F20]"
                    >
                      {zones.map((zone) => (
                        <option key={zone.id} value={zone.eircode_prefix}>
                          {zone.eircode_prefix} - {zone.area_name} {Number(zone.travel_surcharge) === 0 ? '(Free Travel)' : `(+€${Number(zone.travel_surcharge)} travel)`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Calculated Dynamic Outputs */}
                  <div className="bg-[#1E3F20] text-white rounded-xl p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4 divide-x divide-white/10 text-center">
                      <div>
                        <p className="text-[10px] text-white/70 uppercase tracking-widest font-semibold">Estimated Price</p>
                        <p className="text-xl sm:text-2xl font-black text-[#FECE14] font-mono mt-0.5">
                          €{estimate.costMin} - €{estimate.costMax}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/70 uppercase tracking-widest font-semibold">Duration Guide</p>
                        <p className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                          {estimate.durationMin} - {estimate.durationMax} hrs
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-3 space-y-2">
                      <p className="text-[11px] text-white/80 font-semibold mb-1">What&apos;s Included In This Estimate:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-white/90">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#FECE14] shrink-0" />
                          <span>Certified Master Shearer</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#FECE14] shrink-0" />
                          <span>Low-stress Animal Handling</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#FECE14] shrink-0" />
                          <span>Complete Board Sweep</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#FECE14] shrink-0" />
                          <span>Wool Packed & Pressed</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic CTA button */}
                  <button
                    onClick={() => handleScrollToId('booking')}
                    className="w-full py-3 bg-[#FECE14] hover:bg-[#e0b40b] text-[#000000] font-black rounded-lg text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow hover:shadow-md flex items-center justify-center gap-2"
                  >
                    Book This Estimate
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Tab Content 2: Before/After Slider */}
              {activeTab === 'slider' && (
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#1E3F20] flex items-center gap-2">
                      We Don&apos;t Just Shear. We Clean.
                    </h3>
                    <p className="text-xs text-[#1A202C]/70">
                      Drag the slider below to see the difference between standard contract shearers and the sheepsheeran clean-site standard.
                    </p>
                  </div>

                  {/* Interactive Before/After Visualizer */}
                  <div 
                    ref={sliderContainerRef}
                    onMouseMove={handleMouseMove}
                    onTouchMove={handleTouchMove}
                    className="relative aspect-video rounded-xl overflow-hidden select-none cursor-ew-resize border border-zinc-200"
                  >
                    {/* Before Image (The "Other" Guys) */}
                    <img 
                      src="https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&q=80&w=800"
                      alt="The Other Guys messy shearing board"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute left-4 top-4 bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded shadow-sm">
                      The &ldquo;Other&rdquo; Guys
                    </div>

                    {/* After Image Container (sheepsheeran Standard) */}
                    <div 
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      <img 
                        src="https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&q=80&w=800"
                        alt="sheepsheeran clean-swept standard"
                        className="absolute inset-0 w-full h-full object-cover max-w-none"
                        style={{ width: sliderContainerRef.current?.getBoundingClientRect().width }}
                      />
                      <div className="absolute left-4 top-4 bg-[#1E3F20] text-[#FECE14] text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded shadow-sm whitespace-nowrap">
                        sheepsheeran Standard
                      </div>
                    </div>

                    {/* Divider Line & Handle */}
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-[#FECE14] cursor-ew-resize"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#FECE14] text-[#000000] shadow-lg flex items-center justify-center border-2 border-white">
                        <span className="text-xs font-bold font-mono">↔</span>
                      </div>
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="bg-[#FDFBF7] p-3.5 rounded-lg border border-zinc-200 text-xs text-zinc-700 leading-relaxed">
                    <p className="font-semibold text-[#1E3F20] mb-0.5">The Zero-Mess Guarantee</p>
                    We respect your farm. Our post-shear clean-up is built into every booking as standard. No extra fees, no extra labor for you. We sweep the board and pack fleeces professionally.
                  </div>

                  <button
                    onClick={() => handleScrollToId('guarantee')}
                    className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-[#1E3F20] font-bold rounded-lg text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5"
                  >
                    Learn More About Our Clean Guarantee
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}