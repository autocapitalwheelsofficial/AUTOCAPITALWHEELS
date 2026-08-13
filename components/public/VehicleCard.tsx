'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye, Fuel, Gauge } from 'lucide-react';
import { Vehicle } from '@/types';
import { formatPrice, formatMileage, getVehicleTitle } from '@/lib/utils';

interface VehicleCardProps {
  vehicle: Vehicle;
  onWishlistToggle?: (vehicleId: string) => void;
  isWishlisted?: boolean;
  variant?: 'grid' | 'list';
}

export default function VehicleCard({
  vehicle,
  onWishlistToggle,
  isWishlisted = false,
  variant = 'grid',
}: VehicleCardProps) {
  const router = useRouter();
  const title = getVehicleTitle(vehicle);
  const isSold = vehicle.status === 'Sold' || vehicle.availability === 'Sold';
  const imageUrl = vehicle.main_image_url || '/placeholder-car.jpg';

  if (variant === 'list') {
    return (
      <div
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;
          router.push(`/cars/${vehicle.slug}`);
        }}
        className={`group flex gap-0 overflow-hidden rounded-2xl bg-[#121215] border border-[#1f1f26] hover:border-[#b48d36]/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 cursor-pointer ${isSold ? 'opacity-70' : ''}`}
      >
        {/* Image */}
        <div className="relative flex-shrink-0 w-52 h-36 overflow-hidden bg-[#16161a]">
          <Image src={imageUrl} alt={title} fill sizes="208px" className="object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          {isSold && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="badge badge-sold text-xs">SOLD</span>
            </div>
          )}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {vehicle.is_featured    && <span className="badge badge-featured">★ Featured</span>}
            {vehicle.is_new_arrival && <span className="badge badge-new">New Arrival</span>}
            {vehicle.is_hot_deal   && <span className="badge badge-hot">🔥 Hot Deal</span>}
            {vehicle.is_price_drop && <span className="badge badge-price-drop">↓ Price Drop</span>}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between p-4 bg-[#121215]">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <Link href={`/cars/${vehicle.slug}`} className="hover:opacity-80 transition-opacity">
                <h3 className="font-display font-bold text-base text-white leading-snug">{title}</h3>
              </Link>
              {onWishlistToggle && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWishlistToggle(vehicle.id); }}
                  className={`flex-shrink-0 p-1.5 rounded-full transition-all duration-200 cursor-pointer ${isWishlisted ? 'bg-red-950/40' : 'hover:bg-white/5'}`}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart size={14} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-500 hover:text-red-400'} />
                </button>
              )}
            </div>
            <p className="text-[10px] tracking-widest uppercase font-semibold text-neutral-500">
              {vehicle.year} &bull; {vehicle.fuel_type} &bull; {vehicle.transmission} &bull; {formatMileage(vehicle.mileage)}
            </p>
          </div>
          <div className="flex items-end justify-between border-t border-[#1f1f26] pt-3 mt-3">
            <span className="font-display font-bold text-base text-white">{formatPrice(vehicle.price)}</span>
            <Link href={`/cars/${vehicle.slug}`} className="text-[10px] font-bold tracking-widest text-[#b48d36] uppercase hover:opacity-75 transition-opacity">
              View Details →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;
        router.push(`/cars/${vehicle.slug}`);
      }}
      className={`group relative flex flex-col rounded-2xl overflow-hidden bg-[#121215] border border-[#1f1f26] hover:border-[#b48d36]/35 shadow-[0_2px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.5),0_0_0_1px_rgba(180,141,54,0.06)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer ${isSold ? 'opacity-75' : ''}`}
    >

      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-[#16161a] flex-shrink-0">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Subtle dark gradient at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121215]/60 via-transparent to-transparent" />

        {/* Sold overlay */}
        {isSold && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center backdrop-blur-[1px]">
            <span className="badge badge-sold px-3 py-1 text-xs tracking-widest">SOLD</span>
          </div>
        )}

        {/* Wishlist button */}
        {onWishlistToggle && !isSold && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWishlistToggle(vehicle.id); }}
            className={`absolute top-3 right-3 p-1.5 rounded-full transition-all duration-200 z-10 cursor-pointer shadow-md ${
              isWishlisted
                ? 'bg-red-950/70 border border-red-800/50'
                : 'bg-black/50 border border-white/10 hover:bg-black/70 hover:border-white/20'
            }`}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={13}
              className={`transition-all duration-200 ${isWishlisted ? 'fill-red-500 text-red-500 scale-110' : 'text-white/70 hover:text-red-400'}`}
            />
          </button>
        )}

        {/* Quick view on hover */}
        {!isSold && (
          <Link
            href={`/cars/${vehicle.slug}`}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[5]"
            aria-label={`Quick view ${title}`}
          >
            <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold tracking-widest uppercase px-3 py-2 rounded-lg border border-white/10">
              <Eye size={11} />
              Quick View
            </span>
          </Link>
        )}

        {/* Marketing badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {vehicle.is_featured    && <span className="badge badge-featured">★ Featured</span>}
          {vehicle.is_new_arrival && <span className="badge badge-new">✦ New Arrival</span>}
          {vehicle.is_hot_deal   && <span className="badge badge-hot">🔥 Hot Deal</span>}
          {vehicle.is_price_drop && <span className="badge badge-price-drop">↓ Price Drop</span>}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-[#121215]">
        <div>
          {/* Metadata chips */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase text-neutral-500">
              {vehicle.year}
            </span>
            {vehicle.fuel_type && (
              <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-neutral-500">
                <Fuel size={9} />
                {vehicle.fuel_type}
              </span>
            )}
            {vehicle.mileage && (
              <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-neutral-500">
                <Gauge size={9} />
                {formatMileage(vehicle.mileage)}
              </span>
            )}
          </div>

          <Link href={`/cars/${vehicle.slug}`} className="block group/title">
            <h3 className="font-display font-bold text-sm text-white tracking-tight leading-tight group-hover/title:text-[#b48d36] transition-colors duration-200">
              {vehicle.make} {vehicle.model}
            </h3>
            {vehicle.variant && (
              <p className="text-[10px] text-neutral-500 mt-0.5 font-medium">{vehicle.variant}</p>
            )}
          </Link>
        </div>

        {/* Price & Action */}
        <div className="border-t border-[#1f1f26] mt-3.5 pt-3 flex items-center justify-between gap-2">
          <div>
            <span className="font-display font-bold text-sm text-white">{formatPrice(vehicle.price)}</span>
            {vehicle.is_price_drop && vehicle.original_price && (
              <span className="block text-[10px] text-neutral-500 line-through">{formatPrice(vehicle.original_price)}</span>
            )}
          </div>
          <Link
            href={`/cars/${vehicle.slug}`}
            className="flex-shrink-0 text-[9px] font-bold tracking-widest text-[#b48d36] uppercase hover:text-[#d4a94e] transition-colors duration-200 flex items-center gap-1"
          >
            Details
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
