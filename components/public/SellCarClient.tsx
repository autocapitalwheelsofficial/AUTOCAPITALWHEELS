'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X, CheckCircle2, Loader2, Camera, MessageCircle, ChevronDown, Check } from 'lucide-react';
import { sellCarSchema, SellCarFormValues } from '@/lib/validations';
import { CAR_MAKES, FUEL_TYPES, TRANSMISSION_TYPES, VEHICLE_CONDITIONS, INSURANCE_STATUSES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function SellCarClient() {
  const [formState, setFormState] = useState<FormState>('idle');
  const [requestId, setRequestId] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [openMakeDropdown, setOpenMakeDropdown] = useState(false);

  const {
    register,
    handleSubmit,
    formState: formErrorsState,
    watch,
    setValue,
  } = useForm<any>({
    resolver: zodResolver(sellCarSchema) as any,
    defaultValues: {
      number_of_owners: 1,
      rc_available: true,
      accident_history: false,
      vehicle_condition: 'Good',
    },
  });
  const errors = formErrorsState.errors as any;
  const selectedMakeWatch = watch('make');

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setValue('owner_name', session.user.user_metadata?.full_name || '');
        setValue('owner_phone', session.user.user_metadata?.phone || '');
        setValue('owner_email', session.user.email || '');
      }
    };
    loadUser();
  }, [setValue]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 10) {
      setUploadError('Maximum 10 photos allowed');
      return;
    }
    setUploadError('');
    const validFiles = files.filter((f) => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024);
    const newPhotos = [...photos, ...validFiles];
    setPhotos(newPhotos);
    newPhotos.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreviews((prev) => [...prev, e.target?.result as string]);
      };
      if (!photoPreviews[newPhotos.indexOf(file)]) reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (data: SellCarFormValues) => {
    if (formState === 'loading') return;
    setFormState('loading');
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      if (userId) {
        formData.append('user_id', userId);
      }
      photos.forEach((photo) => formData.append('photos', photo));

      const res = await fetch('/api/sell-requests', { method: 'POST', body: formData });
      const json = await res.json();

      if (json.success) {
        setRequestId(json.data?.request_id || '');
        setFormState('success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setFormState('error');
      }
    } catch {
      setFormState('error');
    }
  };

  if (formState === 'success') {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-6 pt-24">
        <div className="max-w-md w-full text-center bg-[#121215] border border-neutral-800 rounded-2xl p-8 shadow-2xl animate-fade-in-scale">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="text-[#b48d36] animate-bounce" size={56} />
          </div>
          <h1 className="font-display font-black text-2xl text-white uppercase tracking-wider mb-3">Request Submitted!</h1>
          <p className="text-xs text-neutral-400 leading-relaxed mb-4">
            Thank you for submitting your vehicle details. Our evaluation team will review your car and contact you to schedule an inspection. You can track this request status in your profile page.
          </p>
          {requestId && (
            <div className="inline-block bg-[#16161a] border border-neutral-800 rounded-xl px-6 py-3.5 mb-6">
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-1">Your Reference ID</p>
              <p className="font-mono font-bold text-white text-lg">#{requestId}</p>
            </div>
          )}
          <div className="space-y-3">
            <a
              href={`https://wa.me/918800243707?text=Hello%20AutoCapital%20Wheels%2C%20I%20just%20submitted%20a%20sell%20request%20for%20my%20car.%20My%20reference%20ID%20is%20%23${requestId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#25d366] hover:bg-[#128C7E] text-white font-bold py-3.5 rounded-lg text-xs uppercase tracking-wider transition-all"
            >
              <MessageCircle size={16} />
              Follow Up on WhatsApp
            </a>
            <a href="/profile" className="w-full inline-flex items-center justify-center border border-neutral-800 hover:bg-neutral-900 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer">
              Go to My Profile
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] pt-24 pb-16">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-[#0d0d10] py-12 px-4">
        <div className="container-custom max-w-3xl">
          <div className="w-10 h-0.5 bg-[#b48d36] mb-4" />
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-wider mb-3">Sell Your Car</h1>
          <p className="text-neutral-400 text-xs sm:text-sm max-w-xl font-light uppercase tracking-wider leading-relaxed">
            Submit your vehicle details and our team will review your car and contact you with the next steps.
          </p>
        </div>
      </div>

      <div className="container-custom max-w-3xl py-10 px-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Owner Details */}
          <div className="bg-[#121215] rounded-2xl border border-neutral-800 p-6 shadow-xl">
            <h2 className="font-display font-bold text-lg text-white border-b border-neutral-800 pb-3 mb-5 uppercase tracking-wider">Your Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 font-sans">Full Name *</label>
                <input type="text" placeholder="Your full name" className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-[#b48d36] focus:ring-1 focus:ring-[#b48d36]/30 transition-all duration-300 text-white" {...register('owner_name')} />
                {errors.owner_name && <p className="text-red-500 text-[10px] mt-1">{errors.owner_name.message}</p>}
              </div>
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 font-sans">Mobile Number *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-neutral-800 bg-[#16161a] text-xs text-neutral-500 font-semibold">+91</span>
                  <input type="tel" placeholder="10-digit number" maxLength={10} className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-r-lg focus:outline-none focus:border-[#b48d36] focus:ring-1 focus:ring-[#b48d36]/30 transition-all duration-300 text-white" {...register('owner_phone')} />
                </div>
                {errors.owner_phone && <p className="text-red-500 text-[10px] mt-1">{errors.owner_phone.message}</p>}
              </div>
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 font-sans">Email Address (optional)</label>
                <input type="email" placeholder="your@email.com" className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-[#b48d36] focus:ring-1 focus:ring-[#b48d36]/30 transition-all duration-300 text-white" {...register('owner_email')} />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 font-sans">City *</label>
                <input type="text" placeholder="Your city" className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-[#b48d36] focus:ring-1 focus:ring-[#b48d36]/30 transition-all duration-300 text-white" {...register('owner_city')} />
                {errors.owner_city && <p className="text-red-500 text-[10px] mt-1">{errors.owner_city.message}</p>}
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="bg-[#121215] rounded-2xl border border-neutral-800 p-6 shadow-xl">
            <h2 className="font-display font-bold text-lg text-white border-b border-neutral-800 pb-3 mb-5 uppercase tracking-wider">Vehicle Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Make Custom Dropdown */}
              <div className="relative">
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 font-sans">Make *</label>
                <button
                  type="button"
                  onClick={() => setOpenMakeDropdown(!openMakeDropdown)}
                  className={`w-full flex items-center justify-between text-xs font-semibold px-4 py-3 bg-[#16161a] border ${errors.make ? 'border-red-500' : 'border-neutral-800'} rounded-lg hover:border-[#b48d36] focus:border-[#b48d36] focus:ring-1 focus:ring-[#b48d36]/30 text-white transition-all duration-300 text-left cursor-pointer`}
                  id="sell-make-btn"
                >
                  <span className="truncate">{selectedMakeWatch || 'Select Make'}</span>
                  <ChevronDown size={14} className={`text-neutral-500 transition-transform duration-300 ${openMakeDropdown ? 'rotate-180' : ''}`} />
                </button>

                {openMakeDropdown && (
                  <div className="absolute left-0 right-0 mt-2 bg-[#16161a] border border-neutral-800 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 py-1.5 scrollbar-thin">
                    {CAR_MAKES.map((m) => (
                      <div
                        key={m}
                        onClick={() => { setValue('make', m); setOpenMakeDropdown(false); }}
                        className="flex items-center justify-between px-4 py-2 hover:bg-[#b48d36]/10 text-xs font-semibold text-white cursor-pointer transition-all"
                      >
                        <span>{m}</span>
                        {selectedMakeWatch === m && <Check size={12} className="text-[#b48d36]" />}
                      </div>
                    ))}
                  </div>
                )}
                {errors.make && <p className="text-red-500 text-[10px] mt-1">{errors.make.message}</p>}
              </div>

              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 font-sans">Model *</label>
                <input type="text" placeholder="e.g. Swift, Creta, Nexon" className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-[#b48d36] focus:ring-1 focus:ring-[#b48d36]/30 transition-all duration-300 text-white" {...register('model')} />
                {errors.model && <p className="text-red-500 text-[10px] mt-1">{errors.model.message}</p>}
              </div>
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 font-sans">Variant (optional)</label>
                <input type="text" placeholder="e.g. VXI, SX, ZX+" className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-[#b48d36] focus:ring-1 focus:ring-[#b48d36]/30 transition-all duration-300 text-white" {...register('variant')} />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 font-sans">Manufacturing Year *</label>
                <input type="number" placeholder="e.g. 2020" min="1990" max={new Date().getFullYear()} className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-[#b48d36] focus:ring-1 focus:ring-[#b48d36]/30 transition-all duration-300 text-white" {...register('manufacturing_year', { valueAsNumber: true })} />
                {errors.manufacturing_year && <p className="text-red-500 text-[10px] mt-1">{errors.manufacturing_year.message}</p>}
              </div>
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 font-sans">Registration Year (optional)</label>
                <input type="number" placeholder="e.g. 2020" min="1990" max={new Date().getFullYear()} className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-[#b48d36] focus:ring-1 focus:ring-[#b48d36]/30 transition-all duration-300 text-white" {...register('registration_year', { valueAsNumber: true })} />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 font-sans">Fuel Type *</label>
                <select className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-[#b48d36] focus:ring-1 focus:ring-[#b48d36]/30 transition-all duration-300 text-white cursor-pointer appearance-none" {...register('fuel_type')}>
                  <option value="">Select</option>
                  {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                {errors.fuel_type && <p className="text-red-500 text-[10px] mt-1">{errors.fuel_type.message}</p>}
              </div>
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 font-sans">Transmission *</label>
                <select className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-[#b48d36] focus:ring-1 focus:ring-[#b48d36]/30 transition-all duration-300 text-white cursor-pointer appearance-none" {...register('transmission')}>
                  <option value="">Select</option>
                  {TRANSMISSION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.transmission && <p className="text-red-500 text-[10px] mt-1">{errors.transmission.message}</p>}
              </div>
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 font-sans">Kilometres Driven *</label>
                <input type="number" placeholder="e.g. 45000" min="0" className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-[#b48d36] focus:ring-1 focus:ring-[#b48d36]/30 transition-all duration-300 text-white" {...register('kms_driven', { valueAsNumber: true })} />
                {errors.kms_driven && <p className="text-red-500 text-[10px] mt-1">{errors.kms_driven.message}</p>}
              </div>
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 font-sans">Number of Owners</label>
                <select className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-[#b48d36] focus:ring-1 focus:ring-[#b48d36]/30 transition-all duration-300 text-white cursor-pointer appearance-none" {...register('number_of_owners', { valueAsNumber: true })}>
                  {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 font-sans">Expected Selling Price (₹) (optional)</label>
                <input type="number" placeholder="e.g. 500000" min="0" className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-[#b48d36] focus:ring-1 focus:ring-[#b48d36]/30 transition-all duration-300 text-white" {...register('expected_price', { valueAsNumber: true })} />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 font-sans">Vehicle Condition *</label>
                <select className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-[#b48d36] focus:ring-1 focus:ring-[#b48d36]/30 transition-all duration-300 text-white cursor-pointer appearance-none" {...register('vehicle_condition')}>
                  {VEHICLE_CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 font-sans">Insurance Status (optional)</label>
                <select className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-[#b48d36] focus:ring-1 focus:ring-[#b48d36]/30 transition-all duration-300 text-white cursor-pointer appearance-none" {...register('insurance_status')}>
                  <option value="">Select</option>
                  {INSURANCE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-neutral-800 bg-[#16161a] cursor-pointer hover:bg-neutral-800/40 transition-colors">
                <input type="checkbox" className="w-4 h-4 accent-neutral-900" {...register('accident_history')} />
                <div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Accident History</span>
                  <p className="text-[10px] text-neutral-500">Vehicle has had an accident</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-neutral-800 bg-[#16161a] cursor-pointer hover:bg-neutral-800/40 transition-colors">
                <input type="checkbox" className="w-4 h-4 accent-neutral-900" defaultChecked {...register('rc_available')} />
                <div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">RC Available</span>
                  <p className="text-[10px] text-neutral-500">Registration Certificate available</p>
                </div>
              </label>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="bg-[#121215] rounded-2xl border border-neutral-800 p-6 shadow-xl">
            <h2 className="font-display font-bold text-lg text-white border-b border-neutral-800 pb-3 mb-2 uppercase tracking-wider">Vehicle Photos</h2>
            <p className="text-[10px] text-neutral-400 font-light leading-relaxed mb-5 uppercase tracking-wider">Upload up to 10 photos. Include exterior, interior, dashboard, and any damage areas. Good photos help us evaluate your car faster.</p>

            {/* Dropzone */}
            <div
              className="dropzone bg-[#16161a] border-neutral-800 hover:border-amber-500/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={32} className="text-neutral-500 mx-auto mb-3" />
              <p className="font-bold text-neutral-300 text-xs uppercase tracking-wider mb-1">Click to upload photos</p>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest">or drag and drop — JPG, PNG, WEBP up to 10MB each</p>
              <p className="text-[9px] text-[#b48d36] uppercase tracking-widest mt-1 font-bold">Max 10 photos total</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
                id="sell-photos-input"
              />
            </div>

            {uploadError && <p className="text-red-500 text-[10px] mt-2 font-bold">{uploadError}</p>}

            {/* Previews */}
            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                {photoPreviews.map((src, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800">
                    <img src={src} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                      aria-label="Remove photo"
                    >
                      <X size={10} />
                    </button>
                    {idx === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5">Main</div>
                    )}
                  </div>
                ))}
                {photoPreviews.length < 10 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-neutral-800 flex items-center justify-center text-neutral-600 hover:border-neutral-500 hover:text-neutral-500 transition-colors bg-[#16161a]"
                  >
                    <Upload size={20} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="bg-[#121215] rounded-2xl border border-neutral-800 p-6 shadow-xl">
            <h2 className="font-display font-bold text-lg text-white border-b border-neutral-800 pb-3 mb-4 uppercase tracking-wider">Additional Information</h2>
            <textarea
              rows={4}
              placeholder="Any additional details about the vehicle — modifications, recent repairs, accessories included, reason for selling, etc."
              className="w-full text-xs font-semibold px-4 py-3 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-amber-500 text-white resize-none"
              {...register('additional_info')}
            />
          </div>

          {formState === 'error' && (
            <div className="bg-red-950/50 border border-red-900 rounded-xl p-4 text-xs text-red-400 text-center">
              Something went wrong. Please try again or WhatsApp us on +91 8800243707.
            </div>
          )}

          {/* Notice */}
          <div className="bg-amber-950/20 border border-[#b48d36]/30 rounded-xl p-4 text-xs text-neutral-300 leading-relaxed">
            <strong className="text-[#b48d36] uppercase tracking-wider block mb-1">Please note:</strong> We do not provide an instant valuation. Our team carefully reviews each vehicle submission and will contact you personally to discuss the next steps and pricing.
          </div>

          <button
            type="submit"
            disabled={formState === 'loading'}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#b48d36] hover:bg-[#9a845a] text-white font-bold py-4 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
            id="submit-sell-request-btn"
          >
            {formState === 'loading' ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                SUBMITTING...
              </>
            ) : (
              'Submit Sell Request'
            )}
          </button>

          <p className="text-xs text-neutral-500 text-center pb-8">
            By submitting you agree to be contacted by our team regarding your vehicle.
          </p>
        </form>
      </div>
    </div>
  );
}
