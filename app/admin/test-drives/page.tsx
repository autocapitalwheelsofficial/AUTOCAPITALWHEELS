'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Mail, Phone, Calendar, User, MapPin, Clock, CheckCircle, XCircle, Loader2, X } from 'lucide-react';

export default function AdminTestDrivesPage() {
  const [testDrives, setTestDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedTestDrive, setSelectedTestDrive] = useState<any | null>(null);
  
  const supabase = createClient();

  const loadTestDrives = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('test_drive_requests')
        .select(`
          *,
          vehicles(make, model, variant, year, price)
        `)
        .order('created_at', { ascending: false });

      if (data) setTestDrives(data);
      if (error) console.error(error);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestDrives();
  }, []);

  const handleUpdate = async (id: string, updates: { status: string; admin_notes: string }) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('test_drive_requests')
        .update({
          status: updates.status,
          admin_notes: updates.admin_notes || null,
        })
        .eq('id', id);

      if (error) {
        alert('Failed to update status: ' + error.message);
      } else {
        // Reload list
        await loadTestDrives();
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
        <h1 className="font-display font-bold text-2xl text-neutral-900">Test Drive Bookings</h1>
        <p className="text-neutral-500 text-sm mt-0.5">{testDrives.length} total test drive request{testDrives.length !== 1 ? 's' : ''}</p>
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
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Requested Date</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Customer Info</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Vehicle Details</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Booking Slot</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Dealer Notes / Feedback</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {testDrives.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-neutral-400 font-light">
                      No test drive requests received yet.
                    </td>
                  </tr>
                ) : (
                  testDrives.map((td) => {
                    const car = td.vehicles || td.vehicle_snapshot || {};
                    return (
                      <tr key={td.id} className="hover:bg-neutral-50/30 transition-colors align-top">
                        
                        {/* Booking Date */}
                        <td className="p-4 text-neutral-600 font-medium whitespace-nowrap">
                          {formatDate(td.preferred_date)}
                          <div className="text-[10px] text-neutral-400 mt-1">Booked: {formatDate(td.created_at)}</div>
                        </td>

                        {/* Customer */}
                        <td className="p-4">
                          <button
                            onClick={() => setSelectedTestDrive(td)}
                            className="font-bold text-[#b48d36] hover:underline flex items-center gap-1.5 cursor-pointer text-left"
                          >
                            <User size={12} className="text-neutral-400" />
                            {td.customer_name}
                          </button>
                          <div className="text-neutral-500 mt-1.5 flex flex-col gap-1">
                            <span className="flex items-center gap-1">
                              <Phone size={10} /> +91 {td.customer_phone}
                            </span>
                            {td.customer_email && (
                              <span className="flex items-center gap-1">
                                <Mail size={10} /> {td.customer_email}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <MapPin size={10} /> {td.location || 'N/A'}
                            </span>
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
                              <div className="text-[9px] text-neutral-500 mt-1 font-mono uppercase">#{td.request_id}</div>
                            </div>
                          ) : (
                            <span className="text-neutral-400 italic">Unknown Vehicle</span>
                          )}
                        </td>

                        {/* Booking Slot */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 font-semibold text-neutral-700">
                            <Clock size={11} className="text-neutral-400" />
                            {td.preferred_time || 'Any Time'}
                          </div>
                          {td.message && (
                            <div className="text-[10px] text-neutral-400 mt-2 bg-neutral-50 p-2 rounded border border-neutral-100 max-w-[200px] break-words">
                              {td.message}
                            </div>
                          )}
                        </td>

                        {/* Dealer Notes Input */}
                        <td className="p-4">
                          <textarea
                            defaultValue={td.admin_notes || ''}
                            placeholder="Add approval slot or rejection reason..."
                            className="w-full form-input text-xs p-2 border border-neutral-200 rounded resize-y max-w-[220px]"
                            id={`notes-input-${td.id}`}
                            rows={2}
                          />
                        </td>

                        {/* Status Select Actions */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex flex-col gap-2">
                            <select
                              defaultValue={td.status}
                              className="form-input text-xs py-1.5 px-2.5 max-w-[130px] cursor-pointer font-semibold"
                              id={`status-select-${td.id}`}
                            >
                              <option value="NEW">Pending Review</option>
                              <option value="CONFIRMED">Confirm Slot</option>
                              <option value="CANCELLED">Cancel / Reject</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="RESCHEDULED">Rescheduled</option>
                            </select>
                            
                            <div className="flex items-center gap-1.5">
                              <button
                                disabled={updatingId === td.id}
                                onClick={() => {
                                  const selectEl = document.getElementById(`status-select-${td.id}`) as HTMLSelectElement;
                                  const notesEl = document.getElementById(`notes-input-${td.id}`) as HTMLTextAreaElement;
                                  handleUpdate(td.id, {
                                    status: selectEl.value,
                                    admin_notes: notesEl.value,
                                  });
                                }}
                                className="inline-flex items-center justify-center gap-1 bg-[#171717] hover:bg-neutral-800 text-white font-bold px-3 py-1.5 rounded text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                              >
                                {updatingId === td.id ? (
                                  <Loader2 className="animate-spin" size={10} />
                                ) : (
                                  'Save'
                                )}
                              </button>
                              <button
                                onClick={() => setSelectedTestDrive(td)}
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

      {/* Test Drive Detail Modal */}
      {selectedTestDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 animate-fade-in-scale">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50">
              <div>
                <h2 className="font-display font-bold text-lg text-neutral-900">Test Drive Booking Details</h2>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">#{selectedTestDrive.request_id}</p>
              </div>
              <button
                onClick={() => setSelectedTestDrive(null)}
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
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Customer Details</h3>
                  <div className="bg-neutral-50 p-4 rounded-xl space-y-2.5 border border-neutral-100">
                    <p className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
                      <User size={14} className="text-neutral-400" /> {selectedTestDrive.customer_name}
                    </p>
                    <p className="text-xs text-neutral-600 flex items-center gap-2">
                      <Phone size={14} className="text-neutral-400" /> +91 {selectedTestDrive.customer_phone}
                    </p>
                    {selectedTestDrive.customer_email && (
                      <p className="text-xs text-neutral-600 flex items-center gap-2">
                        <Mail size={14} className="text-neutral-400" /> {selectedTestDrive.customer_email}
                      </p>
                    )}
                    {selectedTestDrive.location && (
                      <p className="text-xs text-neutral-600 flex items-center gap-2">
                        <MapPin size={14} className="text-neutral-400" /> Location: {selectedTestDrive.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Vehicle specifications */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Vehicle of Interest</h3>
                  <div className="bg-neutral-50 p-4 rounded-xl space-y-2.5 border border-neutral-100">
                    {selectedTestDrive.vehicles || selectedTestDrive.vehicle_snapshot ? (
                      (() => {
                        const car = selectedTestDrive.vehicles || selectedTestDrive.vehicle_snapshot;
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
                      <p className="text-xs text-neutral-500 italic">Unknown Vehicle</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking slot specifics */}
              <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-xs">
                <div>
                  <span className="text-neutral-500 block">Requested Date</span>
                  <strong className="text-neutral-800 flex items-center gap-1 mt-0.5">
                    <Calendar size={12} className="text-neutral-400" /> {new Date(selectedTestDrive.preferred_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </strong>
                </div>
                <div>
                  <span className="text-neutral-500 block">Preferred Slot</span>
                  <strong className="text-neutral-800 flex items-center gap-1 mt-0.5">
                    <Clock size={12} className="text-neutral-400" /> {selectedTestDrive.preferred_time || 'Any Time'}
                  </strong>
                </div>
              </div>

              {/* Message */}
              {selectedTestDrive.message && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Customer Message</h3>
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-xs text-neutral-700 leading-relaxed min-h-[50px] whitespace-pre-wrap">
                    {selectedTestDrive.message}
                  </div>
                </div>
              )}

              {/* Submitted At */}
              {selectedTestDrive.created_at && (
                <div className="text-[10px] text-neutral-400">
                  Request Created: <strong className="text-neutral-600">{new Date(selectedTestDrive.created_at).toLocaleString('en-IN')}</strong>
                </div>
              )}

              {/* Status Update inside Modal */}
              <div className="border-t border-neutral-100 pt-5 space-y-4">
                <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Status Update & Dealer Notes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Status</label>
                    <select
                      id={`modal-status-${selectedTestDrive.id}`}
                      defaultValue={selectedTestDrive.status}
                      className="w-full form-input text-xs py-2 px-3 border border-neutral-200 rounded font-semibold cursor-pointer"
                    >
                      <option value="NEW">Pending Review</option>
                      <option value="CONFIRMED">Confirm Slot</option>
                      <option value="CANCELLED">Cancel / Reject</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="RESCHEDULED">Rescheduled</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Dealer Feedback Notes</label>
                    <textarea
                      id={`modal-notes-${selectedTestDrive.id}`}
                      defaultValue={selectedTestDrive.admin_notes || ''}
                      placeholder="Slot confirmed for 3:00 PM..."
                      className="w-full form-input text-xs p-2 border border-neutral-200 rounded resize-none"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2.5">
                  <button
                    onClick={() => setSelectedTestDrive(null)}
                    className="px-4 py-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    disabled={updatingId === selectedTestDrive.id}
                    onClick={async () => {
                      const selectEl = document.getElementById(`modal-status-${selectedTestDrive.id}`) as HTMLSelectElement;
                      const notesEl = document.getElementById(`modal-notes-${selectedTestDrive.id}`) as HTMLTextAreaElement;
                      await handleUpdate(selectedTestDrive.id, {
                        status: selectEl.value,
                        admin_notes: notesEl.value,
                      });
                      setSelectedTestDrive(null);
                    }}
                    className="px-5 py-2 bg-[#171717] hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {updatingId === selectedTestDrive.id ? (
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

