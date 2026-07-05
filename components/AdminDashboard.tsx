'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  X, 
  Calendar, 
  MapPin, 
  Plus, 
  Sliders, 
  Image, 
  Briefcase, 
  Key, 
  CheckCircle, 
  RefreshCw, 
  AlertCircle, 
  DollarSign, 
  Users, 
  ChevronRight, 
  LogOut,
  Upload,
  Layers
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// Type definitions matching DB schema
interface Booking {
  id: string;
  client_name: string;
  phone_number: string;
  email: string;
  eircode: string | null;
  address: string;
  flock_size: number;
  breed_type: string | null;
  service_type: string;
  preferred_date: string;
  estimated_price: number | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
}

interface ServiceZone {
  id: string;
  eircode_prefix: string;
  area_name: string;
  is_active: boolean;
  travel_surcharge: number;
  created_at: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  breed: string | null;
  image_url: string;
  description: string | null;
  display_order: number;
  created_at: string;
}

export function AdminDashboard() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Admin states
  const [activeTab, setActiveTab] = useState<'bookings' | 'routes' | 'portfolio'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [zones, setZones] = useState<ServiceZone[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  
  // Loading & Action states
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form States for New Portfolio Item
  const [newPortfolio, setNewPortfolio] = useState({
    title: '',
    breed: '',
    image_url: '',
    description: '',
    display_order: 1
  });
  const [portfolioFormMsg, setPortfolioFormMsg] = useState({ type: '', text: '' });

  // Form States for Route Surcharges
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editSurcharge, setEditSurcharge] = useState<number>(0);

  // Authenticate simple pin
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '1234' || passcode.toLowerCase() === 'sheepshear') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid passcode. Hint: Use demo PIN "1234"');
    }
  };

  // Fetch data from Supabase
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Bookings
      const { data: bookingsData, error: bError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (bError) throw bError;
      setBookings(bookingsData || []);

      // 2. Fetch Service Zones
      const { data: zonesData, error: zError } = await supabase
        .from('service_zones')
        .select('*')
        .order('eircode_prefix', { ascending: true });
      
      if (zError) throw zError;
      setZones(zonesData || []);

      // 3. Fetch Portfolio
      const { data: portfolioData, error: pError } = await supabase
        .from('portfolio_gallery')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (pError) throw pError;
      setPortfolio(portfolioData || []);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Handle Booking Status Update
  const updateBookingStatus = async (id: string, newStatus: Booking['status']) => {
    setActionLoadingId(id);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Optimistic update
      setBookings(prev => 
        prev.map(b => b.id === id ? { ...b, status: newStatus } : b)
      );
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Failed to update booking status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Zone Toggle Active Status
  const toggleZoneActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('service_zones')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setZones(prev => 
        prev.map(z => z.id === id ? { ...z, is_active: !currentStatus } : z)
      );
    } catch (err) {
      console.error('Error toggling zone status:', err);
    }
  };

  // Handle Zone Surcharge Update
  const saveZoneSurcharge = async (id: string) => {
    try {
      const { error } = await supabase
        .from('service_zones')
        .update({ travel_surcharge: editSurcharge })
        .eq('id', id);

      if (error) throw error;

      setZones(prev => 
        prev.map(z => z.id === id ? { ...z, travel_surcharge: editSurcharge } : z)
      );
      setEditingZoneId(null);
    } catch (err) {
      console.error('Error updating surcharge:', err);
    }
  };

  // Handle New Portfolio Submit
  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    setPortfolioFormMsg({ type: '', text: '' });

    if (!newPortfolio.title || !newPortfolio.image_url) {
      setPortfolioFormMsg({ type: 'error', text: 'Title and Image URL are required' });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('portfolio_gallery')
        .insert([{
          title: newPortfolio.title,
          breed: newPortfolio.breed || null,
          image_url: newPortfolio.image_url,
          description: newPortfolio.description || null,
          display_order: Number(newPortfolio.display_order)
        }])
        .select();

      if (error) throw error;

      if (data) {
        setPortfolio(prev => [...prev, data[0]].sort((a, b) => a.display_order - b.display_order));
        setPortfolioFormMsg({ type: 'success', text: 'Portfolio project added successfully!' });
        setNewPortfolio({
          title: '',
          breed: '',
          image_url: '',
          description: '',
          display_order: portfolio.length + 2
        });
      }
    } catch (err) {
      console.error('Error adding portfolio:', err);
      setPortfolioFormMsg({ type: 'error', text: 'Could not upload to portfolio. Verify connection.' });
    }
  };

  // Quick stats computed from current states
  const totalBookingsCount = bookings.length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;
  const totalEstimatedRevenue = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + Number(b.estimated_price || 0), 0);

  // Filtered Bookings list
  const filteredBookings = bookings.filter(b => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#111827] font-sans antialiased">
      {/* Background visual accents */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-amber-50/50 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* LOCK SCREEN (Private Access simulation) */}
        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            <motion.div 
              key="lock-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-md mx-auto my-16 bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="bg-[#000000] text-[#FFFFFF] p-8 text-center relative">
                {/* Gold primary brand tag */}
                <div className="absolute top-4 right-4 bg-[#FECE14] text-[#000000] text-xs font-mono font-bold px-2 py-0.5 rounded">
                  SECURE
                </div>
                <div className="w-12 h-12 bg-[#FECE14]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="w-6 h-6 text-[#FECE14]" />
                </div>
                <h1 className="text-xl font-bold font-display tracking-tight uppercase">sheepsheeran</h1>
                <p className="text-xs text-gray-400 mt-1 font-mono">INTERNAL OPERATIONS HUB</p>
              </div>

              <form onSubmit={handleLogin} className="p-8 space-y-6">
                <div>
                  <label htmlFor="passcode" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Enter Operator Passcode
                  </label>
                  <input
                    id="passcode"
                    type="password"
                    placeholder="Enter demo passcode '1234'"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full text-center tracking-widest text-lg font-bold font-mono bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#FECE14] focus:border-transparent transition-all"
                    autoFocus
                  />
                  {authError && (
                    <p className="text-xs text-[#DC2626] mt-2 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {authError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-[#000000] hover:bg-[#111827] text-[#FFFFFF] font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 group"
                >
                  Verify Credentials
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="pt-4 border-t border-[#F3F4F6] text-center">
                  <span className="text-xs text-gray-400">
                    Secure channel authorized for sheepsheeran Munster route planning.
                  </span>
                </div>
              </form>
            </motion.div>
          ) : (
            
            /* ACTIVE DASHBOARD */
            <motion.div
              key="dashboard-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Top Management Header */}
              <div className="bg-[#000000] rounded-2xl text-[#FFFFFF] p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-black relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-10 pointer-events-none">
                  <Sliders className="w-96 h-96 text-[#FECE14]" />
                </div>

                <div className="space-y-2 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#FECE14] text-[#000000] text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded">
                      Live Operations
                    </span>
                    <span className="text-xs text-gray-400 font-mono">Cork & Munster</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
                    sheepsheeran Admin Panel
                  </h1>
                  <p className="text-sm text-gray-300 max-w-xl">
                    Manage your booking requests, optimize Eircode route zones, adjust seasonal travel premiums, and upload recent portfolio work.
                  </p>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                  <button
                    onClick={fetchData}
                    title="Refresh Data"
                    className="p-3 bg-[#1F2937] hover:bg-[#374151] rounded-lg transition-colors border border-gray-800 text-gray-300"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsAuthenticated(false)}
                    className="px-4 py-2.5 bg-[#DC2626] hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Lock Console
                  </button>
                </div>
              </div>

              {/* Quick Stats Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-5 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Unprocessed Requests</span>
                    <AlertCircle className="w-5 h-5 text-[#D97706]" />
                  </div>
                  <p className="text-2xl font-black font-mono text-[#111827]">
                    {pendingBookingsCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Awaiting route/date confirmation</p>
                </div>

                <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-5 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Bookings</span>
                    <Users className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-2xl font-black font-mono text-[#111827]">
                    {totalBookingsCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">All processed & historic requests</p>
                </div>

                <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-5 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Active Service Zones</span>
                    <MapPin className="w-5 h-5 text-[#16A34A]" />
                  </div>
                  <p className="text-2xl font-black font-mono text-[#111827]">
                    {zones.filter(z => z.is_active).length} <span className="text-sm font-normal text-gray-400">/ {zones.length}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Operational Eircode prefixes</p>
                </div>

                <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-5 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Booked Revenue</span>
                    <div className="w-5 h-5 rounded-full bg-[#FECE14]/20 text-[#000000] flex items-center justify-center font-bold text-xs">€</div>
                  </div>
                  <p className="text-2xl font-black font-mono text-[#111827]">
                    €{totalEstimatedRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Confirmed & completed estimates</p>
                </div>
              </div>

              {/* Main Content Tabs & Controls */}
              <div className="flex flex-wrap gap-2 border-b border-[#E5E7EB] pb-px">
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
                    activeTab === 'bookings'
                      ? 'border-[#000000] text-[#000000] font-bold'
                      : 'border-transparent text-gray-500 hover:text-[#000000]'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Booking Requests Queue
                  {pendingBookingsCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-[#D97706] text-white rounded-full font-bold">
                      {pendingBookingsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('routes')}
                  className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
                    activeTab === 'routes'
                      ? 'border-[#000000] text-[#000000] font-bold'
                      : 'border-transparent text-gray-500 hover:text-[#000000]'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  Route & Zone Settings
                </button>

                <button
                  onClick={() => setActiveTab('portfolio')}
                  className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
                    activeTab === 'portfolio'
                      ? 'border-[#000000] text-[#000000] font-bold'
                      : 'border-transparent text-gray-500 hover:text-[#000000]'
                  }`}
                >
                  <Image className="w-4 h-4" />
                  Portfolio Manager
                </button>
              </div>

              {/* Tab Panes */}
              <div className="mt-6">
                
                {/* 1. BOOKINGS QUEUE */}
                {activeTab === 'bookings' && (
                  <div className="space-y-6">
                    {/* Header with Filters */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E7EB] shadow-sm">
                      <div>
                        <h2 className="text-base font-bold text-[#111827]">Incoming Client Queue</h2>
                        <p className="text-xs text-gray-500">Review, approve, and finalize prices for local sheep farmers</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filter:</span>
                        <div className="inline-flex rounded-lg border border-[#E5E7EB] p-0.5 bg-gray-50">
                          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((f) => (
                            <button
                              key={f}
                              onClick={() => setStatusFilter(f)}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md capitalize transition-all ${
                                statusFilter === f
                                  ? 'bg-[#000000] text-[#FFFFFF] shadow-sm'
                                  : 'text-gray-600 hover:text-[#000000]'
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bookings List */}
                    {isLoading ? (
                      <div className="py-20 text-center space-y-3">
                        <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-500">Querying secure booking database...</p>
                      </div>
                    ) : filteredBookings.length === 0 ? (
                      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
                        <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-gray-700">No matching bookings found</h3>
                        <p className="text-xs text-gray-400 mt-1">There are no client requests matching the selected filter status.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-all ${
                              booking.status === 'pending' ? 'border-amber-200 ring-1 ring-amber-100' : 'border-[#E5E7EB]'
                            }`}
                          >
                            {/* Card Top Block */}
                            <div className="p-5 sm:p-6 flex flex-col lg:flex-row justify-between lg:items-start gap-4">
                              <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Status Pills */}
                                  {booking.status === 'pending' && (
                                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-100 text-[#D97706] border border-amber-200">
                                      Pending Approval
                                    </span>
                                  )}
                                  {booking.status === 'confirmed' && (
                                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-green-100 text-[#16A34A] border border-green-200">
                                      Confirmed
                                    </span>
                                  )}
                                  {booking.status === 'completed' && (
                                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                      Completed
                                    </span>
                                  )}
                                  {booking.status === 'cancelled' && (
                                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-red-100 text-[#DC2626] border border-red-200">
                                      Cancelled
                                    </span>
                                  )}

                                  <span className="text-xs text-gray-400 font-mono">ID: {booking.id.substring(0, 8)}</span>
                                </div>

                                <div>
                                  <h3 className="text-lg font-bold text-gray-900">{booking.client_name}</h3>
                                  <p className="text-xs text-gray-500 font-mono mt-0.5">Eircode: {booking.eircode || 'N/A'}</p>
                                </div>

                                {/* Flock Detail Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                                  <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Flock Size</span>
                                    <span className="font-mono text-sm font-bold text-gray-900">{booking.flock_size} Sheep</span>
                                  </div>
                                  <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Breed Type</span>
                                    <span className="text-sm font-medium text-gray-900 truncate block">{booking.breed_type || 'Mixed'}</span>
                                  </div>
                                  <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Service</span>
                                    <span className="text-sm font-medium text-gray-900 truncate block">{booking.service_type}</span>
                                  </div>
                                  <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Est. Price</span>
                                    <span className="font-mono text-sm font-bold text-[#16A34A] block">
                                      {booking.estimated_price ? `€${Number(booking.estimated_price).toFixed(2)}` : 'Calculated on call'}
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-1 text-xs text-gray-600 pt-2">
                                  <p className="flex items-center gap-1.5">
                                    <span className="font-semibold text-gray-800">Phone:</span> {booking.phone_number}
                                  </p>
                                  <p className="flex items-center gap-1.5">
                                    <span className="font-semibold text-gray-800">Email:</span> {booking.email}
                                  </p>
                                  <p className="flex items-center gap-1.5">
                                    <span className="font-semibold text-gray-800">Yard Address:</span> {booking.address}
                                  </p>
                                </div>
                              </div>

                              {/* Right Info Box & Actions */}
                              <div className="flex flex-col sm:items-end justify-between gap-4 lg:self-stretch">
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-left sm:text-right w-full sm:w-auto">
                                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Target Date Window</span>
                                  <div className="flex items-center gap-1.5 sm:justify-end text-sm font-bold text-gray-900 mt-1">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    {booking.preferred_date}
                                  </div>
                                </div>

                                {/* Actions Row */}
                                <div className="flex flex-wrap items-center gap-2">
                                  {booking.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                        disabled={actionLoadingId === booking.id}
                                        className="px-4 py-2 bg-[#16A34A] hover:bg-green-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        Accept Booking
                                      </button>
                                      <button
                                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                        disabled={actionLoadingId === booking.id}
                                        className="px-3 py-2 bg-[#DC2626] hover:bg-red-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                        Reject
                                      </button>
                                    </>
                                  )}

                                  {booking.status === 'confirmed' && (
                                    <>
                                      <button
                                        onClick={() => updateBookingStatus(booking.id, 'completed')}
                                        disabled={actionLoadingId === booking.id}
                                        className="px-4 py-2 bg-[#000000] hover:bg-gray-800 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                                      >
                                        <CheckCircle className="w-3.5 h-3.5 text-[#FECE14]" />
                                        Mark Completed
                                      </button>
                                      <button
                                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                        disabled={actionLoadingId === booking.id}
                                        className="px-3 py-2 bg-[#F3F4F6] hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition-colors"
                                      >
                                        Cancel Booking
                                      </button>
                                    </>
                                  )}

                                  {booking.status === 'completed' && (
                                    <span className="text-xs text-[#16A34A] font-bold flex items-center gap-1">
                                      <CheckCircle className="w-4 h-4" /> Finished & Swept
                                    </span>
                                  )}

                                  {booking.status === 'cancelled' && (
                                    <button
                                      onClick={() => updateBookingStatus(booking.id, 'pending')}
                                      className="px-3 py-1.5 border border-gray-300 text-gray-600 hover:text-black font-semibold text-xs rounded-lg transition-all"
                                    >
                                      Reopen Request
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. ROUTE & ZONE SETTINGS */}
                {activeTab === 'routes' && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm space-y-4">
                      <div>
                        <h2 className="text-base font-bold text-[#111827]">Manage Service Zones & Surcharges</h2>
                        <p className="text-xs text-gray-500">Toggle active Eircode prefixes and adjust regional travel fees dynamically based on fuel and transit overheads.</p>
                      </div>

                      {isLoading ? (
                        <div className="py-12 text-center">
                          <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                        </div>
                      ) : (
                        <div className="overflow-x-auto border border-[#E5E7EB] rounded-lg">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-50 border-b border-[#E5E7EB] text-xs font-bold uppercase text-gray-500">
                                <th className="p-4">Eircode Routing Key</th>
                                <th className="p-4">Area Covered</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Travel Surcharge</th>
                                <th className="p-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                              {zones.map((zone) => (
                                <tr key={zone.id} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="p-4 font-mono font-bold text-[#111827]">{zone.eircode_prefix}</td>
                                  <td className="p-4 font-medium text-gray-700">{zone.area_name}</td>
                                  <td className="p-4">
                                    <button
                                      onClick={() => toggleZoneActive(zone.id, zone.is_active)}
                                      className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
                                        zone.is_active 
                                          ? 'bg-green-100 text-[#16A34A]' 
                                          : 'bg-red-100 text-[#DC2626]'
                                      }`}
                                    >
                                      {zone.is_active ? 'Active Routes' : 'Inactive'}
                                    </button>
                                  </td>
                                  <td className="p-4 font-mono">
                                    {editingZoneId === zone.id ? (
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-gray-500">€</span>
                                        <input
                                          type="number"
                                          value={editSurcharge}
                                          onChange={(e) => setEditSurcharge(Number(e.target.value))}
                                          className="w-20 px-1.5 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#FECE14]"
                                        />
                                      </div>
                                    ) : (
                                      <span className="font-bold text-gray-900">€{Number(zone.travel_surcharge).toFixed(2)}</span>
                                    )}
                                  </td>
                                  <td className="p-4 text-right">
                                    {editingZoneId === zone.id ? (
                                      <div className="flex items-center justify-end gap-1">
                                        <button
                                          onClick={() => saveZoneSurcharge(zone.id)}
                                          className="p-1.5 bg-[#16A34A] text-white rounded hover:bg-green-700 transition-colors"
                                          title="Save"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => setEditingZoneId(null)}
                                          className="p-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                          title="Cancel"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setEditingZoneId(zone.id);
                                          setEditSurcharge(Number(zone.travel_surcharge));
                                        }}
                                        className="text-xs font-bold text-[#000000] hover:underline"
                                      >
                                        Edit Surcharge
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. PORTFOLIO MANAGER */}
                {activeTab === 'portfolio' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add to Portfolio Form */}
                    <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm space-y-4 lg:col-span-1 h-fit">
                      <div>
                        <h2 className="text-base font-bold text-[#111827]">Upload New Project</h2>
                        <p className="text-xs text-gray-500">Publish recent Munster shearing results directly from your phone in the yard.</p>
                      </div>

                      <form onSubmit={handleAddPortfolio} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Project Title / Farm</label>
                          <input
                            type="text"
                            placeholder="e.g. Commercial Suffolk-Cross Ewes"
                            value={newPortfolio.title}
                            onChange={(e) => setNewPortfolio({...newPortfolio, title: e.target.value})}
                            className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#FECE14]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Breed Type</label>
                          <input
                            type="text"
                            placeholder="e.g. Suffolk, Texel, Mixed"
                            value={newPortfolio.breed}
                            onChange={(e) => setNewPortfolio({...newPortfolio, breed: e.target.value})}
                            className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#FECE14]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Image URL</label>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/photo-..."
                            value={newPortfolio.image_url}
                            onChange={(e) => setNewPortfolio({...newPortfolio, image_url: e.target.value})}
                            className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#FECE14]"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">Provide a premium Unsplash or hosted image URL</p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description / Client Note</label>
                          <textarea
                            rows={3}
                            placeholder="e.g. Sheared and swept in under 4 hours. Absolute clean cut results."
                            value={newPortfolio.description}
                            onChange={(e) => setNewPortfolio({...newPortfolio, description: e.target.value})}
                            className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#FECE14]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Display Order</label>
                            <input
                              type="number"
                              value={newPortfolio.display_order}
                              onChange={(e) => setNewPortfolio({...newPortfolio, display_order: Number(e.target.value)})}
                              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#FECE14]"
                            />
                          </div>
                        </div>

                        {portfolioFormMsg.text && (
                          <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                            portfolioFormMsg.type === 'success' ? 'bg-green-50 text-[#16A34A]' : 'bg-red-50 text-[#DC2626]'
                          }`}>
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {portfolioFormMsg.text}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-[#000000] hover:bg-gray-800 text-[#FFFFFF] font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Publish to Live Portfolio
                        </button>
                      </form>
                    </div>

                    {/* Current Portfolio List */}
                    <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm space-y-4 lg:col-span-2">
                      <div>
                        <h2 className="text-base font-bold text-[#111827]">Active Portfolio Gallery</h2>
                        <p className="text-xs text-gray-500">Visual proof of sheepsheeran's professional cleanliness displayed on the live site.</p>
                      </div>

                      {isLoading ? (
                        <div className="py-12 text-center">
                          <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                        </div>
                      ) : portfolio.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-12">No portfolio items loaded yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {portfolio.map((item) => (
                            <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-gray-50/50">
                              <div className="aspect-video relative bg-gray-200 overflow-hidden">
                                <img
                                  src={item.image_url}
                                  alt={item.title}
                                  className="object-cover w-full h-full"
                                />
                                <span className="absolute top-2 left-2 bg-black/75 text-[#FFFFFF] text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                                  Order {item.display_order}
                                </span>
                              </div>
                              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                <div>
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-gray-900 text-sm truncate">{item.title}</h4>
                                    {item.breed && (
                                      <span className="text-[10px] bg-[#FECE14]/20 text-gray-900 font-bold px-2 py-0.5 rounded uppercase">
                                        {item.breed}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}