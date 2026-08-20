'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Mail, Phone, Tag, User, Car, Image as ImageIcon, Loader2, X, MapPin, Save, FileText } from 'lucide-react';

export default function AdminSellRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const supabase = createClient();

  const loadRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sell_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setRequests(data);
      if (error) console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRequest = async (req: any) => {
    setSelectedRequest(req);
    if (req.status === 'NEW') {
      try {
        const { error } = await supabase
          .from('sell_requests')
          .update({ status: 'UNDER_REVIEW' })
          .eq('id', req.id);
        
        if (!error) {
          setRequests(prev => prev.map(item => item.id === req.id ? { ...item, status: 'UNDER_REVIEW' } : item));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => { loadRequests(); }, []);

  const handleUpdate = async (id: string, updates?: { status: string; admin_notes: string | null; offered_price: number | null }) => {
    setUpdatingId(id);
    let statusVal, notesVal, priceVal;
    if (updates) {
      statusVal = updates.status;
      notesVal = updates.admin_notes;
      priceVal = updates.offered_price;
    } else {
      const selectEl = document.getElementById(`status-${id}`) as HTMLSelectElement;
      const notesEl = document.getElementById(`notes-${id}`) as HTMLTextAreaElement;
      const priceEl = document.getElementById(`price-${id}`) as HTMLInputElement;
      statusVal = selectEl.value;
      notesVal = notesEl.value || null;
      priceVal = priceEl.value ? parseFloat(priceEl.value) : null;
    }

    try {
      const { error } = await supabase
        .from('sell_requests')
        .update({
          status: statusVal,
          admin_notes: notesVal,
          offered_price: priceVal,
        })
        .eq('id', id);

      if (error) alert('Failed: ' + error.message);
      else await loadRequests();
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="p-4 lg:p-8 bg-[#0a0a0c] text-white min-h-screen">
      
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-white uppercase tracking-wider">Sell Requests</h1>
          <p className="text-neutral-500 text-xs uppercase tracking-widest mt-1">{requests.length} sell request{requests.length !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={loadRequests}
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
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Owner</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Vehicle</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Specs</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Expected Price</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Photos</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Offer Price & Notes</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Status Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-xs">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-neutral-500 font-light italic">
                        No sell requests received yet.
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req.id} className="hover:bg-neutral-800/10 transition-colors align-top">
                        
                        {/* Date */}
                        <td className="p-4 text-neutral-400 whitespace-nowrap font-medium">
                          {formatDate(req.created_at)}
                          <div className="text-[9px] text-neutral-500 mt-1 font-mono uppercase">#{req.request_id}</div>
                        </td>

                        {/* Owner */}
                        <td className="p-4">
                          <button
                            onClick={() => handleOpenRequest(req)}
                            className="font-bold text-[#b48d36] hover:underline flex items-center gap-1.5 cursor-pointer text-left"
                          >
                            <User size={12} className="text-neutral-400" />
                            {req.owner_name}
                          </button>
                          <div className="text-neutral-400 mt-2 flex flex-col gap-1.5">
                            <span className="flex items-center gap-1"><Phone size={10} className="text-neutral-500" /> +91 {req.owner_phone}</span>
                            {req.owner_email && <span className="flex items-center gap-1 truncate max-w-[150px]"><Mail size={10} className="text-neutral-500" /> {req.owner_email}</span>}
                            <span className="text-[10px] text-neutral-500">City: {req.owner_city}</span>
                          </div>
                        </td>

                        {/* Vehicle */}
                        <td className="p-4">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <Car size={12} className="text-neutral-400" />
                            {req.manufacturing_year} {req.make} {req.model}
                          </div>
                          {req.variant && <div className="text-[10px] text-neutral-400 mt-1">Variant: {req.variant}</div>}
                          {req.additional_info && (
                            <div className="text-[10px] text-neutral-500 mt-2 max-w-[180px] break-words leading-relaxed italic">
                              "{req.additional_info}"
                            </div>
                          )}
                        </td>

                        {/* Specs */}
                        <td className="p-4 whitespace-nowrap text-neutral-300">
                          <div className="font-semibold text-neutral-200">{req.fuel_type} • {req.transmission}</div>
                          <div className="text-neutral-400 mt-1.5">{req.kms_driven?.toLocaleString('en-IN')} km</div>
                          <div className="text-neutral-400">{req.number_of_owners} Owner{req.number_of_owners !== 1 ? 's' : ''}</div>
                          <div className="text-neutral-500 mt-1">Condition: {req.vehicle_condition}</div>
                          {req.accident_history && (
                            <span className="inline-block mt-1.5 px-2 py-0.5 text-[9px] font-bold rounded bg-red-950 text-red-400 border border-red-900/40">Accident History</span>
                          )}
                        </td>

                        {/* Expected Price */}
                        <td className="p-4 whitespace-nowrap font-bold text-neutral-200">
                          {req.expected_price ? (
                            <span>₹{(req.expected_price / 100000).toFixed(2)} Lakh</span>
                          ) : (
                            <span className="text-neutral-500 font-light italic">Not specified</span>
                          )}
                        </td>

                        {/* Photos */}
                        <td className="p-4">
                          {req.photo_urls?.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 max-w-[100px]">
                              {req.photo_urls.slice(0, 4).map((url: string, i: number) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                  <img src={url} alt={`Photo ${i+1}`} className="w-8 h-8 rounded object-cover border border-neutral-800 hover:opacity-85 transition" />
                                </a>
                              ))}
                              {req.photo_urls.length > 4 && (
                                <span className="text-[9px] text-neutral-550 block w-full">+{req.photo_urls.length - 4} more</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-neutral-600 italic text-[10px]">No photos</span>
                          )}
                        </td>

                        {/* Offer Price + Notes */}
                        <td className="p-4">
                          <div className="flex flex-col gap-2">
                            <input
                              id={`price-${req.id}`}
                              type="number"
                              placeholder="Offer price (₹)"
                              defaultValue={req.offered_price || ''}
                              className="w-full bg-[#16161a] border border-neutral-800 rounded-lg text-xs py-1.5 px-2.5 max-w-[140px] text-white focus:outline-none focus:border-amber-500"
                            />
                            <textarea
                              id={`notes-${req.id}`}
                              defaultValue={req.admin_notes || ''}
                              placeholder="Inspection details..."
                              className="w-full bg-[#16161a] border border-neutral-800 rounded-lg text-xs p-2 focus:outline-none focus:border-amber-500 resize-y max-w-[200px]"
                              rows={2}
                            />
                          </div>
                        </td>

                        {/* Status Action */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex flex-col gap-2">
                            <select
                              id={`status-${req.id}`}
                              defaultValue={req.status}
                              className="w-full bg-[#16161a] border border-neutral-800 text-white rounded-lg text-xs py-1.5 px-2.5 max-w-[150px] font-semibold cursor-pointer focus:outline-none focus:border-amber-500"
                            >
                              <option value="NEW">Pending Review</option>
                              <option value="UNDER_REVIEW">Under Review</option>
                              <option value="INSPECTION_SCHEDULED">Inspection Scheduled</option>
                              <option value="OFFER_MADE">Offer Made</option>
                              <option value="NEGOTIATION">In Negotiation</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="REJECTED">Rejected</option>
                              <option value="CLOSED">Closed</option>
                            </select>
                            <div className="flex items-center gap-1.5">
                              <button
                                disabled={updatingId === req.id}
                                onClick={() => handleUpdate(req.id)}
                                className="inline-flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-black font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                              >
                                {updatingId === req.id ? <Loader2 size={10} className="animate-spin" /> : 'Save'}
                              </button>
                              <button
                                onClick={() => handleOpenRequest(req)}
                                className="inline-flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer border border-neutral-700"
                              >
                                Details
                              </button>
                            </div>
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
            {requests.length === 0 ? (
              <div className="bg-[#121215] border border-neutral-800 rounded-2xl p-8 text-center text-neutral-500 italic">
                No sell requests received yet.
              </div>
            ) : (
              requests.map((req) => {
                return (
                  <div key={req.id} className="bg-[#121215] border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-neutral-850 pb-3">
                      <div>
                        <button
                          onClick={() => handleOpenRequest(req)}
                          className="font-bold text-[#b48d36] hover:underline text-sm text-left block"
                        >
                          {req.owner_name}
                        </button>
                        <p className="text-[10px] text-neutral-500 mt-1 font-mono uppercase">#{req.request_id}</p>
                      </div>
                      <span className="text-[10px] text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-md">{formatDate(req.created_at)}</span>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-1 text-xs text-neutral-300">
                      <a href={`tel:${req.owner_phone}`} className="flex items-center gap-2 hover:text-amber-500">
                        <Phone size={12} className="text-neutral-500" /> +91 {req.owner_phone}
                      </a>
                      {req.owner_email && (
                        <a href={`mailto:${req.owner_email}`} className="flex items-center gap-2 hover:text-amber-500 truncate">
                          <Mail size={12} className="text-neutral-500" /> {req.owner_email}
                        </a>
                      )}
                      <p className="text-neutral-400 text-[11px] flex items-center gap-2">
                        <MapPin size={12} className="text-neutral-500" /> City: {req.owner_city}
                      </p>
                    </div>

                    {/* Vehicle Details */}
                    <div className="bg-[#16161a] border border-neutral-800 rounded-xl p-3.5 space-y-2">
                      <div>
                        <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">Vehicle specs</p>
                        <p className="text-xs font-bold text-white">{req.manufacturing_year} {req.make} {req.model}</p>
                        {req.variant && <p className="text-[10px] text-neutral-450 mt-0.5">Variant: {req.variant}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-850 text-[11px] text-neutral-300">
                        <div>Engine: <span className="font-semibold text-white">{req.fuel_type} • {req.transmission}</span></div>
                        <div>Driven: <span className="font-semibold text-white">{req.kms_driven?.toLocaleString('en-IN')} km</span></div>
                        <div>Owners: <span className="font-semibold text-white">{req.number_of_owners} Owner</span></div>
                        <div>Condition: <span className="font-semibold text-white">{req.vehicle_condition}</span></div>
                      </div>
                      {req.accident_history && (
                        <span className="inline-block px-2 py-0.5 text-[9px] font-bold rounded bg-red-950 text-red-400 border border-red-900/40">Accident History</span>
                      )}
                    </div>

                    {/* Expected Price */}
                    <div className="flex items-center justify-between text-xs bg-neutral-900 border border-neutral-850 p-3 rounded-xl">
                      <span className="text-neutral-400">Expected Price:</span>
                      <span className="font-bold text-[#b48d36]">
                        {req.expected_price ? `₹${(req.expected_price / 100000).toFixed(2)} Lakh` : 'Not specified'}
                      </span>
                    </div>

                    {/* Photos */}
                    {req.photo_urls?.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Vehicle Photos ({req.photo_urls.length})</p>
                        <div className="flex flex-wrap gap-1.5">
                          {req.photo_urls.map((url: string, i: number) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                              <img src={url} alt={`Car Photo ${i+1}`} className="w-12 h-12 rounded-lg object-cover border border-neutral-800 hover:opacity-85 transition" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Form */}
                    <div className="pt-4 border-t border-neutral-850 space-y-3">
                      <div>
                        <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Update Status</label>
                        <select
                          id={`mob-status-${req.id}`}
                          defaultValue={req.status}
                          className="w-full bg-[#16161a] border border-neutral-800 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-500 font-semibold cursor-pointer"
                        >
                          <option value="NEW">Pending Review</option>
                          <option value="UNDER_REVIEW">Under Review</option>
                          <option value="INSPECTION_SCHEDULED">Inspection Scheduled</option>
                          <option value="OFFER_MADE">Offer Made</option>
                          <option value="NEGOTIATION">In Negotiation</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="REJECTED">Rejected</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Offered Price (₹)</label>
                          <input
                            id={`mob-price-${req.id}`}
                            type="number"
                            placeholder="Enter purchase offer amount"
                            defaultValue={req.offered_price || ''}
                            className="w-full bg-[#16161a] border border-neutral-800 rounded-xl text-xs py-2.5 px-3 text-white focus:outline-none focus:border-amber-500 font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 font-sans">Dealer Inspection Notes</label>
                          <textarea
                            id={`mob-notes-${req.id}`}
                            defaultValue={req.admin_notes || ''}
                            placeholder="Car evaluation comments, tires status, engine health notes..."
                            rows={3}
                            className="w-full bg-[#16161a] border border-neutral-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 resize-none font-sans"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          disabled={updatingId === req.id}
                          onClick={() => {
                            const selectEl = document.getElementById(`mob-status-${req.id}`) as HTMLSelectElement;
                            const notesEl = document.getElementById(`mob-notes-${req.id}`) as HTMLTextAreaElement;
                            const priceEl = document.getElementById(`mob-price-${req.id}`) as HTMLInputElement;
                            handleUpdate(req.id, {
                              status: selectEl.value,
                              admin_notes: notesEl.value || null,
                              offered_price: priceEl.value ? parseFloat(priceEl.value) : null,
                            });
                          }}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {updatingId === req.id ? (
                            <Loader2 className="animate-spin" size={12} />
                          ) : (
                            <>
                              <Save size={12} />
                              Save Changes
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenRequest(req)}
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

      {/* Sell Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl bg-[#121215] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-scale">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#16161a]">
              <div>
                <h2 className="font-display font-bold text-base text-white uppercase tracking-wider">Sell Request Details</h2>
                <p className="text-[10px] text-neutral-500 font-mono mt-0.5">#{selectedRequest.request_id}</p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 rounded-lg text-neutral-450 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Owner info */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Owner Details</h3>
                  <div className="bg-[#16161a] p-4 rounded-xl space-y-2.5 border border-neutral-800">
                    <p className="text-xs font-semibold text-white flex items-center gap-2">
                      <User size={12} className="text-neutral-500" /> {selectedRequest.owner_name}
                    </p>
                    <p className="text-xs text-neutral-300 flex items-center gap-2">
                      <Phone size={12} className="text-neutral-500" /> +91 {selectedRequest.owner_phone}
                    </p>
                    {selectedRequest.owner_email && (
                      <p className="text-xs text-neutral-300 flex items-center gap-2 truncate">
                        <Mail size={12} className="text-neutral-500" /> {selectedRequest.owner_email}
                      </p>
                    )}
                    <p className="text-xs text-neutral-300 flex items-center gap-2">
                      <MapPin size={12} className="text-neutral-500" /> City: {selectedRequest.owner_city}
                    </p>
                  </div>
                </div>

                {/* Vehicle specifications */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Vehicle Specs</h3>
                  <div className="bg-[#16161a] p-4 rounded-xl space-y-2 border border-neutral-800 text-xs">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <Car size={12} className="text-[#b48d36]" />
                      {selectedRequest.manufacturing_year} {selectedRequest.make} {selectedRequest.model}
                    </p>
                    {selectedRequest.variant && <p className="text-[10px] text-neutral-400">Variant: {selectedRequest.variant}</p>}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 pt-2 border-t border-neutral-800/80 text-neutral-300">
                      <div>Fuel: <strong>{selectedRequest.fuel_type}</strong></div>
                      <div>Transmission: <strong>{selectedRequest.transmission}</strong></div>
                      <div>KMs Driven: <strong>{selectedRequest.kms_driven?.toLocaleString('en-IN')} km</strong></div>
                      <div>Owners: <strong>{selectedRequest.number_of_owners}</strong></div>
                      <div>Condition: <strong>{selectedRequest.vehicle_condition}</strong></div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Expected Price & Docs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#16161a] p-4 rounded-xl border border-neutral-800 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-0.5">Expected Price</span>
                  <p className="font-bold text-[#b48d36] text-sm">
                    {selectedRequest.expected_price ? `₹${(selectedRequest.expected_price / 100000).toFixed(2)} Lakh` : 'Not specified'}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[9px] font-bold text-neutral-500 uppercase">RC Available</span>
                    <p className="font-semibold text-white mt-0.5">{selectedRequest.rc_available ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-neutral-500 uppercase">PUC Valid</span>
                    <p className="font-semibold text-white mt-0.5">{selectedRequest.puc_available ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-neutral-500 uppercase">Accident</span>
                    <p className="font-semibold text-white mt-0.5">{selectedRequest.accident_history ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Additional notes */}
              {selectedRequest.additional_info && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Additional Comments</h3>
                  <div className="bg-[#16161a] p-4 rounded-xl border border-neutral-800 text-xs text-neutral-300 leading-relaxed italic">
                    "{selectedRequest.additional_info}"
                  </div>
                </div>
              )}

              {/* Photos */}
              {selectedRequest.photo_urls?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Vehicle Photos</h3>
                  <div className="flex flex-wrap gap-2 bg-[#16161a] p-4 rounded-xl border border-neutral-800">
                    {selectedRequest.photo_urls.map((url: string, i: number) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="relative group">
                        <img src={url} alt={`Upload ${i+1}`} className="w-16 h-16 rounded-lg object-cover border border-neutral-800 group-hover:opacity-80 transition" />
                        <span className="absolute bottom-1 right-1 bg-black/70 text-[8px] text-white px-1 rounded font-mono">#{i+1}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Update Form inside Modal */}
              <div className="border-t border-neutral-800 pt-5 space-y-4">
                <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Evaluation & Response Status</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1 space-y-3">
                    <div>
                      <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Status</label>
                      <select
                        id={`modal-status-${selectedRequest.id}`}
                        defaultValue={selectedRequest.status}
                        className="w-full bg-[#16161a] border border-neutral-800 text-white rounded-xl py-2.5 px-3 text-xs font-semibold cursor-pointer focus:outline-none focus:border-amber-500"
                      >
                        <option value="NEW">Pending Review</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="INSPECTION_SCHEDULED">Inspection Scheduled</option>
                        <option value="OFFER_MADE">Offer Made</option>
                        <option value="NEGOTIATION">In Negotiation</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Offered Price (₹)</label>
                      <input
                        id={`modal-price-${selectedRequest.id}`}
                        type="number"
                        defaultValue={selectedRequest.offered_price || ''}
                        placeholder="Offer amount"
                        className="w-full bg-[#16161a] border border-neutral-800 text-white rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Evaluation Notes / Remarks</label>
                    <textarea
                      id={`modal-notes-${selectedRequest.id}`}
                      defaultValue={selectedRequest.admin_notes || ''}
                      placeholder="Inspection notes, tires status, paint condition remarks..."
                      className="w-full bg-[#16161a] border border-neutral-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 resize-none h-full min-h-[106px]"
                      rows={4}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2.5 border border-neutral-850 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    disabled={updatingId === selectedRequest.id}
                    onClick={async () => {
                      const selectEl = document.getElementById(`modal-status-${selectedRequest.id}`) as HTMLSelectElement;
                      const notesEl = document.getElementById(`modal-notes-${selectedRequest.id}`) as HTMLTextAreaElement;
                      const priceEl = document.getElementById(`modal-price-${selectedRequest.id}`) as HTMLInputElement;
                      await handleUpdate(selectedRequest.id, {
                        status: selectEl.value,
                        admin_notes: notesEl.value || null,
                        offered_price: priceEl.value ? parseFloat(priceEl.value) : null,
                      });
                      setSelectedRequest(null);
                    }}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {updatingId === selectedRequest.id ? (
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
