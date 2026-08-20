'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, X, Star, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CAR_MAKES, FUEL_TYPES, TRANSMISSION_TYPES, BODY_TYPES,
  VEHICLE_CATEGORIES, LOCATIONS, INSURANCE_STATUSES, OWNERSHIP_OPTIONS
} from '@/lib/constants';

interface VehicleFormProps {
  vehicle?: any;
}

const VEHICLE_STATUSES = ['Active', 'Draft', 'Reserved', 'Sold', 'Archived'];
const AVAILABILITY_STATUSES = ['Available', 'Reserved', 'Sold', 'Coming Soon'];

export default function VehicleForm({ vehicle }: VehicleFormProps) {
  const router = useRouter();
  const isEdit = !!vehicle;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Image state
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>(vehicle?.vehicle_images || []);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Form data
  const [form, setForm] = useState({
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    variant: vehicle?.variant || '',
    year: vehicle?.year || new Date().getFullYear(),
    registration_year: vehicle?.registration_year || '',
    registration_state: vehicle?.registration_state || '',
    price: vehicle?.price || '',
    original_price: vehicle?.original_price || '',
    mileage: vehicle?.mileage || '',
    fuel_type: vehicle?.fuel_type || '',
    transmission: vehicle?.transmission || '',
    body_type: vehicle?.body_type || '',
    colour: vehicle?.colour || '',
    seating_capacity: vehicle?.seating_capacity || '',
    engine_cc: vehicle?.engine_cc || '',
    engine_description: vehicle?.engine_description || '',
    ownership: vehicle?.ownership || '1',
    location: vehicle?.location || 'Gurugram',
    vehicle_category: vehicle?.vehicle_category || 'Private',
    status: vehicle?.status || 'Draft',
    availability: vehicle?.availability || 'Available',
    description: vehicle?.description || '',
    additional_info: vehicle?.additional_info || '',
    service_history: vehicle?.service_history || '',
    accident_history: vehicle?.accident_history || false,
    rc_available: vehicle?.rc_available !== false,
    puc_available: vehicle?.puc_available !== false,
    insurance_status: vehicle?.insurance_status || '',
    warranty_available: vehicle?.warranty_available || false,
    warranty_description: vehicle?.warranty_description || '',
    is_featured: vehicle?.is_featured || false,
    is_new_arrival: vehicle?.is_new_arrival || false,
    is_hot_deal: vehicle?.is_hot_deal || false,
    is_price_drop: vehicle?.is_price_drop || false,
    seo_title: vehicle?.seo_title || '',
    seo_description: vehicle?.seo_description || '',
    sold_price: vehicle?.sold_price || '',
    sold_date: vehicle?.sold_date ? new Date(vehicle.sold_date).toISOString().split('T')[0] : '',
    buyer_name: vehicle?.buyer_name || '',
    buyer_phone: vehicle?.buyer_phone || '',
    buyer_email: vehicle?.buyer_email || '',
    sales_notes: vehicle?.sales_notes || '',
  });

  const [dbCategories, setDbCategories] = useState<any[]>([]);

  useState(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const json = await res.json();
        if (json.success) {
          const setting = json.settings.find((s: any) => s.key === 'homepage_categories');
          if (setting?.value) {
            const parsed = JSON.parse(setting.value);
            if (Array.isArray(parsed)) {
              setDbCategories(parsed);
            }
          }
        }
      } catch {}
    };
    fetchCats();
  });

  const setField = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((f) => f.type.startsWith('image/') && f.size <= 15 * 1024 * 1024);
    setNewImages((prev) => [...prev, ...validFiles]);
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setNewImagePreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (idx: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = async (imageId: string) => {
    if (!confirm('Remove this image?')) return;
    try {
      await fetch(`/api/admin/vehicle-images/${imageId}`, { method: 'DELETE' });
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch { /* ignore */ }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let slug = vehicle?.slug;

      // Create or update vehicle
      const vehicleData = {
        ...form,
        year: parseInt(String(form.year)),
        price: parseFloat(String(form.price)),
        original_price: form.original_price ? parseFloat(String(form.original_price)) : null,
        mileage: parseInt(String(form.mileage)) || 0,
        seating_capacity: form.seating_capacity ? parseInt(String(form.seating_capacity)) : null,
        engine_cc: form.engine_cc ? parseInt(String(form.engine_cc)) : null,
        registration_year: form.registration_year ? parseInt(String(form.registration_year)) : null,
        sold_price: form.status === 'Sold' && form.sold_price ? parseFloat(String(form.sold_price)) : null,
        sold_date: form.status === 'Sold' && form.sold_date ? new Date(form.sold_date).toISOString() : null,
        buyer_name: form.status === 'Sold' ? form.buyer_name : null,
        buyer_phone: form.status === 'Sold' ? form.buyer_phone : null,
        buyer_email: form.status === 'Sold' ? form.buyer_email : null,
        sales_notes: form.status === 'Sold' ? form.sales_notes : null,
      };

      if (isEdit) {
        const res = await fetch(`/api/vehicles/${slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vehicleData),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
      } else {
        const res = await fetch('/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vehicleData),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        slug = json.data.slug;
      }

      // Upload new images
      if (newImages.length > 0 && slug) {
        setUploadingImages(true);
        const imageFormData = new FormData();
        imageFormData.append('slug', slug);
        newImages.forEach((img) => imageFormData.append('images', img));
        await fetch('/api/admin/vehicle-images', {
          method: 'POST',
          body: imageFormData,
        });
        setUploadingImages(false);
      }

      setSaved(true);
      setTimeout(() => {
        router.push('/admin/vehicles');
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to save vehicle');
    } finally {
      setSaving(false);
      setUploadingImages(false);
    }
  };



  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <Link href="/admin/vehicles" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4">
        <ArrowLeft size={15} />
        Back to Vehicles
      </Link>

      {/* Core Details */}
      <Section title="Vehicle Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Make" required>
            <select className="form-input" value={form.make} onChange={(e) => setField('make', e.target.value)} required>
              <option value="">Select Make</option>
              {CAR_MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Model" required>
            <input type="text" className="form-input" placeholder="e.g. Swift, Creta" value={form.model} onChange={(e) => setField('model', e.target.value)} required />
          </Field>
          <Field label="Variant">
            <input type="text" className="form-input" placeholder="e.g. VXI, ZX+" value={form.variant} onChange={(e) => setField('variant', e.target.value)} />
          </Field>
          <Field label="Year" required>
            <input type="number" className="form-input" min="1990" max={new Date().getFullYear()} value={form.year} onChange={(e) => setField('year', parseInt(e.target.value))} required />
          </Field>
          <Field label="Registration Year">
            <input type="number" className="form-input" min="1990" max={new Date().getFullYear()} value={form.registration_year} onChange={(e) => setField('registration_year', e.target.value)} />
          </Field>
          <Field label="Registration State">
            <input type="text" className="form-input" placeholder="e.g. DL, HR" value={form.registration_state} onChange={(e) => setField('registration_state', e.target.value)} />
          </Field>
          <Field label="Fuel Type" required>
            <select className="form-input" value={form.fuel_type} onChange={(e) => setField('fuel_type', e.target.value)} required>
              <option value="">Select</option>
              {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Transmission" required>
            <select className="form-input" value={form.transmission} onChange={(e) => setField('transmission', e.target.value)} required>
              <option value="">Select</option>
              {TRANSMISSION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Body Type">
            <select className="form-input" value={form.body_type} onChange={(e) => setField('body_type', e.target.value)}>
              <option value="">Select Category</option>
              {dbCategories.length > 0 ? (
                dbCategories.map((c) => (
                  <option key={c.body_type} value={c.body_type}>{c.name} ({c.body_type})</option>
                ))
              ) : (
                BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)
              )}
            </select>
          </Field>
          <Field label="Colour">
            <input type="text" className="form-input" placeholder="e.g. Pearl White" value={form.colour} onChange={(e) => setField('colour', e.target.value)} />
          </Field>
          <Field label="Engine (cc)">
            <input type="number" className="form-input" placeholder="e.g. 1197" value={form.engine_cc} onChange={(e) => setField('engine_cc', e.target.value)} />
          </Field>
          <Field label="Seating Capacity">
            <input type="number" className="form-input" placeholder="e.g. 5" min="1" max="50" value={form.seating_capacity} onChange={(e) => setField('seating_capacity', e.target.value)} />
          </Field>
          <Field label="Mileage (km)" required>
            <input type="number" className="form-input" placeholder="e.g. 45000" min="0" value={form.mileage} onChange={(e) => setField('mileage', e.target.value)} required />
          </Field>
          <Field label="Ownership">
            <select className="form-input" value={form.ownership} onChange={(e) => setField('ownership', e.target.value)}>
              {OWNERSHIP_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Location">
            <select className="form-input" value={form.location} onChange={(e) => setField('location', e.target.value)}>
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="Vehicle Category">
            <select className="form-input" value={form.vehicle_category} onChange={(e) => setField('vehicle_category', e.target.value)}>
              {VEHICLE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Engine Description">
            <input type="text" className="form-input" placeholder="e.g. 1.2L Dual VVT-i Petrol" value={form.engine_description} onChange={(e) => setField('engine_description', e.target.value)} />
          </Field>
        </div>
      </Section>

      {/* Pricing */}
      <Section title="Pricing & Status">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Selling Price (₹)" required>
            <input type="number" className="form-input" placeholder="e.g. 550000" min="0" value={form.price} onChange={(e) => setField('price', e.target.value)} required />
          </Field>
          <Field label="Original Price (₹)">
            <input type="number" className="form-input" placeholder="Strike-through price" min="0" value={form.original_price} onChange={(e) => setField('original_price', e.target.value)} />
          </Field>
          <Field label="Status" required>
            <select className="form-input" value={form.status} onChange={(e) => setField('status', e.target.value)}>
              {VEHICLE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Availability">
            <select className="form-input" value={form.availability} onChange={(e) => setField('availability', e.target.value)}>
              {AVAILABILITY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        {/* Marketing flags */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: 'is_featured', label: 'Featured' },
            { key: 'is_new_arrival', label: 'New Arrival' },
            { key: 'is_hot_deal', label: 'Hot Deal' },
            { key: 'is_price_drop', label: 'Price Drop' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2.5 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                className="w-4 h-4 accent-gray-900"
                checked={form[key as keyof typeof form] as boolean}
                onChange={(e) => setField(key, e.target.checked)}
              />
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Sales & Transaction Details (Only if status is Sold) */}
      {form.status === 'Sold' && (
        <Section title="Sales & Transaction Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Final Sale Price (₹)" required>
              <input
                type="number"
                className="form-input border-amber-500/50 focus:border-amber-500"
                placeholder="Actual selling price"
                min="0"
                value={form.sold_price}
                onChange={(e) => setField('sold_price', e.target.value)}
                required
              />
            </Field>
            <Field label="Sale Date" required>
              <input
                type="date"
                className="form-input border-amber-500/50 focus:border-amber-500"
                value={form.sold_date}
                onChange={(e) => setField('sold_date', e.target.value)}
                required
              />
            </Field>
            <Field label="Buyer Name">
              <input
                type="text"
                className="form-input"
                placeholder="Full name of customer"
                value={form.buyer_name}
                onChange={(e) => setField('buyer_name', e.target.value)}
              />
            </Field>
            <Field label="Buyer Phone">
              <input
                type="text"
                className="form-input"
                placeholder="10-digit mobile number"
                value={form.buyer_phone}
                onChange={(e) => setField('buyer_phone', e.target.value)}
              />
            </Field>
            <Field label="Buyer Email">
              <input
                type="email"
                className="form-input"
                placeholder="email@example.com"
                value={form.buyer_email}
                onChange={(e) => setField('buyer_email', e.target.value)}
              />
            </Field>
            <Field label="Sales / Deal Notes">
              <input
                type="text"
                className="form-input"
                placeholder="Remarks, discount reasons, exchange deal details..."
                value={form.sales_notes}
                onChange={(e) => setField('sales_notes', e.target.value)}
              />
            </Field>
          </div>
        </Section>
      )}

      {/* Documentation */}
      <Section title="Documentation & Condition">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Insurance Status">
            <select className="form-input" value={form.insurance_status} onChange={(e) => setField('insurance_status', e.target.value)}>
              <option value="">Select</option>
              {INSURANCE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Service History">
            <select className="form-input" value={form.service_history} onChange={(e) => setField('service_history', e.target.value)}>
              <option value="">Select</option>
              <option value="Full Service History">Full Service History</option>
              <option value="Partial Service History">Partial Service History</option>
              <option value="No Service History">No Service History</option>
              <option value="Manufacturer Service History">Manufacturer Service History</option>
            </select>
          </Field>
          <Field label="Warranty Description">
            <input type="text" className="form-input" placeholder="e.g. 3 months engine warranty" value={form.warranty_description} onChange={(e) => setField('warranty_description', e.target.value)} />
          </Field>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: 'rc_available', label: 'RC Available' },
            { key: 'puc_available', label: 'PUC Available' },
            { key: 'warranty_available', label: 'Warranty' },
            { key: 'accident_history', label: 'Accident History' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2.5 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                className="w-4 h-4 accent-gray-900"
                checked={form[key as keyof typeof form] as boolean}
                onChange={(e) => setField(key, e.target.checked)}
              />
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Description */}
      <Section title="Description & Notes">
        <div className="space-y-4">
          <div>
            <label className="form-label">Vehicle Description</label>
            <textarea rows={5} className="form-input resize-y" placeholder="Describe this vehicle's condition, history, and highlights..." value={form.description} onChange={(e) => setField('description', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Additional Information</label>
            <textarea rows={3} className="form-input resize-y" placeholder="Accessories, modifications, reason for selling..." value={form.additional_info} onChange={(e) => setField('additional_info', e.target.value)} />
          </div>
        </div>
      </Section>

      {/* Images */}
      <Section title="Photos">
        {/* Existing images */}
        {existingImages.length > 0 && (
          <div className="mb-4">
            <p className="form-label mb-2">Current Photos</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-2">
              {existingImages.sort((a, b) => a.sort_order - b.sort_order).map((img: any) => (
                <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                  <Image src={img.url} alt="Vehicle" fill className="object-cover" sizes="80px" />
                  {img.is_main && <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5">Main</div>}
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.id)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors shadow z-10 cursor-pointer"
                    aria-label="Remove image"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New image upload */}
        <div
          className="dropzone"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={28} className="text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700 mb-1">Click to upload photos</p>
          <p className="text-xs text-gray-400">JPG, PNG, WEBP — up to 15MB each. First photo becomes main.</p>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
        </div>

        {newImagePreviews.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-2 mt-3">
            {newImagePreviews.map((src, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                <img src={src} alt={`New ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewImage(idx)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove"
                >
                  <X size={10} />
                </button>
                {idx === 0 && existingImages.length === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5">Main</div>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* SEO */}
      <Section title="SEO (optional)">
        <div className="space-y-4">
          <div>
            <label className="form-label">SEO Title <span className="text-gray-400 font-normal">(leave blank for auto-generated)</span></label>
            <input type="text" className="form-input" placeholder="Auto-generated if blank" value={form.seo_title} onChange={(e) => setField('seo_title', e.target.value)} maxLength={65} />
            <p className="text-xs text-gray-400 mt-1">{form.seo_title.length}/65</p>
          </div>
          <div>
            <label className="form-label">SEO Description</label>
            <textarea rows={2} className="form-input resize-none" placeholder="Auto-generated if blank" value={form.seo_description} onChange={(e) => setField('seo_description', e.target.value)} maxLength={160} />
            <p className="text-xs text-gray-400 mt-1">{form.seo_description.length}/160</p>
          </div>
        </div>
      </Section>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-4 pb-8">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary py-3.5 px-8 text-sm justify-center min-w-[180px]"
          id="save-vehicle-btn"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {uploadingImages ? 'Uploading Images...' : 'Saving...'}
            </>
          ) : saved ? (
            <>
              <CheckCircle size={16} />
              Saved!
            </>
          ) : (
            isEdit ? 'Save Changes' : 'Add Vehicle'
          )}
        </button>
        <Link href="/admin/vehicles" className="btn-secondary py-3.5 px-8 text-sm">
          Cancel
        </Link>
        {isEdit && (
          <Link
            href={`/cars/${vehicle.slug}`}
            target="_blank"
            className="text-sm text-blue-600 hover:underline ml-auto"
          >
            View on site →
          </Link>
        )}
      </div>
    </form>
  );
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6">
    <h2 className="font-display font-bold text-lg text-gray-900 mb-5">{title}</h2>
    {children}
  </div>
);

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="form-label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
    {children}
  </div>
);
