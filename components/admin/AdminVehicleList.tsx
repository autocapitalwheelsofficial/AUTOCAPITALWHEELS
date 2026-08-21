'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Edit, Eye, Trash2, Star, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { formatPrice, formatMileage, timeAgo } from '@/lib/utils';

interface Vehicle {
  id: string;
  slug: string;
  make: string;
  model: string;
  variant?: string;
  year: number;
  price: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  status: string;
  availability: string;
  main_image_url?: string;
  is_featured?: boolean;
  view_count?: number;
  enquiry_count?: number;
  created_at: string;
}

interface AdminVehicleListProps {
  vehicles: Vehicle[];
  total: number;
  page: number;
  perPage: number;
  currentStatus?: string;
}

const statusColors: Record<string, string> = {
  Active: 'bg-green-950/40 text-green-400 border border-green-900/30',
  Draft: 'bg-neutral-900 text-neutral-400 border border-neutral-800',
  Reserved: 'bg-yellow-950/40 text-yellow-400 border border-yellow-900/30',
  Sold: 'bg-red-950/40 text-red-400 border border-red-900/30',
  Archived: 'bg-neutral-900 text-neutral-400 border border-neutral-800',
};

export default function AdminVehicleList({ vehicles, total, page, perPage, currentStatus }: AdminVehicleListProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  const totalPages = Math.ceil(total / perPage);

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(slug);
    try {
      const res = await fetch(`/api/vehicles/${slug}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        router.refresh();
      } else {
        alert('Failed to delete: ' + json.error);
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleStatusToggle = async (vehicle: Vehicle) => {
    const newStatus = vehicle.status === 'Active' ? 'Draft' : 'Active';
    const res = await fetch(`/api/vehicles/${vehicle.slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) router.refresh();
  };

  if (vehicles.length === 0) {
    return (
      <div className="bg-[#121215] rounded-xl border border-[#1f1f26] p-12 text-center">
        <div className="text-5xl mb-3">🚗</div>
        <h3 className="font-semibold text-lg text-white mb-1">
          {currentStatus ? `No ${currentStatus} vehicles` : 'No vehicles yet'}
        </h3>
        <p className="text-neutral-400 text-sm mb-5">
          {currentStatus ? 'Try a different status filter.' : 'Add your first vehicle to get started.'}
        </p>
        <Link href="/admin/vehicles/new" className="btn-primary text-sm py-2.5 px-6">
          Add Vehicle
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#121215] rounded-xl border border-[#1f1f26] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1f1f26] bg-[#16161a]">
                <th className="text-left px-5 py-3 text-xs font-bold text-neutral-400 uppercase tracking-wider">Vehicle</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-neutral-400 uppercase tracking-wider hidden md:table-cell">Price</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-neutral-400 uppercase tracking-wider hidden lg:table-cell">Details</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-neutral-400 uppercase tracking-wider hidden xl:table-cell">Stats</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-neutral-400 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-neutral-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f26]/60">
              {vehicles.map((vehicle) => {
                const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ''}`;
                return (
                  <tr key={vehicle.id} className="hover:bg-[#16161a]/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-10 rounded-md overflow-hidden bg-[#16161a] border border-[#1f1f26] flex-shrink-0">
                          {vehicle.main_image_url ? (
                            <Image src={vehicle.main_image_url} alt={title} fill className="object-cover" sizes="56px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xs">No img</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate max-w-[180px]">{title}</div>
                          <div className="text-xs text-neutral-500 truncate">{vehicle.slug}</div>
                          {vehicle.status === 'Sold' && (vehicle as any).sold_price && (
                            <div className="text-[10px] text-[#b48d36] font-semibold mt-0.5">
                              Sold: ₹{((vehicle as any).sold_price / 100000).toFixed(2)} Lakh
                            </div>
                          )}
                          {vehicle.status === 'Sold' && (vehicle as any).buyer_name && (
                            <div className="text-[9px] text-neutral-500">
                              Buyer: {(vehicle as any).buyer_name}
                            </div>
                          )}
                        </div>
                        {vehicle.is_featured && <Star size={13} className="text-amber-500 flex-shrink-0" />}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      {vehicle.price ? (
                        <span className="font-semibold text-white">{formatPrice(vehicle.price)}</span>
                      ) : (
                        <span className="text-neutral-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-neutral-400">
                      <div>{vehicle.fuel_type} · {vehicle.transmission}</div>
                      <div className="text-xs text-neutral-500">{formatMileage(vehicle.mileage)}</div>
                    </td>
                    <td className="px-4 py-3.5 hidden xl:table-cell text-neutral-400">
                      <div className="text-xs">{vehicle.view_count || 0} views</div>
                      <div className="text-xs">{vehicle.enquiry_count || 0} enquiries</div>
                      <div className="text-xs text-neutral-500">{timeAgo(vehicle.created_at)}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleStatusToggle(vehicle)}
                        className={`badge ${statusColors[vehicle.status] || 'bg-neutral-900 text-neutral-400'} hover:opacity-80 cursor-pointer transition-opacity`}
                        title="Click to toggle Active/Draft"
                      >
                        {vehicle.status}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/cars/${vehicle.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                          title="View on site"
                        >
                          <Eye size={15} />
                        </Link>
                        <Link
                          href={`/admin/vehicles/${vehicle.slug}/edit`}
                          className="p-1.5 rounded-md text-neutral-400 hover:text-blue-400 hover:bg-blue-950/40 transition-colors"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(vehicle.slug, title)}
                          disabled={deleting === vehicle.slug}
                          className="p-1.5 rounded-md text-neutral-400 hover:text-red-400 hover:bg-red-950/40 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#1f1f26] bg-[#16161a]/30">
            <p className="text-xs text-neutral-400">
              Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
            </p>
            <div className="flex gap-1.5">
              <Link
                href={`/admin/vehicles?page=${page - 1}${currentStatus ? `&status=${currentStatus}` : ''}`}
                className={`p-1.5 rounded-md border border-[#1f1f26] text-sm text-neutral-400 transition-colors ${page === 1 ? 'opacity-40 pointer-events-none' : 'hover:bg-[#16161a] hover:text-white'}`}
                aria-disabled={page === 1}
              >
                <ChevronLeft size={15} />
              </Link>
              <span className="px-3 py-1.5 text-xs text-neutral-400">{page} / {totalPages}</span>
              <Link
                href={`/admin/vehicles?page=${page + 1}${currentStatus ? `&status=${currentStatus}` : ''}`}
                className={`p-1.5 rounded-md border border-[#1f1f26] text-sm text-neutral-400 transition-colors ${page === totalPages ? 'opacity-40 pointer-events-none' : 'hover:bg-[#16161a] hover:text-white'}`}
                aria-disabled={page === totalPages}
              >
                <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
