'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, X, CheckCircle, Save, Phone, Mail, Globe, Clock, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminSettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // General settings
  const [form, setForm] = useState({
    brand_name: '',
    brand_tagline: '',
    business_phone: '',
    business_whatsapp: '',
    business_email: '',
    business_address: '',
    business_hours: '',
  });

  // Slides state
  const [existingSlides, setExistingSlides] = useState<any[]>([]);
  const [newSlideFiles, setNewSlideFiles] = useState<File[]>([]);
  const [newSlidePreviews, setNewSlidePreviews] = useState<string[]>([]);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/settings');
        const json = await res.json();
        if (json.success) {
          const loadedForm = { ...form };
          json.settings.forEach((s: any) => {
            if (s.key === 'hero_slides') {
              try {
                const parsed = JSON.parse(s.value);
                const mapped = (parsed || []).map((item: any) => {
                  if (typeof item === 'string') {
                    return {
                      url: item,
                      subtitle: "Delhi's Premium Used Cars",
                      title_white: "Trusted Cars. ",
                      title_gold: "Trusted Deals.",
                      description: "We buy and sell certified, premium pre-owned cars. Get transparent pricing, 100+ checkpoint verified vehicles, and expert support."
                    };
                  }
                  return item;
                });
                setExistingSlides(mapped);
              } catch {
                setExistingSlides([]);
              }
            } else if (s.key in loadedForm) {
              loadedForm[s.key as keyof typeof form] = s.value || '';
            }
          });
          setForm(loadedForm);
        }
      } catch (e: any) {
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleFieldChange = (key: string, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSlideTextChange = (idx: number, field: string, value: string) => {
    setExistingSlides((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      (f) => (f.type.startsWith('image/') || f.type.startsWith('video/')) && f.size <= 50 * 1024 * 1024
    );

    setNewSlideFiles((prev) => [...prev, ...validFiles]);
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewSlidePreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewSlide = (idx: number) => {
    setNewSlideFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewSlidePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeExistingSlide = (url: string) => {
    if (confirm('Delete this slide?')) {
      setExistingSlides((prev) => prev.filter((slide) => slide.url !== url));
    }
  };

  const moveSlide = (idx: number, direction: 'left' | 'right') => {
    const nextIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= existingSlides.length) return;
    
    setExistingSlides((prev) => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[nextIdx];
      copy[nextIdx] = temp;
      return copy;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        formData.append(key, val);
      });

      formData.append('existing_hero_slides', JSON.stringify(existingSlides));
      
      newSlideFiles.forEach((file) => {
        formData.append('hero_slides_files', file);
      });

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        setSuccess(true);
        setNewSlideFiles([]);
        setNewSlidePreviews([]);
        // Re-fetch to get public URLs for new slides
        const updatedRes = await fetch('/api/admin/settings');
        const updatedJson = await updatedRes.json();
        if (updatedJson.success) {
          updatedJson.settings.forEach((s: any) => {
            if (s.key === 'hero_slides') {
              setExistingSlides(JSON.parse(s.value));
            }
          });
        }
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(json.error || 'Failed to save settings');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-amber-500" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-neutral-950 text-white min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="font-display font-bold text-2xl">Site Settings</h1>
              <p className="text-neutral-500 text-xs mt-0.5">Manage homepage slides, metadata, and company contact details.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Hero Slideshow Management */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-display font-bold text-lg text-amber-500 border-b border-neutral-800 pb-3">Hero Section Slideshow</h2>
            
            {/* Existing Slides */}
            {existingSlides.length > 0 && (
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Active Slides</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {existingSlides.map((slideObj, idx) => {
                    const url = typeof slideObj === 'string' ? slideObj : slideObj.url;
                    const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('/hero/hero_slide_') && !url.includes('.png') && !url.includes('.jpg');
                    return (
                      <div key={idx} className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-4 relative group">
                        {/* Header controls (ordering & remove) */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Slide #{idx + 1}</span>
                          <div className="flex items-center gap-1.5">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => moveSlide(idx, 'left')}
                                className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-white transition-all cursor-pointer border border-neutral-800"
                                title="Move Up/Left"
                              >
                                <ChevronLeft size={12} />
                              </button>
                            )}
                            {idx < existingSlides.length - 1 && (
                              <button
                                type="button"
                                onClick={() => moveSlide(idx, 'right')}
                                className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-white transition-all cursor-pointer border border-neutral-800"
                                title="Move Down/Right"
                              >
                                <ChevronRight size={12} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeExistingSlide(url)}
                              className="p-1 rounded bg-red-950 text-red-400 hover:bg-red-900 transition-all cursor-pointer border border-red-900/40"
                              title="Delete Slide"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Media Preview */}
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-900 border border-neutral-900">
                          {isVideo ? (
                            <video src={url} className="w-full h-full object-cover" muted loop playsInline />
                          ) : (
                            <img src={url} alt="Slide Preview" className="w-full h-full object-cover" />
                          )}
                          <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[8px] text-neutral-300 font-bold uppercase tracking-widest">
                            {isVideo ? 'Video Slide' : 'Image Slide'}
                          </div>
                        </div>

                        {/* Text Inputs */}
                        <div className="space-y-2 pt-2 border-t border-neutral-900">
                          <div>
                            <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">Subtitle / Tagline</label>
                            <input
                              type="text"
                              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                              value={slideObj.subtitle || ''}
                              onChange={(e) => handleSlideTextChange(idx, 'subtitle', e.target.value)}
                              placeholder="Delhi's Premium Used Cars"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">Title (White part)</label>
                              <input
                                type="text"
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                                value={slideObj.title_white || ''}
                                onChange={(e) => handleSlideTextChange(idx, 'title_white', e.target.value)}
                                placeholder="Trusted Cars."
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">Title (Gold part)</label>
                              <input
                                type="text"
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                                value={slideObj.title_gold || ''}
                                onChange={(e) => handleSlideTextChange(idx, 'title_gold', e.target.value)}
                                placeholder="Trusted Deals."
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">Description</label>
                            <textarea
                              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none font-light leading-snug"
                              rows={2}
                              value={slideObj.description || ''}
                              onChange={(e) => handleSlideTextChange(idx, 'description', e.target.value)}
                              placeholder="We buy and sell certified pre-owned cars..."
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upload Area */}
            <div>
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Upload Slides (Image or Video)</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-800 hover:border-neutral-700 rounded-2xl p-8 text-center cursor-pointer hover:bg-neutral-900/30 transition-colors"
              >
                <Upload size={28} className="text-neutral-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-neutral-200">Drag & Drop or Click to Select</p>
                <p className="text-xs text-neutral-500 mt-1">Supports JPG, PNG, WEBP and MP4 videos — up to 50MB</p>
                <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileSelect} />
              </div>
            </div>

            {/* Previews of new slides */}
            {newSlidePreviews.length > 0 && (
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">New Upload Previews</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {newSlidePreviews.map((src, idx) => {
                    const file = newSlideFiles[idx];
                    const isVideo = file?.type.startsWith('video/');
                    return (
                      <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 group">
                        {isVideo ? (
                          <video src={src} className="w-full h-full object-cover" muted />
                        ) : (
                          <img src={src} alt="New Slide" className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => removeNewSlide(idx)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Business Profile Details */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-display font-bold text-lg text-amber-500 border-b border-neutral-800 pb-3">Company Details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">Brand Name</label>
                <input type="text" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500" value={form.brand_name} onChange={(e) => handleFieldChange('brand_name', e.target.value)} />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">Brand Tagline</label>
                <input type="text" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500" value={form.brand_tagline} onChange={(e) => handleFieldChange('brand_tagline', e.target.value)} />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">Phone Number</label>
                <input type="text" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500" value={form.business_phone} onChange={(e) => handleFieldChange('business_phone', e.target.value)} />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">WhatsApp Number</label>
                <input type="text" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500" value={form.business_whatsapp} onChange={(e) => handleFieldChange('business_whatsapp', e.target.value)} />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">Business Email</label>
                <input type="email" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500" value={form.business_email} onChange={(e) => handleFieldChange('business_email', e.target.value)} />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">Business Hours</label>
                <input type="text" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500" value={form.business_hours} onChange={(e) => handleFieldChange('business_hours', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Success / Error Messages */}
          {success && (
            <div className="bg-green-950/40 border border-green-800 rounded-xl p-4 text-sm text-green-400 flex items-center gap-2">
              <CheckCircle size={16} />
              Settings saved successfully!
            </div>
          )}

          {error && (
            <div className="bg-red-950/40 border border-red-800 rounded-xl p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="btn-primary py-3.5 px-8 text-xs font-bold tracking-widest uppercase justify-center min-w-[200px] cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                SAVING SETTINGS...
              </>
            ) : (
              <>
                <Save size={14} />
                SAVE ALL SETTINGS
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
