'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  ShieldCheck, 
  Info, 
  AlertTriangle,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface ServiceZone {
  id: string;
  eircode_prefix: string;
  area_name: string;
  is_active: boolean;
  travel_surcharge: number;
}

export function BookingForm() {
  // Form Steps: 1 = Contact, 2 = Flock Info, 3 = Date & Location
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [zones, setZones] = useState<ServiceZone[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    serviceType: 'Full Shearing',
    flockSize: 10,
    breedType: 'Lowland / Commercial (Texel, Suffolk, etc.)',
    eircode: '',
    address: '',
    preferredWindow: 'As soon as possible (Current Season)',
    specificDate: '',
    specialInstructions: '',
  });

  // Fetch zones on mount
  useEffect(() => {
    async function fetchZones() {
      try {
        const { data, error } = await supabase
          .from('service_zones')
          .select('*');
        if (error) throw error;
        if (data) {
          setZones(data as ServiceZone[]);
        }
      } catch (err) {
        console.error('Failed to load service zones:', err);
      }
    }
    fetchZones();
  }, []);

  // Live Calculations
  const eircodePrefix = formData.eircode.trim().substring(0, 3).toUpperCase();
  const matchedZone = zones.find(
    (z) => z.eircode_prefix.toUpperCase() === eircodePrefix
  );

  const travelSurcharge = matchedZone && matchedZone.is_active ? Number(matchedZone.travel_surcharge) : 0;
  
  // Calculate base price
  let basePrice = 0;
  const size = Number(formData.flockSize) || 0;

  if (formData.serviceType === 'Full Shearing') {
    if (size <= 30) {
      basePrice = 150; // Minimum flat call-out fee covers up to 30 sheep
    } else if (size <= 50) {
      basePrice = 150 + (size - 30) * 4.50;
    } else if (size <= 150) {
      basePrice = size * 4.00; // €3.50 - €4.50 avg
    } else {
      basePrice = size * 3.00; // €2.50 - €3.50 avg
    }
  } else if (formData.serviceType === 'Crutching & Dagging') {
    basePrice = Math.max(150, size * 1.50); // Minimum call-out €150 applies
  } else if (formData.serviceType === 'Pedigree / Show Preparation') {
    basePrice = Math.max(150, size * 10.00); // Minimum call-out €150 applies
  }

  const estimatedTotal = basePrice + travelSurcharge;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    // Basic validation per step
    if (step === 1) {
      if (!formData.fullName || !formData.phone || !formData.email) {
        setErrorMsg('Please fill out all contact fields before proceeding.');
        return;
      }
      if (!formData.email.includes('@')) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
    } else if (step === 2) {
      if (!formData.flockSize || formData.flockSize < 1) {
        setErrorMsg('Please enter a valid flock size.');
        return;
      }
    }
    setErrorMsg(null);
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setErrorMsg(null);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.eircode || !formData.address) {
      setErrorMsg('Please fill in your Eircode and Address details.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      const { error } = await supabase.from('bookings').insert({
        client_name: formData.fullName,
        phone_number: formData.phone,
        email: formData.email,
        eircode: formData.eircode,
        address: formData.address,
        flock_size: Number(formData.flockSize),
        breed_type: formData.breedType,
        service_type: formData.serviceType,
        preferred_date: formData.specificDate || new Date().toISOString().split('T')[0], // Fallback to today if none selected
        estimated_price: estimatedTotal,
        status: 'pending'
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="booking-form" className="py-16 px-4 bg-[#FDFBF7] text-[#111827] scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold tracking-wider text-[#1E3F20] bg-[#1E3F20]/10 rounded-full uppercase">
            Book On-Site
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1E3F20] tracking-tight">
            Schedule Your Shearing Day
          </h2>
          <p className="mt-3 text-base md:text-lg text-[#1A202C]/80 max-w-2xl mx-auto">
            Book our premium, clean-site mobile shearing service. Fill out our multi-step scheduling tool to secure your slot without the administrative hassle.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Form Container */}
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-xl border border-stone-200/60 overflow-hidden">
            
            {/* Form Progress Bar */}
            {!success && (
              <div className="bg-stone-50 border-b border-stone-100 px-6 py-4">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                  <span>Progress</span>
                  <span>Step {step} of 3</span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-[#1E3F20] h-full transition-all duration-300"
                    style={{ width: `${(step / 3) * 100}%` }}
                  />
                </div>
                
                {/* Visual Step Titles */}
                <div className="grid grid-cols-3 gap-2 mt-3 text-[11px] font-medium text-center">
                  <span className={step >= 1 ? 'text-[#1E3F20] font-bold' : 'text-stone-400'}>
                    1. Contact Details
                  </span>
                  <span className={step >= 2 ? 'text-[#1E3F20] font-bold' : 'text-stone-400'}>
                    2. Flock Info
                  </span>
                  <span className={step >= 3 ? 'text-[#1E3F20] font-bold' : 'text-stone-400'}>
                    3. Date & Location
                  </span>
                </div>
              </div>
            )}

            <div className="p-6 md:p-8">
              <AnimatePresence mode="wait">
                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-6 p-4 bg-red-50 border-l-4 border-[#DC2626] text-[#DC2626] rounded-r-md flex items-start gap-3 text-sm"
                  >
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Please check standard rules:</span> {errorMsg}
                    </div>
                  </motion.div>
                )}

                {/* Success State */}
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12 px-4"
                  >
                    <div className="w-16 h-16 bg-[#16A34A]/10 text-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#1E3F20] mb-2">
                      Booking Request Received!
                    </h3>
                    <p className="text-[#1A202C]/80 max-w-md mx-auto mb-8 text-sm leading-relaxed">
                      Thank you for choosing sheepsheeran. We have received your booking details and are processing your request.
                    </p>

                    <div className="bg-stone-50 rounded-xl p-6 text-left max-w-lg mx-auto border border-stone-200/50 space-y-4">
                      <h4 className="font-bold text-stone-900 text-sm uppercase tracking-wider">
                        What Happens Next?
                      </h4>
                      <ol className="space-y-3 text-sm text-[#1A202C]/90">
                        <li className="flex gap-3">
                          <span className="flex items-center justify-center bg-[#1E3F20] text-white rounded-full w-5 h-5 text-xs shrink-0 font-bold mt-0.5">1</span>
                          <span><strong>Route Verification:</strong> We will verify your location and flock size against our active schedule.</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex items-center justify-center bg-[#1E3F20] text-white rounded-full w-5 h-5 text-xs shrink-0 font-bold mt-0.5">2</span>
                          <span><strong>Date Confirmation:</strong> You will receive an SMS and email within 24 hours confirming your exact shearing window and final price estimate.</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex items-center justify-center bg-[#1E3F20] text-white rounded-full w-5 h-5 text-xs shrink-0 font-bold mt-0.5">3</span>
                          <span><strong>Preparation Reminder:</strong> We’ll send you a quick text the evening before we arrive to remind you to keep the sheep dry.</span>
                        </li>
                      </ol>
                    </div>

                    <button
                      onClick={() => {
                        setSuccess(false);
                        setStep(1);
                        setFormData({
                          fullName: '',
                          phone: '',
                          email: '',
                          serviceType: 'Full Shearing',
                          flockSize: 10,
                          breedType: 'Lowland / Commercial (Texel, Suffolk, etc.)',
                          eircode: '',
                          address: '',
                          preferredWindow: 'As soon as possible (Current Season)',
                          specificDate: '',
                          specialInstructions: '',
                        });
                      }}
                      className="mt-8 px-6 py-2.5 bg-[#1E3F20] hover:bg-[#152e17] text-white text-sm font-semibold rounded-lg shadow transition-colors"
                    >
                      Submit Another Booking Request
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                    
                    {/* STEP 1: CONTACT DETAILS */}
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-5"
                      >
                        <div className="border-b border-stone-100 pb-2">
                          <h3 className="text-lg font-bold text-[#1E3F20]">Step 1: Contact Details</h3>
                          <p className="text-xs text-stone-500">How can we reach you to coordinate the schedule?</p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                            Full Name <span className="text-[#DC2626]">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                              <User className="w-4 h-4" />
                            </span>
                            <input
                              type="text"
                              name="fullName"
                              required
                              value={formData.fullName}
                              onChange={handleInputChange}
                              placeholder="e.g. John Hegarty"
                              className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3F20]/20 focus:border-[#1E3F20] transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                            Phone Number <span className="text-[#DC2626]">*</span>
                            <span className="normal-case font-normal text-stone-500 ml-1">(Crucial for SMS updates in the field)</span>
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                              <Phone className="w-4 h-4" />
                            </span>
                            <input
                              type="tel"
                              name="phone"
                              required
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="e.g. 087 123 4567"
                              className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3F20]/20 focus:border-[#1E3F20] transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                            Email Address <span className="text-[#DC2626]">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                              <Mail className="w-4 h-4" />
                            </span>
                            <input
                              type="email"
                              name="email"
                              required
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="e.g. john@hegartyfarms.ie"
                              className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3F20]/20 focus:border-[#1E3F20] transition-all"
                            />
                          </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={nextStep}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#1E3F20] hover:bg-[#152e17] text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                          >
                            Next: Flock Details
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: FLOCK & SERVICE INFORMATION */}
                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-5"
                      >
                        <div className="border-b border-stone-100 pb-2">
                          <h3 className="text-lg font-bold text-[#1E3F20]">Step 2: Flock & Service Information</h3>
                          <p className="text-xs text-stone-500">Provide details about your flock to help us allocate resources.</p>
                        </div>

                        {/* Service Type Radio */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5">
                            Service Type <span className="text-[#DC2626]">*</span>
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[
                              { label: 'Full Shearing', desc: 'Complete fleece removal' },
                              { label: 'Crutching & Dagging', desc: 'Hindquarter clean-up' },
                              { label: 'Pedigree / Show Preparation', desc: 'Custom precision cuts' }
                            ].map((srv) => (
                              <label
                                key={srv.label}
                                className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-all ${
                                  formData.serviceType === srv.label
                                    ? 'border-[#1E3F20] bg-[#1E3F20]/5 ring-1 ring-[#1E3F20]'
                                    : 'border-stone-200 hover:border-stone-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-[#1E3F20]">{srv.label}</span>
                                  <input
                                    type="radio"
                                    name="serviceType"
                                    value={srv.label}
                                    checked={formData.serviceType === srv.label}
                                    onChange={handleInputChange}
                                    className="accent-[#1E3F20]"
                                  />
                                </div>
                                <span className="text-[11px] text-stone-500 mt-1">{srv.desc}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Flock Size & Breed */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                              Flock Size (Approx. Head Count) <span className="text-[#DC2626]">*</span>
                            </label>
                            <input
                              type="number"
                              name="flockSize"
                              required
                              min="1"
                              value={formData.flockSize}
                              onChange={handleInputChange}
                              placeholder="e.g. 75"
                              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3F20]/20 focus:border-[#1E3F20] transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                              Primary Breed Type <span className="text-[#DC2626]">*</span>
                            </label>
                            <select
                              name="breedType"
                              value={formData.breedType}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3F20]/20 focus:border-[#1E3F20] transition-all bg-white"
                            >
                              <option value="Lowland / Commercial (Texel, Suffolk, etc.)">
                                Lowland / Commercial (Texel, Suffolk, etc.)
                              </option>
                              <option value="Mountain / Blackface (Cheviot, Blackface, etc.)">
                                Mountain / Blackface (Cheviot, Blackface, etc.)
                              </option>
                              <option value="Mixed Flock">Mixed Flock</option>
                              <option value="Pedigree Breed (Requires custom styling)">
                                Pedigree Breed (Requires custom styling)
                              </option>
                            </select>
                          </div>
                        </div>

                        <div className="pt-4 flex justify-between items-center">
                          <button
                            type="button"
                            onClick={prevStep}
                            className="flex items-center gap-2 px-4 py-2.5 text-stone-600 hover:text-stone-900 text-sm font-semibold transition-all"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                          </button>
                          
                          <button
                            type="button"
                            onClick={nextStep}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#1E3F20] hover:bg-[#152e17] text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                          >
                            Next: Date & Location
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3: DATE & LOCATION */}
                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-5"
                      >
                        <div className="border-b border-stone-100 pb-2">
                          <h3 className="text-lg font-bold text-[#1E3F20]">Step 3: Preferred Date & Location</h3>
                          <p className="text-xs text-stone-500">Provide logistics detail for the travel calculation and routing.</p>
                        </div>

                        {/* Eircode & Match Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-1">
                            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                              Eircode <span className="text-[#DC2626]">*</span>
                            </label>
                            <input
                              type="text"
                              name="eircode"
                              required
                              value={formData.eircode}
                              onChange={handleInputChange}
                              placeholder="e.g. P81 A123"
                              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3F20]/20 focus:border-[#1E3F20] transition-all"
                            />
                          </div>

                          <div className="md:col-span-2 flex items-end">
                            {formData.eircode && (
                              <div className={`w-full p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                                matchedZone 
                                  ? 'bg-[#16A34A]/5 border-[#16A34A] text-[#16A34A]' 
                                  : 'bg-amber-50 border-amber-300 text-amber-800'
                              }`}>
                                {matchedZone ? (
                                  <>
                                    <Check className="w-4 h-4 shrink-0" />
                                    <span>
                                      <strong>{matchedZone.area_name} Verified!</strong> Travel Surcharge: €{Number(matchedZone.travel_surcharge).toFixed(2)}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Info className="w-4 h-4 shrink-0" />
                                    <span>
                                      No specific zone matched for prefix &quot;{eircodePrefix || '...'}&quot;. Standard Munster call-out applies.
                                    </span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Address */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                            Full Address / Directions <span className="text-[#DC2626]">*</span>
                          </label>
                          <textarea
                            name="address"
                            required
                            rows={2}
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="e.g. Hegarty Farm, Ballyvourney, Macroom, Co. Cork. (Include landmarks)"
                            className="w-full px-4 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3F20]/20 focus:border-[#1E3F20] transition-all"
                          />
                        </div>

                        {/* Shearing Window & Date Picker */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                              Preferred Shearing Window <span className="text-[#DC2626]">*</span>
                            </label>
                            <select
                              name="preferredWindow"
                              value={formData.preferredWindow}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3F20]/20 focus:border-[#1E3F20] transition-all bg-white"
                            >
                              <option value="As soon as possible (Current Season)">As soon as possible (Current Season)</option>
                              <option value="Early Season (May)">Early Season (May)</option>
                              <option value="Mid Season (June)">Mid Season (June)</option>
                              <option value="Late Season (July / August)">Late Season (July / August)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                              Specific Date Preference <span className="text-stone-400 font-normal">(Optional)</span>
                            </label>
                            <input
                              type="date"
                              name="specificDate"
                              value={formData.specificDate}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3F20]/20 focus:border-[#1E3F20] transition-all bg-white"
                            />
                          </div>
                        </div>

                        {/* Special Instructions */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                            Special Instructions / Notes <span className="text-stone-400 font-normal">(Optional)</span>
                          </label>
                          <textarea
                            name="specialInstructions"
                            rows={2}
                            value={formData.specialInstructions}
                            onChange={handleInputChange}
                            placeholder="e.g. 'No power at the pens, will need generator.' or 'Please call 30 mins before arrival so I can bring the sheep in.'"
                            className="w-full px-4 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3F20]/20 focus:border-[#1E3F20] transition-all"
                          />
                        </div>

                        {/* Submit Actions */}
                        <div className="pt-4 flex justify-between items-center border-t border-stone-100">
                          <button
                            type="button"
                            onClick={prevStep}
                            className="flex items-center gap-2 px-4 py-2.5 text-stone-600 hover:text-stone-900 text-sm font-semibold transition-all"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                          </button>
                          
                          <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-8 py-3 bg-[#FECE14] hover:bg-black hover:text-white text-stone-950 text-sm font-bold rounded-lg shadow-md hover:shadow-xl transition-all disabled:opacity-50"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing Request...
                              </>
                            ) : (
                              <>
                                Request Booking Slot
                                <Check className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}

                  </form>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar: Dynamic Cost Estimator & Inclusions */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Pricing Breakdown */}
            <div className="bg-[#1E3F20] text-white rounded-2xl shadow-xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-44 h-44 bg-[#FECE14]/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-[#FECE14]" />
                <span className="text-xs font-bold text-[#FECE14] uppercase tracking-wider">
                  Live Estimate Breakdown
                </span>
              </div>

              <h3 className="text-xl font-bold mb-4 border-b border-white/10 pb-3">
                Booking Summary
              </h3>

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Service:</span>
                  <span className="font-semibold">{formData.serviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Flock Size:</span>
                  <span className="font-semibold">{formData.flockSize} Sheep</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Breed Type:</span>
                  <span className="font-semibold truncate max-w-[180px]" title={formData.breedType}>
                    {formData.breedType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Travel Surcharge:</span>
                  <span className="font-semibold">
                    {travelSurcharge > 0 ? `€${travelSurcharge.toFixed(2)}` : '€0.00 (Primary Zone)'}
                  </span>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
                  <span className="text-base font-bold text-white">Estimated Total:</span>
                  <div className="text-right">
                    <span className="text-2xl md:text-3xl font-extrabold text-[#FECE14]">
                      €{estimatedTotal.toFixed(2)}
                    </span>
                    <p className="text-[10px] text-white/60">Subject to final inspection</p>
                  </div>
                </div>
              </div>

              {/* Quick Warning */}
              {formData.flockSize < 30 && formData.serviceType === 'Full Shearing' && (
                <div className="mt-5 p-3 bg-white/5 rounded-lg border border-white/10 text-xs text-white/80">
                  <span className="font-bold text-[#FECE14]">Note:</span> A flat call-out rate of €150 applies for flocks under 30 head to cover fuel and setup overhead.
                </div>
              )}
            </div>

            {/* What's Included */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-stone-200/60">
              <h4 className="font-bold text-[#1E3F20] text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1E3F20]" />
                What&apos;s Included as Standard
              </h4>
              <ul className="space-y-3 text-xs md:text-sm text-[#1A202C]/95">
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Professional shearing by a certified master shearer</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Calm, low-stress animal handling</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Complete post-shear board sweep and clean-up</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Wool packed neatly into your wool sacks</span>
                </li>
              </ul>
            </div>

            {/* Guarantee Badge */}
            <div className="bg-[#FDFBF7] rounded-2xl p-6 border border-[#1E3F20]/10 flex gap-4 items-start">
              <span className="text-3xl">🛡️</span>
              <div>
                <h5 className="font-bold text-sm text-[#1E3F20]">Biosecurity Guarantee</h5>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Our shearing machines, handpieces, and boots are strictly disinfected between every single farm. We actively protect Munster flocks from contagious conditions like sheep scab.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}