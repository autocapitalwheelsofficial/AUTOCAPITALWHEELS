'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

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
    <section className="py-10 bg-white overflow-hidden relative">
      <div className="container-custom relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="h-[1px] w-8 bg-amber-500/50" />
            <span className="text-amber-500 text-xs font-bold tracking-widest uppercase">Explore</span>
            <span className="h-[1px] w-8 bg-amber-500/50" />
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-neutral-800">Browse By Category</h2>
        </motion.div>

        {/* Scrollable Container */}
        <div className="flex overflow-x-auto gap-6 sm:gap-8 lg:gap-12 pb-8 px-4 -mx-4 sm:mx-0 sm:px-0 sm:justify-center snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {displayCategories.map((cat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.25, 1, 0.5, 1] }}
              className="flex-shrink-0 snap-center"
            >
              <Link 
                href={`/cars?body_type=${encodeURIComponent(cat.body_type)}`}
                className="flex flex-col items-center gap-4 group"
              >
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full p-[3px] bg-gradient-to-b from-neutral-200 to-neutral-300 group-hover:from-amber-500 group-hover:to-amber-600 transition-all duration-500 shadow-md group-hover:shadow-[0_0_35px_rgba(180,141,54,0.25)]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white relative">
                    {cat.image_url ? (
                      <img 
                        src={cat.image_url} 
                        alt={cat.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-500 text-xs font-bold uppercase tracking-widest">
                        {cat.body_type}
                      </div>
                    )}
                    {/* Inner overlay for depth */}
                    <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] pointer-events-none" />
                  </div>
                </div>
                
                <div className="text-center transition-transform duration-300 group-hover:-translate-y-1">
                  <h3 className="font-bold text-sm sm:text-base tracking-wide transition-colors" style={{ color: '#4b5563' }}>
                    {cat.name}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
