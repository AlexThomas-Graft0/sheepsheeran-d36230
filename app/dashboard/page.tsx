'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

// TypeScript interfaces mapped from the SQL schema
export interface Booking {
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
  status: string;
  created_at: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  breed: string | null;
  image_url: string;
  description: string | null;
  display_order: number;
  created_at: string;
}

export interface ServiceZone {
  id: string;
  eircode_prefix: string;
  area_name: string;
  is_active: boolean;
  travel_surcharge: number;
  created_at: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
}

export default function OwnerDashboard() {
  // Navigation & Tab states
  const [activeTab, setActiveTab] = useState<'bookings' | 'zones' | 'portfolio' | 'enquiries'>('bookings');

  // Core Data States
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [zones, setZones] = useState<ServiceZone[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);

  // UI States
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Search/Filter states
  const [bookingSearch, setBookingSearch] = useState<string>('');
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>('all');

  // Form Modals / Edit states
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [currentBooking, setCurrentBooking] = useState<Partial<Booking> | null>(null);

  const [isZoneModalOpen, setIsZoneModalOpen] = useState<boolean>(false);
  const [currentZone, setCurrentZone] = useState<Partial<ServiceZone> | null>(null);

  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState<boolean>(false);
  const [currentPortfolio, setCurrentPortfolio] = useState<Partial<PortfolioItem>>({});

  // Fetch initial data
  useEffect(() => {
    fetchAllData();
  }, []);

  const triggerNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch Bookings
      const { data: bData, error: bErr } = await supabase
        .from('bookings')
        .select('*')
        .order('preferred_date', { ascending: true });
      if (bErr) throw bErr;
      setBookings(bData || []);

      // Fetch Zones
      const { data: zData, error: zErr } = await supabase
        .from('service_zones')
        .select('*')
        .order('eircode_prefix', { ascending: true });
      if (zErr) throw zErr;
      setZones(zData || []);

      // Fetch Portfolio
      const { data: pData, error: pErr } = await supabase
        .from('portfolio_gallery')
        .select('*')
        .order('display_order', { ascending: true });
      if (pErr) throw pErr;
      setPortfolio(pData || []);

      // Fetch Enquiries
      const { data: eData, error: eErr } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (eErr) throw eErr;
      setEnquiries(eData || []);

    } catch (error: any) {
      triggerNotification(error.message || 'Failed to fetch dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- BOOKING OPERATIONS ---
  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBooking?.client_name || !currentBooking?.phone_number || !currentBooking?.email || !currentBooking?.address) {
      triggerNotification('Please fill in all required fields.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      if (currentBooking.id) {
        // Update
        const { error } = await supabase
          .from('bookings')
          .update({
            client_name: currentBooking.client_name,
            phone_number: currentBooking.phone_number,
            email: currentBooking.email,
            eircode: currentBooking.eircode || null,
            address: currentBooking.address,
            flock_size: Number(currentBooking.flock_size || 0),
            breed_type: currentBooking.breed_type || null,
            service_type: currentBooking.service_type || 'Shearing',
            preferred_date: currentBooking.preferred_date || '2024-05-24',
            estimated_price: currentBooking.estimated_price ? Number(currentBooking.estimated_price) : null,
            status: currentBooking.status || 'pending'
          })
          .eq('id', currentBooking.id);

        if (error) throw error;
        triggerNotification('Booking updated successfully.', 'success');
      } else {
        // Insert
        const { error } = await supabase
          .from('bookings')
          .insert([{
            client_name: currentBooking.client_name,
            phone_number: currentBooking.phone_number,
            email: currentBooking.email,
            eircode: currentBooking.eircode || null,
            address: currentBooking.address,
            flock_size: Number(currentBooking.flock_size || 0),
            breed_type: currentBooking.breed_type || null,
            service_type: currentBooking.service_type || 'Shearing',
            preferred_date: currentBooking.preferred_date || '2024-05-24',
            estimated_price: currentBooking.estimated_price ? Number(currentBooking.estimated_price) : null,
            status: currentBooking.status || 'pending'
          }]);

        if (error) throw error;
        triggerNotification('New booking added.', 'success');
      }
      setIsBookingModalOpen(false);
      setCurrentBooking(null);
      fetchAllData();
    } catch (error: any) {
      triggerNotification(error.message || 'Error saving booking', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (id: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      triggerNotification(`Booking status updated to ${newStatus}.`, 'success');
      fetchAllData();
    } catch (error: any) {
      triggerNotification(error.message || 'Failed to update status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      triggerNotification('Booking deleted successfully.', 'success');
      fetchAllData();
    } catch (error: any) {
      triggerNotification(error.message || 'Failed to delete booking', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // --- SERVICE ZONE OPERATIONS ---
  const handleSaveZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentZone?.eircode_prefix || !currentZone?.area_name) {
      triggerNotification('Please fill in Eircode prefix and Area Name.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      if (currentZone.id) {
        // Update
        const { error } = await supabase
          .from('service_zones')
          .update({
            eircode_prefix: currentZone.eircode_prefix.toUpperCase(),
            area_name: currentZone.area_name,
            is_active: currentZone.is_active ?? true,
            travel_surcharge: Number(currentZone.travel_surcharge || 0)
          })
          .eq('id', currentZone.id);

        if (error) throw error;
        triggerNotification('Service zone updated.', 'success');
      } else {
        // Insert
        const { error } = await supabase
          .from('service_zones')
          .insert([{
            eircode_prefix: currentZone.eircode_prefix.toUpperCase(),
            area_name: currentZone.area_name,
            is_active: currentZone.is_active ?? true,
            travel_surcharge: Number(currentZone.travel_surcharge || 0)
          }]);

        if (error) throw error;
        triggerNotification('New service zone added.', 'success');
      }
      setIsZoneModalOpen(false);
      setCurrentZone(null);
      fetchAllData();
    } catch (error: any) {
      triggerNotification(error.message || 'Error saving service zone', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteZone = async (id: string) => {
    if (!confirm('Delete this service zone?')) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('service_zones')
        .delete()
        .eq('id', id);

      if (error) throw error;
      triggerNotification('Service zone deleted.', 'success');
      fetchAllData();
    } catch (error: any) {
      triggerNotification(error.message || 'Failed to delete service zone', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // --- PORTFOLIO OPERATIONS ---
  const handleSavePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPortfolio?.title || !currentPortfolio?.image_url) {
      triggerNotification('Title and Image URL are required.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      if (currentPortfolio.id) {
        // Update
        const { error } = await supabase
          .from('portfolio_gallery')
          .update({
            title: currentPortfolio.title,
            breed: currentPortfolio.breed || null,
            image_url: currentPortfolio.image_url,
            description: currentPortfolio.description || null,
            display_order: Number(currentPortfolio.display_order || 0)
          })
          .eq('id', currentPortfolio.id);

        if (error) throw error;
        triggerNotification('Portfolio item updated.', 'success');
      } else {
        // Insert
        const { error } = await supabase
          .from('portfolio_gallery')
          .insert([{
            title: currentPortfolio.title,
            breed: currentPortfolio.breed || null,
            image_url: currentPortfolio.image_url,
            description: currentPortfolio.description || null,
            display_order: Number(currentPortfolio.display_order || 0)
          }]);

        if (error) throw error;
        triggerNotification('Portfolio item added.', 'success');
      }
      setIsPortfolioModalOpen(false);
      setCurrentPortfolio({});
      fetchAllData();
    } catch (error: any) {
      triggerNotification(error.message || 'Error saving portfolio item', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!confirm('Delete this portfolio item?')) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('portfolio_gallery')
        .delete()
        .eq('id', id);

      if (error) throw error;
      triggerNotification('Portfolio item deleted.', 'success');
      fetchAllData();
    } catch (error: any) {
      triggerNotification(error.message || 'Failed to delete portfolio item', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // --- ENQUIRY OPERATIONS ---
  const handleDeleteEnquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('enquiries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      triggerNotification('Enquiry deleted.', 'success');
      fetchAllData();
    } catch (error: any) {
      triggerNotification(error.message || 'Failed to delete enquiry', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Metric calculations
  const totalBookingsCount = bookings.length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;
  const totalFlockSize = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((acc, b) => acc + (b.flock_size || 0), 0);
  const totalEstimatedRevenue = bookings
    .filter(b => b.status !== 'cancelled' && b.estimated_price)
    .reduce((acc, b) => acc + Number(b.estimated_price || 0), 0);

  // Filters for bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch =
      b.client_name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.address.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (b.eircode && b.eircode.toLowerCase().includes(bookingSearch.toLowerCase()));

    const matchesStatus = bookingFilterStatus === 'all' || b.status === bookingFilterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-yellow-400 selection:text-black">
      {/* Top Banner & Header */}
      <header className="border-b border-neutral-800 bg-black/95 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-[#FECE14] text-black font-extrabold px-3 py-1 rounded text-sm tracking-widest uppercase">
              SHEEP SHEERAN
            </div>
            <span className="text-neutral-400 text-xs hidden sm:inline-block border-l border-neutral-800 pl-3">
              Owner Operations Portal
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-neutral-400 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              ← Back to Live Site
            </Link>
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1"
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification Toast */}
        {notification && (
          <div
            className={`fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-lg shadow-2xl transition-all border ${
              notification.type === 'success'
                ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                : 'bg-red-950 border-red-500 text-red-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">
                {notification.type === 'success' ? '✓ Success' : '⚠️ Error'}
              </span>
            </div>
            <p className="text-xs mt-1">{notification.message}</p>
          </div>
        )}

        {/* Page Title & Quick Status */}
        <div className="mb-8 md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Owner Dashboard
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Real-time monitoring of Munster mobile sheep shearing schedules, zones, portfolio, and farmer requests.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ● Database Synced
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-neutral-950 p-5 rounded-lg border border-neutral-800 relative overflow-hidden">
            <div className="absolute right-3 top-3 bg-[#FECE14]/10 text-[#FECE14] p-2 rounded text-xs font-bold">
              FLOCK
            </div>
            <p className="text-xs text-neutral-400 uppercase font-bold tracking-wider">Total Head Count</p>
            <p className="text-3xl font-black text-white mt-1">
              {loading ? '...' : totalFlockSize} <span className="text-xs text-neutral-500">Sheep</span>
            </p>
            <p className="text-[10px] text-neutral-500 mt-2">Excluding cancelled requests</p>
          </div>

          <div className="bg-neutral-950 p-5 rounded-lg border border-neutral-800 relative overflow-hidden">
            <div className="absolute right-3 top-3 bg-emerald-500/10 text-emerald-400 p-2 rounded text-xs font-bold">
              EST. REV
            </div>
            <p className="text-xs text-neutral-400 uppercase font-bold tracking-wider">Estimated Revenue</p>
            <p className="text-3xl font-black text-emerald-400 mt-1">
              {loading ? '...' : `€${totalEstimatedRevenue.toLocaleString()}`}
            </p>
            <p className="text-[10px] text-neutral-500 mt-2">Active booked revenue</p>
          </div>

          <div className="bg-neutral-950 p-5 rounded-lg border border-neutral-800 relative overflow-hidden">
            <div className="absolute right-3 top-3 bg-amber-500/10 text-amber-400 p-2 rounded text-xs font-bold">
              QUEUE
            </div>
            <p className="text-xs text-neutral-400 uppercase font-bold tracking-wider">Pending Bookings</p>
            <p className="text-3xl font-black text-amber-400 mt-1">
              {loading ? '...' : pendingBookingsCount} / {totalBookingsCount}
            </p>
            <p className="text-[10px] text-neutral-500 mt-2">Awaiting owner review</p>
          </div>

          <div className="bg-neutral-950 p-5 rounded-lg border border-neutral-800 relative overflow-hidden">
            <div className="absolute right-3 top-3 bg-blue-500/10 text-blue-400 p-2 rounded text-xs font-bold">
              ZONES
            </div>
            <p className="text-xs text-neutral-400 uppercase font-bold tracking-wider">Active Service Zones</p>
            <p className="text-3xl font-black text-white mt-1">
              {loading ? '...' : zones.filter(z => z.is_active).length}
            </p>
            <p className="text-[10px] text-neutral-500 mt-2">With dynamic travel rates</p>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="border-b border-neutral-800 mb-6">
          <nav className="flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`pb-4 px-1 text-sm font-bold tracking-wider uppercase border-b-2 transition-colors ${
                activeTab === 'bookings'
                  ? 'border-[#FECE14] text-[#FECE14]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('zones')}
              className={`pb-4 px-1 text-sm font-bold tracking-wider uppercase border-b-2 transition-colors ${
                activeTab === 'zones'
                  ? 'border-[#FECE14] text-[#FECE14]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              Service Zones ({zones.length})
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`pb-4 px-1 text-sm font-bold tracking-wider uppercase border-b-2 transition-colors ${
                activeTab === 'portfolio'
                  ? 'border-[#FECE14] text-[#FECE14]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              Portfolio ({portfolio.length})
            </button>
            <button
              onClick={() => setActiveTab('enquiries')}
              className={`pb-4 px-1 text-sm font-bold tracking-wider uppercase border-b-2 transition-colors ${
                activeTab === 'enquiries'
                  ? 'border-[#FECE14] text-[#FECE14]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              Enquiries ({enquiries.length})
            </button>
          </nav>
        </div>

        {/* Tab Content Areas */}

        {/* TAB 1: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div>
            {/* Filter & Add Bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 bg-neutral-950 p-4 rounded-lg border border-neutral-800">
              <div className="flex flex-1 flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Search client, address or Eircode..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-[#FECE14] flex-1"
                />
                <select
                  value={bookingFilterStatus}
                  onChange={(e) => setBookingFilterStatus(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-[#FECE14]"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setCurrentBooking({
                    client_name: '',
                    phone_number: '',
                    email: '',
                    address: '',
                    flock_size: 30,
                    breed_type: 'Lowland / Commercial',
                    service_type: 'Shearing',
                    preferred_date: '2024-05-24',
                    status: 'pending',
                    estimated_price: 150
                  });
                  setIsBookingModalOpen(true);
                }}
                className="bg-[#FECE14] text-black hover:bg-yellow-400 font-bold text-xs uppercase px-4 py-2.5 rounded transition-colors"
              >
                + Add Manual Booking
              </button>
            </div>

            {/* Bookings Table */}
            {loading ? (
              <div className="text-center py-12 text-neutral-400 text-xs">Loading schedules...</div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-neutral-950 text-center py-12 rounded-lg border border-neutral-800">
                <p className="text-neutral-400 text-sm">No bookings found matching your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950">
                <table className="min-w-full divide-y divide-neutral-800 text-left text-xs">
                  <thead className="bg-neutral-900 uppercase text-neutral-400 tracking-wider">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Client / Contact</th>
                      <th className="px-4 py-3 font-semibold">Location (Eircode)</th>
                      <th className="px-4 py-3 font-semibold text-center">Flock Details</th>
                      <th className="px-4 py-3 font-semibold">Service / Date</th>
                      <th className="px-4 py-3 font-semibold">Price</th>
                      <th className="px-4 py-3 font-semibold text-center">Status</th>
                      <th className="px-4 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-neutral-900/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-bold text-white text-sm">{b.client_name}</div>
                          <div className="text-neutral-400 text-[11px]">{b.phone_number}</div>
                          <div className="text-neutral-500 text-[10px]">{b.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-neutral-200 line-clamp-1">{b.address}</div>
                          <span className="inline-block bg-neutral-800 text-yellow-400 text-[10px] px-1.5 py-0.5 rounded font-mono uppercase mt-1">
                            {b.eircode || 'No Eircode'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <div className="text-white font-black text-sm">{b.flock_size} Head</div>
                          <div className="text-neutral-400 text-[10px]">{b.breed_type || 'Unspecified'}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-block text-[10px] bg-neutral-800 text-white px-2 py-0.5 rounded font-bold uppercase mb-1">
                            {b.service_type}
                          </span>
                          <div className="text-neutral-300 font-mono text-[11px]">{b.preferred_date}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-bold text-white">
                            {b.estimated_price ? `€${Number(b.estimated_price).toFixed(2)}` : 'TBD'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              b.status === 'confirmed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : b.status === 'completed'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : b.status === 'cancelled'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-1.5">
                            {b.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded text-[10px] font-bold"
                                title="Approve Request"
                              >
                                Confirm
                              </button>
                            )}
                            {b.status === 'confirmed' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'completed')}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-[10px] font-bold"
                                title="Mark Job Completed"
                              >
                                Complete
                              </button>
                            )}
                            {b.status !== 'cancelled' && b.status !== 'completed' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                                className="bg-neutral-800 hover:bg-neutral-700 text-red-400 px-2 py-1 rounded text-[10px] font-bold"
                                title="Cancel Job"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setCurrentBooking(b);
                                setIsBookingModalOpen(true);
                              }}
                              className="bg-neutral-800 hover:bg-neutral-700 text-white px-2 py-1 rounded text-[10px]"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBooking(b.id)}
                              className="bg-red-950 hover:bg-red-900 text-red-200 px-2 py-1 rounded text-[10px]"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SERVICE ZONES */}
        {activeTab === 'zones' && (
          <div>
            <div className="flex items-center justify-between mb-6 bg-neutral-950 p-4 rounded-lg border border-neutral-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Munster Active Eircode Routing Keys</h3>
                <p className="text-xs text-neutral-400 mt-1">Manage dynamic call-out travel fees and coverage indicators.</p>
              </div>
              <button
                onClick={() => {
                  setCurrentZone({ eircode_prefix: '', area_name: '', is_active: true, travel_surcharge: 0 });
                  setIsZoneModalOpen(true);
                }}
                className="bg-[#FECE14] text-black hover:bg-yellow-400 font-bold text-xs uppercase px-4 py-2.5 rounded transition-colors"
              >
                + Add Service Zone
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-neutral-400 text-xs">Loading zones...</div>
            ) : zones.length === 0 ? (
              <div className="bg-neutral-950 text-center py-12 rounded-lg border border-neutral-800">
                <p className="text-neutral-400 text-sm">No service zones defined.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zones.map((z) => (
                  <div
                    key={z.id}
                    className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-mono font-black text-[#FECE14] tracking-widest bg-neutral-900 px-2.5 py-1 rounded border border-neutral-800">
                          {z.eircode_prefix}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            z.is_active
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-neutral-800 text-neutral-500'
                          }`}
                        >
                          {z.is_active ? 'Active Zone' : 'Inactive'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold mt-3 text-white">{z.area_name}</h4>
                      <p className="text-xs text-neutral-400 mt-1">
                        Travel Surcharge: <span className="text-white font-mono font-bold">€{Number(z.travel_surcharge).toFixed(2)}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-neutral-900">
                      <button
                        onClick={() => {
                          setCurrentZone(z);
                          setIsZoneModalOpen(true);
                        }}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs px-3 py-1 rounded transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteZone(z.id)}
                        className="bg-red-950 hover:bg-red-900 text-red-200 text-xs px-3 py-1 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PORTFOLIO */}
        {activeTab === 'portfolio' && (
          <div>
            <div className="flex items-center justify-between mb-6 bg-neutral-950 p-4 rounded-lg border border-neutral-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Wool Quality & Job Gallery</h3>
                <p className="text-xs text-neutral-400 mt-1">Live photos of sheared flocks, pedigree show prep, and clean-ups.</p>
              </div>
              <button
                onClick={() => {
                  setCurrentPortfolio({ title: '', breed: '', image_url: '', description: '', display_order: 1 });
                  setIsPortfolioModalOpen(true);
                }}
                className="bg-[#FECE14] text-black hover:bg-yellow-400 font-bold text-xs uppercase px-4 py-2.5 rounded transition-colors"
              >
                + Add Portfolio Item
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-neutral-400 text-xs">Loading portfolio...</div>
            ) : portfolio.length === 0 ? (
              <div className="bg-neutral-950 text-center py-12 rounded-lg border border-neutral-800">
                <p className="text-neutral-400 text-sm">No portfolio items available.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolio.map((p) => (
                  <div key={p.id} className="bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden flex flex-col justify-between">
                    <div>
                      {/* Image Preview */}
                      <div className="relative h-48 w-full bg-neutral-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.image_url}
                          alt={p.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback image if URL fails
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516467508483-a7212febe31a';
                          }}
                        />
                        <span className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-[#FECE14]">
                          Order: {p.display_order}
                        </span>
                      </div>
                      <div className="p-4">
                        <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded uppercase">
                          {p.breed || 'Mixed Breed'}
                        </span>
                        <h4 className="text-base font-bold mt-2 text-white">{p.title}</h4>
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{p.description || 'No description provided.'}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-neutral-900/50 border-t border-neutral-900 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setCurrentPortfolio(p);
                          setIsPortfolioModalOpen(true);
                        }}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs px-3 py-1 rounded transition-colors"
                      >
                        Edit Details
                      </button>
                      <button
                        onClick={() => handleDeletePortfolio(p.id)}
                        className="bg-red-950 hover:bg-red-900 text-red-200 text-xs px-3 py-1 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ENQUIRIES */}
        {activeTab === 'enquiries' && (
          <div>
            <div className="mb-6 bg-neutral-950 p-4 rounded-lg border border-neutral-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">General Enquiries Queue</h3>
              <p className="text-xs text-neutral-400 mt-1">Direct inquiries submitted via the site contact forms.</p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-neutral-400 text-xs">Loading enquiries...</div>
            ) : enquiries.length === 0 ? (
              <div className="bg-neutral-950 text-center py-12 rounded-lg border border-neutral-800">
                <p className="text-neutral-400 text-sm">No general enquiries found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {enquiries.map((e) => (
                  <div
                    key={e.id}
                    className="bg-neutral-950 border border-neutral-800 rounded-lg p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-base font-bold text-white">{e.name}</h4>
                        <span className="text-[10px] font-mono text-neutral-500">
                          {e.created_at ? e.created_at.split('T')[0] : '2024-05-24'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-neutral-400">
                        <div>
                          Email:{' '}
                          <a href={`mailto:${e.email}`} className="text-yellow-400 underline hover:text-yellow-300">
                            {e.email}
                          </a>
                        </div>
                        {e.phone && (
                          <div>
                            Phone:{' '}
                            <a href={`tel:${e.phone}`} className="text-white hover:underline">
                              {e.phone}
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 p-3 bg-neutral-900 rounded border border-neutral-800 text-sm text-neutral-200 whitespace-pre-line">
                        {e.message}
                      </div>
                    </div>

                    <div className="flex md:flex-col items-end gap-2 justify-end">
                      <a
                        href={`mailto:${e.email}?subject=sheepsheeran Enquiry Response`}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs px-3 py-1.5 rounded font-bold uppercase tracking-wider transition-colors text-center w-full"
                      >
                        Reply Email
                      </a>
                      <button
                        onClick={() => handleDeleteEnquiry(e.id)}
                        className="bg-red-950 hover:bg-red-900 text-red-200 text-xs px-3 py-1.5 rounded transition-colors text-center w-full"
                      >
                        Delete Record
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-neutral-800 bg-black py-6 mt-12 text-center text-xs text-neutral-500">
        <p>© 2024 sheepsheeran. Built with React, Next.js, and Supabase. Owner Administration Panel.</p>
      </footer>

      {/* --- MODALS --- */}

      {/* 1. BOOKING MODAL */}
      {isBookingModalOpen && currentBooking && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="bg-neutral-900 px-6 py-4 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#FECE14]">
                {currentBooking.id ? 'Edit Booking' : 'Add Manual Booking'}
              </h3>
              <button
                onClick={() => {
                  setIsBookingModalOpen(false);
                  setCurrentBooking(null);
                }}
                className="text-neutral-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBooking} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Client Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={currentBooking.client_name || ''}
                  onChange={(e) => setCurrentBooking({ ...currentBooking, client_name: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FECE14]"
                  placeholder="e.g. John Hegarty"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={currentBooking.phone_number || ''}
                    onChange={(e) => setCurrentBooking({ ...currentBooking, phone_number: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FECE14]"
                    placeholder="e.g. 087 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={currentBooking.email || ''}
                    onChange={(e) => setCurrentBooking({ ...currentBooking, email: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FECE14]"
                    placeholder="john@hegartyfarms.ie"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Eircode Prefix (3 Characters)
                  </label>
                  <input
                    type="text"
                    value={currentBooking.eircode || ''}
                    onChange={(e) => setCurrentBooking({ ...currentBooking, eircode: e.target.value.toUpperCase() })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FECE14]"
                    placeholder="e.g. P81"
                    maxLength={10}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={currentBooking.preferred_date || '2024-05-24'}
                    onChange={(e) => setCurrentBooking({ ...currentBooking, preferred_date: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FECE14]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Full Address / Location Directions *
                </label>
                <textarea
                  required
                  rows={2}
                  value={currentBooking.address || ''}
                  onChange={(e) => setCurrentBooking({ ...currentBooking, address: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FECE14]"
                  placeholder="Hegarty Farm, Ballyvourney, Macroom, Co. Cork"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Flock Size *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={currentBooking.flock_size || 0}
                    onChange={(e) => setCurrentBooking({ ...currentBooking, flock_size: Number(e.target.value) })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FECE14]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Breed Type
                  </label>
                  <input
                    type="text"
                    value={currentBooking.breed_type || ''}
                    onChange={(e) => setCurrentBooking({ ...currentBooking, breed_type: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FECE14]"
                    placeholder="e.g. Suffolk"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Service Type *
                  </label>
                  <select
                    value={currentBooking.service_type || 'Shearing'}
                    onChange={(e) => setCurrentBooking({ ...currentBooking, service_type: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FECE14]"
                  >
                    <option value="Shearing">Shearing</option>
                    <option value="Crutching">Crutching</option>
                    <option value="Pedigree">Pedigree</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Estimated Price (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentBooking.estimated_price || ''}
                    onChange={(e) => setCurrentBooking({ ...currentBooking, estimated_price: Number(e.target.value) })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FECE14]"
                    placeholder="e.g. 150.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Status
                  </label>
                  <select
                    value={currentBooking.status || 'pending'}
                    onChange={(e) => setCurrentBooking({ ...currentBooking, status: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FECE14]"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsBookingModalOpen(false);
                    setCurrentBooking(null);
                  }}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 py-2 rounded text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-[#FECE14] text-black hover:bg-yellow-400 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider"
                >
                  {actionLoading ? 'Saving...' : 'Save Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. SERVICE ZONE MODAL */}
      {isZoneModalOpen && currentZone && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg max-w-md w-full overflow-hidden shadow-2xl">
            <div className="bg-neutral-900 px-6 py-4 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#FECE14]">
                {currentZone.id ? 'Edit Service Zone' : 'Add Service Zone'}
              </h3>
              <button
                onClick={() => {
                  setIsZoneModalOpen(false);
                  setCurrentZone(null);
                }}
                className="text-neutral-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveZone} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Eircode Routing Prefix *
                </label>
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={currentZone.eircode_prefix || ''}
                  onChange={(e) => setCurrentZone({ ...currentZone, eircode_prefix: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FECE14]"
                  placeholder="e.g. P81"
                />
                <p className="text-[10px] text-neutral-500 mt-1">First 3 characters of the Eircode (e.g., T12, P81)</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Area Name / Region Description *
                </label>
                <input
                  type="text"
                  required
                  value={currentZone.area_name || ''}
                  onChange={(e) => setCurrentZone({ ...currentZone, area_name: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FECE14]"
                  placeholder="e.g. West Cork / Bantry"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Travel Surcharge Fee (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={currentZone.travel_surcharge || 0}
                  onChange={(e) => setCurrentZone({ ...currentZone, travel_surcharge: Number(e.target.value) })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FECE14]"
                />
                <p className="text-[10px] text-neutral-500 mt-1">Extra travel cost applied to this Eircode routing key.</p>
              </div>

              <div className="flex items-center space-x-3 py-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={currentZone.is_active ?? true}
                  onChange={(e) => setCurrentZone({ ...currentZone, is_active: e.target.checked })}
                  className="rounded bg-neutral-900 border-neutral-800 text-[#FECE14] focus:ring-0 focus:ring-offset-0 h-4 w-4"
                />
                <label htmlFor="is_active" className="text-xs font-bold uppercase tracking-wider text-neutral-400 cursor-pointer">
                  Mark Zone as Active (Offer coverage to live users)
                </label>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsZoneModalOpen(false);
                    setCurrentZone(null);
                  }}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 py-2 rounded text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-[#FECE14] text-black hover:bg-yellow-400 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider"
                >
                  {actionLoading ? 'Saving...' : 'Save Zone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. PORTFOLIO MODAL */}
      {isPortfolioModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg max-w-md w-full overflow-hidden shadow-2xl">
            <div className="bg-neutral-900 px-6 py-4 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#FECE14]">
                {currentPortfolio.id ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
              </h3>
              <button
                onClick={() => {
                  setIsPortfolioModalOpen(false);
                  setCurrentPortfolio({});
                }}
                className="text-neutral-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePortfolio} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={currentPortfolio.title || ''}
                  onChange={(e) => setCurrentPortfolio({ ...currentPortfolio, title: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FECE14]"
                  placeholder="e.g. Purebred Texel Show Prep"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Breed Type
                </label>
                <input
                  type="text"
                  value={currentPortfolio.breed || ''}
                  onChange={(e) => setCurrentPortfolio({ ...currentPortfolio, breed: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FECE14]"
                  placeholder="e.g. Suffolk, Cheviot, Mixed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={currentPortfolio.image_url || ''}
                  onChange={(e) => setCurrentPortfolio({ ...currentPortfolio, image_url: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FECE14]"
                  placeholder="https://images.unsplash.com/photo-..."
                />
                <p className="text-[10px] text-neutral-500 mt-1">Must be an absolute secure HTTPS image link.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Description / Client Feedback
                </label>
                <textarea
                  rows={3}
                  value={currentPortfolio.description || ''}
                  onChange={(e) => setCurrentPortfolio({ ...currentPortfolio, description: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FECE14]"
                  placeholder="Include details about the shearing speed, wool quality, and clean-up."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={currentPortfolio.display_order || 0}
                  onChange={(e) => setCurrentPortfolio({ ...currentPortfolio, display_order: Number(e.target.value) })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FECE14]"
                />
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsPortfolioModalOpen(false);
                    setCurrentPortfolio({});
                  }}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 py-2 rounded text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-[#FECE14] text-black hover:bg-yellow-400 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider"
                >
                  {actionLoading ? 'Saving...' : 'Save Portfolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}