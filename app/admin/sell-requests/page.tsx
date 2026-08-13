'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Mail, Phone, Tag, User, Car, Image as ImageIcon, Loader2, X, MapPin } from 'lucide-react';

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
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-neutral-900">Sell Requests</h1>
        <p className="text-neutral-500 text-sm mt-0.5">{requests.length} sell request{requests.length !== 1 ? 's' : ''} total</p>
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
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Owner</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Vehicle</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Specs</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Expected Price</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Photos</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Offer Price + Notes</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-neutral-400 font-light">
                      No sell requests received yet.
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-neutral-50/30 transition-colors align-top">

                      {/* Date */}
                      <td className="p-4 text-neutral-500 whitespace-nowrap font-medium">
                        {formatDate(req.created_at)}
                        <div className="text-[9px] text-neutral-400 mt-0.5 font-mono">{req.request_id}</div>
                      </td>

                      {/* Owner */}
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="font-bold text-[#b48d36] hover:underline flex items-center gap-1.5 cursor-pointer text-left"
                        >
                          <User size={12} className="text-neutral-400" />
                          {req.owner_name}
                        </button>
                        <div className="text-neutral-500 mt-1 flex flex-col gap-1">
                          <span className="flex items-center gap-1"><Phone size={10} /> +91 {req.owner_phone}</span>
                          {req.owner_email && <span className="flex items-center gap-1"><Mail size={10} /> {req.owner_email}</span>}
                          <span className="text-[10px] text-neutral-400">City: {req.owner_city}</span>
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td className="p-4">
                        <div className="font-bold text-neutral-800 flex items-center gap-1.5">
                          <Car size={12} className="text-neutral-400" />
                          {req.manufacturing_year} {req.make} {req.model}
                        </div>
                        {req.variant && <div className="text-[10px] text-neutral-400 mt-0.5">Variant: {req.variant}</div>}
                        {req.additional_info && (
                          <div className="text-[10px] text-neutral-500 mt-1 max-w-[160px] break-words leading-relaxed">
                            {req.additional_info}
                          </div>
                        )}
                      </td>

                      {/* Specs */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="text-neutral-700 font-semibold">{req.fuel_type} • {req.transmission}</div>
                        <div className="text-neutral-500 mt-1">{req.kms_driven?.toLocaleString('en-IN')} km</div>
                        <div className="text-neutral-500">{req.number_of_owners} Owner{req.number_of_owners !== 1 ? 's' : ''}</div>
                        <div className="text-neutral-400 mt-1">Condition: {req.vehicle_condition}</div>
                        {req.accident_history && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold rounded bg-red-50 text-red-600 border border-red-200">Accident History</span>
                        )}
                      </td>

                      {/* Expected Price */}
                      <td className="p-4 whitespace-nowrap font-bold text-neutral-800">
                        {req.expected_price ? (
                          <span>₹{(req.expected_price / 100000).toFixed(2)} Lakh</span>
                        ) : (
                          <span className="text-neutral-300 font-light italic">Not specified</span>
                        )}
                      </td>

                      {/* Photos */}
                      <td className="p-4">
                        {req.photo_urls?.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-w-[100px]">
                            {req.photo_urls.slice(0, 4).map((url: string, i: number) => (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                <img src={url} alt={`Photo ${i+1}`} className="w-10 h-10 rounded object-cover border border-neutral-200 hover:opacity-80 transition" />
                              </a>
                            ))}
                            {req.photo_urls.length > 4 && (
                              <span className="text-[10px] text-neutral-400">+{req.photo_urls.length - 4} more</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-300 italic text-[10px]">No photos</span>
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
                            className="form-input text-xs py-1.5 px-2.5 max-w-[140px] border border-neutral-200 rounded"
                          />
                          <textarea
                            id={`notes-${req.id}`}
                            defaultValue={req.admin_notes || ''}
                            placeholder="Inspection notes, offer details..."
                            className="form-input text-xs p-2 border border-neutral-200 rounded resize-y max-w-[200px]"
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
                            className="form-input text-xs py-1.5 px-2.5 max-w-[150px] cursor-pointer font-semibold"
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
                              className="inline-flex items-center justify-center gap-1 bg-[#171717] hover:bg-neutral-800 text-white font-bold px-3 py-1.5 rounded text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                            >
                              {updatingId === req.id ? <Loader2 size={10} className="animate-spin" /> : 'Save'}
                            </button>
                            <button
                              onClick={() => setSelectedRequest(req)}
                              className="inline-flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold px-3 py-1.5 rounded text-[10px] uppercase tracking-wider transition-all cursor-pointer"
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
      )}

      {/* Sell Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 animate-fade-in-scale">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50">
              <div>
                <h2 className="font-display font-bold text-lg text-neutral-900">Sell Request Details</h2>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">#{selectedRequest.request_id}</p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Owner info */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Owner Details</h3>
                  <div className="bg-neutral-50 p-4 rounded-xl space-y-2.5 border border-neutral-100">
                    <p className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
                      <User size={14} className="text-neutral-400" /> {selectedRequest.owner_name}
                    </p>
                    <p className="text-xs text-neutral-600 flex items-center gap-2">
                      <Phone size={14} className="text-neutral-400" /> +91 {selectedRequest.owner_phone}
                    </p>
                    {selectedRequest.owner_email && (
                      <p className="text-xs text-neutral-600 flex items-center gap-2">
                        <Mail size={14} className="text-neutral-400" /> {selectedRequest.owner_email}
                      </p>
                    )}
                    <p className="text-xs text-neutral-600 flex items-center gap-2">
                      <MapPin size={14} className="text-neutral-400" /> City: {selectedRequest.owner_city}
                    </p>
                  </div>
                </div>

                {/* Vehicle specifications */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Vehicle Details</h3>
                  <div className="bg-neutral-50 p-4 rounded-xl space-y-2.5 border border-neutral-100">
                    <p className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
                      <Car size={14} className="text-neutral-400" /> {selectedRequest.manufacturing_year} {selectedRequest.make} {selectedRequest.model}
                    </p>
                    {selectedRequest.variant && (
                      <p className="text-xs text-neutral-500">Variant: {selectedRequest.variant}</p>
                    )}
                    <div className="grid grid-cols-2 gap-y-1.5 text-xs text-neutral-600">
                      <div>Fuel: <strong className="text-neutral-800">{selectedRequest.fuel_type || 'N/A'}</strong></div>
                      <div>Transmission: <strong className="text-neutral-800">{selectedRequest.transmission || 'N/A'}</strong></div>
                      <div>Mileage: <strong className="text-neutral-800">{selectedRequest.kms_driven?.toLocaleString('en-IN') || 0} km</strong></div>
                      <div>Owners: <strong className="text-neutral-800">{selectedRequest.number_of_owners || 1}</strong></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra technical details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-xs">
                <div>
                  <span className="text-neutral-500 block">Expected Price</span>
                  <strong className="text-neutral-800 text-sm">
                    {selectedRequest.expected_price ? `₹${(selectedRequest.expected_price / 100000).toFixed(2)} Lakh` : 'Not specified'}
                  </strong>
                </div>
                <div>
                  <span className="text-neutral-500 block">Condition</span>
                  <strong className="text-neutral-800">{selectedRequest.vehicle_condition || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block">Insurance Status</span>
                  <strong className="text-neutral-800">{selectedRequest.insurance_status || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block">RC Available</span>
                  <strong className="text-neutral-800">{selectedRequest.rc_available ? 'Yes' : 'No'}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block">Accident History</span>
                  <strong className={selectedRequest.accident_history ? 'text-red-600' : 'text-green-600'}>
                    {selectedRequest.accident_history ? 'Yes' : 'No'}
                  </strong>
                </div>
                {selectedRequest.registration_year && (
                  <div>
                    <span className="text-neutral-500 block">Reg. Year</span>
                    <strong className="text-neutral-800">{selectedRequest.registration_year}</strong>
                  </div>
                )}
              </div>

              {/* Photos Grid */}
              {selectedRequest.photo_urls?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Uploaded Photos ({selectedRequest.photo_urls.length})</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                    {selectedRequest.photo_urls.map((url: string, i: number) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="group relative aspect-square rounded-lg overflow-hidden border border-neutral-200 bg-white">
                        <img src={url} alt={`Photo ${i+1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Message */}
              {selectedRequest.additional_info && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Additional Info</h3>
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-xs text-neutral-700 leading-relaxed min-h-[50px]">
                    {selectedRequest.additional_info}
                  </div>
                </div>
              )}

              {/* Status Update inside Modal */}
              <div className="border-t border-neutral-100 pt-5 space-y-4">
                <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Dealer Review Action</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Status</label>
                    <select
                      id={`modal-status-${selectedRequest.id}`}
                      defaultValue={selectedRequest.status}
                      className="w-full form-input text-xs py-2 px-3 border border-neutral-200 rounded font-semibold cursor-pointer"
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
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Offered Price (₹)</label>
                    <input
                      id={`modal-price-${selectedRequest.id}`}
                      type="number"
                      placeholder="Offered price"
                      defaultValue={selectedRequest.offered_price || ''}
                      className="w-full form-input text-xs py-2 px-3 border border-neutral-200 rounded font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Review Feedback Notes</label>
                    <textarea
                      id={`modal-notes-${selectedRequest.id}`}
                      defaultValue={selectedRequest.admin_notes || ''}
                      placeholder="Inspection scheduled for tomorrow morning..."
                      className="w-full form-input text-xs p-2 border border-neutral-200 rounded resize-none"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2.5">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
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
                    className="px-5 py-2 bg-[#171717] hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {updatingId === selectedRequest.id ? (
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

