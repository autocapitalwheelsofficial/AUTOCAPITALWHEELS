'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HeaderSearch({ isDarkHeader }: { isDarkHeader?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/vehicles?search=${encodeURIComponent(query)}&per_page=5`);
        const json = await res.json();
        if (json.success) {
          setResults(json.data || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      setIsOpen(false);
      router.push(`/cars?search=${encodeURIComponent(query)}`);
    }
  };

  const handleResultClick = () => {
    setIsOpen(false);
  };

  const iconColor = isDarkHeader ? 'text-white' : 'text-neutral-600';

  return (
    <div className="relative" ref={searchRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-lg transition-all duration-200 hover:bg-white/10 active:scale-95 group cursor-pointer"
        aria-label="Search"
      >
        {isOpen ? (
          <X size={20} className={iconColor} />
        ) : (
          <Search size={20} className={iconColor} />
        )}
      </button>

      {/* Search Dropdown / Overlay */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-[calc(100vw-2rem)] sm:w-[400px] bg-[#121215] border border-neutral-800 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in-scale z-50">
          
          <div className="p-3 border-b border-neutral-800 relative">
            <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search make, model, or type..."
              className="w-full bg-[#1c1c21] text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-neutral-600"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-neutral-800 [&::-webkit-scrollbar-track]:bg-transparent p-2">
            
            {loading && (
              <div className="flex items-center justify-center p-6 text-neutral-500">
                <Loader2 size={16} className="animate-spin mr-2" />
                <span className="text-xs">Searching inventory...</span>
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="p-6 text-center text-neutral-500 text-xs">
                No vehicles found for "<span className="text-white">{query}</span>"
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="flex flex-col gap-1">
                <div className="px-3 pb-1 pt-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  Suggestions
                </div>
                {results.map((car) => (
                  <Link
                    key={car.id}
                    href={`/cars/${car.slug}`}
                    onClick={handleResultClick}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-800/50 transition-colors group"
                  >
                    <div className="w-16 h-12 rounded-lg bg-neutral-900 overflow-hidden flex-shrink-0 relative border border-neutral-800/50">
                      <img 
                        src={car.main_image_url || '/placeholder_car.jpg'} 
                        alt={car.model} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-500 transition-colors">
                        {car.year} {car.make} {car.model}
                      </h4>
                      <p className="text-[10px] text-neutral-500 truncate">
                        {car.variant} • {car.fuel_type} • {car.transmission}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 pl-2">
                      <p className="text-xs font-bold text-[#b48d36]">
                        ₹{car.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </Link>
                ))}
                <Link
                  href={`/cars?search=${encodeURIComponent(query)}`}
                  onClick={handleResultClick}
                  className="mt-2 block w-full text-center py-2.5 text-xs font-bold text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                >
                  View all results for "{query}"
                </Link>
              </div>
            )}

            {!query && !loading && (
              <div className="p-4">
                <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 px-2">Popular Searches</div>
                <div className="flex flex-wrap gap-2">
                  {['SUV', 'Sedan', 'Toyota', 'Mahindra', 'Luxury'].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setQuery(term);
                        inputRef.current?.focus();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] text-neutral-300 transition-colors cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
