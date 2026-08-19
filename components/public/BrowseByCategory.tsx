'use client';

import Link from 'next/link';

interface CategoryItem {
  name: string;
  body_type: string;
  image_url: string;
}

interface BrowseByCategoryProps {
  categories: CategoryItem[];
}

export default function BrowseByCategory({ categories }: BrowseByCategoryProps) {
  const defaultCategories: CategoryItem[] = [
    { name: 'Explore SUVs', body_type: 'SUV', image_url: '' },
    { name: 'Premium Sedans', body_type: 'Sedan', image_url: '' },
    { name: 'Luxury Collection', body_type: 'Luxury', image_url: '' }
  ];

  const displayCategories = categories && categories.length > 0 ? categories : defaultCategories;

  return (
    <section className="py-12 bg-neutral-950 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="h-[1px] w-8 bg-amber-500/50" />
            <span className="text-amber-500 text-xs font-bold tracking-widest uppercase">Explore</span>
            <span className="h-[1px] w-8 bg-amber-500/50" />
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">Browse By Category</h2>
        </div>

        {/* Scrollable Container */}
        <div className="flex overflow-x-auto gap-6 sm:gap-8 lg:gap-12 pb-8 px-4 -mx-4 sm:mx-0 sm:px-0 sm:justify-center snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {displayCategories.map((cat, idx) => (
            <Link 
              key={idx} 
              href={`/cars?body_type=${encodeURIComponent(cat.body_type)}`}
              className="flex flex-col items-center gap-4 group flex-shrink-0 snap-center"
            >
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full p-[3px] bg-gradient-to-b from-neutral-800 to-neutral-900 group-hover:from-amber-500 group-hover:to-amber-900 transition-all duration-500 shadow-2xl group-hover:shadow-[0_0_30px_rgba(180,141,54,0.3)]">
                <div className="w-full h-full rounded-full overflow-hidden bg-neutral-950 relative">
                  {cat.image_url ? (
                    <img 
                      src={cat.image_url} 
                      alt={cat.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-neutral-600 text-xs font-bold uppercase tracking-widest">
                      {cat.body_type}
                    </div>
                  )}
                  {/* Inner overlay for depth */}
                  <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] pointer-events-none" />
                </div>
              </div>
              
              <div className="text-center transition-transform duration-300 group-hover:-translate-y-1">
                <h3 className="text-white font-bold text-sm sm:text-base tracking-wide group-hover:text-amber-500 transition-colors">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
