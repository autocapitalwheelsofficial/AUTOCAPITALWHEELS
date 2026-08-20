'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useWishlist } from '@/lib/hooks/useWishlist';
import VehicleCard from './VehicleCard';
import type { Vehicle } from '@/types';
import { motion } from 'framer-motion';

interface FeaturedInventoryProps {
  vehicles: Vehicle[];
}

export default function FeaturedInventory({ vehicles }: FeaturedInventoryProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();

  if (vehicles.length === 0) return null;

  return (
    <section className="py-12 bg-transparent">
      <div className="container-custom">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
        >
          <div>
            <div className="divider" />
            <p className="section-label mb-2">Our Inventory</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-neutral-800">Featured Cars</h2>
          </div>
          <Link
            href="/cars"
            className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-[#b48d36] group transition-colors"
            style={{ color: '#4a5568' }}
          >
            View All Cars
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-[#b48d36]" />
          </Link>
        </motion.div>

        {/* Grid / Carousel */}
        <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 snap-x snap-mandatory pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {vehicles.map((vehicle, idx) => (
            <motion.div 
              key={vehicle.id} 
              className="min-w-[85vw] sm:min-w-0 snap-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.25, 1, 0.5, 1] }}
            >
              <VehicleCard
                vehicle={vehicle}
                isWishlisted={isWishlisted(vehicle.id)}
                onWishlistToggle={toggleWishlist}
              />
            </motion.div>
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
