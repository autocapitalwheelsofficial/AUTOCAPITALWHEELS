'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, Loader2, ChevronDown, Check } from 'lucide-react';
import type { Vehicle } from '@/types';

export default function QuickSearch() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  
  // Custom Dropdowns open state: 'make' | 'model' | 'year' | 'price' | null
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState({
    query: '',
    make: '',
    model: '',
    year: '',
    max_price: '',
  });

  // Autocomplete suggestions
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Vehicle[]>([]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch active stock to build dropdown options
  useEffect(() => {
    setLoading(true);
    fetch('/api/vehicles?per_page=100')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const list: Vehicle[] = json.data;
          setVehicles(list);
          const activeMakes = Array.from(new Set(list.map((v) => v.make))).sort();
          setMakes(activeMakes);
        }
      })
      .catch((err) => console.error('Error loading search criteria:', err))
      .finally(() => setLoading(false));
  }, []);

  // Update models dynamically based on selected brand
  useEffect(() => {
    if (!filters.make) {
      setModels([]);
      setFilters((p) => ({ ...p, model: '' }));
      return;
    }
    const filteredModels = Array.from(
      new Set(
        vehicles
          .filter((v) => v.make === filters.make)
          .map((v) => v.model)
      )
    ).sort();
    setModels(filteredModels);
    setFilters((p) => ({ ...p, model: '' }));
  }, [filters.make, vehicles]);

  const handleQueryChange = (val: string) => {
    setFilters((p) => ({ ...p, query: val }));
    if (!val.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const queryLower = val.toLowerCase();
    const matches = vehicles.filter(
      (v) =>
        v.make.toLowerCase().includes(queryLower) ||
        v.model.toLowerCase().includes(queryLower) ||
        v.year.toString().includes(queryLower) ||
        (v.variant && v.variant.toLowerCase().includes(queryLower))
    );
    setSuggestions(matches.slice(0, 5));
    setShowSuggestions(true);
  };

  const toggleDropdown = (key: string) => {
    setActiveDropdown(activeDropdown === key ? null : key);
  };

  const selectOption = (key: string, val: string) => {
    setFilters((p) => ({ ...p, [key]: val }));
    setActiveDropdown(null);
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (filters.query) params.set('search', filters.query);
    if (filters.make) params.set('make', filters.make);
    if (filters.model) params.set('model', filters.model);
    if (filters.year) params.set('year', filters.year);
    if (filters.max_price) params.set('max_price', filters.max_price);
    
    router.push(`/cars?${params.toString()}`);
  };

  const formatLakh = (valStr: string) => {
    if (!valStr) return 'Any Price';
    const num = parseInt(valStr);
    return `Under ₹${num / 100000} Lakh`;
  };

  return (
    <section className="relative z-20 mt-6 lg:-mt-14 pb-8 bg-[var(--color-bg-base)]" ref={dropdownRef}>
      <div className="container-custom">
        <div className="bg-[var(--color-bg-card)] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[var(--color-border)] p-6 lg:p-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
              
              {/* Autocomplete Search input */}
              <div className="relative">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Search Car</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type brand, model..."
                    className="w-full text-xs font-semibold px-4 py-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-amber-500 pr-10 transition-all duration-300 text-neutral-800"
                    style={{ color: '#1a1a1a !important', backgroundColor: '#ffffff', caretColor: '#1a1a1a' }}
                    value={filters.query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                  />
                  <Search size={14} className="absolute right-3.5 top-3.5 text-neutral-400" />
                </div>

                {/* Autocomplete Suggestions Box */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in py-1">
                    <p className="px-4 py-2 text-[9px] font-bold text-neutral-500 uppercase tracking-wider border-b border-[var(--color-border)]">Matching Vehicles</p>
                    {suggestions.map((car) => (
                      <div
                        key={car.id}
                        onClick={() => {
                          router.push(`/cars/${car.slug}`);
                          setShowSuggestions(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#b48d36]/10 cursor-pointer transition-colors duration-200"
                      >
                        <img
                          src={car.main_image_url || '/logo.png'}
                          alt={car.model}
                          className="w-10 h-7 object-cover rounded bg-[var(--color-bg-input)] border border-[var(--color-border)]"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="block text-xs font-bold text-[var(--color-text-primary)] truncate">{car.make} {car.model}</span>
                          <span className="block text-[10px] text-neutral-400 truncate">{car.variant} • {car.year}</span>
                        </div>
                        <span className="text-xs font-bold text-[#b48d36] shrink-0">₹{(car.price / 100000).toFixed(2)} Lakh</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Brand Dropdown */}
              <div className="relative">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Brand</label>
                <button
                  type="button"
                  onClick={() => toggleDropdown('make')}
                  className="w-full flex items-center justify-between text-xs font-semibold px-4 py-3 bg-white border border-[var(--color-border)] rounded-lg hover:border-amber-500/50 text-[var(--color-text-primary)] transition-all duration-300 text-left cursor-pointer"
                >
                  <span className="truncate">{filters.make || 'All Brands'}</span>
                  <ChevronDown size={14} className={`text-neutral-400 transition-transform duration-300 ${activeDropdown === 'make' ? 'rotate-185' : ''}`} />
                </button>

                {activeDropdown === 'make' && (
                  <div className="absolute left-0 right-0 mt-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 py-1.5 animate-fade-in scrollbar-thin">
                    <div
                      onClick={() => selectOption('make', '')}
                      className="flex items-center justify-between px-4 py-2 hover:bg-[#b48d36]/10 text-xs font-semibold text-[var(--color-text-primary)] cursor-pointer transition-all"
                    >
                      <span>All Brands</span>
                      {!filters.make && <Check size={12} className="text-[#b48d36]" />}
                    </div>
                    {makes.map((make) => (
                      <div
                        key={make}
                        onClick={() => selectOption('make', make)}
                        className="flex items-center justify-between px-4 py-2 hover:bg-[#b48d36]/10 text-xs font-semibold text-[var(--color-text-primary)] cursor-pointer transition-all"
                      >
                        <span>{make}</span>
                        {filters.make === make && <Check size={12} className="text-[#b48d36]" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Model Dropdown */}
              <div className="relative">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Model</label>
                <button
                  type="button"
                  onClick={() => toggleDropdown('model')}
                  className="w-full flex items-center justify-between text-xs font-semibold px-4 py-3 bg-white border border-[var(--color-border)] rounded-lg hover:border-amber-500/50 text-[var(--color-text-primary)] transition-all duration-300 text-left cursor-pointer"
                >
                  <span className="truncate">{filters.model || 'All Models'}</span>
                  <ChevronDown size={14} className={`text-neutral-400 transition-transform duration-300 ${activeDropdown === 'model' ? 'rotate-185' : ''}`} />
                </button>

                {activeDropdown === 'model' && (
                  <div className="absolute left-0 right-0 mt-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 py-1.5 animate-fade-in scrollbar-thin">
                    <div
                      onClick={() => selectOption('model', '')}
                      className="flex items-center justify-between px-4 py-2 hover:bg-[#b48d36]/10 text-xs font-semibold text-[var(--color-text-primary)] cursor-pointer transition-all"
                    >
                      <span>All Models</span>
                      {!filters.model && <Check size={12} className="text-[#b48d36]" />}
                    </div>
                    {models.map((model) => (
                      <div
                        key={model}
                        onClick={() => selectOption('model', model)}
                        className="flex items-center justify-between px-4 py-2 hover:bg-[#b48d36]/10 text-xs font-semibold text-[var(--color-text-primary)] cursor-pointer transition-all"
                      >
                        <span>{model}</span>
                        {filters.model === model && <Check size={12} className="text-[#b48d36]" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Year Dropdown */}
              <div className="relative">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Year</label>
                <button
                  type="button"
                  onClick={() => toggleDropdown('year')}
                  className="w-full flex items-center justify-between text-xs font-semibold px-4 py-3 bg-white border border-[var(--color-border)] rounded-lg hover:border-amber-500/50 text-[var(--color-text-primary)] transition-all duration-300 text-left cursor-pointer"
                >
                  <span className="truncate">{filters.year ? `${filters.year} & Above` : 'Any Year'}</span>
                  <ChevronDown size={14} className={`text-neutral-400 transition-transform duration-300 ${activeDropdown === 'year' ? 'rotate-185' : ''}`} />
                </button>

                {activeDropdown === 'year' && (
                  <div className="absolute left-0 right-0 mt-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 py-1.5 animate-fade-in scrollbar-thin">
                    <div
                      onClick={() => selectOption('year', '')}
                      className="flex items-center justify-between px-4 py-2 hover:bg-[#b48d36]/10 text-xs font-semibold text-[var(--color-text-primary)] cursor-pointer transition-all"
                    >
                      <span>Any Year</span>
                      {!filters.year && <Check size={12} className="text-[#b48d36]" />}
                    </div>
                    {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map((y) => (
                      <div
                        key={y}
                        onClick={() => selectOption('year', y.toString())}
                        className="flex items-center justify-between px-4 py-2 hover:bg-[#b48d36]/10 text-xs font-semibold text-[var(--color-text-primary)] cursor-pointer transition-all"
                      >
                        <span>{y} & Above</span>
                        {filters.year === y.toString() && <Check size={12} className="text-[#b48d36]" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Price Dropdown */}
              <div className="relative">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Price Range</label>
                <button
                  type="button"
                  onClick={() => toggleDropdown('price')}
                  className="w-full flex items-center justify-between text-xs font-semibold px-4 py-3 bg-white border border-[var(--color-border)] rounded-lg hover:border-amber-500/50 text-[var(--color-text-primary)] transition-all duration-300 text-left cursor-pointer"
                >
                  <span className="truncate">{formatLakh(filters.max_price)}</span>
                  <ChevronDown size={14} className={`text-neutral-400 transition-transform duration-300 ${activeDropdown === 'price' ? 'rotate-185' : ''}`} />
                </button>

                {activeDropdown === 'price' && (
                  <div className="absolute left-0 right-0 mt-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 py-1.5 animate-fade-in scrollbar-thin">
                    <div
                      onClick={() => selectOption('max_price', '')}
                      className="flex items-center justify-between px-4 py-2 hover:bg-[#b48d36]/10 text-xs font-semibold text-[var(--color-text-primary)] cursor-pointer transition-all"
                    >
                      <span>Any Price</span>
                      {!filters.max_price && <Check size={12} className="text-[#b48d36]" />}
                    </div>
                    {[300000, 500000, 800000, 1200000, 2000000].map((p) => (
                      <div
                        key={p}
                        onClick={() => selectOption('max_price', p.toString())}
                        className="flex items-center justify-between px-4 py-2 hover:bg-[#b48d36]/10 text-xs font-semibold text-[var(--color-text-primary)] cursor-pointer transition-all"
                      >
                        <span>{formatLakh(p.toString())}</span>
                        {filters.max_price === p.toString() && <Check size={12} className="text-[#b48d36]" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Button */}
              <div>
                <button
                  type="button"
                  onClick={() => handleSearch()}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#b48d36] hover:bg-[#9a845a] text-white font-bold h-[42px] rounded-lg text-xs uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 cursor-pointer"
                >
                  <Search size={14} />
                  Search Cars
                </button>
              </div>

            </div>

            {/* Bottom filter toggle row */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => router.push('/cars')}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-neutral-500 hover:text-[#b48d36] transition-colors uppercase tracking-wider cursor-pointer"
              >
                <SlidersHorizontal size={12} className="text-amber-500" />
                More Filters
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
