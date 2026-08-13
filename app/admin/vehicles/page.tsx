import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Plus, Search } from 'lucide-react';
import AdminVehicleList from '@/components/admin/AdminVehicleList';

async function getVehicles(searchParams: Record<string, string>) {
  const supabase = createAdminClient();
  const status = searchParams.status;
  const search = searchParams.search;
  const page = parseInt(searchParams.page || '1');
  const per_page = 20;
  const offset = (page - 1) * per_page;

  let query = supabase
    .from('vehicles')
    .select('id, slug, make, model, variant, year, price, mileage, fuel_type, transmission, status, availability, main_image_url, is_featured, is_hot_deal, is_new_arrival, view_count, enquiry_count, created_at, sold_price, sold_date, buyer_name, buyer_phone', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + per_page - 1);

  if (status) query = query.eq('status', status);
  if (search) query = query.or(`make.ilike.%${search}%,model.ilike.%${search}%,slug.ilike.%${search}%`);

  const { data, count } = await query;
  return { vehicles: data || [], total: count || 0, page, per_page };
}

export default async function AdminVehiclesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const { vehicles, total, page, per_page } = await getVehicles(params);

  let totalRevenue = 0;
  if (params.status === 'Sold') {
    const supabase = createAdminClient();
    const { data: soldData } = await supabase
      .from('vehicles')
      .select('price, sold_price')
      .eq('status', 'Sold');
    
    totalRevenue = (soldData || []).reduce((sum, item) => sum + Number(item.sold_price || item.price || 0), 0);
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-neutral-900">
            {params.status === 'Sold' ? 'Sold Vehicles Register' : 'Vehicles'}
          </h1>
          <p className="text-neutral-500 text-sm mt-0.5">
            {params.status === 'Sold'
              ? `${total} cars sold • Total Revenue: ₹${(totalRevenue / 100000).toFixed(2)} Lakh`
              : `${total} vehicle${total !== 1 ? 's' : ''} total`}
          </p>
        </div>
        {params.status !== 'Sold' && (
          <Link href="/admin/vehicles/new" className="btn-primary text-sm py-2.5 px-5" id="admin-add-vehicle-btn">
            <Plus size={16} />
            Add Vehicle
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-5 flex flex-wrap gap-3 items-center">
        <form className="flex items-center gap-2 flex-1 min-w-48">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              name="search"
              defaultValue={params.search}
              placeholder="Search make, model..."
              className="form-input pl-9 text-sm py-2"
            />
          </div>
          <button type="submit" className="btn-primary text-sm py-2 px-4">Search</button>
        </form>
        <div className="flex gap-1.5 flex-wrap">
          {['', 'Active', 'Draft', 'Reserved', 'Sold', 'Archived'].map((s) => (
            <Link
              key={s || 'all'}
              href={`/admin/vehicles${s ? `?status=${s}` : ''}`}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${
                (params.status || '') === s
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
              }`}
            >
              {s || 'All'}
            </Link>
          ))}
        </div>
      </div>

      <AdminVehicleList
        vehicles={vehicles}
        total={total}
        page={page}
        perPage={per_page}
        currentStatus={params.status}
      />
    </div>
  );
}
