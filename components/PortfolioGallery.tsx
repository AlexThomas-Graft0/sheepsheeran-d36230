'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

interface PortfolioItem {
  id: string;
  title: string;
  breed: string | null;
  image_url: string;
  description: string | null;
  display_order: number;
  location?: string;
  flock_size?: string;
  client_note?: string;
}

const STATIC_FALLBACKS: Omit<PortfolioItem, 'id' | 'display_order'>[] = [
  {
    title: 'Commercial Suffolk-Cross Ewes',
    breed: 'Suffolk',
    location: 'Macroom, Co. Cork',
    flock_size: '140 Head',
    client_note: 'Sheared and swept in under 4 hours. The wool quality was exceptional this year thanks to the clean, single-pass cuts.',
    image_url: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&w=1200&q=80',
    description: 'A row of clean, neatly sheared white ewes standing calmly in a clean pen. No nicks, no rough cuts.'
  },
  {
    title: 'Pedigree Texel Ram Preparation',
    breed: 'Texel',
    location: 'Fermoy, Co. Cork',
    flock_size: '12 Rams (Show Prep)',
    client_note: 'High-precision cuts that highlighted the shoulder width and muscle definition perfectly. Ready for the sales.',
    image_url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=80',
    description: 'Sturdy Texel ram with perfectly styled head fleece and clean, structured lines.'
  },
  {
    title: 'Mountain Blackface Hoggets',
    breed: 'Blackface',
    location: 'Millstreet, Co. Cork',
    flock_size: '220 Head',
    client_note: 'Cleaned up beautifully. Even with the tough, greasy mountain coats, the shearer maintained a rapid pace without compromising on safety.',
    image_url: 'https://images.unsplash.com/photo-1511117833895-4b473c0b85d6?auto=format&fit=crop&w=1200&q=80',
    description: 'A group of hardy Blackface sheep with clean bellies and neatly harvested, long-staple fleece ready for grading.'
  },
  {
    title: 'The Clean Sweep (Before & After)',
    breed: 'Clean Sweep',
    location: 'Midleton, Co. Cork',
    flock_size: '100% Clean Yard Guarantee Met',
    client_note: "They swept up every last scrap. I didn't have to touch a broom after they drove out the gate.",
    image_url: 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?auto=format&fit=crop&w=1200&q=80',
    description: 'Perfectly swept, empty concrete floor with professionally packed wool sacks ready for transport.'
  }
];

export function PortfolioGallery() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [selectedBreed, setSelectedBreed] = useState<string>('All');
  const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const { data, error } = await supabase
          .from('portfolio_gallery')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          // Merge Supabase items with our rich copy details
          const enriched = data.map((dbItem) => {
            const matchedStatic = STATIC_FALLBACKS.find(
              (s) =>
                s.title.toLowerCase().includes(dbItem.title.toLowerCase()) ||
                dbItem.title.toLowerCase().includes(s.title.toLowerCase()) ||
                (dbItem.breed && s.breed?.toLowerCase() === dbItem.breed.toLowerCase())
            );

            return {
              id: dbItem.id,
              title: dbItem.title,
              breed: dbItem.breed || matchedStatic?.breed || 'Commercial',
              image_url: dbItem.image_url || matchedStatic?.image_url || '',
              description: dbItem.description || matchedStatic?.description || '',
              display_order: dbItem.display_order,
              location: matchedStatic?.location || 'Munster, Ireland',
              flock_size: matchedStatic?.flock_size || 'Commercial Flock',
              client_note: matchedStatic?.client_note || 'Outstanding execution matching the sheepsheeran clean-site standard.'
            };
          });
          setItems(enriched);
        } else {
          // Fallback to static items if DB has no records yet
          const formattedFallback = STATIC_FALLBACKS.map((item, index) => ({
            id: `static-${index}`,
            display_order: index,
            ...item
          }));
          setItems(formattedFallback);
        }
      } catch (err) {
        console.error('Error fetching portfolio data:', err);
        // Fallback gracefully to high-quality mockup data
        const formattedFallback = STATIC_FALLBACKS.map((item, index) => ({
          id: `static-${index}`,
          display_order: index,
          ...item
        }));
        setItems(formattedFallback);
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolio();
  }, []);

  // Keyboard navigation for accessible modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveItem(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Trap focus inside modal when open
  useEffect(() => {
    if (activeItem && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [activeItem]);

  const breeds = ['All', 'Suffolk', 'Texel', 'Blackface', 'Clean Sweep'];

  const filteredItems = selectedBreed === 'All' 
    ? items 
    : items.filter(item => item.breed?.toLowerCase().includes(selectedBreed.toLowerCase()));

  return (
    <section id="portfolio" className="relative py-24 bg-[#FDFBF7] overflow-hidden">
      {/* Decorative architectural background element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-black blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-[#FECE14] blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold tracking-widest text-black uppercase bg-[#FECE14] px-3 py-1 rounded mb-4 font-mono">
            OUR WORK IN THE FIELD
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#111827] tracking-tight font-sans mb-6">
            Precision Cuts. <span className="underline decoration-[#FECE14] decoration-4 underline-offset-8">Clean Yields.</span>
          </h2>
          <p className="text-lg text-gray-700 font-normal leading-relaxed">
            See the results of our professional shearing standards. Real photos from working family farms across Munster.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap justify-center gap-2 mb-12" role="tablist" aria-label="Filter portfolio by sheep breed">
          {breeds.map((breed) => {
            const isActive = selectedBreed === breed;
            return (
              <button
                key={breed}
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedBreed(breed)}
                className={`px-5 py-2.5 rounded text-xs font-bold font-mono tracking-wider uppercase transition-all duration-200 outline-none focus:ring-2 focus:ring-[#FECE14] focus:ring-offset-2 ${
                  isActive
                    ? 'bg-black text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-black hover:bg-gray-50'
                }`}
              >
                {breed}
              </button>
            );
          })}
        </div>

        {/* Dynamic Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg" />
            ))}
          </div>
        ) : (
          <motion.div 
            layout 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  key={item.id}
                  className="group relative bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                    
                    {/* Floating Badge */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-[#FECE14] text-black text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded font-mono shadow-sm">
                        {item.breed}
                      </span>
                    </div>

                    {/* Bottom overlay preview text */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="text-xs font-mono text-[#FECE14] mb-1 font-bold tracking-wider">{item.location}</p>
                      <h3 className="text-lg font-bold tracking-tight font-sans line-clamp-1">{item.title}</h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col justify-between flex-grow">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-mono text-gray-500 uppercase tracking-wider block">
                          Flock Size: <strong className="text-black font-semibold">{item.flock_size}</strong>
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-6">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <button
                        onClick={() => setActiveItem(item)}
                        className="inline-flex items-center text-xs font-bold font-mono tracking-wider text-black uppercase group-hover:underline focus:ring-2 focus:ring-[#FECE14] focus:ring-offset-2 rounded px-1"
                        aria-label={`View details of ${item.title}`}
                      >
                        VIEW FULL CASE STUDY 
                        <svg className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty state placeholder */}
        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-sm font-semibold text-gray-900">No projects found</h3>
            <p className="mt-1 text-xs text-gray-500">Check back soon as we upload our latest shearing sweeps!</p>
          </div>
        )}

        {/* Bottom CTA Hook */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-600 font-mono mb-4">Ready to experience the sheepsheeran standard on your holding?</p>
          <a
            href="#book"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-black bg-[#FECE14] text-black text-sm font-bold tracking-wider uppercase hover:bg-black hover:text-[#FECE14] transition-all duration-300 shadow-md focus:ring-2 focus:ring-[#FECE14] focus:ring-offset-2"
          >
            BOOK AN ESTIMATED SLOT
          </a>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveItem(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: 'spring', duration: 0.5 }}
              ref={modalRef}
              className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveItem(null)}
                className="absolute top-4 right-4 z-20 bg-black/80 text-white hover:bg-[#FECE14] hover:text-black p-2.5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FECE14]"
                aria-label="Close details"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  
                  {/* Image Block */}
                  <div className="relative h-64 md:h-full min-h-[300px] bg-black">
                    <img
                      src={activeItem.image_url}
                      alt={activeItem.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-6">
                      <span className="bg-[#FECE14] text-black text-xs font-bold tracking-widest uppercase px-3 py-1 rounded font-mono">
                        {activeItem.breed}
                      </span>
                    </div>
                  </div>

                  {/* Content Block */}
                  <div className="p-8 sm:p-10 flex flex-col justify-between">
                    <div>
                      <div className="space-y-1 mb-6">
                        <span className="text-xs font-mono font-bold text-[#D97706] uppercase tracking-wider block">
                          {activeItem.location}
                        </span>
                        <h3 id="modal-title" className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight font-sans">
                          {activeItem.title}
                        </h3>
                      </div>

                      {/* Stats Table */}
                      <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100 mb-6">
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500">Target Breed</p>
                          <p className="text-sm font-bold text-black">{activeItem.breed}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500">Flock Size</p>
                          <p className="text-sm font-bold text-black">{activeItem.flock_size}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900">Project Overview</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {activeItem.description}
                        </p>
                      </div>

                      {/* Client Note / Testimonial Block */}
                      {activeItem.client_note && (
                        <div className="mt-8 p-5 bg-[#FDFBF7] border-l-4 border-[#FECE14] rounded-r-lg">
                          <p className="text-xs font-mono uppercase tracking-wider text-[#D97706] mb-2 font-bold">Farmer Feedback</p>
                          <blockquote className="text-sm italic text-gray-800 leading-relaxed">
                            "{activeItem.client_note}"
                          </blockquote>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                      <a
                        href="#book"
                        onClick={() => setActiveItem(null)}
                        className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent bg-black text-white text-xs font-bold font-mono tracking-wider uppercase hover:bg-[#FECE14] hover:text-black transition-colors duration-200 rounded"
                      >
                        Book Similar Standard
                      </a>
                      <button
                        onClick={() => setActiveItem(null)}
                        className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-gray-700 text-xs font-bold font-mono tracking-wider uppercase hover:bg-gray-50 transition-colors duration-200 rounded"
                      >
                        Back to Gallery
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}