import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { VehicleCard } from '../components/VehicleCard';
import { BIHAR_DISTRICTS } from '@shaadiyatra/shared';
import { Search, Filter, RotateCcw, Calendar, MapPin, SlidersHorizontal } from 'lucide-react';

export const Vehicles: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [eventDate, setEventDate] = useState(searchParams.get('eventDate') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [capacity, setCapacity] = useState(searchParams.get('capacity') || '');

  // Load categories
  useEffect(() => {
    api.getCategories()
      .then((res) => {
        if (res.success) setCategories(res.categories || []);
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch vehicles with filters
  const fetchVehicles = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (city) params.city = city;
    if (categoryId) params.categoryId = categoryId;
    if (eventDate) params.eventDate = eventDate;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (capacity) params.capacity = capacity;

    api.getVehicles(params)
      .then((res) => {
        if (res.success) setVehicles(res.vehicles || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVehicles();
  }, [city, categoryId, eventDate, minPrice, maxPrice, capacity]);

  const handleResetFilters = () => {
    setCity('');
    setCategoryId('');
    setEventDate('');
    setMinPrice('');
    setMaxPrice('');
    setCapacity('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900">
          Wedding Fleet Catalog
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Browse and combine multiple vehicles across Bihar for your wedding ceremonies and Baraat.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          {/* District / City */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              District
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full text-xs font-medium p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="">All Bihar</option>
              {BIHAR_DISTRICTS.map((d) => (
                <option key={d} value={d.split(' ')[0]}>{d}</option>
              ))}
            </select>
          </div>

          {/* Event Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Event Date
            </label>
            <input
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full text-xs font-medium p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full text-xs font-medium p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Max Daily Rate
            </label>
            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full text-xs font-medium p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="">Any Budget</option>
              <option value="4000">Up to ₹4,000</option>
              <option value="8000">Up to ₹8,000</option>
              <option value="15000">Up to ₹15,000</option>
              <option value="25000">Up to ₹25,000</option>
            </select>
          </div>

          {/* Seating Capacity */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Min Capacity
            </label>
            <select
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full text-xs font-medium p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="">Any Capacity</option>
              <option value="4">4+ Seater (Sedan / Coupe)</option>
              <option value="7">7+ Seater (Scorpio / Fortuner)</option>
              <option value="12">12+ Seater (Traveller)</option>
              <option value="25">25+ Seater (Coach Bus)</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div>
            <button
              onClick={handleResetFilters}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 hover:text-navy-900 hover:bg-slate-100 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Date Filter Alert */}
        {eventDate && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-gold-700 font-semibold">
            <Calendar className="w-4 h-4 text-gold-600" />
            <span>Showing verified vehicles available on {eventDate} (booked/blocked vehicles automatically excluded).</span>
          </div>
        )}
      </div>

      {/* Vehicle Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gold-500 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-500 font-medium">Loading wedding vehicles...</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto">
          <SlidersHorizontal className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-bold text-navy-900">No Vehicles Match Criteria</h3>
          <p className="text-xs text-slate-500 mt-2">
            Try adjusting your dates, removing filters, or searching in an adjacent Bihar district.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-6 px-6 py-2.5 rounded-xl gold-gradient text-navy-900 text-xs font-bold"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4 text-xs font-semibold text-slate-500">
            Found {vehicles.length} vehicle(s) ready for booking
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
