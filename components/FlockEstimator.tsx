'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'

interface ServiceZone {
  eircode_prefix: string
  area_name: string
  is_active: boolean
  travel_surcharge: number
}

export function FlockEstimator() {
  const [breed, setBreed] = useState<'commercial' | 'mountain' | 'pedigree'>('commercial')
  const [service, setService] = useState<'shearing' | 'crutching'>('shearing')
  const [flockSize, setFlockSize] = useState<number>(75)
  const [zones, setZones] = useState<ServiceZone[]>([])
  const [selectedZonePrefix, setSelectedZonePrefix] = useState<string>('T12')
  const [loadingZones, setLoadingZones] = useState<boolean>(true)

  useEffect(() => {
    async function fetchZones() {
      try {
        const { data, error } = await supabase
          .from('service_zones')
          .select('eircode_prefix, area_name, is_active, travel_surcharge')
        if (!error && data) {
          const activeZones = data.filter((z: any) => z.is_active) as ServiceZone[]
          setZones(activeZones)
          if (activeZones.length > 0) {
            // Default to first active zone
            setSelectedZonePrefix(activeZones[0].eircode_prefix)
          }
        }
      } catch (err) {
        console.error('Error fetching service zones:', err)
      } finally {
        setLoadingZones(false)
      }
    }
    fetchZones()
  }, [])

  // Dynamic calculations
  const activeZone = zones.find(z => z.eircode_prefix === selectedZonePrefix)
  const travelSurcharge = activeZone ? Number(activeZone.travel_surcharge) : 0

  const calculateEstimate = () => {
    let ratePerHead = 0
    let timePerSheepMinutes = 0

    if (service === 'shearing') {
      if (breed === 'commercial') {
        if (flockSize <= 50) ratePerHead = 4.50
        else if (flockSize <= 150) ratePerHead = 3.75
        else ratePerHead = 3.00
        timePerSheepMinutes = 3.5
      } else if (breed === 'mountain') {
        if (flockSize <= 50) ratePerHead = 5.00
        else if (flockSize <= 150) ratePerHead = 4.25
        else ratePerHead = 3.50
        timePerSheepMinutes = 4.5
      } else {
        ratePerHead = 12.00
        timePerSheepMinutes = 20.0
      }
    } else {
      if (breed === 'commercial') {
        ratePerHead = 1.75
        timePerSheepMinutes = 1.5
      } else if (breed === 'mountain') {
        ratePerHead = 2.00
        timePerSheepMinutes = 2.0
      } else {
        ratePerHead = 6.00
        timePerSheepMinutes = 8.0
      }
    }

    const rawPrice = flockSize * ratePerHead
    // Apply minimum call-out fee of €150
    const priceWithMinimum = Math.max(150, rawPrice)
    const totalPrice = priceWithMinimum + travelSurcharge

    // Duration: 45 mins setup/cleanup buffer + dynamic time
    const setupBuffer = 45
    const totalMinutes = setupBuffer + (flockSize * timePerSheepMinutes)
    const hoursDecimal = totalMinutes / 60

    const durationMin = Math.max(1, Math.round(hoursDecimal * 0.9 * 2) / 2)
    const durationMax = Math.round(hoursDecimal * 1.1 * 2) / 2

    const priceMin = Math.round(totalPrice * 0.95)
    const priceMax = Math.round(totalPrice * 1.05)

    const isMinimumApplied = rawPrice < 150

    return {
      priceMin,
      priceMax,
      durationMin,
      durationMax,
      isMinimumApplied,
    }
  }

  const estimate = calculateEstimate()

  return (
    <section id="estimator" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#FDFBF7] text-[#111827] overflow-hidden">
      {/* Decorative top border representing a perfectly swept board */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FECE14] via-[#000000] to-[#FECE14]" />

      <div className="max-w-7xl mx-auto">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#FECE14]/20 text-[#000000] border border-[#FECE14]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
            Flock Estimator Quick-Tool
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight font-display text-[#000000] leading-none">
            Get an Instant Estimate
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#111827]/80 font-sans max-w-2xl mx-auto">
            No hidden fees, no phone tag. Adjust the slider to match your flock size and get an instant guide price and time estimate for your shearing day.
          </p>
        </div>

        {/* Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-8 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-[#000000]/5">
            
            {/* 1. Breed Type Selector */}
            <div className="space-y-3">
              <label className="block text-sm font-bold uppercase tracking-wider text-[#000000]">
                1. Select Your Breed Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'commercial',
                    label: 'Lowland / Commercial',
                    desc: 'e.g., Texel, Suffolk, Charollais',
                  },
                  {
                    id: 'mountain',
                    label: 'Mountain / Blackface',
                    desc: 'e.g., Scottish Blackface, Cheviot',
                  },
                  {
                    id: 'pedigree',
                    label: 'Pedigree / Show Prep',
                    desc: 'Requires precision custom cuts',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBreed(item.id as any)}
                    className={`relative p-4 rounded-xl text-left border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FECE14] focus:ring-offset-2 ${
                      breed === item.id
                        ? 'border-[#000000] bg-[#000000] text-white shadow-md'
                        : 'border-[#000000]/10 bg-white text-[#111827] hover:border-[#000000]/30 hover:bg-[#FDFBF7]'
                    }`}
                  >
                    <div className="font-bold text-sm sm:text-xs xl:text-sm">{item.label}</div>
                    <div className={`mt-1 text-xs ${breed === item.id ? 'text-[#FECE14]' : 'text-[#111827]/60'}`}>
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Service Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-bold uppercase tracking-wider text-[#000000]">
                2. Select Your Service
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'shearing',
                    label: 'Full Shearing',
                    desc: 'Complete fleece removal',
                    icon: (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                      </svg>
                    ),
                  },
                  {
                    id: 'crutching',
                    label: 'Crutching / Dagging',
                    desc: 'Clean-up around tail and legs',
                    icon: (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    ),
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setService(item.id as any)}
                    className={`flex items-start gap-3 p-4 rounded-xl text-left border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FECE14] focus:ring-offset-2 ${
                      service === item.id
                        ? 'border-[#000000] bg-[#000000] text-white shadow-md'
                        : 'border-[#000000]/10 bg-white text-[#111827] hover:border-[#000000]/30 hover:bg-[#FDFBF7]'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${service === item.id ? 'bg-[#FECE14] text-[#000000]' : 'bg-[#000000]/5 text-[#000000]'}`}>
                      {item.icon}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{item.label}</div>
                      <div className={`text-xs ${service === item.id ? 'text-[#FECE14]' : 'text-[#111827]/60'}`}>
                        {item.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Slider Block */}
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <label htmlFor="flock-slider" className="text-sm font-bold uppercase tracking-wider text-[#000000]">
                  3. Adjust Flock Size
                </label>
                <div className="flex items-center gap-1.5 bg-[#FECE14] text-[#000000] px-3 py-1 rounded-full font-mono font-bold text-lg">
                  {flockSize} <span className="text-xs uppercase font-sans font-bold">head</span>
                </div>
              </div>

              <div className="relative pt-2">
                <input
                  id="flock-slider"
                  type="range"
                  min="10"
                  max="500"
                  step="5"
                  value={flockSize}
                  onChange={(e) => setFlockSize(Number(e.target.value))}
                  className="w-full h-2 bg-[#000000]/10 rounded-lg appearance-none cursor-pointer accent-[#000000] focus:outline-none focus:ring-2 focus:ring-[#FECE14]"
                />
                <div className="flex justify-between text-xs font-mono text-[#111827]/50 mt-2">
                  <span>10 Sheep</span>
                  <span>150</span>
                  <span>300</span>
                  <span>500+</span>
                </div>
              </div>
            </div>

            {/* 4. Service Zone / Eircode Prefix Selector */}
            <div className="space-y-3 pt-2 border-t border-[#000000]/5">
              <div className="flex justify-between items-baseline">
                <label className="block text-sm font-bold uppercase tracking-wider text-[#000000]">
                  4. Select Your Location (Munster)
                </label>
                {activeZone && activeZone.travel_surcharge > 0 && (
                  <span className="text-xs bg-[#D97706]/10 text-[#D97706] font-semibold px-2 py-0.5 rounded">
                    +€{activeZone.travel_surcharge} Travel Fee
                  </span>
                )}
              </div>
              
              {loadingZones ? (
                <div className="h-10 bg-[#000000]/5 animate-pulse rounded-lg" />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {zones.map((zone) => (
                    <button
                      key={zone.eircode_prefix}
                      type="button"
                      onClick={() => setSelectedZonePrefix(zone.eircode_prefix)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                        selectedZonePrefix === zone.eircode_prefix
                          ? 'bg-[#FECE14] border-[#000000] text-[#000000] shadow-sm'
                          : 'bg-[#FDFBF7] border-[#000000]/10 text-[#111827] hover:border-[#000000]/20'
                      }`}
                    >
                      <span className="block font-mono font-bold text-sm">{zone.eircode_prefix}</span>
                      <span className="block text-[10px] opacity-75 truncate">{zone.area_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Dynamic Output Sticky Card */}
          <div className="lg:col-span-5 lg:sticky lg:top-8">
            <div className="bg-[#000000] text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              {/* Decorative accent graphic */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FECE14]/10 rounded-full blur-2xl pointer-events-none" />

              <h3 className="text-xl font-bold tracking-tight text-[#FECE14] border-b border-white/10 pb-4">
                Estimate Summary
              </h3>

              {/* Dynamic Price Display */}
              <div className="py-6 space-y-2">
                <span className="text-xs font-semibold tracking-widest text-white/60 uppercase block">
                  Estimated Price Range
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-white font-mono">
                    €{estimate.priceMin} - €{estimate.priceMax}
                  </span>
                </div>
                {estimate.isMinimumApplied && (
                  <p className="text-xs text-[#FECE14] font-medium flex items-center gap-1 mt-1">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Minimum booking charge of €150 applied
                  </p>
                )}
              </div>

              {/* Dynamic Duration Display */}
              <div className="py-4 border-t border-b border-white/10 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-white/50 block">Est. Duration</span>
                  <span className="text-lg font-bold text-white font-mono">
                    {estimate.durationMin} - {estimate.durationMax} hrs
                  </span>
                </div>
                <div>
                  <span className="text-xs text-white/50 block">Per Sheep Rate</span>
                  <span className="text-lg font-bold text-[#FECE14] font-mono">
                    ~€{(estimate.priceMin / flockSize).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* What's Included */}
              <div className="py-6 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-white/70 block">
                  What’s Included:
                </span>
                <ul className="space-y-2.5 text-sm text-white/90">
                  {[
                    'Professional shearing by a certified master shearer',
                    'Calm, low-stress animal handling techniques',
                    'Complete post-shear board sweep & clean-up',
                    'Wool packed neatly into your wool sacks',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="p-0.5 rounded bg-[#16A34A] text-white mt-0.5 shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Call to Action */}
              <a
                href="#book"
                className="block w-full text-center bg-[#FECE14] text-[#000000] font-bold py-4 px-6 rounded-xl hover:bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#FECE14]/50 hover:shadow-lg active:scale-[0.98]"
              >
                Book This Estimate
              </a>

              <p className="text-center text-[11px] text-white/40 mt-3">
                *Final rates confirmed upon route verification and local setup review.
              </p>
            </div>
          </div>

        </div>

        {/* Premium Testimonial Section in Section 1 */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="relative bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-[#000000]/5 overflow-hidden">
            {/* Elegant massive quotation marks */}
            <div className="absolute -top-4 -left-2 text-[120px] font-serif text-[#000000]/5 leading-none select-none pointer-events-none">
              “
            </div>
            
            <figure className="relative z-10 space-y-6">
              <blockquote className="text-lg sm:text-xl font-medium italic text-[#111827] leading-relaxed">
                "Most shearers leave your yard looking like a bomb went off. sheepsheeran arrived exactly when they said they would, sheared 120 ewes without a fuss, and left the shed cleaner than it was when they arrived. Absolute professionals. I won't use anyone else now."
              </blockquote>
              
              <hr className="border-[#000000]/10 w-16" />

              <figcaption className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#000000] text-[#FECE14] flex items-center justify-center font-bold text-lg font-mono">
                  MO
                </div>
                <div>
                  <div className="font-bold text-base text-[#000000]">Michael O'Connor</div>
                  <div className="text-xs text-[#111827]/60">Dairy & Sheep Farmer, Macroom, Co. Cork</div>
                </div>
              </figcaption>
            </figure>
          </div>
        </div>

      </div>
    </section>
  )
}