'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

interface PortfolioItem {
  id: string;
  title: string;
  breed: string;
  image_url: string;
  description: string;
}

export function PillarsAndGuarantee() {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const [activeStep, setActiveStep] = useState<number>(0);
  const [portfolioProof, setPortfolioProof] = useState<PortfolioItem[]>([]);
  const [loadingProof, setLoadingProof] = useState<boolean>(true);

  // Fetch verified portfolio items to display as live proof of the guarantee
  useEffect(() => {
    async function fetchProof() {
      try {
        const { data, error } = await supabase
          .from('portfolio_gallery')
          .select('id, title, breed, image_url, description')
          .order('display_order', { ascending: true })
          .limit(2);

        if (!error && data) {
          setPortfolioProof(data as PortfolioItem[]);
        }
      } catch (err) {
        console.error('Error fetching portfolio proof:', err);
      } finally {
        setLoadingProof(false);
      }
    }
    fetchProof();
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const steps = [
    {
      number: '01',
      title: 'Secure Handling & Setup',
      desc: 'We set up our mobile shearing rig on a flat, secure surface. We ensure the penning area minimizes sheep movement to keep stress levels low before they even reach the board.',
      metric: 'Calm Setup'
    },
    {
      number: '02',
      title: 'Precision Shearing',
      desc: 'Using clean, sharp, sterilized gear, we execute swift, single-pass cuts. This maximizes your staple length, minimizes second cuts, and ensures your sheep are sheared safely without unnecessary nicks.',
      metric: 'Single-Pass Cut'
    },
    {
      number: '03',
      title: 'Professional Fleece Packing',
      desc: "We don't leave fleeces in a tangled pile. We roll and pack your wool neatly into your wool sacks, keeping the clean fleece separate from any dirty dags or floor sweepings to protect your wool's market value.",
      metric: 'Value Maximized'
    },
    {
      number: '04',
      title: 'The Clean Sweep',
      desc: 'Before we load our gear onto the truck, we sweep the entire shearing area. We collect all loose wool scraps, dags, and dirt, leaving your yard clean, safe, and ready for your daily operations.',
      metric: 'Zero Yard Mess'
    }
  ];

  return (
    <section className="relative bg-[#FDFBF7] text-[#1A202C] py-20 px-4 sm:px-6 lg:px-8 overflow-hidden font-sans">
      {/* Decorative subtle background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e3f2005_1px,transparent_1px),linear-gradient(to_bottom,#1e3f2005_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-28">
        
        {/* ================= SECTION 1: THREE PILLARS ================= */}
        <div>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#1E3F20]/10 text-[#1E3F20]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FECE14]" />
              Premium Mobile Sheep Shearing
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E3F20] tracking-tight">
              The Cleanest Cut. <span className="underline decoration-[#FECE14] decoration-wavy decoration-2">The Cleanest Yard.</span>
            </h2>
            <p className="mt-4 text-lg text-[#1A202C]/80 leading-relaxed">
              Professional, reliable mobile sheep shearing across Cork and Munster. We handle your flock with expert care, maximize your wool value, and sweep the floor clean before we leave.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-[#1E3F20]/5 hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#1E3F20]/10 flex items-center justify-center mb-6 group-hover:bg-[#1E3F20] transition-colors duration-300">
                  {/* Shearing handpiece icon */}
                  <svg className="w-6 h-6 text-[#1E3F20] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xs font-bold tracking-wider text-[#FECE14] uppercase bg-black px-2.5 py-1 rounded">Pillar 1</span>
                <h3 className="text-xl font-bold text-[#1E3F20] mt-3 mb-4">Animal Welfare First</h3>
                <p className="text-[#1A202C]/80 leading-relaxed text-sm">
                  High stress ruins fleece quality and harms your stock. We use smooth, low-stress handling techniques perfected over years of shearing. Your sheep remain calm, minimizing risk and ensuring a clean, swift cut every time.
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-2 text-xs font-semibold text-[#1E3F20]">
                <span>Calm, Skilled Handling</span>
              </div>
            </motion.div>

            {/* Pillar 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-[#1E3F20]/5 hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#1E3F20]/10 flex items-center justify-center mb-6 group-hover:bg-[#1E3F20] transition-colors duration-300">
                  {/* Clean fleece icon */}
                  <svg className="w-6 h-6 text-[#1E3F20] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="text-xs font-bold tracking-wider text-[#FECE14] uppercase bg-black px-2.5 py-1 rounded">Pillar 2</span>
                <h3 className="text-xl font-bold text-[#1E3F20] mt-3 mb-4">Maximize Your Wool Yield</h3>
                <p className="text-[#1A202C]/80 leading-relaxed text-sm">
                  Avoidable second cuts reduce the market value of your wool. Our precision shearing technique delivers clean, single-pass cuts that keep the staple length intact, ensuring your wool grades at its highest possible value.
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-2 text-xs font-semibold text-[#1E3F20]">
                <span>Fleece Integrity Maintained</span>
              </div>
            </motion.div>

            {/* Pillar 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-[#1E3F20]/5 hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#1E3F20]/10 flex items-center justify-center mb-6 group-hover:bg-[#1E3F20] transition-colors duration-300">
                  {/* Broom icon */}
                  <svg className="w-6 h-6 text-[#1E3F20] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="text-xs font-bold tracking-wider text-[#FECE14] uppercase bg-black px-2.5 py-1 rounded">Pillar 3</span>
                <h3 className="text-xl font-bold text-[#1E3F20] mt-3 mb-4">Zero Mess Left Behind</h3>
                <p className="text-[#1A202C]/80 leading-relaxed text-sm">
                  Most shearers pack up and leave you with a mountain of swept debris and scattered wool. We don’t. We sweep the shearing board clean, pack the fleeces professionally, and leave your yard exactly how we found it.
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-2 text-xs font-semibold text-[#1E3F20]">
                <span>The Clean-Site Guarantee</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ================= SECTION 2: THE BEFORE/AFTER SLIDER ================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#1E3F20]/10 text-[#1E3F20]">
                Interactive Comparison
              </span>
              <h3 className="text-3xl font-extrabold text-[#1E3F20] tracking-tight">
                We Don't Just Shear. <br className="hidden sm:inline" />
                <span className="text-black bg-[#FECE14] px-2 py-1 rounded">We Clean.</span>
              </h3>
              <p className="text-base text-[#1A202C]/80 leading-relaxed">
                Drag the slider to see the difference between standard contract shearers and the <span className="font-semibold text-[#1E3F20]">sheepsheeran</span> clean-site standard. We respect your farm. Our post-shear clean-up is built into every booking as standard. No extra fees, no extra labor for you.
              </p>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">The "Other" Guys</h4>
                    <p className="text-xs text-gray-500">Swept-aside dags, loose wool scattered across dirty concrete, oil stains, and messy piles left for the farmer.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1E3F20]">The sheepsheeran Standard</h4>
                    <p className="text-xs text-gray-500">Spotless concrete floor, neatly packed wool sacks stacked ready for transport, and a clean, safe workspace.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a 
                  href="#book" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-lg shadow-sm text-black bg-[#FECE14] hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FECE14] transition-all duration-200"
                >
                  Book Your Clean Shear
                </a>
              </div>
            </div>

            {/* Interactive Slider Widget */}
            <div className="lg:col-span-7">
              <div 
                ref={sliderRef}
                className="relative h-[350px] sm:h-[450px] w-full rounded-2xl overflow-hidden select-none cursor-ew-resize shadow-md border-4 border-white"
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
              >
                {/* Left Side: Messy (Default Background) */}
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=1200')" }}>
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-md shadow">
                    The "Other" Guys (Messy Yard)
                  </div>
                </div>

                {/* Right Side: Clean (Clipping Overlay) */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-75"
                  style={{ 
                    backgroundImage: "url('https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&q=80&w=1200')",
                    clipPath: `inset(0 0 0 ${sliderPosition}%)`
                  }}
                >
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute top-4 right-4 bg-[#1E3F20] text-white text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-md shadow border border-[#FECE14]">
                    sheepsheeran Standard (Clean)
                  </div>
                </div>

                {/* Slider Handle Line */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-[#FECE14] cursor-ew-resize"
                  style={{ left: `${sliderPosition}%` }}
                >
                  {/* Handle Knob */}
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-black border-4 border-[#FECE14] flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-[#FECE14]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </div>
                </div>

                {/* Simple helper badge */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-white text-xs font-medium tracking-wide pointer-events-none">
                  ← Drag or Hover to Reveal Standard →
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= SECTION 3: THE 4-STEP GUARANTEE ================= */}
        <div className="relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#1E3F20]/10 text-[#1E3F20]">
              Our Standards
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#1E3F20] tracking-tight">
              The 4-Step Post-Shear Clean Guarantee
            </h2>
            <p className="mt-4 text-lg text-[#1A202C]/80">
              Our signature guarantee is what sets us apart. We don't consider the job complete until these four steps are executed on your shearing board.
            </p>
          </div>

          {/* Stepper Grid/Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
            
            {/* Horizontal progress bar for desktop */}
            <div className="hidden lg:block absolute top-[44px] left-12 right-12 h-1 bg-gray-200 z-0">
              <motion.div 
                className="h-full bg-[#1E3F20]" 
                animate={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              const isCompleted = activeStep > idx;

              return (
                <div 
                  key={step.number}
                  className="relative z-10 cursor-pointer group"
                  onClick={() => setActiveStep(idx)}
                >
                  <div className={`p-6 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-white shadow-lg border-2 border-[#1E3F20]' 
                      : 'bg-white/60 hover:bg-white border border-gray-100 shadow-sm'
                  }`}>
                    
                    {/* Step Bubble */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        isActive 
                          ? 'bg-[#1E3F20] text-white ring-4 ring-[#1E3F20]/10' 
                          : isCompleted 
                            ? 'bg-[#FECE14] text-black' 
                            : 'bg-gray-100 text-gray-500'
                      }`}>
                        {step.number}
                      </div>
                      <span className="text-[10px] font-bold tracking-widest uppercase bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                        {step.metric}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-lg text-[#1E3F20] mb-2 group-hover:text-[#FECE14] transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-sm text-[#1A202C]/80 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stepper Control for Screen Readers / Accessibility */}
          <div className="flex justify-center gap-2 mt-8">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`w-3 h-3 rounded-full transition-all ${activeStep === idx ? 'bg-[#1E3F20] w-6' : 'bg-gray-300'}`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ================= SOCIAL PROOF / LIVE PROOF HYBRID ================= */}
        <div className="bg-[#1E3F20] rounded-3xl text-white p-8 sm:p-12 relative overflow-hidden">
          {/* Subtle graphic accent */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-[#FECE14]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            
            {/* Testimonial Left */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex gap-1 text-[#FECE14]">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-xl sm:text-2xl font-medium leading-relaxed italic text-gray-100">
                "Most shearers leave your yard looking like a bomb went off. sheepsheeran arrived exactly when they said they would, sheared 120 ewes without a fuss, and left the shed cleaner than it was when they arrived. Absolute professionals. I won't use anyone else now."
              </blockquote>
              <div>
                <p className="font-extrabold text-white text-lg">Michael O'Connor</p>
                <p className="text-sm text-[#FECE14]">Dairy & Sheep Farmer, Macroom, Co. Cork</p>
              </div>
            </div>

            {/* Dynamic DB Verification Right */}
            <div className="lg:col-span-5 bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-[#FECE14]">Live Job Verification</span>
                <span className="inline-flex items-center gap-1 text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-mono">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  SECURE DB
                </span>
              </div>

              {loadingProof ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-white/20 rounded w-1/3" />
                  <div className="h-20 bg-white/10 rounded" />
                </div>
              ) : portfolioProof.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={portfolioProof[0].image_url} 
                      alt={portfolioProof[0].title}
                      className="w-16 h-16 rounded-lg object-cover border border-white/20 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-white">{portfolioProof[0].title}</h4>
                      <p className="text-xs text-gray-300">Breed: {portfolioProof[0].breed}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 italic leading-relaxed">
                    "{portfolioProof[0].description || 'Meticulously shorn with full cleanup verified.'}"
                  </p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-gray-300">No live proof items uploaded yet. Rest assured, our 100% clean guarantee applies to every single booking.</p>
                </div>
              )}

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                <span>100% Clean-Site Guarantee</span>
                <span>Fully Insured & Biosecure</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}