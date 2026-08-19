'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Vehicle } from '@/types';

interface TestDriveModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export default function TestDriveModal({ vehicle, onClose }: TestDriveModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    preferred_date: '',
    preferred_time: '',
    message: '',
  });

  // Pre-fill user data if logged in
  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setFormData((prev) => ({
          ...prev,
          name: session.user.user_metadata?.full_name || '',
          phone: session.user.user_metadata?.phone || '',
          email: session.user.email || '',
        }));
      }
    };
    loadUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      const vehicleSnapshot = {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        variant: vehicle.variant,
        year: vehicle.year,
        price: vehicle.price,
        slug: vehicle.slug,
      };

      const res = await fetch('/api/test-drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_email: formData.email || null,
          location: formData.location,
          preferred_date: formData.preferred_date,
          preferred_time: formData.preferred_time || null,
          message: formData.message || null,
          vehicle_id: vehicle.id,
          vehicle_snapshot: vehicleSnapshot,
          user_id: userId,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setSuccess(true);
      } else {
        setError(json.error || 'Failed to book test drive. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#121215] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-scale">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div>
            <h2 className="font-display font-bold text-base text-white uppercase tracking-wider">Book a Test Drive</h2>
            <p className="text-[10px] text-neutral-400 font-light uppercase tracking-wider mt-0.5">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="p-8 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 size={48} className="text-[#b48d36] animate-bounce" />
            </div>
            <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">Booking Submitted!</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
              Your test drive request has been recorded. Our team will review the availability and call you to confirm your slot. You can track this request status in your profile page.
            </p>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center bg-[#b48d36] hover:bg-[#9a845a] text-white font-bold px-8 py-3 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-950/50 border border-red-900 rounded-lg p-3 text-xs text-red-400 text-center">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit number"
                  className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Location (City / Address) *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Where do you live?"
                    className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-amber-500 pl-10 text-white"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                  <MapPin size={14} className="absolute left-3.5 top-3.5 text-neutral-500" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Preferred Date *</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-amber-500 pl-10 text-white cursor-pointer"
                    value={formData.preferred_date}
                    onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                    onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                    onFocus={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                  />
                  <Calendar size={14} className="absolute left-3.5 top-3.5 text-neutral-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Preferred Time Slot *</label>
                <div className="relative">
                  <select
                    required
                    className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-amber-500 pl-10 text-white cursor-pointer appearance-none"
                    value={formData.preferred_time}
                    onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                  >
                    <option value="">Select Time Slot</option>
                    <option value="Morning (10:00 AM - 12:00 PM)">Morning (10 AM - 12 PM)</option>
                    <option value="Afternoon (12:00 PM - 03:00 PM)">Afternoon (12 PM - 3 PM)</option>
                    <option value="Evening (03:00 PM - 06:00 PM)">Evening (3 PM - 6 PM)</option>
                  </select>
                  <Clock size={14} className="absolute left-3.5 top-3.5 text-neutral-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Message / Special Requests (optional)</label>
              <textarea
                rows={2}
                placeholder="Any special requests or instructions..."
                className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-amber-500 text-white resize-none"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#b48d36] hover:bg-[#9a845a] text-white font-bold py-4 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'BOOK TEST DRIVE'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
