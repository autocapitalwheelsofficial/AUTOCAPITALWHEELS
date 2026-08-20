'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { SlidersHorizontal, LayoutGrid, List, X, ChevronDown, Search, Check } from 'lucide-react';
import VehicleCard from './VehicleCard';
import type { Vehicle, VehicleSortOption } from '@/types';
import { CAR_MAKES, FUEL_TYPES, TRANSMISSION_TYPES, BODY_TYPES, VEHICLE_CATEGORIES, SORT_OPTIONS } from '@/lib/constants';

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface Filters {
  search: string;
  make: string;
  fuel_type: string;
  transmission: string;
  body_type: string;
  vehicle_category: string;
  min_price: string;
  max_price: string;
  min_year: string;
  max_year: string;
  availability: string;
}

const defaultFilters: Filters = {
  search: '',
  make: '',
  fuel_type: '',
  transmission: '',
  body_type: '',
  vehicle_category: '',
  min_price: '',
  max_price: '',
  min_year: '',
  max_year: '',
  availability: '',
};

// Debounced input wrapper to prevent parent layout re-rendering & jittering on every keyboard press
function BudgetInput({ placeholder, value, onChange, min, max }: { placeholder: string; value: string; onChange: (v: string) => void; min?: string; max?: number }) {
  const [localVal, setLocalVal] = useState(value);
  
  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localVal !== value) {
        onChange(localVal);
      }
    }, 1200);
    return () => clearTimeout(handler);
  }, [localVal, value, onChange]);

  return (
    <input
      type="number"
      placeholder={placeholder}
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      min={min}
      max={max}
      className="w-full text-sm border border-neutral-200 rounded-lg py-2.5 px-3 focus:outline-none focus:border-[#b48d36] transition-all"
      style={{ color: '#000000', backgroundColor: '#f8f9fa', caretColor: '#000000' }}
    />
  );
}

// ─── FilterPanel (MUST be outside InventoryClient so React doesn't remount inputs) ──
interface FilterPanelProps {
  filters: Filters;
  availableMakes: string[];
  activeFilterCount: number;
  openMakeDropdown: boolean;
  setOpenMakeDropdown: (v: boolean) => void;
  updateFilter: (key: keyof Filters, value: string) => void;
  clearFilters: () => void;
}

function FilterPanel({
  filters, availableMakes, activeFilterCount,
  openMakeDropdown, setOpenMakeDropdown,
  updateFilter, clearFilters,
}: FilterPanelProps) {
  const currentYear = new Date().getFullYear();
  
  // Local state for search input to prevent re-rendering page on every single character keystroke
  const [localSearch, setLocalSearch] = useState(filters.search);
  
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (localSearch !== filters.search) {
        updateFilter('search', localSearch);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [localSearch, filters.search, updateFilter]);

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="pb-4 border-b border-neutral-200">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search make, model..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full text-sm border border-neutral-200 rounded-lg py-2.5 pl-9 pr-3 focus:outline-none focus:border-[#b48d36] transition-all text-black"
            style={{ color: '#000000', backgroundColor: '#ffffff', caretColor: '#000000' }}
            id="inventory-search"
          />
        </div>
      </div>

      {/* Make */}
      <div className="relative">
        <p className="filter-section-title">Make</p>
        <button
          type="button"
          onClick={() => setOpenMakeDropdown(!openMakeDropdown)}
          className="w-full flex items-center justify-between text-xs font-semibold px-4 py-3 bg-white border border-neutral-200 rounded-lg hover:border-[#b48d36]/50 text-neutral-700 transition-all duration-300 text-left cursor-pointer"
          id="filter-make-btn"
        >
          <span className="truncate">{filters.make || 'All Makes'}</span>
          <ChevronDown size={14} className={`text-neutral-400 transition-transform duration-300 ${openMakeDropdown ? 'rotate-180' : ''}`} />
        </button>

        {openMakeDropdown && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50 py-1.5 animate-fade-in">
            <div
              onClick={() => { updateFilter('make', ''); setOpenMakeDropdown(false); }}
              className="flex items-center justify-between px-4 py-2 hover:bg-[#b48d36]/5 text-xs font-semibold text-neutral-700 cursor-pointer transition-all"
            >
              <span>All Makes</span>
              {!filters.make && <Check size={12} className="text-[#b48d36]" />}
            </div>
            {availableMakes.map((make) => (
              <div
                key={make}
                onClick={() => { updateFilter('make', make); setOpenMakeDropdown(false); }}
                className="flex items-center justify-between px-4 py-2 hover:bg-[#b48d36]/5 text-xs font-semibold text-neutral-700 cursor-pointer transition-all"
              >
                <span>{make}</span>
                {filters.make === make && <Check size={12} className="text-[#b48d36]" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Body Type */}
      <div>
        <p className="filter-section-title">Body Type</p>
        <div className="flex flex-wrap gap-2">
          {BODY_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => updateFilter('body_type', filters.body_type === type ? '' : type)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 cursor-pointer ${
                filters.body_type === type
                  ? 'border-[#b48d36] bg-[#b48d36]/10 text-[#b48d36]'
                  : 'border-neutral-200 text-neutral-600 bg-white hover:border-[#b48d36]/40'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Fuel */}
      <div>
        <p className="filter-section-title">Fuel Type</p>
        <div className="flex flex-wrap gap-2">
          {FUEL_TYPES.map((fuel) => (
            <button
              key={fuel}
              onClick={() => updateFilter('fuel_type', filters.fuel_type === fuel ? '' : fuel)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 cursor-pointer ${
                filters.fuel_type === fuel
                  ? 'border-[#b48d36] bg-[#b48d36]/10 text-[#b48d36]'
                  : 'border-neutral-200 text-neutral-600 bg-white hover:border-[#b48d36]/40'
              }`}
            >
              {fuel}
            </button>
          ))}
        </div>
      </div>

      {/* Transmission */}
      <div>
        <p className="filter-section-title">Transmission</p>
        <div className="flex flex-wrap gap-2">
          {TRANSMISSION_TYPES.map((trans) => (
            <button
              key={trans}
              onClick={() => updateFilter('transmission', filters.transmission === trans ? '' : trans)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 cursor-pointer ${
                filters.transmission === trans
                  ? 'border-[#b48d36] bg-[#b48d36]/10 text-[#b48d36]'
                  : 'border-neutral-200 text-neutral-600 bg-white hover:border-[#b48d36]/40'
              }`}
            >
              {trans}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <p className="filter-section-title">Budget</p>
        <div className="flex gap-2">
          <BudgetInput
            placeholder="Min ₹"
            value={filters.min_price}
            onChange={(val) => updateFilter('min_price', val)}
          />
          <BudgetInput
            placeholder="Max ₹"
            value={filters.max_price}
            onChange={(val) => updateFilter('max_price', val)}
          />
        </div>
      </div>

      {/* Year Range */}
      <div>
        <p className="filter-section-title">Year</p>
        <div className="flex gap-2">
          <BudgetInput
            placeholder="From"
            value={filters.min_year}
            onChange={(val) => updateFilter('min_year', val)}
            min="1990"
            max={currentYear}
          />
          <BudgetInput
            placeholder="To"
            value={filters.max_year}
            onChange={(val) => updateFilter('max_year', val)}
            min="1990"
            max={currentYear}
          />
        </div>
      </div>

      {/* Availability */}
      <div>
        <p className="filter-section-title">Availability</p>
        <div className="flex gap-2">
          {['Available', 'Reserved'].map((avail) => (
            <button
              key={avail}
              onClick={() => updateFilter('availability', filters.availability === avail ? '' : avail)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 cursor-pointer ${
                filters.availability === avail
                  ? 'border-[#b48d36] bg-[#b48d36]/10 text-[#b48d36]'
                  : 'border-neutral-200 text-neutral-600 bg-white hover:border-[#b48d36]/40'
              }`}
            >
              {avail}
            </button>
          ))}
        </div>
      </div>

      {/* Clear */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="w-full mt-2 text-sm text-red-500 hover:text-red-600 font-medium py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          Clear All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  );
}

// (Interfaces and FilterPanel component moved above for stable React identity)

export default function InventoryClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<VehicleSortOption>('recommended');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<Filters>(() => ({
    ...defaultFilters,
    search: searchParams.get('search') || '',
    make: searchParams.get('make') || '',
    fuel_type: searchParams.get('fuel_type') || '',
    transmission: searchParams.get('transmission') || '',
    body_type: searchParams.get('body_type') || '',
    vehicle_category: searchParams.get('vehicle_category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    min_year: searchParams.get('min_year') || '',
    max_year: searchParams.get('max_year') || '',
    availability: searchParams.get('availability') || '',
  }));

  const [availableMakes, setAvailableMakes] = useState<string[]>([]);
  const [recommended, setRecommended] = useState<Vehicle[]>([]);
  const [openMakeDropdown, setOpenMakeDropdown] = useState(false);
  const [openSortDropdown, setOpenSortDropdown] = useState(false);

  useEffect(() => {
    fetch('/api/vehicles?per_page=100')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const uniqueMakes = Array.from(new Set(json.data.map((v: any) => v.make))).sort();
          setAvailableMakes(uniqueMakes as string[]);
        }
      })
      .catch((err) => console.error('Error fetching inventory makes:', err));
  }, []);

  useEffect(() => {
    if (vehicles.length === 0 && !loading) {
      fetch('/api/vehicles?per_page=3')
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setRecommended(json.data);
          }
        })
        .catch((err) => console.error('Error loading fallback recommendations:', err));
    }
  }, [vehicles, loading]);

  const { isWishlisted, toggleWishlist } = useWishlist();

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const fetchVehicles = useCallback(async (currentFilters: Filters, currentPage: number, currentSort: VehicleSortOption) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('per_page', '12');
      params.set('sort', currentSort);
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      const res = await fetch(`/api/vehicles?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setVehicles(json.data || []);
        setTotal(json.total || 0);
        setTotalPages(json.total_pages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles(filters, page, sort);
  }, [filters, page, sort, fetchVehicles]);


  const updateFilter = useCallback((key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
    setPage(1);
  }, []);


  // FilterPanel is extracted outside this component (above) to preserve stable identity.
  // This prevents React from remounting inputs on every keystroke.


  return (
    <div className="min-h-screen bg-[var(--color-bg-base)]">
      {/* Page Header */}
      <div className="bg-[var(--color-bg-card)] border-b border-[var(--color-border)] py-8 px-4">
        <div className="container-custom">
          <h1 className="font-display font-black text-3xl text-[var(--color-text-primary)]">
            {filters.body_type ? `${filters.body_type} Collection` : 'Find Your Next Car'}
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm font-light mt-1">
            {filters.body_type
              ? `Showing all available ${filters.body_type} vehicles`
              : 'Browse our curated selection of quality pre-owned vehicles'}
          </p>
        </div>
      </div>

      <div className="container-custom py-6">
        <div className="flex gap-6">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-neutral-200 p-5 sticky top-20 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-base text-neutral-800">Filters</h2>
                {activeFilterCount > 0 && (
                  <span className="text-xs bg-[#b48d36] text-white font-semibold px-2 py-0.5 rounded-full">{activeFilterCount}</span>
                )}
              </div>
              <FilterPanel
                filters={filters}
                availableMakes={availableMakes}
                activeFilterCount={activeFilterCount}
                openMakeDropdown={openMakeDropdown}
                setOpenMakeDropdown={setOpenMakeDropdown}
                updateFilter={updateFilter}
                clearFilters={clearFilters}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden flex items-center gap-2 btn-secondary text-sm py-2 px-4"
                  id="show-filters-btn"
                >
                  <SlidersHorizontal size={16} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-neutral-900 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <p className="text-sm text-neutral-500">
                  {loading ? 'Loading...' : (
                    <span>
                      <span className="font-semibold text-neutral-900">{total}</span>
                      {' '}car{total !== 1 ? 's' : ''} available
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Sort */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenSortDropdown(!openSortDropdown)}
                    className="flex items-center justify-between text-xs font-bold px-4 py-2.5 bg-[#16161a] border border-[#1f1f26] rounded-lg hover:border-amber-500/50 text-white transition-all duration-200 text-left cursor-pointer min-w-[170px]"
                    id="sort-dropdown-btn"
                  >
                    <span className="truncate">{SORT_OPTIONS.find((o) => o.value === sort)?.label || 'Recommended'}</span>
                    <ChevronDown size={14} className={`text-neutral-500 transition-transform duration-300 ${openSortDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {openSortDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#16161a] border border-[#1f1f26] rounded-xl shadow-2xl z-50 py-1.5 animate-fade-in-scale">
                      {SORT_OPTIONS.map((option) => (
                        <div
                          key={option.value}
                          onClick={() => {
                            setSort(option.value as VehicleSortOption);
                            setPage(1);
                            setOpenSortDropdown(false);
                          }}
                          className="flex items-center justify-between px-4 py-2 hover:bg-[#b48d36]/10 text-xs font-semibold text-white cursor-pointer transition-all"
                        >
                          <span>{option.label}</span>
                          {sort === option.value && <Check size={12} className="text-[#b48d36]" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* View toggle */}
                <div className="hidden sm:flex border border-neutral-200 rounded-md overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:bg-neutral-50'}`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:bg-neutral-50'}`}
                    aria-label="List view"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-[#1f1f26] overflow-hidden bg-[#121215]">
                    <div className="skeleton bg-neutral-800 h-48 w-full" />
                    <div className="p-4 space-y-2">
                      <div className="skeleton bg-neutral-800 h-5 w-3/4" />
                      <div className="skeleton bg-neutral-800 h-4 w-1/2" />
                      <div className="skeleton bg-neutral-800 h-9 w-full mt-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : vehicles.length === 0 ? (
              <div className="space-y-10">
                <div className="text-center py-12 bg-[#121215] border border-neutral-800 rounded-2xl p-8">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="font-display font-bold text-lg text-white mb-2">No Direct Matches Found</h3>
                  <p className="text-neutral-400 text-xs mb-6 max-w-sm mx-auto leading-relaxed">We couldn't find a vehicle matching those filters. Try clearing filters or WhatsApp us directly.</p>
                  <div className="flex gap-3 justify-center">
                    <button onClick={clearFilters} className="inline-flex items-center justify-center bg-[#b48d36] hover:bg-[#9a845a] text-white font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer">Clear Filters</button>
                    <a href="https://wa.me/918800243707" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center border border-neutral-800 text-white font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider hover:border-white transition-all cursor-pointer">
                      Request on WhatsApp
                    </a>
                  </div>
                </div>

                {recommended.length > 0 && (
                  <div className="border-t border-neutral-800/80 pt-10">
                    <h3 className="font-display font-bold text-sm text-neutral-400 uppercase tracking-widest mb-6 text-center lg:text-left">Recommended Premium Cars in Stock</h3>
                    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                      {recommended.map((vehicle) => (
                        <VehicleCard
                          key={vehicle.id}
                          vehicle={vehicle}
                          variant="grid"
                          isWishlisted={isWishlisted(vehicle.id)}
                          onWishlistToggle={toggleWishlist}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                  {vehicles.map((vehicle) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      variant={viewMode}
                      isWishlisted={isWishlisted(vehicle.id)}
                      onWishlistToggle={toggleWishlist}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 text-sm border border-neutral-200 rounded-md disabled:opacity-40 hover:bg-neutral-50 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-neutral-500">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 text-sm border border-neutral-200 rounded-md disabled:opacity-40 hover:bg-neutral-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showFilters && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setShowFilters(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto lg:hidden border-t border-neutral-200 shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-neutral-100 px-5 py-4 flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-neutral-800">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-500" aria-label="Close filters">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <FilterPanel
                filters={filters}
                availableMakes={availableMakes}
                activeFilterCount={activeFilterCount}
                openMakeDropdown={openMakeDropdown}
                setOpenMakeDropdown={setOpenMakeDropdown}
                updateFilter={updateFilter}
                clearFilters={clearFilters}
              />
              <button
                onClick={() => setShowFilters(false)}
                className="btn-primary w-full mt-4 py-3 justify-center"
              >
                Show {total} Results
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
