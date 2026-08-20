'use client';

import { useState, useEffect } from 'react';
import { HelpCircle, Plus, Edit2, Trash2, X, Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminFAQsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [faqs, setFaqs] = useState<any[]>([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [currentFaq, setCurrentFaq] = useState({
    id: '',
    question: '',
    answer: '',
    category: 'General',
    sort_order: 0,
  });

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/faqs');
      const json = await res.json();
      if (json.success) {
        setFaqs(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const handleOpenAdd = () => {
    setModalType('add');
    setCurrentFaq({
      id: '',
      question: '',
      answer: '',
      category: 'General',
      sort_order: faqs.length + 1,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (faq: any) => {
    setModalType('edit');
    setCurrentFaq({
      id: faq.id,
      question: faq.question || '',
      answer: faq.answer || '',
      category: faq.category || 'General',
      sort_order: faq.sort_order || 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ permanently?')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/faqs?id=${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setFaqs((prev) => prev.filter((faq) => faq.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = modalType === 'add' ? 'POST' : 'PUT';
      const res = await fetch('/api/admin/faqs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentFaq),
      });
      const json = await res.json();
      if (json.success) {
        setShowModal(false);
        fetchFAQs();
      } else {
        alert(json.error || 'Failed to save FAQ');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 bg-[#0a0a0c] text-white min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-display font-black text-2xl text-white uppercase tracking-wider">Frequently Asked Questions</h1>
            <p className="text-neutral-500 text-xs uppercase tracking-widest mt-1">{faqs.length} FAQ{faqs.length !== 1 ? 's' : ''} configured on site</p>
          </div>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-[#b48d36] hover:bg-[#a37e2c] text-black font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} />
          Add FAQ
        </button>
      </div>

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
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Order</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Category</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Question</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Answer</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-xs text-neutral-300">
                  {faqs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-neutral-500 font-light italic">
                        No FAQs created yet. Click "Add FAQ" to create one.
                      </td>
                    </tr>
                  ) : (
                    faqs.map((faq) => (
                      <tr key={faq.id} className="hover:bg-neutral-800/10 transition-colors align-top">
                        <td className="p-4 whitespace-nowrap font-mono text-[#b48d36] font-bold">
                          #{faq.sort_order || 0}
                        </td>
                        <td className="p-4 whitespace-nowrap font-bold text-neutral-200">
                          {faq.category || 'General'}
                        </td>
                        <td className="p-4 font-bold text-white max-w-xs">
                          <div className="flex items-start gap-1.5 leading-relaxed">
                            <HelpCircle size={14} className="text-[#b48d36] flex-shrink-0 mt-0.5" />
                            {faq.question}
                          </div>
                        </td>
                        <td className="p-4 max-w-sm break-words font-light leading-relaxed text-neutral-400">
                          {faq.answer}
                        </td>
                        <td className="p-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(faq)}
                              className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
                              title="Edit FAQ"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(faq.id)}
                              className="p-2 rounded-lg bg-red-950/20 border border-red-900/30 text-red-400 hover:text-white hover:bg-red-900 transition-all cursor-pointer"
                              title="Delete FAQ"
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
            {faqs.length === 0 ? (
              <div className="bg-[#121215] border border-neutral-800 rounded-2xl p-8 text-center text-neutral-500 italic">
                No FAQs created yet.
              </div>
            ) : (
              faqs.map((faq) => (
                <div key={faq.id} className="bg-[#121215] border border-neutral-800 rounded-2xl p-5 space-y-3.5 shadow-xl">
                  {/* Card Header: Order and Category */}
                  <div className="flex items-center justify-between border-b border-neutral-850 pb-2.5">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest bg-neutral-900 px-2 py-0.5 rounded-md">Order #{faq.sort_order || 0}</span>
                    <span className="text-xs font-bold text-[#b48d36] uppercase tracking-wider">{faq.category || 'General'}</span>
                  </div>

                  {/* Question */}
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-neutral-550 uppercase tracking-widest">Question</p>
                    <p className="text-xs font-bold text-white leading-relaxed flex items-start gap-1.5">
                      <HelpCircle size={14} className="text-[#b48d36] shrink-0 mt-0.5" />
                      {faq.question}
                    </p>
                  </div>

                  {/* Answer */}
                  <div className="space-y-1 bg-neutral-900/40 p-3 rounded-xl border border-neutral-850">
                    <p className="text-[9px] font-bold text-neutral-550 uppercase tracking-widest">Answer</p>
                    <p className="text-xs font-light text-neutral-400 leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-neutral-855">
                    <button
                      onClick={() => handleOpenEdit(faq)}
                      className="flex-1 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Edit2 size={12} className="text-neutral-400" />
                      Edit FAQ
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
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

      {/* Add / Edit FAQ Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#121215] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-scale">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#16161a]">
              <h2 className="font-display font-bold text-white text-base uppercase tracking-wider">
                {modalType === 'add' ? 'Add FAQ' : 'Edit FAQ'}
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
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Buying / Finance"
                    className="w-full text-xs px-3.5 py-2.5 bg-[#16161a] border border-neutral-800 rounded-xl focus:outline-none focus:border-amber-500 text-white font-semibold"
                    value={currentFaq.category}
                    onChange={(e) => setCurrentFaq({ ...currentFaq, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Sort Order *</label>
                  <input
                    type="number"
                    required
                    className="w-full text-xs px-3.5 py-2.5 bg-[#16161a] border border-neutral-800 rounded-xl focus:outline-none focus:border-amber-500 text-white font-semibold"
                    value={currentFaq.sort_order}
                    onChange={(e) => setCurrentFaq({ ...currentFaq, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Question Text *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. What documents are needed to sell my car?"
                  className="w-full text-xs px-3.5 py-2.5 bg-[#16161a] border border-neutral-800 rounded-xl focus:outline-none focus:border-amber-500 text-white font-semibold"
                  value={currentFaq.question}
                  onChange={(e) => setCurrentFaq({ ...currentFaq, question: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Answer Text *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Provide the detailed explanation response..."
                  className="w-full text-xs px-3.5 py-2.5 bg-[#16161a] border border-neutral-800 rounded-xl focus:outline-none focus:border-amber-500 text-white resize-none leading-relaxed font-light"
                  value={currentFaq.answer}
                  onChange={(e) => setCurrentFaq({ ...currentFaq, answer: e.target.value })}
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
                  {saving ? <Loader2 size={12} className="animate-spin" /> : 'Save FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
