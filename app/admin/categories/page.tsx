'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, X, Save, ArrowLeft, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';

interface CategoryItem {
  id_local?: string;
  name: string;
  body_type: string;
  image_url: string;
  pendingFile?: File;
}

const BODY_TYPES = ['Sedan', 'Hatchback', 'SUV', 'MUV', 'Coupe', 'Convertible', 'Van', 'Pickup', 'Wagon', 'Luxury'];

export default function AdminCategoriesPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const [replaceIdx, setReplaceIdx] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [categories, setCategories] = useState<CategoryItem[]>([]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings', { cache: 'no-store' });
      const json = await res.json();
      if (json.success) {
        let found = false;
        json.settings.forEach((s: any) => {
          if (s.key === 'homepage_categories') {
            try {
              const parsed = JSON.parse(s.value);
              if (Array.isArray(parsed)) {
                const mapped = parsed.map((item: any, idx: number) => ({
                  id_local: `saved-${idx}-${Date.now()}`,
                  name: item.name || '',
                  body_type: item.body_type || 'SUV',
                  image_url: item.image_url || '',
                }));
                setCategories(mapped);
                found = true;
              }
            } catch {
              // ignore
            }
          }
        });
        if (!found) {
          setCategories([]);
        }
      }
    } catch (e: any) {
      setError('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleFieldChange = (idx: number, field: keyof CategoryItem, value: string) => {
    setCategories((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleReplaceMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replaceIdx === null) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit!');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setCategories((prev) => {
      const copy = [...prev];
      copy[replaceIdx] = {
        ...copy[replaceIdx],
        image_url: localUrl,
        pendingFile: file,
      };
      return copy;
    });
    setReplaceIdx(null);
  };

  const handleNewCategorySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      (f) => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024
    );

    const newCategories = validFiles.map((file, idx) => {
      const localUrl = URL.createObjectURL(file);
      return {
        id_local: `new-${idx}-${Date.now()}`,
        name: 'New Category',
        body_type: 'SUV',
        image_url: localUrl,
        pendingFile: file,
      };
    });

    setCategories((prev) => [...prev, ...newCategories]);
  };

  const addEmptyCategory = () => {
    setCategories((prev) => [
      ...prev,
      {
        id_local: `new-${Date.now()}`,
        name: 'New Category',
        body_type: 'SUV',
        image_url: '',
      }
    ]);
  };

  const removeCategory = (idx: number) => {
    if (confirm('Are you sure you want to remove this category?')) {
      setCategories((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const moveCategory = (idx: number, direction: 'left' | 'right') => {
    const nextIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= categories.length) return;
    
    setCategories((prev) => {
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
      const filesToSend: File[] = [];

      let pendingUploadCount = 0;
      const processedCategoriesList = categories.map((cat) => {
        if (cat.pendingFile) {
          const placeholder = `PENDING_UPLOAD_${pendingUploadCount++}`;
          filesToSend.push(cat.pendingFile);
          return {
            name: cat.name,
            body_type: cat.body_type,
            image_url: placeholder,
          };
        }
        return {
          name: cat.name,
          body_type: cat.body_type,
          image_url: cat.image_url,
        };
      });

      formData.append('homepage_categories', JSON.stringify(processedCategoriesList));
      
      filesToSend.forEach((file) => {
        formData.append('category_files', file);
      });

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        setSuccess(true);
        await fetchSettings();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(json.error || 'Failed to save categories');
      }
    } catch (err) {
      console.error(err);
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
              <h1 className="font-display font-bold text-2xl">Homepage Categories</h1>
              <p className="text-neutral-500 text-xs mt-0.5">Manage the circular category links shown on the homepage.</p>
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
            Categories updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="font-display font-bold text-lg text-amber-500">Active Categories</h2>
              <button
                type="button"
                onClick={addEmptyCategory}
                className="flex items-center gap-1.5 text-xs font-bold bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Plus size={14} /> Add Manual
              </button>
            </div>
            
            {categories.length === 0 && (
              <p className="text-xs text-neutral-500 italic">No categories configured. Upload photos below or add manually.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((cat, idx) => {
                return (
                  <div key={cat.id_local || idx} className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-4 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">#{idx + 1}</span>
                      <div className="flex items-center gap-1">
                        {idx > 0 && (
                          <button type="button" onClick={() => moveCategory(idx, 'left')} className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-white transition-all cursor-pointer border border-neutral-800"><ChevronLeft size={12} /></button>
                        )}
                        {idx < categories.length - 1 && (
                          <button type="button" onClick={() => moveCategory(idx, 'right')} className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-white transition-all cursor-pointer border border-neutral-800"><ChevronRight size={12} /></button>
                        )}
                        <button type="button" onClick={() => removeCategory(idx)} className="p-1 rounded bg-red-950 text-red-400 hover:bg-red-900 transition-all cursor-pointer border border-red-900/40"><X size={12} /></button>
                      </div>
                    </div>

                    <div className="relative aspect-square rounded-full overflow-hidden bg-neutral-900 border-2 border-neutral-800 group/media mx-auto w-32">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-600">No Image</div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <button
                          type="button"
                          onClick={() => {
                            setReplaceIdx(idx);
                            replaceFileInputRef.current?.click();
                          }}
                          className="bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-neutral-800 cursor-pointer pointer-events-auto flex items-center gap-1"
                        >
                          <Upload size={10} /> Edit
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-neutral-900">
                      <div>
                        <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">Display Name</label>
                        <input
                          type="text"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          value={cat.name}
                          onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                          placeholder="e.g. Luxury SUVs"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">Links to Body Type</label>
                        <select
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          value={cat.body_type}
                          onChange={(e) => handleFieldChange(idx, 'body_type', e.target.value)}
                        >
                          {BODY_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upload Area */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-bold text-lg text-amber-500 border-b border-neutral-800 pb-3">Quick Add Multiple Images</h3>
            <div>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-800 hover:border-neutral-700 rounded-2xl p-8 text-center cursor-pointer hover:bg-neutral-900/30 transition-colors"
              >
                <Upload size={28} className="text-neutral-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-neutral-200">Upload Multiple Category Photos</p>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleNewCategorySelect} />
                <input ref={replaceFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleReplaceMediaSelect} />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
