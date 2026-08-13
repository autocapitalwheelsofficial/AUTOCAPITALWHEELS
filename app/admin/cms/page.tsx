'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, X, Save, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminCMSPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Slides state
  const [existingSlides, setExistingSlides] = useState<any[]>([]);
  const [newSlideFiles, setNewSlideFiles] = useState<File[]>([]);
  const [newSlidePreviews, setNewSlidePreviews] = useState<string[]>([]);

  const DEFAULT_SLIDES = [
    {
      url: '/hero_full_background.png',
      subtitle: "Delhi's Premium Used Cars",
      title_white: "Trusted Cars. ",
      title_gold: "Trusted Deals.",
      description: "We buy and sell certified, premium pre-owned cars. Get transparent pricing, 100+ checkpoint verified vehicles, and expert support."
    },
    {
      url: '/hero_full_background_2.png',
      subtitle: "Handpicked Premium Fleet",
      title_white: "Elite Quality. ",
      title_gold: "Assured Warranty.",
      description: "Every vehicle in our collection undergoes rigorous certification checks so you can drive home with absolute peace of mind."
    },
    {
      url: '/hero_full_background_3.png',
      subtitle: "Seamless Automobile Trades",
      title_white: "Sell Instantly. ",
      title_gold: "Best Market Price.",
      description: "Get the best market valuation for your pre-owned car with free doorstep inspections and instant paperless transactions."
    }
  ];

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const json = await res.json();
      if (json.success) {
        let found = false;
        json.settings.forEach((s: any) => {
          if (s.key === 'hero_slides') {
            try {
              const parsed = JSON.parse(s.value);
              if (Array.isArray(parsed) && parsed.length > 0) {
                const mapped = parsed.map((item: any) => {
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
                found = true;
              }
            } catch {
              // ignore
            }
          }
        });
        if (!found) {
          setExistingSlides(DEFAULT_SLIDES);
        }
      }
    } catch (e: any) {
      setError('Failed to load website slides settings');
      setExistingSlides(DEFAULT_SLIDES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSlideTextChange = (idx: number, field: string, value: string) => {
    setExistingSlides((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleReplaceMediaSelect = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      alert('File size exceeds 50MB limit!');
      return;
    }

    setSaving(true);
    try {
      // Upload directly to Supabase storage via dynamic endpoint or settings API
      const formData = new FormData();
      formData.append('hero_slides_files', file);
      // We send empty slides array to prevent double adding, just upload
      formData.append('existing_hero_slides', '[]');

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        // Fetch settings again to get the uploaded URL
        const updatedRes = await fetch('/api/admin/settings');
        const updatedJson = await updatedRes.json();
        if (updatedJson.success) {
          updatedJson.settings.forEach((s: any) => {
            if (s.key === 'hero_slides') {
              const parsed = JSON.parse(s.value);
              const latestUrlObj = parsed[parsed.length - 1];
              const latestUrl = typeof latestUrlObj === 'string' ? latestUrlObj : latestUrlObj.url;
              
              // Replace URL in our local state
              setExistingSlides((prev) => {
                const copy = [...prev];
                copy[idx] = { ...copy[idx], url: latestUrl };
                return copy;
              });
            }
          });
        }
      } else {
        alert('Upload failed: ' + (json.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setSaving(false);
    }
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
        await fetchSettings();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(json.error || 'Failed to save slideshow settings');
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
              <h1 className="font-display font-bold text-2xl">Website CMS</h1>
              <p className="text-neutral-500 text-xs mt-0.5">Manage homepage hero slides, title headings, descriptions, and backgrounds.</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#b48d36] hover:bg-[#9a845a] text-black font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow cursor-pointer"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Changes
          </button>
        </div>

        {error && (
          <div className="bg-red-950 border border-red-900 rounded-xl p-4 text-xs text-red-400 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-950 border border-green-900 rounded-xl p-4 text-xs text-green-400 text-center">
            CMS slides settings updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Active Slides */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-display font-bold text-lg text-amber-500 border-b border-neutral-800 pb-3">Homepage Slides</h2>
            
            {existingSlides.length === 0 && (
              <p className="text-xs text-neutral-500 italic">No slides configured. Upload photos or videos below to create slides.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {existingSlides.map((slideObj, idx) => {
                const url = slideObj.url;
                const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('/hero/hero_slide_') && !url.includes('.png') && !url.includes('.jpg');
                return (
                  <div key={idx} className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-4 relative group">
                    
                    {/* Header Controls */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Slide #{idx + 1}</span>
                      <div className="flex items-center gap-1.5">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => moveSlide(idx, 'left')}
                            className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-white transition-all cursor-pointer border border-neutral-800"
                            title="Move Left"
                          >
                            <ChevronLeft size={12} />
                          </button>
                        )}
                        {idx < existingSlides.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveSlide(idx, 'right')}
                            className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-white transition-all cursor-pointer border border-neutral-800"
                            title="Move Right"
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

                    {/* Media Preview & Replace Button */}
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-900 border border-neutral-900 group/media">
                      {isVideo ? (
                        <video src={url} className="w-full h-full object-cover" muted loop playsInline />
                      ) : (
                        <img src={url} alt="Preview" className="w-full h-full object-cover" />
                      )}
                      
                      {/* Replace Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <label className="bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-neutral-800 cursor-pointer pointer-events-auto flex items-center gap-1">
                          <Upload size={10} />
                          Replace Media
                          <input
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={(e) => handleReplaceMediaSelect(idx, e)}
                          />
                        </label>
                      </div>
                      
                      <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[8px] text-neutral-300 font-bold uppercase tracking-widest">
                        {isVideo ? 'Video' : 'Image'}
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
                          <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">Title (White)</label>
                          <input
                            type="text"
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                            value={slideObj.title_white || ''}
                            onChange={(e) => handleSlideTextChange(idx, 'title_white', e.target.value)}
                            placeholder="Trusted Cars."
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">Title (Gold)</label>
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

          {/* Upload Area */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-bold text-lg text-amber-500 border-b border-neutral-800 pb-3">Upload New Slides</h3>
            <div>
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
        </form>
      </div>
    </div>
  );
}
