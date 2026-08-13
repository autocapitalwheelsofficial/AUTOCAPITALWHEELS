'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useWishlist } from '@/lib/hooks/useWishlist';
import VehicleCard from '@/components/public/VehicleCard';
import { Loader2, Heart, User, LogOut, Phone, Mail, Award, Calendar, Clock, MapPin, MessageSquare, Car } from 'lucide-react';
import Link from 'next/link';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  const supabase = createClient();
  const { user, wishlistItems, toggleWishlist, loading: wLoading } = useWishlist();
  
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [userProfile, setUserProfile] = useState<any>({ name: '', email: '', phone: '' });

  // Test Drives, Enquiries & Sell Requests states
  const [testDrives, setTestDrives] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [sellRequests, setSellRequests] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUserProfile({
          name: session.user.user_metadata?.full_name || 'Valued Customer',
          email: session.user.email || '',
          phone: session.user.user_metadata?.phone || 'Not Added',
        });
      }
    };
    checkSession();
  }, [router, supabase.auth]);

  // Load vehicles in wishlist
  useEffect(() => {
    const loadWishlistVehicles = async () => {
      if (wishlistItems.length === 0) {
        setVehicles([]);
        return;
      }

      setLoadingVehicles(true);
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .in('id', wishlistItems);

        if (error) console.error('Error loading wishlist vehicles:', error);
        if (data) setVehicles(data);
      } catch (e) {
        console.error('Error loading wishlist vehicles:', e);
      } finally {
        setLoadingVehicles(false);
      }
    };

    if (user && activeTab === 'wishlist') {
      loadWishlistVehicles();
    }
  }, [user, wishlistItems, activeTab, supabase]);

  // Load test drives and quotations history
  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return;
      setLoadingHistory(true);
      try {
        // Load test drives
        const { data: tdData, error: tdErr } = await supabase
          .from('test_drive_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (tdData) setTestDrives(tdData);

        // Load enquiries (Quotations)
        const { data: enqData } = await supabase
          .from('vehicle_enquiries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (enqData) setEnquiries(enqData);

        // Load sell requests
        const { data: sellData } = await supabase
          .from('sell_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (sellData) setSellRequests(sellData);
      } catch (err) {
        console.error('Error loading history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    if (user && (activeTab === 'test-drives' || activeTab === 'quotations' || activeTab === 'sell-requests')) {
      loadHistory();
    }
  }, [user, activeTab, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-6 pt-24">
        <Loader2 className="animate-spin text-amber-500" size={32} />
      </div>
    );
  }

  // Format date helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Status style helper
  const getStatusBadge = (status: string) => {
    const s = (status || 'NEW').toUpperCase();
    if (s === 'CONFIRMED' || s === 'APPROVED' || s === 'CONVERTED') {
      return <span className="px-2.5 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider bg-emerald-950/40 text-emerald-400 border border-emerald-900/60">Approved / Confirmed</span>;
    }
    if (s === 'CONTACTED') {
      return <span className="px-2.5 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider bg-blue-950/40 text-blue-400 border border-blue-900/60">Contacted</span>;
    }
    if (s === 'FOLLOW_UP') {
      return <span className="px-2.5 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider bg-amber-950/40 text-amber-400 border border-amber-900/60">Follow Up</span>;
    }
    if (s === 'OFFER_MADE') {
      return <span className="px-2.5 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider bg-blue-950/40 text-blue-400 border border-blue-900/60">Offer Made</span>;
    }
    if (s === 'NEGOTIATION') {
      return <span className="px-2.5 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider bg-violet-950/40 text-violet-400 border border-violet-900/60">In Negotiation</span>;
    }
    if (s === 'INSPECTION_SCHEDULED') {
      return <span className="px-2.5 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider bg-sky-950/40 text-sky-400 border border-sky-900/60">Inspection Scheduled</span>;
    }
    if (s === 'UNDER_REVIEW') {
      return <span className="px-2.5 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider bg-orange-950/40 text-orange-400 border border-orange-900/60">Under Review</span>;
    }
    if (s === 'RESCHEDULED') {
      return <span className="px-2.5 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider bg-orange-950/40 text-orange-400 border border-orange-900/60">Rescheduled</span>;
    }
    if (s === 'CANCELLED' || s === 'REJECTED' || s === 'CLOSED') {
      return <span className="px-2.5 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider bg-red-950/40 text-red-400 border border-red-900/60">Cancelled / Rejected</span>;
    }
    if (s === 'COMPLETED') {
      return <span className="px-2.5 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider bg-neutral-900 text-neutral-400 border border-neutral-800">Completed</span>;
    }
    return <span className="px-2.5 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider bg-amber-950/40 text-[#b48d36] border border-[#b48d36]/30">Pending Review</span>;
  };


  return (
    <div className="min-h-screen bg-[#0a0a0c] pt-24 pb-16">
      <div className="container-custom max-w-5xl px-4">
        
        {/* Profile Header Card */}
        <div className="bg-[#121215] border border-neutral-800 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
            <div className="w-16 h-16 rounded-full bg-[#b48d36]/10 border border-[#b48d36]/20 flex items-center justify-center text-[#b48d36] font-display font-black text-2xl">
              {userProfile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-display font-bold text-xl sm:text-2xl text-white">{userProfile.name}</h1>
              <p className="text-xs text-neutral-400 mt-0.5 tracking-wider uppercase font-semibold">AutoCapital Member</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 border border-neutral-800 hover:bg-neutral-900 px-5 py-2.5 rounded-lg text-xs font-bold text-white tracking-wider transition-all cursor-pointer hover:border-white/20"
          >
            <LogOut size={14} />
            LOG OUT
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-6 mb-8 border-b border-neutral-800 pb-px overflow-x-auto scrollbar-none">
          <button
            onClick={() => router.push('/profile?tab=profile')}
            className={`pb-3 text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'profile' ? 'text-white border-b-2 border-[#b48d36]' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <User size={13} />
            My Profile
          </button>
          <button
            onClick={() => router.push('/profile?tab=wishlist')}
            className={`pb-3 text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'wishlist' ? 'text-white border-b-2 border-[#b48d36]' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Heart size={13} className={activeTab === 'wishlist' ? 'fill-white' : ''} />
            My Wishlist ({wishlistItems.length})
          </button>
          <button
            onClick={() => router.push('/profile?tab=test-drives')}
            className={`pb-3 text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'test-drives' ? 'text-white border-b-2 border-[#b48d36]' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Calendar size={13} />
            Test Drives ({testDrives.length})
          </button>
          <button
            onClick={() => router.push('/profile?tab=quotations')}
            className={`pb-3 text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'quotations' ? 'text-white border-b-2 border-[#b48d36]' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <MessageSquare size={13} />
            Quotations ({enquiries.length})
          </button>
          <button
            onClick={() => router.push('/profile?tab=sell-requests')}
            className={`pb-3 text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'sell-requests' ? 'text-white border-b-2 border-[#b48d36]' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Car size={13} />
            Sell Requests ({sellRequests.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="bg-[#121215] border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl max-w-2xl">
            <h2 className="font-display font-bold text-lg text-white border-b border-neutral-800 pb-3">Personal Information</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Full Name</span>
                <div className="flex items-center gap-2.5 text-neutral-300">
                  <User size={16} className="text-neutral-500" />
                  <span className="text-sm font-semibold">{userProfile.name}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Email Address</span>
                <div className="flex items-center gap-2.5 text-neutral-300">
                  <Mail size={16} className="text-neutral-500" />
                  <span className="text-sm font-semibold">{userProfile.email}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Mobile Number</span>
                <div className="flex items-center gap-2.5 text-neutral-300">
                  <Phone size={16} className="text-neutral-500" />
                  <span className="text-sm font-semibold">{userProfile.phone}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Member Status</span>
                <div className="flex items-center gap-2.5 text-[#b48d36]">
                  <Award size={16} />
                  <span className="text-sm font-bold">Premium Member</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div>
            {loadingVehicles ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-amber-500" size={32} />
              </div>
            ) : vehicles.length === 0 ? (
              <div className="bg-[#121215] border border-neutral-800 rounded-2xl p-10 text-center shadow-xl">
                <Heart className="mx-auto text-neutral-600 mb-4" size={40} />
                <h3 className="font-display font-bold text-lg text-white mb-2">Your Wishlist is Empty</h3>
                <p className="text-xs text-neutral-400 font-light max-w-sm mx-auto mb-6">
                  Browse our premium inventory and click the heart icon on any vehicle to save it to your wishlist.
                </p>
                <Link href="/cars" className="btn-primary py-2.5 px-6 text-sm inline-flex">
                  Browse Inventory
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    isWishlisted={true}
                    onWishlistToggle={toggleWishlist}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Test Drives tab content */}
        {activeTab === 'test-drives' && (
          <div className="space-y-4">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-[#b48d36]" size={32} />
              </div>
            ) : testDrives.length === 0 ? (
              <div className="bg-[#121215] border border-neutral-800 rounded-2xl p-10 text-center shadow-xl">
                <Calendar className="mx-auto text-neutral-600 mb-4" size={40} />
                <h3 className="font-display font-bold text-lg text-white mb-2">No Test Drives Booked</h3>
                <p className="text-xs text-neutral-400 font-light max-w-sm mx-auto mb-6">
                  You haven't requested any test drive bookings yet. Find your dream car in inventory to book a test drive slot.
                </p>
                <Link href="/cars" className="btn-primary py-2.5 px-6 text-sm inline-flex">Browse Cars</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {testDrives.map((td) => {
                  const snapshot = td.vehicle_snapshot || {};
                  return (
                    <div key={td.id} className="bg-[#121215] border border-neutral-800 rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-5 shadow-xl">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 flex-wrap">
                          <h3 className="font-display font-bold text-base text-white">
                            {snapshot.year || ''} {snapshot.make || ''} {snapshot.model || 'Unknown Car'}
                          </h3>
                          {snapshot.variant && (
                            <span className="text-[10px] text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded mt-0.5 font-medium">{snapshot.variant}</span>
                          )}
                          <span className="text-xs text-neutral-500 font-medium">#{td.request_id}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-6 text-xs text-neutral-300">
                          <div className="flex items-center gap-2">
                            <Calendar size={13} className="text-neutral-500" />
                            <span><strong>Date:</strong> {formatDate(td.preferred_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={13} className="text-neutral-500" />
                            <span><strong>Slot:</strong> {td.preferred_time || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={13} className="text-neutral-500" />
                            <span><strong>Address:</strong> {td.location || 'N/A'}</span>
                          </div>
                        </div>

                        {td.message && (
                          <p className="text-xs text-neutral-400 font-light leading-relaxed bg-[#16161a] p-3 rounded-lg border border-neutral-800/60">
                            <strong>My Notes:</strong> {td.message}
                          </p>
                        )}

                        {td.admin_notes && (
                          <div className="border border-amber-900/40 bg-amber-950/10 p-3.5 rounded-xl space-y-1">
                            <span className="text-[9px] font-bold text-[#b48d36] tracking-wider uppercase">Dealer Response</span>
                            <p className="text-xs text-neutral-300 font-medium leading-relaxed">{td.admin_notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-row md:flex-col justify-between items-end md:items-end gap-3 self-start md:self-stretch">
                        <div className="text-right">
                          <span className="block text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-1">Booking Status</span>
                          {getStatusBadge(td.status)}
                        </div>
                        {snapshot.price && (
                          <span className="text-sm font-bold text-white">₹{(snapshot.price / 100000).toFixed(2)} Lakh</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Quotations tab content */}
        {activeTab === 'quotations' && (
          <div className="space-y-4">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-[#b48d36]" size={32} />
              </div>
            ) : enquiries.length === 0 ? (
              <div className="bg-[#121215] border border-neutral-800 rounded-2xl p-10 text-center shadow-xl">
                <MessageSquare className="mx-auto text-neutral-600 mb-4" size={40} />
                <h3 className="font-display font-bold text-lg text-white mb-2">No Quotations Requested</h3>
                <p className="text-xs text-neutral-400 font-light max-w-sm mx-auto mb-6">
                  You haven't requested pricing quotations for any vehicles yet. Find your dream car in inventory to request a custom quote.
                </p>
                <Link href="/cars" className="btn-primary py-2.5 px-6 text-sm inline-flex">Browse Cars</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {enquiries.map((enq) => {
                  const snapshot = enq.vehicle_snapshot || {};
                  return (
                    <div key={enq.id} className="bg-[#121215] border border-neutral-800 rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-5 shadow-xl">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-start gap-3 flex-wrap">
                          <h3 className="font-display font-bold text-base text-white">
                            {snapshot.year || ''} {snapshot.make || ''} {snapshot.model || 'Unknown Car'}
                          </h3>
                          {snapshot.variant && (
                            <span className="text-[10px] text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded mt-0.5 font-medium">{snapshot.variant}</span>
                          )}
                          <span className="text-xs text-neutral-500 font-medium">#{enq.enquiry_id}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-xs text-neutral-300">
                          <div className="flex items-center gap-2">
                            <Clock size={13} className="text-neutral-500" />
                            <span><strong>Request Date:</strong> {formatDate(enq.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={13} className="text-neutral-500" />
                            <span><strong>Preferred Contact:</strong> {enq.preferred_contact}</span>
                          </div>
                        </div>

                        {enq.message && (
                          <p className="text-xs text-neutral-400 font-light leading-relaxed bg-[#16161a] p-3 rounded-lg border border-neutral-800/60">
                            <strong>Message:</strong> {enq.message}
                          </p>
                        )}

                        {enq.admin_notes && (
                          <div className="border border-amber-900/40 bg-amber-950/10 p-3.5 rounded-xl space-y-1">
                            <span className="text-[9px] font-bold text-[#b48d36] tracking-wider uppercase">Dealer Notes</span>
                            <p className="text-xs text-neutral-300 font-medium leading-relaxed">{enq.admin_notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-row md:flex-col justify-between items-end md:items-end gap-3 self-start md:self-stretch">
                        <div className="text-right">
                          <span className="block text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-1">Status</span>
                          {getStatusBadge(enq.status)}
                        </div>
                        {snapshot.price && (
                          <span className="text-sm font-bold text-white">₹{(snapshot.price / 100000).toFixed(2)} Lakh</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Sell Requests tab content */}
        {activeTab === 'sell-requests' && (
          <div className="space-y-4">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-[#b48d36]" size={32} />
              </div>
            ) : sellRequests.length === 0 ? (
              <div className="bg-[#121215] border border-neutral-800 rounded-2xl p-10 text-center shadow-xl">
                <Car className="mx-auto text-neutral-600 mb-4" size={40} />
                <h3 className="font-display font-bold text-lg text-white mb-2">No Sell Requests Submitted</h3>
                <p className="text-xs text-neutral-400 font-light max-w-sm mx-auto mb-6">
                  You haven't submitted any car sell requests yet. Want to sell your car? Fill in the details and we'll contact you with our best offer.
                </p>
                <Link href="/sell-car" className="btn-primary py-2.5 px-6 text-sm inline-flex">Sell Your Car</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {sellRequests.map((req) => (
                  <div key={req.id} className="bg-[#121215] border border-neutral-800 rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-5 shadow-xl">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-start gap-3 flex-wrap">
                        <h3 className="font-display font-bold text-base text-white">
                          {req.manufacturing_year} {req.make} {req.model}
                        </h3>
                        {req.variant && (
                          <span className="text-[10px] text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded mt-0.5 font-medium">{req.variant}</span>
                        )}
                        <span className="text-xs text-neutral-500 font-medium">#{req.request_id}</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4 text-xs text-neutral-300">
                        <div><span className="text-neutral-500">Fuel:</span> {req.fuel_type}</div>
                        <div><span className="text-neutral-500">Transmission:</span> {req.transmission}</div>
                        <div><span className="text-neutral-500">KMs:</span> {req.kms_driven?.toLocaleString('en-IN')}</div>
                        <div><span className="text-neutral-500">Owners:</span> {req.number_of_owners}</div>
                      </div>

                      {req.expected_price && (
                        <p className="text-xs text-white font-bold">
                          Expected: ₹{(req.expected_price / 100000).toFixed(2)} Lakh
                        </p>
                      )}

                      {req.admin_notes && (
                        <div className="border border-amber-900/40 bg-amber-950/10 p-3.5 rounded-xl space-y-1">
                          <span className="text-[9px] font-bold text-[#b48d36] tracking-wider uppercase">Dealer Response</span>
                          <p className="text-xs text-neutral-300 font-medium leading-relaxed">{req.admin_notes}</p>
                          {req.offered_price && (
                            <p className="text-sm font-bold text-[#b48d36] mt-1">Offered Price: ₹{(req.offered_price / 100000).toFixed(2)} Lakh</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row md:flex-col justify-between items-end md:items-end gap-3 self-start md:self-stretch">
                      <div className="text-right">
                        <span className="block text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-1">Request Status</span>
                        {getStatusBadge(req.status)}
                      </div>
                      <span className="text-[10px] text-neutral-500">{formatDate(req.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

import { Suspense } from 'react';

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-6 pt-24">
        <Loader2 className="animate-spin text-amber-500" size={32} />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
