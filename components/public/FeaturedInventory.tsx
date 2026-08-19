'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useWishlist } from '@/lib/hooks/useWishlist';
import VehicleCard from './VehicleCard';
import type { Vehicle } from '@/types';

interface FeaturedInventoryProps {
  vehicles: Vehicle[];
}

export default function FeaturedInventory({ vehicles }: FeaturedInventoryProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();

  if (vehicles.length === 0) return null;

  return (
    <section className="py-8 bg-[#faf9f6]/30">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="divider" />
            <p className="section-label mb-2">Our Inventory</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-neutral-900">Featured Cars</h2>
          </div>
          <Link
            href="/cars"
            className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900 group transition-colors"
          >
            View All Cars
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid / Carousel */}
        <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 snap-x snap-mandatory pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="min-w-[85vw] sm:min-w-0 snap-center">
              <VehicleCard
                vehicle={vehicle}
                isWishlisted={isWishlisted(vehicle.id)}
                onWishlistToggle={toggleWishlist}
              />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link href="/cars" className="btn-secondary px-8 py-3">
            See All Available Cars
          </Link>
        </div>
      </div>
    </section>
  );
}
