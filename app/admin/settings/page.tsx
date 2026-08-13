'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, Save, Phone, Mail, Globe, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminSettingsPage() {
  const router = useRouter();
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

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/settings');
        const json = await res.json();
        if (json.success) {
          const loadedForm = { ...form };
          json.settings.forEach((s: any) => {
            if (s.key in loadedForm) {
              loadedForm[s.key as keyof typeof form] = s.value || '';
            }
          });
          setForm(loadedForm);
        }
      } catch (e: any) {
        setError('Failed to load company settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleFieldChange = (key: string, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        formData.append(k, v);
      });

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        setSuccess(true);
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
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="font-display font-bold text-2xl">Company Settings</h1>
              <p className="text-neutral-500 text-xs mt-0.5">Manage brand metadata, phone numbers, and address details.</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#b48d36] hover:bg-[#9a845a] text-black font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow cursor-pointer"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Settings
          </button>
        </div>

        {error && (
          <div className="bg-red-950 border border-red-900 rounded-xl p-4 text-xs text-red-400 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-950 border border-green-900 rounded-xl p-4 text-xs text-green-400 text-center">
            Company profile settings updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
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
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">WhatsApp Link Number</label>
                <input type="text" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500" value={form.business_whatsapp} onChange={(e) => handleFieldChange('business_whatsapp', e.target.value)} />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">Business Email Address</label>
                <input type="email" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500" value={form.business_email} onChange={(e) => handleFieldChange('business_email', e.target.value)} />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">Operational Business Hours</label>
                <input type="text" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500" value={form.business_hours} onChange={(e) => handleFieldChange('business_hours', e.target.value)} placeholder="e.g. 10:00 AM - 07:00 PM" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">Office/Showroom Address</label>
              <textarea rows={3} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-amber-500 resize-none font-light" value={form.business_address} onChange={(e) => handleFieldChange('business_address', e.target.value)} />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
