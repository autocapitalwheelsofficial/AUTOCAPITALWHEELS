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
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="p-2 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-500 hover:text-neutral-900 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-display font-bold text-2xl text-neutral-900">Frequently Asked Questions (FAQs)</h1>
            <p className="text-neutral-500 text-sm mt-0.5">{faqs.length} FAQ{faqs.length !== 1 ? 's' : ''} configured on site</p>
          </div>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-[#b48d36] hover:bg-[#9a845a] text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} />
          Add FAQ
        </button>
      </div>

      {/* Table grid */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2 text-neutral-500">
            <Loader2 className="animate-spin text-amber-500" size={24} />
            <span className="text-xs font-semibold">Loading FAQs...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Order</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Category</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Question</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Answer</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs text-neutral-600">
                {faqs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-neutral-400 font-light italic">
                      No FAQs created yet. Click "Add FAQ" to create one.
                    </td>
                  </tr>
                ) : (
                  faqs.map((faq) => (
                    <tr key={faq.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="p-4 whitespace-nowrap font-mono text-neutral-400 font-bold">
                        #{faq.sort_order || 0}
                      </td>
                      <td className="p-4 whitespace-nowrap font-bold text-neutral-700">
                        {faq.category || 'General'}
                      </td>
                      <td className="p-4 font-bold text-neutral-800">
                        <div className="flex items-center gap-1.5">
                          <HelpCircle size={12} className="text-neutral-400 flex-shrink-0" />
                          {faq.question}
                        </div>
                      </td>
                      <td className="p-4 max-w-sm break-words font-light leading-relaxed">
                        {faq.answer}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(faq)}
                            className="p-1.5 rounded bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:scale-105 transition-all cursor-pointer"
                            title="Edit FAQ"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(faq.id)}
                            className="p-1.5 rounded bg-red-50 text-red-600 hover:text-red-700 border border-red-100 hover:scale-105 transition-all cursor-pointer"
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
        )}
      </div>

      {/* Add / Edit FAQ Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 animate-fade-in-scale">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <h2 className="font-display font-bold text-neutral-800 text-sm uppercase tracking-wider">
                {modalType === 'add' ? 'Add FAQ' : 'Edit FAQ'}
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
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Buying / Finance"
                    className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-amber-500 text-neutral-800"
                    value={currentFaq.category}
                    onChange={(e) => setCurrentFaq({ ...currentFaq, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Sort Order *</label>
                  <input
                    type="number"
                    required
                    className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-amber-500 text-neutral-800"
                    value={currentFaq.sort_order}
                    onChange={(e) => setCurrentFaq({ ...currentFaq, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Question Text *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. What documents are needed to sell my car?"
                  className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-amber-500 text-neutral-800"
                  value={currentFaq.question}
                  onChange={(e) => setCurrentFaq({ ...currentFaq, question: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Answer Text *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Provide the detailed explanation response..."
                  className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-amber-500 text-neutral-800 resize-none leading-relaxed font-light"
                  value={currentFaq.answer}
                  onChange={(e) => setCurrentFaq({ ...currentFaq, answer: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#b48d36] hover:bg-[#9a845a] text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer mt-2"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save FAQ'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
