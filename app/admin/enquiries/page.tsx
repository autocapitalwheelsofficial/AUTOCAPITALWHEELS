'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Mail, Phone, Calendar, User, MessageSquare, Clock, MapPin, Loader2, X } from 'lucide-react';

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);

  const supabase = createClient();

  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicle_enquiries')
        .select(`
          *,
          vehicles(make, model, variant, year, price)
        `)
        .order('created_at', { ascending: false });

      if (data) setEnquiries(data);
      if (error) console.error(error);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const handleUpdate = async (id: string, updates: { status: string; admin_notes: string }) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('vehicle_enquiries')
        .update({
          status: updates.status,
          admin_notes: updates.admin_notes || null,
        })
        .eq('id', id);

      if (error) {
        alert('Failed to update status: ' + error.message);
      } else {
        // Reload list
        await loadEnquiries();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Format date helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-neutral-900">Quotation Enquiries</h1>
        <p className="text-neutral-500 text-sm mt-0.5">{enquiries.length} total customer request{enquiries.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-amber-500" size={32} />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Vehicle of Interest</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Message</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Preference</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Dealer Notes / Feedback</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {enquiries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-neutral-400 font-light">
                      No quotation enquiries received yet.
                    </td>
                  </tr>
                ) : (
                  enquiries.map((enq) => {
                    const car = enq.vehicles || enq.vehicle_snapshot || {};
                    return (
                      <tr key={enq.id} className="hover:bg-neutral-50/30 transition-colors align-top">
                        
                        {/* Date */}
                        <td className="p-4 text-neutral-600 font-medium whitespace-nowrap">
                          {formatDate(enq.created_at)}
                        </td>

                        {/* Customer */}
                        <td className="p-4">
                          <button
                            onClick={() => setSelectedEnquiry(enq)}
                            className="font-bold text-[#b48d36] hover:underline flex items-center gap-1.5 cursor-pointer text-left"
                          >
                            <User size={12} className="text-neutral-400" />
                            {enq.customer_name}
                          </button>
                          <div className="text-neutral-500 mt-1.5 flex flex-col gap-1">
                            <span className="flex items-center gap-1">
                              <Phone size={10} /> +91 {enq.customer_phone}
                            </span>
                            {enq.customer_email && (
                              <span className="flex items-center gap-1">
                                <Mail size={10} /> {enq.customer_email}
                              </span>
                            )}
                            {enq.customer_city && (
                              <span className="text-[10px] text-neutral-400">
                                City: {enq.customer_city}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Vehicle */}
                        <td className="p-4">
                          {car.make ? (
                            <div>
                              <div className="font-bold text-neutral-800">
                                {car.year} {car.make} {car.model}
                              </div>
                              <div className="text-[10px] text-neutral-400 mt-1">
                                {car.variant} • {car.price ? `₹${(car.price / 100000).toFixed(2)} Lakh` : ''}
                              </div>
                              <div className="text-[9px] text-neutral-500 mt-1 font-mono uppercase">#{enq.enquiry_id}</div>
                            </div>
                          ) : (
                            <span className="text-neutral-400 italic">General Inquiry</span>
                          )}
                        </td>

                        {/* Message */}
                        <td className="p-4 max-w-[200px] break-words text-neutral-600 leading-relaxed font-light">
                          {enq.message || <span className="text-neutral-300 italic">No notes left</span>}
                        </td>

                        {/* Preference */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="font-semibold text-neutral-700">
                            {enq.preferred_contact}
                          </div>
                          {enq.preferred_time && (
                            <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-0.5">
                              <Clock size={10} /> {enq.preferred_time}
                            </div>
                          )}
                        </td>

                        {/* Dealer Notes Input */}
                        <td className="p-4">
                          <textarea
                            defaultValue={enq.admin_notes || ''}
                            placeholder="Add price quote details or comments..."
                            className="w-full form-input text-xs p-2 border border-neutral-200 rounded resize-y max-w-[220px]"
                            id={`notes-input-${enq.id}`}
                            rows={2}
                          />
                        </td>

                        {/* Status Select Actions */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex flex-col gap-2">
                            <select
                              defaultValue={enq.status}
                              className="form-input text-xs py-1.5 px-2.5 max-w-[130px] cursor-pointer font-semibold"
                              id={`status-select-${enq.id}`}
                            >
                              <option value="NEW">Pending Review</option>
                              <option value="CONTACTED">Contacted</option>
                              <option value="FOLLOW_UP">Follow Up</option>
                              <option value="NEGOTIATION">In Negotiation</option>
                              <option value="CONVERTED">Converted / Won</option>
                              <option value="CLOSED">Closed / Rejected</option>
                            </select>
                            
                            <div className="flex items-center gap-1.5">
                              <button
                                disabled={updatingId === enq.id}
                                onClick={() => {
                                  const selectEl = document.getElementById(`status-select-${enq.id}`) as HTMLSelectElement;
                                  const notesEl = document.getElementById(`notes-input-${enq.id}`) as HTMLTextAreaElement;
                                  handleUpdate(enq.id, {
                                    status: selectEl.value,
                                    admin_notes: notesEl.value,
                                  });
                                }}
                                className="inline-flex items-center justify-center gap-1 bg-[#171717] hover:bg-neutral-800 text-white font-bold px-3 py-1.5 rounded text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                              >
                                {updatingId === enq.id ? (
                                  <Loader2 className="animate-spin" size={10} />
                                ) : (
                                  'Save'
                                )}
                              </button>
                              <button
                                onClick={() => setSelectedEnquiry(enq)}
                                className="inline-flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold px-3 py-1.5 rounded text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                              >
                                Details
                              </button>
                            </div>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enquiry Detail Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 animate-fade-in-scale">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50">
              <div>
                <h2 className="font-display font-bold text-lg text-neutral-900">Enquiry Details</h2>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">#{selectedEnquiry.enquiry_id}</p>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer details */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Customer Info</h3>
                  <div className="bg-neutral-50 p-4 rounded-xl space-y-2.5 border border-neutral-100">
                    <p className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
                      <User size={14} className="text-neutral-400" /> {selectedEnquiry.customer_name}
                    </p>
                    <p className="text-xs text-neutral-600 flex items-center gap-2">
                      <Phone size={14} className="text-neutral-400" /> +91 {selectedEnquiry.customer_phone}
                    </p>
                    {selectedEnquiry.customer_email && (
                      <p className="text-xs text-neutral-600 flex items-center gap-2">
                        <Mail size={14} className="text-neutral-400" /> {selectedEnquiry.customer_email}
                      </p>
                    )}
                    {selectedEnquiry.customer_city && (
                      <p className="text-xs text-neutral-600 flex items-center gap-2">
                        <MapPin size={14} className="text-neutral-400" /> City: {selectedEnquiry.customer_city}
                      </p>
                    )}
                  </div>
                </div>

                {/* Vehicle details */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Vehicle of Interest</h3>
                  <div className="bg-neutral-50 p-4 rounded-xl space-y-2.5 border border-neutral-100">
                    {selectedEnquiry.vehicles || selectedEnquiry.vehicle_snapshot ? (
                      (() => {
                        const car = selectedEnquiry.vehicles || selectedEnquiry.vehicle_snapshot;
                        return (
                          <>
                            <p className="text-sm font-semibold text-neutral-800">
                              {car.year} {car.make} {car.model}
                            </p>
                            {car.variant && (
                              <p className="text-xs text-neutral-500">Variant: {car.variant}</p>
                            )}
                            {car.price && (
                              <p className="text-xs font-bold text-[#b48d36]">
                                Price: ₹{(car.price / 100000).toFixed(2)} Lakh
                              </p>
                            )}
                          </>
                        );
                      })()
                    ) : (
                      <p className="text-xs text-neutral-500 italic">General Inquiry (No Specific Vehicle Selected)</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Customer Message</h3>
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-xs text-neutral-700 leading-relaxed min-h-[60px] whitespace-pre-wrap">
                  {selectedEnquiry.message || 'No custom requirements or notes provided.'}
                </div>
              </div>

              {/* Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-xs">
                <div>
                  <span className="font-semibold text-neutral-500">Preferred Contact Method:</span>
                  <p className="font-bold text-neutral-800 mt-0.5">{selectedEnquiry.preferred_contact}</p>
                </div>
                {selectedEnquiry.preferred_time && (
                  <div>
                    <span className="font-semibold text-neutral-500">Preferred Time Slot:</span>
                    <p className="font-bold text-neutral-800 mt-0.5 flex items-center gap-1">
                      <Clock size={12} className="text-neutral-400" /> {selectedEnquiry.preferred_time}
                    </p>
                  </div>
                )}
              </div>

              {/* Meta info */}
              <div className="text-[10px] text-neutral-400 flex flex-wrap gap-x-4 gap-y-1">
                <span>Source: <strong className="text-neutral-600">{selectedEnquiry.source || 'website'}</strong></span>
                {selectedEnquiry.ip_address && (
                  <span>IP Address: <strong className="text-neutral-600">{selectedEnquiry.ip_address}</strong></span>
                )}
                {selectedEnquiry.created_at && (
                  <span>Submitted At: <strong className="text-neutral-600">{new Date(selectedEnquiry.created_at).toLocaleString('en-IN')}</strong></span>
                )}
              </div>

              {/* Update Form inside Modal */}
              <div className="border-t border-neutral-100 pt-5 space-y-4">
                <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Status Update & Dealer Notes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Status</label>
                    <select
                      id={`modal-status-${selectedEnquiry.id}`}
                      defaultValue={selectedEnquiry.status}
                      className="w-full form-input text-xs py-2 px-3 border border-neutral-200 rounded font-semibold cursor-pointer"
                    >
                      <option value="NEW">Pending Review</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="FOLLOW_UP">Follow Up</option>
                      <option value="NEGOTIATION">In Negotiation</option>
                      <option value="CONVERTED">Converted / Won</option>
                      <option value="CLOSED">Closed / Rejected</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Dealer Feedback Notes</label>
                    <textarea
                      id={`modal-notes-${selectedEnquiry.id}`}
                      defaultValue={selectedEnquiry.admin_notes || ''}
                      placeholder="Price quotation shared, scheduled callback..."
                      className="w-full form-input text-xs p-2 border border-neutral-200 rounded resize-none"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2.5">
                  <button
                    onClick={() => setSelectedEnquiry(null)}
                    className="px-4 py-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    disabled={updatingId === selectedEnquiry.id}
                    onClick={async () => {
                      const selectEl = document.getElementById(`modal-status-${selectedEnquiry.id}`) as HTMLSelectElement;
                      const notesEl = document.getElementById(`modal-notes-${selectedEnquiry.id}`) as HTMLTextAreaElement;
                      await handleUpdate(selectedEnquiry.id, {
                        status: selectEl.value,
                        admin_notes: notesEl.value,
                      });
                      setSelectedEnquiry(null);
                    }}
                    className="px-5 py-2 bg-[#171717] hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {updatingId === selectedEnquiry.id ? (
                      <Loader2 className="animate-spin" size={12} />
                    ) : (
                      'Save & Close'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
