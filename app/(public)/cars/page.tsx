import type { Metadata } from 'next';
import { Suspense } from 'react';
import InventoryClient from '@/components/public/InventoryClient';


export const metadata: Metadata = {
  title: 'Buy Cars — Explore Our Pre-Owned Inventory',
  description: 'Browse AutoCapital Wheels\' curated inventory of quality pre-owned cars in Delhi. Filter by make, model, price, fuel type, and more.',
};

export default function CarsPage() {
  return (
    <div className="pt-16">
      <Suspense fallback={<InventorySkeleton />}>
        <InventoryClient />
      </Suspense>
    </div>
  );
}

function InventorySkeleton() {
  return (
    <div className="container-custom py-10">
      <div className="skeleton h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 overflow-hidden">
            <div className="skeleton h-48 w-full" />
            <div className="p-4 space-y-2">
              <div className="skeleton h-5 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-8 w-full mt-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
