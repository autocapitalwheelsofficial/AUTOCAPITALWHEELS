'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Mail, Phone, Calendar, User, MessageSquare, Clock, MapPin, Loader2, X, Save } from 'lucide-react';

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

  const handleOpenEnquiry = async (enq: any) => {
    setSelectedEnquiry(enq);
    if (enq.status === 'NEW') {
      try {
        const { error } = await supabase
          .from('vehicle_enquiries')
          .update({ status: 'CONTACTED' })
          .eq('id', enq.id);
        
        if (!error) {
          setEnquiries(prev => prev.map(item => item.id === enq.id ? { ...item, status: 'CONTACTED' } : item));
        }
      } catch (err) {
        console.error(err);
      }
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
    <div className="p-4 lg:p-8 bg-[#0a0a0c] text-white min-h-screen">
      
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-white uppercase tracking-wider">Quotation Enquiries</h1>
          <p className="text-neutral-500 text-xs uppercase tracking-widest mt-1">{enquiries.length} total customer request{enquiries.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={loadEnquiries}
          className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all w-fit cursor-pointer"
        >
          Refresh
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
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Date</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Customer</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Vehicle of Interest</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Message</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Preference</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Dealer Feedback / Response Notes</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Status Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-xs">
                  {enquiries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-500 font-light italic">
                        No quotation enquiries received yet.
                      </td>
                    </tr>
                  ) : (
                    enquiries.map((enq) => {
                      const car = enq.vehicles || enq.vehicle_snapshot || {};
                      return (
                        <tr key={enq.id} className="hover:bg-neutral-800/10 transition-colors align-top">
                          
                          {/* Date */}
                          <td className="p-4 text-neutral-400 font-medium whitespace-nowrap">
                            {formatDate(enq.created_at)}
                          </td>

                          {/* Customer */}
                          <td className="p-4">
                            <button
                              onClick={() => handleOpenEnquiry(enq)}
                              className="font-bold text-[#b48d36] hover:underline flex items-center gap-1.5 cursor-pointer text-left"
                            >
                              <User size={12} className="text-neutral-400" />
                              {enq.customer_name}
                            </button>
                            <div className="text-neutral-400 mt-2 flex flex-col gap-1.5">
                              <span className="flex items-center gap-1">
                                <Phone size={10} className="text-neutral-500" /> +91 {enq.customer_phone}
                              </span>
                              {enq.customer_email && (
                                <span className="flex items-center gap-1 truncate max-w-[160px]">
                                  <Mail size={10} className="text-neutral-500" /> {enq.customer_email}
                                </span>
                              )}
                              {enq.customer_city && (
                                <span className="text-[10px] text-neutral-500">
                                  City: {enq.customer_city}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Vehicle */}
                          <td className="p-4">
                            {car.make ? (
                              <div>
                                <div className="font-bold text-white">
                                  {car.year} {car.make} {car.model}
                                </div>
                                <div className="text-[10px] text-neutral-400 mt-1">
                                  {car.variant} • {car.price ? `₹${(car.price / 100000).toFixed(2)} Lakh` : ''}
                                </div>
                                <div className="text-[9px] text-neutral-500 mt-1.5 font-mono uppercase">#{enq.enquiry_id}</div>
                              </div>
                            ) : (
                              <span className="text-neutral-500 italic">General Inquiry</span>
                            )}
                          </td>

                          {/* Message */}
                          <td className="p-4 max-w-[200px] break-words text-neutral-400 leading-relaxed font-light">
                            {enq.message || <span className="text-neutral-650 italic">No notes left</span>}
                          </td>

                          {/* Preference */}
                          <td className="p-4 whitespace-nowrap">
                            <div className="font-semibold text-neutral-300">
                              {enq.preferred_contact}
                            </div>
                            {enq.preferred_time && (
                              <div className="text-[10px] text-neutral-500 mt-1 flex items-center gap-0.5">
                                <Clock size={10} /> {enq.preferred_time}
                              </div>
                            )}
                          </td>

                          {/* Dealer Notes Input */}
                          <td className="p-4">
                            <textarea
                              defaultValue={enq.admin_notes || ''}
                              placeholder="Add price quote details..."
                              className="w-full text-xs p-2.5 bg-[#16161a] border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/10 resize-y max-w-[220px]"
                              id={`notes-input-${enq.id}`}
                              rows={3}
                            />
                          </td>

                          {/* Status Select Actions */}
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex flex-col gap-2">
                              <select
                                defaultValue={enq.status}
                                className="w-full bg-[#16161a] border border-neutral-800 text-white rounded-lg text-xs py-2 px-3 font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
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
                                  className="inline-flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-black font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                                >
                                  {updatingId === enq.id ? (
                                    <Loader2 className="animate-spin" size={10} />
                                  ) : (
                                    'Save'
                                  )}
                                </button>
                                <button
                                  onClick={() => handleOpenEnquiry(enq)}
                                  className="inline-flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer border border-neutral-700"
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

          {/* Mobile Cards View */}
          <div className="block md:hidden space-y-4">
            {enquiries.length === 0 ? (
              <div className="bg-[#121215] border border-neutral-800 rounded-2xl p-8 text-center text-neutral-500 italic">
                No enquiries received yet.
              </div>
            ) : (
              enquiries.map((enq) => {
                const car = enq.vehicles || enq.vehicle_snapshot || {};
                return (
                  <div key={enq.id} className="bg-[#121215] border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
                      <div>
                        <button
                          onClick={() => handleOpenEnquiry(enq)}
                          className="font-bold text-[#b48d36] hover:underline text-sm text-left block"
                        >
                          {enq.customer_name}
                        </button>
                        <p className="text-[10px] text-neutral-500 mt-1 font-mono uppercase">#{enq.enquiry_id}</p>
                      </div>
                      <span className="text-[10px] text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-md">{formatDate(enq.created_at)}</span>
                    </div>

                    {/* Customer Details */}
                    <div className="space-y-1.5 text-xs text-neutral-300">
                      <a href={`tel:${enq.customer_phone}`} className="flex items-center gap-2 hover:text-amber-500">
                        <Phone size={12} className="text-neutral-500" /> +91 {enq.customer_phone}
                      </a>
                      {enq.customer_email && (
                        <a href={`mailto:${enq.customer_email}`} className="flex items-center gap-2 hover:text-amber-500 truncate">
                          <Mail size={12} className="text-neutral-500" /> {enq.customer_email}
                        </a>
                      )}
                      {enq.customer_city && (
                        <p className="text-neutral-400 text-[11px] flex items-center gap-2">
                          <MapPin size={12} className="text-neutral-500" /> City: {enq.customer_city}
                        </p>
                      )}
                      <p className="text-neutral-400 text-[11px] flex items-center gap-2">
                        <Clock size={12} className="text-neutral-500" /> Pref: {enq.preferred_contact} {enq.preferred_time ? `(${enq.preferred_time})` : ''}
                      </p>
                    </div>

                    {/* Vehicle */}
                    {car.make ? (
                      <div className="bg-[#16161a] border border-neutral-800 rounded-xl p-3">
                        <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Vehicle of Interest</p>
                        <p className="text-xs font-bold text-white">{car.year} {car.make} {car.model}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{car.variant} • {car.price ? `₹${(car.price / 100000).toFixed(2)} Lakh` : ''}</p>
                      </div>
                    ) : (
                      <div className="bg-[#16161a] border border-neutral-800 rounded-xl p-3 text-center text-neutral-500 text-xs italic">
                        General Inquiry
                      </div>
                    )}

                    {/* Message */}
                    <div className="text-xs font-light text-neutral-300 bg-neutral-900 border border-neutral-800/80 p-3 rounded-xl">
                      <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Customer Note</p>
                      <p className="italic leading-relaxed">"{enq.message || 'No specific requirements listed'}"</p>
                    </div>

                    {/* Action Form */}
                    <div className="pt-4 border-t border-neutral-800/80 space-y-3">
                      <div>
                        <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Update Status</label>
                        <select
                          id={`mob-status-${enq.id}`}
                          defaultValue={enq.status}
                          className="w-full bg-[#16161a] border border-neutral-800 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-500 font-semibold cursor-pointer"
                        >
                          <option value="NEW">Pending Review</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="FOLLOW_UP">Follow Up</option>
                          <option value="NEGOTIATION">In Negotiation</option>
                          <option value="CONVERTED">Converted / Won</option>
                          <option value="CLOSED">Closed / Rejected</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 font-sans">Response / Dealer Notes</label>
                        <textarea
                          id={`mob-notes-${enq.id}`}
                          defaultValue={enq.admin_notes || ''}
                          placeholder="Type notes, quoted price, client feedback..."
                          rows={3}
                          className="w-full bg-[#16161a] border border-neutral-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 resize-none font-sans"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          disabled={updatingId === enq.id}
                          onClick={() => {
                            const selectEl = document.getElementById(`mob-status-${enq.id}`) as HTMLSelectElement;
                            const notesEl = document.getElementById(`mob-notes-${enq.id}`) as HTMLTextAreaElement;
                            handleUpdate(enq.id, {
                              status: selectEl.value,
                              admin_notes: notesEl.value,
                            });
                          }}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {updatingId === enq.id ? (
                            <Loader2 className="animate-spin" size={12} />
                          ) : (
                            <>
                              <Save size={12} />
                              Save Changes
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenEnquiry(enq)}
                          className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white font-bold px-4 py-3 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Enquiry Detail Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-[#121215] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-scale">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#16161a]">
              <div>
                <h2 className="font-display font-bold text-base text-white uppercase tracking-wider">Enquiry Details</h2>
                <p className="text-[10px] text-neutral-500 font-mono mt-0.5">#{selectedEnquiry.enquiry_id}</p>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Customer Info */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Customer Info</h3>
                  <div className="bg-[#16161a] p-4 rounded-xl space-y-2.5 border border-neutral-800">
                    <p className="text-xs font-semibold text-white flex items-center gap-2">
                      <User size={12} className="text-neutral-500" /> {selectedEnquiry.customer_name}
                    </p>
                    <p className="text-xs text-neutral-300 flex items-center gap-2">
                      <Phone size={12} className="text-neutral-500" /> +91 {selectedEnquiry.customer_phone}
                    </p>
                    {selectedEnquiry.customer_email && (
                      <p className="text-xs text-neutral-300 flex items-center gap-2 truncate">
                        <Mail size={12} className="text-neutral-500" /> {selectedEnquiry.customer_email}
                      </p>
                    )}
                    {selectedEnquiry.customer_city && (
                      <p className="text-xs text-neutral-300 flex items-center gap-2">
                        <MapPin size={12} className="text-neutral-500" /> City: {selectedEnquiry.customer_city}
                      </p>
                    )}
                  </div>
                </div>

                {/* Vehicle of Interest */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Vehicle of Interest</h3>
                  <div className="bg-[#16161a] p-4 rounded-xl space-y-2 border border-neutral-800">
                    {selectedEnquiry.vehicles || selectedEnquiry.vehicle_snapshot ? (
                      (() => {
                        const car = selectedEnquiry.vehicles || selectedEnquiry.vehicle_snapshot;
                        return (
                          <>
                            <p className="text-xs font-bold text-white">
                              {car.year} {car.make} {car.model}
                            </p>
                            {car.variant && (
                              <p className="text-[10px] text-neutral-400">Variant: {car.variant}</p>
                            )}
                            {car.price && (
                              <p className="text-[11px] font-bold text-[#b48d36]">
                                Price: ₹{(car.price / 100000).toFixed(2)} Lakh
                              </p>
                            )}
                          </>
                        );
                      })()
                    ) : (
                      <p className="text-xs text-neutral-500 italic">General Inquiry</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Message */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Customer Message</h3>
                <div className="bg-[#16161a] p-4 rounded-xl border border-neutral-800 text-xs text-neutral-300 leading-relaxed min-h-[60px] whitespace-pre-wrap italic">
                  "{selectedEnquiry.message || 'No requirements left'}"
                </div>
              </div>

              {/* Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#16161a] p-4 rounded-xl border border-neutral-800 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Preferred Contact Method</span>
                  <p className="font-semibold text-white mt-1">{selectedEnquiry.preferred_contact}</p>
                </div>
                {selectedEnquiry.preferred_time && (
                  <div>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Preferred Time Slot</span>
                    <p className="font-semibold text-white mt-1 flex items-center gap-1">
                      <Clock size={12} className="text-neutral-500" /> {selectedEnquiry.preferred_time}
                    </p>
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="text-[10px] text-neutral-550 flex flex-wrap gap-x-4 gap-y-1">
                <span>Source: <strong className="text-neutral-400">{selectedEnquiry.source || 'website'}</strong></span>
                {selectedEnquiry.ip_address && (
                  <span>IP Address: <strong className="text-neutral-400">{selectedEnquiry.ip_address}</strong></span>
                )}
                {selectedEnquiry.created_at && (
                  <span>Submitted At: <strong className="text-neutral-400">{new Date(selectedEnquiry.created_at).toLocaleString('en-IN')}</strong></span>
                )}
              </div>

              {/* Action Update Form inside Modal */}
              <div className="border-t border-neutral-800 pt-5 space-y-4">
                <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Status Update & Dealer Notes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Status</label>
                    <select
                      id={`modal-status-${selectedEnquiry.id}`}
                      defaultValue={selectedEnquiry.status}
                      className="w-full bg-[#16161a] border border-neutral-800 text-white rounded-xl py-2.5 px-3 text-xs font-semibold cursor-pointer focus:outline-none focus:border-amber-500"
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
                    <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Dealer Feedback Notes</label>
                    <textarea
                      id={`modal-notes-${selectedEnquiry.id}`}
                      defaultValue={selectedEnquiry.admin_notes || ''}
                      placeholder="Add quotation details shared..."
                      className="w-full bg-[#16161a] border border-neutral-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 resize-none"
                      rows={2}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSelectedEnquiry(null)}
                    className="px-4 py-2.5 border border-neutral-850 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
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
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {updatingId === selectedEnquiry.id ? (
                      <Loader2 className="animate-spin" size={12} />
                    ) : (
                      <>
                        <Save size={12} />
                        Save & Close
                      </>
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
