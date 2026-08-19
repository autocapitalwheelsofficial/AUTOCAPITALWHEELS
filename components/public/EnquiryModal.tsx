'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle2, MessageCircle, Clock, MapPin } from 'lucide-react';
import { Vehicle } from '@/types';
import { formatPrice, getVehicleTitle, getWhatsAppUrl, getVehicleWhatsAppMessage } from '@/lib/utils';
import { WHATSAPP_NUMBER } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

interface EnquiryModalProps {
  vehicle?: Vehicle;
  onClose: () => void;
  defaultType?: 'enquiry' | 'test_drive';
}

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function EnquiryModal({ vehicle, onClose, defaultType = 'enquiry' }: EnquiryModalProps) {
  const [formState, setFormState] = useState<FormState>('idle');
  const [enquiryId, setEnquiryId] = useState('');
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  
  // Dynamic vehicle list states
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(vehicle || null);
  const [loadingStock, setLoadingStock] = useState(false);

  // Form states using standard React state instead of react-hook-form/zod to guarantee 100% submission
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_city: '',
    vehicle_id: vehicle?.id || '',
    message: '',
    preferred_contact: 'Phone',
    preferred_time: '',
  });

  const [formValidationErrors, setFormValidationErrors] = useState<Record<string, string>>({});

  // Load user data and available vehicles
  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setFormData((prev) => ({
          ...prev,
          customer_name: session.user.user_metadata?.full_name || '',
          customer_phone: session.user.user_metadata?.phone || '',
          customer_email: session.user.email || '',
        }));
      }
    };
    loadUser();

    if (!vehicle) {
      setLoadingStock(true);
      fetch('/api/vehicles?per_page=50')
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setAvailableVehicles(json.data);
          }
        })
        .catch((err) => console.error('Error loading quote stock:', err))
        .finally(() => setLoadingStock(false));
    }
  }, [vehicle]);

  const handleVehicleChange = (vehicleId: string) => {
    const found = availableVehicles.find((v) => v.id === vehicleId) || null;
    setSelectedVehicle(found);
    setFormData((prev) => ({ ...prev, vehicle_id: vehicleId }));
  };

  const title = selectedVehicle ? getVehicleTitle(selectedVehicle) : 'Select a Vehicle';

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidationErrors({});

    // Client-side validations
    const errors: Record<string, string> = {};
    if (!formData.customer_name.trim()) {
      errors.customer_name = 'Name is required';
    }
    if (!formData.customer_phone.trim()) {
      errors.customer_phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.customer_phone)) {
      errors.customer_phone = 'Please enter a valid 10-digit mobile number';
    }

    if (Object.keys(errors).length > 0) {
      setFormValidationErrors(errors);
      return;
    }

    setFormState('loading');
    try {
      const payload = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email || null,
        customer_city: formData.customer_city || null,
        vehicle_id: formData.vehicle_id || null,
        message: formData.message || null,
        preferred_contact: formData.preferred_contact,
        preferred_time: formData.preferred_time || null,
        test_drive_requested: defaultType === 'test_drive',
        user_id: userId || null,
      };

      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setEnquiryId(json.data?.enquiry_id || '');
        setFormState('success');
      } else {
        console.error('[EnquiryModal] API error:', json);
        setFormState('error');
      }
    } catch (err) {
      console.error('[EnquiryModal] Submit error:', err);
      setFormState('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#121215] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-scale">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div>
            <h2 className="font-display font-bold text-base text-white uppercase tracking-wider">Get Quotation</h2>
            <p className="text-[10px] text-neutral-400 font-light uppercase tracking-wider mt-0.5">{title}</p>
            {selectedVehicle && selectedVehicle.price && (
              <p className="text-xs font-bold text-[#b48d36] mt-0.5">{formatPrice(selectedVehicle.price)}</p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {formState === 'success' ? (
          <div className="p-8 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 size={48} className="text-[#b48d36] animate-bounce" />
            </div>
            <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">Request Submitted!</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
              We have received your quotation request. One of our luxury consultants will prepare a custom proposal and reach out to you shortly. You can track this request status in your profile page.
            </p>
            {enquiryId && (
              <p className="text-[10px] text-neutral-500">
                Reference ID: <span className="font-mono font-semibold text-neutral-300">#{enquiryId}</span>
              </p>
            )}
            <div className="space-y-3 pt-2">
              <a
                href={getWhatsAppUrl(WHATSAPP_NUMBER, getVehicleWhatsAppMessage(title))}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#128C7E] text-white font-bold py-3.5 rounded-lg text-xs uppercase tracking-wider transition-all"
              >
                <MessageCircle size={16} />
                Chat on WhatsApp Instead
              </a>
              <button
                onClick={onClose}
                className="w-full border border-neutral-800 hover:bg-neutral-900 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Vehicle Selector Dropdown if no vehicle passed */}
            {!vehicle && (
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Select Car of Interest *</label>
                {loadingStock ? (
                  <div className="flex items-center gap-2 text-xs text-neutral-500 py-2">
                    <Loader2 className="animate-spin text-[#b48d36]" size={14} />
                    Loading available stock...
                  </div>
                ) : (
                  <select
                    className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-[#b48d36] focus:ring-1 focus:ring-[#b48d36]/30 transition-all duration-300 text-white cursor-pointer appearance-none"
                    onChange={(e) => handleVehicleChange(e.target.value)}
                    value={formData.vehicle_id}
                    required
                  >
                    <option value="" disabled>Choose a vehicle from stock...</option>
                    {availableVehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.year} {v.make} {v.model} {v.variant ? ` ${v.variant}` : ''} (₹{(v.price / 100000).toFixed(2)} Lakh)
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-[#b48d36] focus:ring-1 focus:ring-[#b48d36]/30 transition-all duration-300 text-white"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                />
                {formValidationErrors.customer_name && <p className="text-red-500 text-[10px] mt-1">{formValidationErrors.customer_name}</p>}
              </div>

              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Phone Number *</label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-neutral-800 bg-[#16161a] text-xs text-neutral-500 font-semibold">+91</span>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit number"
                    className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-r-lg focus:outline-none focus:border-[#b48d36] focus:ring-1 focus:ring-[#b48d36]/30 transition-all duration-300 text-white"
                    maxLength={10}
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  />
                </div>
                {formValidationErrors.customer_phone && <p className="text-red-500 text-[10px] mt-1">{formValidationErrors.customer_phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-[#b48d36] focus:ring-1 focus:ring-[#b48d36]/30 transition-all duration-300 text-white"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">City (optional)</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Your city"
                    className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-[#b48d36] focus:ring-1 focus:ring-[#b48d36]/30 transition-all duration-300 pl-10 text-white"
                    value={formData.customer_city}
                    onChange={(e) => setFormData({ ...formData, customer_city: e.target.value })}
                  />
                  <MapPin size={14} className="absolute left-3.5 top-3.5 text-neutral-500" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Message / Requirements</label>
              <textarea
                rows={2}
                placeholder="Questions about registration state, loan requirements..."
                className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-[#b48d36] focus:ring-1 focus:ring-[#b48d36]/30 transition-all duration-300 text-white resize-none"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Preferred Contact Method</label>
                <select
                  className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-amber-500 text-white cursor-pointer appearance-none"
                  value={formData.preferred_contact}
                  onChange={(e) => setFormData({ ...formData, preferred_contact: e.target.value })}
                >
                  <option value="Phone">Phone Call</option>
                  <option value="WhatsApp">WhatsApp Message</option>
                  <option value="Email">Email</option>
                  <option value="Any">Any Method</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Preferred Time slot</label>
                <select
                  className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-amber-500 text-white cursor-pointer appearance-none"
                  value={formData.preferred_time}
                  onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                >
                  <option value="">Any time</option>
                  <option value="Morning (10 AM - 1 PM)">Morning (10 AM - 1 PM)</option>
                  <option value="Afternoon (1 PM - 4 PM)">Afternoon (1 PM - 4 PM)</option>
                  <option value="Evening (4 PM - 7 PM)">Evening (4 PM - 7 PM)</option>
                </select>
              </div>
            </div>

            {formState === 'error' && (
              <p className="text-[10px] text-red-400 bg-red-950/50 border border-red-900 px-4 py-3 rounded-lg text-center">
                Something went wrong. Please try again or click WhatsApp.
              </p>
            )}

            <button
              type="submit"
              disabled={formState === 'loading'}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#b48d36] hover:bg-[#9a845a] text-white font-bold py-4 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
              id="submit-enquiry-btn"
            >
              {formState === 'loading' ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  SUBMITTING...
                </>
              ) : (
                'SUBMIT QUOTATION REQUEST'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
