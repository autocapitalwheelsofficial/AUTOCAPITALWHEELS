'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Mail, Phone, Calendar, User, MapPin, Clock, Loader2, X, Save } from 'lucide-react';

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

  const handleOpenTestDrive = async (td: any) => {
    setSelectedTestDrive(td);
    if (td.status === 'NEW') {
      try {
        const { error } = await supabase
          .from('test_drive_requests')
          .update({ status: 'CONFIRMED' })
          .eq('id', td.id);
        
        if (!error) {
          setTestDrives(prev => prev.map(item => item.id === td.id ? { ...item, status: 'CONFIRMED' } : item));
        }
      } catch (err) {
        console.error(err);
      }
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
    <div className="p-4 lg:p-8 bg-[#0a0a0c] text-white min-h-screen">
      
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-white uppercase tracking-wider">Test Drive Bookings</h1>
          <p className="text-neutral-500 text-xs uppercase tracking-widest mt-1">{testDrives.length} total test drive request{testDrives.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={loadTestDrives}
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
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Requested Date</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Customer Info</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Vehicle Details</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Booking Slot</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Dealer Notes / Feedback</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Status Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-xs">
                  {testDrives.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-neutral-500 font-light italic">
                        No test drive requests received yet.
                      </td>
                    </tr>
                  ) : (
                    testDrives.map((td) => {
                      const car = td.vehicles || td.vehicle_snapshot || {};
                      return (
                        <tr key={td.id} className="hover:bg-neutral-800/10 transition-colors align-top">
                          
                          {/* Booking Date */}
                          <td className="p-4 text-neutral-450 font-medium whitespace-nowrap">
                            {formatDate(td.preferred_date)}
                            <div className="text-[10px] text-neutral-500 mt-1.5">Booked: {formatDate(td.created_at)}</div>
                          </td>

                          {/* Customer */}
                          <td className="p-4">
                            <button
                              onClick={() => handleOpenTestDrive(td)}
                              className="font-bold text-[#b48d36] hover:underline flex items-center gap-1.5 cursor-pointer text-left"
                            >
                              <User size={12} className="text-neutral-400" />
                              {td.customer_name}
                            </button>
                            <div className="text-neutral-400 mt-2 flex flex-col gap-1.5">
                              <span className="flex items-center gap-1">
                                <Phone size={10} className="text-neutral-500" /> +91 {td.customer_phone}
                              </span>
                              {td.customer_email && (
                                <span className="flex items-center gap-1 truncate max-w-[160px]">
                                  <Mail size={10} className="text-neutral-500" /> {td.customer_email}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <MapPin size={10} className="text-neutral-500" /> {td.location || 'N/A'}
                              </span>
                            </div>
                          </td>

                          {/* Vehicle */}
                          <td className="p-4">
                            {car.make ? (
                              <div>
                                <div className="font-bold text-white">
                                  {car.year} {car.make} {car.model}
                                </div>
                                <div className="text-[10px] text-neutral-450 mt-1">
                                  {car.variant} • {car.price ? `₹${(car.price / 100000).toFixed(2)} Lakh` : ''}
                                </div>
                                <div className="text-[9px] text-neutral-500 mt-1.5 font-mono uppercase">#{td.request_id}</div>
                              </div>
                            ) : (
                              <span className="text-neutral-550 italic">Unknown Vehicle</span>
                            )}
                          </td>

                          {/* Booking Slot */}
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 font-semibold text-neutral-300">
                              <Clock size={11} className="text-neutral-500" />
                              {td.preferred_time || 'Any Time'}
                            </div>
                            {td.message && (
                              <div className="text-[10px] text-neutral-400 mt-2 bg-[#16161a] p-2.5 rounded-lg border border-neutral-800 max-w-[200px] break-words italic">
                                "{td.message}"
                              </div>
                            )}
                          </td>

                          {/* Dealer Notes Input */}
                          <td className="p-4">
                            <textarea
                              defaultValue={td.admin_notes || ''}
                              placeholder="Add booking comments..."
                              className="w-full text-xs p-2.5 bg-[#16161a] border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500/85 focus:ring-1 focus:ring-amber-500/15 resize-y max-w-[220px]"
                              id={`notes-input-${td.id}`}
                              rows={3}
                            />
                          </td>

                          {/* Status Select Actions */}
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex flex-col gap-2">
                              <select
                                defaultValue={td.status}
                                className="w-full bg-[#16161a] border border-neutral-800 text-white rounded-lg text-xs py-2 px-3 font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
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
                                  className="inline-flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-black font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                                >
                                  {updatingId === td.id ? (
                                    <Loader2 className="animate-spin" size={10} />
                                  ) : (
                                    'Save'
                                  )}
                                </button>
                                <button
                                  onClick={() => handleOpenTestDrive(td)}
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
            {testDrives.length === 0 ? (
              <div className="bg-[#121215] border border-neutral-800 rounded-2xl p-8 text-center text-neutral-500 italic">
                No test drive requests received yet.
              </div>
            ) : (
              testDrives.map((td) => {
                const car = td.vehicles || td.vehicle_snapshot || {};
                return (
                  <div key={td.id} className="bg-[#121215] border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-neutral-850 pb-3">
                      <div>
                        <button
                          onClick={() => handleOpenTestDrive(td)}
                          className="font-bold text-[#b48d36] hover:underline text-sm text-left block"
                        >
                          {td.customer_name}
                        </button>
                        <p className="text-[10px] text-neutral-500 mt-1 font-mono uppercase">#{td.request_id}</p>
                      </div>
                      <span className="text-[10px] text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-md">{formatDate(td.preferred_date)}</span>
                    </div>

                    {/* Customer Details */}
                    <div className="space-y-1.5 text-xs text-neutral-300">
                      <a href={`tel:${td.customer_phone}`} className="flex items-center gap-2 hover:text-amber-500">
                        <Phone size={12} className="text-neutral-500" /> +91 {td.customer_phone}
                      </a>
                      {td.customer_email && (
                        <a href={`mailto:${td.customer_email}`} className="flex items-center gap-2 hover:text-amber-500 truncate">
                          <Mail size={12} className="text-neutral-500" /> {td.customer_email}
                        </a>
                      )}
                      <p className="text-neutral-400 text-[11px] flex items-center gap-2">
                        <MapPin size={12} className="text-neutral-500" /> Loc: {td.location || 'N/A'}
                      </p>
                      <p className="text-neutral-400 text-[11px] flex items-center gap-2">
                        <Clock size={12} className="text-neutral-500" /> Time: {td.preferred_time || 'Any Time'}
                      </p>
                    </div>

                    {/* Vehicle */}
                    {car.make ? (
                      <div className="bg-[#16161a] border border-neutral-800 rounded-xl p-3">
                        <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Requested Car</p>
                        <p className="text-xs font-bold text-white">{car.year} {car.make} {car.model}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{car.variant} • {car.price ? `₹${(car.price / 100000).toFixed(2)} Lakh` : ''}</p>
                      </div>
                    ) : (
                      <div className="bg-[#16161a] border border-neutral-800 rounded-xl p-3 text-center text-neutral-500 text-xs italic">
                        Unknown Vehicle
                      </div>
                    )}

                    {/* Message */}
                    {td.message && (
                      <div className="text-xs font-light text-neutral-300 bg-neutral-900 border border-neutral-850 p-3 rounded-xl">
                        <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Customer Note</p>
                        <p className="italic leading-relaxed">"{td.message}"</p>
                      </div>
                    )}

                    {/* Action Form */}
                    <div className="pt-4 border-t border-neutral-850 space-y-3">
                      <div>
                        <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Update Status</label>
                        <select
                          id={`mob-status-${td.id}`}
                          defaultValue={td.status}
                          className="w-full bg-[#16161a] border border-neutral-800 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-500 font-semibold cursor-pointer"
                        >
                          <option value="NEW">Pending Review</option>
                          <option value="CONFIRMED">Confirm Slot</option>
                          <option value="CANCELLED">Cancel / Reject</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="RESCHEDULED">Rescheduled</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 font-sans">Dealer Scheduling Notes</label>
                        <textarea
                          id={`mob-notes-${td.id}`}
                          defaultValue={td.admin_notes || ''}
                          placeholder="Confirm test drive timing or add status comments..."
                          rows={3}
                          className="w-full bg-[#16161a] border border-neutral-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 resize-none font-sans"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          disabled={updatingId === td.id}
                          onClick={() => {
                            const selectEl = document.getElementById(`mob-status-${td.id}`) as HTMLSelectElement;
                            const notesEl = document.getElementById(`mob-notes-${td.id}`) as HTMLTextAreaElement;
                            handleUpdate(td.id, {
                              status: selectEl.value,
                              admin_notes: notesEl.value,
                            });
                          }}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {updatingId === td.id ? (
                            <Loader2 className="animate-spin" size={12} />
                          ) : (
                            <>
                              <Save size={12} />
                              Save Changes
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenTestDrive(td)}
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

      {/* Test Drive Detail Modal */}
      {selectedTestDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-[#121215] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-scale">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#16161a]">
              <div>
                <h2 className="font-display font-bold text-base text-white uppercase tracking-wider">Booking Details</h2>
                <p className="text-[10px] text-neutral-500 font-mono mt-0.5">#{selectedTestDrive.request_id}</p>
              </div>
              <button
                onClick={() => setSelectedTestDrive(null)}
                className="p-1.5 rounded-lg text-neutral-450 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
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
                      <User size={12} className="text-neutral-500" /> {selectedTestDrive.customer_name}
                    </p>
                    <p className="text-xs text-neutral-300 flex items-center gap-2">
                      <Phone size={12} className="text-neutral-500" /> +91 {selectedTestDrive.customer_phone}
                    </p>
                    {selectedTestDrive.customer_email && (
                      <p className="text-xs text-neutral-300 flex items-center gap-2 truncate">
                        <Mail size={12} className="text-neutral-500" /> {selectedTestDrive.customer_email}
                      </p>
                    )}
                    <p className="text-xs text-neutral-300 flex items-center gap-2">
                      <MapPin size={12} className="text-neutral-500" /> Location: {selectedTestDrive.location || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Vehicle details */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Vehicle Details</h3>
                  <div className="bg-[#16161a] p-4 rounded-xl space-y-2 border border-neutral-800">
                    {selectedTestDrive.vehicles || selectedTestDrive.vehicle_snapshot ? (
                      (() => {
                        const car = selectedTestDrive.vehicles || selectedTestDrive.vehicle_snapshot;
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
                      <p className="text-xs text-neutral-500 italic">Unknown Vehicle</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Message */}
              {selectedTestDrive.message && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Customer Message</h3>
                  <div className="bg-[#16161a] p-4 rounded-xl border border-neutral-800 text-xs text-neutral-300 leading-relaxed min-h-[60px] whitespace-pre-wrap italic">
                    "{selectedTestDrive.message}"
                  </div>
                </div>
              )}

              {/* Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#16161a] p-4 rounded-xl border border-neutral-800 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Preferred Date</span>
                  <p className="font-semibold text-white mt-1">{formatDate(selectedTestDrive.preferred_date)}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Preferred Time Slot</span>
                  <p className="font-semibold text-white mt-1 flex items-center gap-1">
                    <Clock size={12} className="text-neutral-500" /> {selectedTestDrive.preferred_time || 'Any Time'}
                  </p>
                </div>
              </div>

              {/* Meta */}
              <div className="text-[10px] text-neutral-550 flex flex-wrap gap-x-4 gap-y-1">
                {selectedTestDrive.created_at && (
                  <span>Booked At: <strong className="text-neutral-400">{new Date(selectedTestDrive.created_at).toLocaleString('en-IN')}</strong></span>
                )}
              </div>

              {/* Action Update Form inside Modal */}
              <div className="border-t border-neutral-800 pt-5 space-y-4">
                <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Schedule Update & Dealer Notes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Status</label>
                    <select
                      id={`modal-status-${selectedTestDrive.id}`}
                      defaultValue={selectedTestDrive.status}
                      className="w-full bg-[#16161a] border border-neutral-800 text-white rounded-xl py-2.5 px-3 text-xs font-semibold cursor-pointer focus:outline-none focus:border-amber-500"
                    >
                      <option value="NEW">Pending Review</option>
                      <option value="CONFIRMED">Confirm Slot</option>
                      <option value="CANCELLED">Cancel / Reject</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="RESCHEDULED">Rescheduled</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Dealer Feedback Notes</label>
                    <textarea
                      id={`modal-notes-${selectedTestDrive.id}`}
                      defaultValue={selectedTestDrive.admin_notes || ''}
                      placeholder="Add driver assigned, timing confirmations..."
                      className="w-full bg-[#16161a] border border-neutral-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 resize-none"
                      rows={2}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSelectedTestDrive(null)}
                    className="px-4 py-2.5 border border-neutral-850 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
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
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {updatingId === selectedTestDrive.id ? (
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
