'use client';

import { useState, useEffect } from 'react';
import { Star, User, Edit2, Trash2, Plus, Check, X, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
      const json = await res.json();
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
    <div className="p-4 lg:p-8 bg-[#0a0a0c] text-white min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-display font-black text-2xl text-white uppercase tracking-wider">Testimonials</h1>
            <p className="text-neutral-500 text-xs uppercase tracking-widest mt-1">{testimonials.length} review{testimonials.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-[#b48d36] hover:bg-[#a37e2c] text-black font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} />
          Add Review
        </button>
      </div>

      {/* Tabs / Filters */}
      <div className="flex items-center gap-1.5 mb-6 border-b border-neutral-850 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-[#b48d36] text-black shadow'
              : 'text-neutral-400 hover:text-white hover:bg-[#16161a]'
          }`}
        >
          All ({testimonials.length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            filter === 'approved'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-neutral-400 hover:text-emerald-500 hover:bg-[#16161a]'
          }`}
        >
          Approved ({testimonials.filter((t) => t.is_active).length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            filter === 'pending'
              ? 'bg-amber-600 text-white shadow'
              : 'text-neutral-400 hover:text-amber-500 hover:bg-[#16161a]'
          }`}
        >
          Pending ({testimonials.filter((t) => !t.is_active).length})
        </button>
      </div>

      {/* Grid container */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#b48d36]" size={32} />
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-[#121215] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#16161a] border-b border-neutral-800">
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Customer</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest text-center">Rating</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Review / Comment</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest text-center">Status</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-xs text-neutral-300">
                  {filteredTestimonials.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-neutral-500 font-light italic">
                        No reviews found matching this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTestimonials.map((t) => (
                      <tr key={t.id} className="hover:bg-neutral-800/10 transition-colors align-top">
                        <td className="p-4">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <User size={12} className="text-neutral-500" />
                            {t.customer_name}
                          </div>
                          <div className="text-[10px] text-neutral-500 mt-1">
                            {t.customer_location || 'No Location'}
                          </div>
                          {t.vehicle_purchased && (
                            <div className="text-[9px] font-bold text-[#b48d36] uppercase tracking-wider mt-1.5 bg-[#b48d36]/10 border border-[#b48d36]/20 px-1.5 py-0.5 rounded inline-block">
                              Car: {t.vehicle_purchased}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-0.5 text-[#b48d36]">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                fill={i < t.rating ? 'currentColor' : 'none'}
                                className={i < t.rating ? 'text-[#b48d36]' : 'text-neutral-800'}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="p-4 max-w-sm break-words font-light leading-relaxed text-neutral-400 italic">
                          &ldquo;{t.review}&rdquo;
                        </td>
                        <td className="p-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(t)}
                            disabled={saving}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                              t.is_active
                                ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/35 hover:bg-emerald-900/30'
                                : 'bg-amber-950/20 text-amber-400 border-amber-900/35 hover:bg-amber-900/30'
                            }`}
                          >
                            {t.is_active ? <Check size={10} /> : <X size={10} />}
                            {t.is_active ? 'Approved' : 'Pending'}
                          </button>
                        </td>
                        <td className="p-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(t)}
                              className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
                              title="Edit Review"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="p-2 rounded-lg bg-red-950/20 border border-red-900/30 text-red-400 hover:text-white hover:bg-red-900 transition-all cursor-pointer"
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
          </div>

          {/* Mobile Cards View */}
          <div className="block md:hidden space-y-4">
            {filteredTestimonials.length === 0 ? (
              <div className="bg-[#121215] border border-neutral-800 rounded-2xl p-8 text-center text-neutral-500 italic">
                No reviews found.
              </div>
            ) : (
              filteredTestimonials.map((t) => (
                <div key={t.id} className="bg-[#121215] border border-neutral-800 rounded-2xl p-5 space-y-3.5 shadow-xl">
                  
                  {/* Card Header: Rating and Status */}
                  <div className="flex items-center justify-between border-b border-neutral-850 pb-2.5">
                    <div className="flex items-center gap-0.5 text-[#b48d36]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < t.rating ? 'currentColor' : 'none'}
                          className={i < t.rating ? 'text-[#b48d36]' : 'text-neutral-800'}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => handleToggleStatus(t)}
                      disabled={saving}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold border transition-all cursor-pointer ${
                        t.is_active
                          ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/35 hover:bg-emerald-900/30'
                          : 'bg-amber-950/20 text-amber-400 border-amber-900/35 hover:bg-amber-900/30'
                      }`}
                    >
                      {t.is_active ? 'Approved' : 'Pending'}
                    </button>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white flex items-center gap-1.5">
                      <User size={14} className="text-neutral-500" />
                      {t.customer_name}
                    </p>
                    <p className="text-[10px] text-neutral-450">{t.customer_location || 'No Location'}</p>
                    {t.vehicle_purchased && (
                      <span className="inline-block text-[9px] font-bold text-[#b48d36] uppercase tracking-wider mt-1 bg-[#b48d36]/10 border border-[#b48d36]/20 px-2 py-0.5 rounded-md">Car: {t.vehicle_purchased}</span>
                    )}
                  </div>

                  {/* Review Text */}
                  <div className="bg-neutral-900/40 p-3 rounded-xl border border-neutral-850 italic text-xs leading-relaxed text-neutral-400">
                    &ldquo;{t.review}&rdquo;
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-neutral-855">
                    <button
                      onClick={() => handleOpenEdit(t)}
                      className="flex-1 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Edit2 size={12} className="text-neutral-400" />
                      Edit Review
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="bg-red-950/20 border border-red-900/35 hover:bg-red-900 text-red-400 hover:text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Add / Edit Testimonial Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#121215] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-scale">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#16161a]">
              <h2 className="font-display font-bold text-white text-base uppercase tracking-wider">
                {modalType === 'add' ? 'Add Review' : 'Edit Review'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-neutral-450 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitModal} className="p-6 space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full text-xs px-3.5 py-2.5 bg-[#16161a] border border-neutral-800 rounded-xl focus:outline-none focus:border-amber-500 text-white font-semibold"
                  value={currentTestimonial.customer_name}
                  onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, customer_name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Location / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Janakpuri, Delhi"
                    className="w-full text-xs px-3.5 py-2.5 bg-[#16161a] border border-neutral-800 rounded-xl focus:outline-none focus:border-amber-500 text-white font-semibold"
                    value={currentTestimonial.customer_location}
                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, customer_location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Vehicle Purchased</label>
                  <input
                    type="text"
                    placeholder="e.g. Mahindra Scorpio"
                    className="w-full text-xs px-3.5 py-2.5 bg-[#16161a] border border-neutral-800 rounded-xl focus:outline-none focus:border-amber-500 text-white font-semibold"
                    value={currentTestimonial.vehicle_purchased}
                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, vehicle_purchased: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Rating (1 to 5 Stars) *</label>
                  <select
                    className="w-full bg-[#16161a] border border-neutral-800 text-white rounded-xl py-2.5 px-3 text-xs font-semibold cursor-pointer focus:outline-none focus:border-amber-500"
                    value={currentTestimonial.rating}
                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, rating: parseInt(e.target.value) || 5 })}
                  >
                    {[5, 4, 3, 2, 1].map((val) => (
                      <option key={val} value={val}>{val} Stars</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Status *</label>
                  <select
                    className="w-full bg-[#16161a] border border-neutral-800 text-white rounded-xl py-2.5 px-3 text-xs font-semibold cursor-pointer focus:outline-none focus:border-amber-500"
                    value={String(currentTestimonial.is_active)}
                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, is_active: e.target.value === 'true' })}
                  >
                    <option value="true">Approved</option>
                    <option value="false">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Customer Review *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type the customer feedback text..."
                  className="w-full text-xs px-3.5 py-2.5 bg-[#16161a] border border-neutral-800 rounded-xl focus:outline-none focus:border-amber-500 text-white resize-none leading-relaxed font-light"
                  value={currentTestimonial.review}
                  onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, review: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  {saving ? <Loader2 size={12} className="animate-spin" /> : 'Save Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
