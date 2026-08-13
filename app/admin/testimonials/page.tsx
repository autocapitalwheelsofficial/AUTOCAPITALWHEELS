'use client';

import { useState, useEffect } from 'react';
import { Star, User, MessageSquare, Edit2, Trash2, Plus, Check, X, ShieldAlert, Loader2 } from 'lucide-react';

export default function AdminTestimonialsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [currentTestimonial, setCurrentTestimonial] = useState({
    id: '',
    customer_name: '',
    customer_location: '',
    review: '',
    rating: 5,
    vehicle_purchased: '',
    is_active: true,
  });

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/testimonials');
      // Wait, there is no direct admin GET endpoint!
      // But we can query all testimonials using supabase client or the public API.
      // Wait, public API only returns approved ones. So we can build a simple fetch using supabase inside the API,
      // or we can update our GET in /api/admin/testimonials/route.ts to fetch ALL testimonials!
      // Yes! Let's check if our /api/admin/testimonials/route.ts has GET. No, we only wrote POST, PUT, DELETE.
      // Let's add GET to /api/admin/testimonials/route.ts so that it returns ALL testimonials for the admin!
      // This is a crucial missing part! Let's make sure it's there.
      const adminRes = await fetch('/api/admin/testimonials/list'); // Let's check if we can make a list endpoint or just add GET to /api/admin/testimonials.
      // Let's call GET /api/admin/testimonials (which we will add!).
      const res2 = await fetch('/api/admin/testimonials');
      const json = await res2.json();
      if (json.success) {
        setTestimonials(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleToggleStatus = async (item: any) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          is_active: !item.is_active,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setTestimonials((prev) =>
          prev.map((t) => (t.id === item.id ? { ...t, is_active: !t.is_active } : t))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial permanently?')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/testimonials?id=${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setTestimonials((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEdit = (item: any) => {
    setModalType('edit');
    setCurrentTestimonial({
      id: item.id,
      customer_name: item.customer_name || '',
      customer_location: item.customer_location || '',
      review: item.review || '',
      rating: item.rating || 5,
      vehicle_purchased: item.vehicle_purchased || '',
      is_active: item.is_active,
    });
    setShowModal(true);
  };

  const handleOpenAdd = () => {
    setModalType('add');
    setCurrentTestimonial({
      id: '',
      customer_name: '',
      customer_location: '',
      review: '',
      rating: 5,
      vehicle_purchased: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = modalType === 'add' ? 'POST' : 'PUT';
      const res = await fetch('/api/admin/testimonials', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentTestimonial),
      });
      const json = await res.json();
      if (json.success) {
        setShowModal(false);
        fetchTestimonials();
      } else {
        alert(json.error || 'Failed to save testimonial');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const filteredTestimonials = testimonials.filter((t) => {
    if (filter === 'approved') return t.is_active === true;
    if (filter === 'pending') return t.is_active === false;
    return true;
  });

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-neutral-900">Client Reviews Moderation</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Manage customer testimonials, edit feedback, and approve/reject entries.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-[#b48d36] hover:bg-[#9a845a] text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} />
          Add Review
        </button>
      </div>

      {/* Tabs / Filters */}
      <div className="flex items-center gap-2 mb-6 border-b border-neutral-200 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-neutral-900 text-white shadow'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          All Reviews ({testimonials.length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            filter === 'approved'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-neutral-500 hover:text-emerald-600'
          }`}
        >
          Approved & Active ({testimonials.filter((t) => t.is_active).length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            filter === 'pending'
              ? 'bg-amber-600 text-white shadow'
              : 'text-neutral-500 hover:text-amber-600'
          }`}
        >
          Pending Approval ({testimonials.filter((t) => !t.is_active).length})
        </button>
      </div>

      {/* Testimonials Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2 text-neutral-500">
            <Loader2 className="animate-spin text-amber-500" size={24} />
            <span className="text-xs font-semibold">Loading reviews...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">Rating</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Review / Comment</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">Status</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filteredTestimonials.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-neutral-400 font-light italic">
                      No reviews found matching this filter.
                    </td>
                  </tr>
                ) : (
                  filteredTestimonials.map((t) => (
                    <tr key={t.id} className="hover:bg-neutral-50/30 transition-colors">
                      {/* Customer Profile info */}
                      <td className="p-4">
                        <div className="font-bold text-neutral-800 flex items-center gap-1.5">
                          <User size={12} className="text-neutral-400" />
                          {t.customer_name}
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-1">
                          {t.customer_location || 'No Location'}
                        </div>
                        {t.vehicle_purchased && (
                          <div className="text-[9px] font-bold text-[#b48d36] uppercase tracking-wider mt-1 bg-amber-50 border border-amber-200/50 px-1.5 py-0.5 rounded inline-block">
                            Car: {t.vehicle_purchased}
                          </div>
                        )}
                      </td>

                      {/* Star Rating */}
                      <td className="p-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              fill={i < t.rating ? 'currentColor' : 'none'}
                              className={i < t.rating ? 'text-amber-500' : 'text-neutral-200'}
                            />
                          ))}
                        </div>
                      </td>

                      {/* Review Text */}
                      <td className="p-4 max-w-sm break-words text-neutral-600 font-light leading-relaxed">
                        &ldquo;{t.review}&rdquo;
                      </td>

                      {/* Status Toggle & Badge */}
                      <td className="p-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(t)}
                          disabled={saving}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                            t.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {t.is_active ? <Check size={10} /> : <X size={10} />}
                          {t.is_active ? 'Approved' : 'Pending'}
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="p-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 rounded bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:scale-105 transition-all cursor-pointer"
                            title="Edit Review"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="p-1.5 rounded bg-red-50 text-red-600 hover:text-red-700 border border-red-100 hover:scale-105 transition-all cursor-pointer"
                            title="Delete Permanently"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 animate-fade-in-scale">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <h2 className="font-display font-bold text-neutral-800 text-sm uppercase tracking-wider">
                {modalType === 'add' ? 'Add Testimonial' : 'Edit Testimonial'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitModal} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-amber-500 text-neutral-800"
                    value={currentTestimonial.customer_name}
                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, customer_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Customer Location</label>
                  <input
                    type="text"
                    placeholder="e.g. New Delhi"
                    className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-amber-500 text-neutral-800"
                    value={currentTestimonial.customer_location}
                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, customer_location: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Purchased Vehicle (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Maruti Suzuki Swift"
                    className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-amber-500 text-neutral-800"
                    value={currentTestimonial.vehicle_purchased}
                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, vehicle_purchased: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Star Rating (1 - 5) *</label>
                  <select
                    className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-amber-500 text-neutral-800 cursor-pointer"
                    value={currentTestimonial.rating}
                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, rating: parseInt(e.target.value) })}
                  >
                    <option value={5}>5 Stars (Excellent)</option>
                    <option value={4}>4 Stars (Good)</option>
                    <option value={3}>3 Stars (Average)</option>
                    <option value={2}>2 Stars (Fair)</option>
                    <option value={1}>1 Star (Poor)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Review Message *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write the customer's feedback statement..."
                  className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-amber-500 text-neutral-800 resize-none leading-relaxed font-light"
                  value={currentTestimonial.review}
                  onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, review: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="modal_is_active"
                  className="w-4 h-4 text-amber-600 bg-neutral-100 border-neutral-300 rounded focus:ring-amber-500 cursor-pointer"
                  checked={currentTestimonial.is_active}
                  onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, is_active: e.target.checked })}
                />
                <label htmlFor="modal_is_active" className="text-xs text-neutral-600 font-semibold cursor-pointer">
                  Approve and publish live on website instantly
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#b48d36] hover:bg-[#9a845a] text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer mt-2"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save Testimonial'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
