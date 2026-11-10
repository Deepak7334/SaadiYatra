import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { VehicleCard } from '../components/VehicleCard';
import { BIHAR_DISTRICTS } from '@shaadiyatra/shared';
import {
  Search,
  Calendar,
  MapPin,
  Car,
  ShieldCheck,
  CreditCard,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Crown,
  Users,
} from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<any[]>([]);
  const [featuredVehicles, setFeaturedVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [selectedCity, setSelectedCity] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    Promise.all([
      api.getCategories(),
      api.getVehicles({ isFeatured: 'true' }),
    ])
      .then(([catRes, vehRes]) => {
        if (catRes.success) setCategories(catRes.categories || []);
        if (vehRes.success) setFeaturedVehicles(vehRes.vehicles || []);
      })
      .catch((err) => console.error('Failed to load home data', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCity) params.set('city', selectedCity);
    if (eventDate) params.set('eventDate', eventDate);
    if (selectedCategory) params.set('categoryId', selectedCategory);
    navigate(`/vehicles?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* 1. Hero Section with Search Panel */}
      <section className="relative royal-gradient text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-wine-800/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-800/80 border border-gold-500/30 text-gold-300 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>Bihar's #1 Wedding Fleet & Multi-Vehicle Booking Platform</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Book Multiple Wedding Vehicles <br className="hidden sm:block" />
            <span className="gold-text-gradient">Under One Combined Booking</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            From majestic Groom arrival cars and grand Baraat Scorpio/Fortuner convoys to AC luxury coaches for Baraatis. Choose, combine, and confirm together.
          </p>

          {/* Search Panel Box */}
          <div className="mt-12 bg-white text-slate-800 p-4 sm:p-6 rounded-3xl shadow-2xl border border-slate-100 max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end text-left">
              {/* Event Location */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Event District / City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gold-600 absolute left-3 top-3.5" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                  >
                    <option value="">All Bihar Districts</option>
                    {BIHAR_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist.split(' ')[0]}>{dist}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Event Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Event Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gold-600 absolute left-3 top-3.5" />
                  <input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Vehicle Category
                </label>
                <div className="relative">
                  <Car className="w-4 h-4 text-gold-600 absolute left-3 top-3.5" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl gold-gradient text-navy-900 font-bold text-sm shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Vehicles</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Stats Banner */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-6 border-t border-navy-700/50 text-slate-300 text-xs">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gold-400" />
              <span>100% Verified Fleet</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4 text-gold-400" />
              <span>Pay 25% Advance Online</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4 text-gold-400" />
              <span>Multi-Vehicle Single Cart</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-gold-400" />
              <span>Instant Owner Response</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600">Curated Wedding Fleet</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 mt-2">
            Explore Vehicles by Category
          </h2>
          <p className="mt-3 text-slate-600 text-sm">
            Everything your celebration requires — from high-impact Baraat convoys to luxury coaches for family.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/vehicles?categoryId=${cat.id}`}
              className="group relative h-64 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 block"
            >
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/40 to-transparent p-6 flex flex-col justify-end text-white">
                <span className="text-xs text-gold-300 font-semibold uppercase tracking-wider">
                  Starts at ₹{cat.basePriceHint.toLocaleString('en-IN')}/day
                </span>
                <h3 className="font-serif text-2xl font-bold text-white group-hover:text-gold-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                  {cat.description}
                </p>
                <div className="mt-3 flex items-center text-xs font-bold text-gold-400 gap-1 group-hover:translate-x-1 transition-transform">
                  <span>View Available Cars</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Wedding Vehicles */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-50/50 rounded-3xl border border-slate-200/50 my-10">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-600">Handpicked for Ceremonies</span>
            <h2 className="font-serif text-3xl font-bold text-navy-900 mt-2">
              Featured Wedding Vehicles in Bihar
            </h2>
          </div>
          <Link
            to="/vehicles"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-navy-900 hover:text-gold-600 transition-colors"
          >
            <span>View All Fleet ({featuredVehicles.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredVehicles.slice(0, 6).map((veh) => (
            <VehicleCard key={veh.id} vehicle={veh} />
          ))}
        </div>
      </section>

      {/* 4. How Multi-Vehicle Booking Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600">Effortless Coordination</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 mt-2">
            How ShaadiYatra Multi-Vehicle Booking Works
          </h2>
          <p className="mt-3 text-slate-600 text-sm">
            No more calling 5 different owners separately. One combined booking workflow handles everything.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            {
              step: '01',
              title: 'Select Multiple Vehicles',
              desc: 'Add bride car, Baraat SUVs, and buses to your unified event cart for your celebration date.',
            },
            {
              step: '02',
              title: 'Submit 1 Request',
              desc: 'Submit one combined booking. Every vehicle owner receives notification only for their car.',
            },
            {
              step: '03',
              title: 'Owner & Admin Review',
              desc: 'Owners confirm availability. Admin verifies and finalizes the package and exact advance amount.',
            },
            {
              step: '04',
              title: 'Pay 25% Advance',
              desc: 'Pay the secure online advance via Razorpay (UPI, Cards, NetBanking) with server verification.',
            },
            {
              step: '05',
              title: 'Guaranteed Booking',
              desc: 'Selected vehicles are locked on the calendar. Receive digital confirmation and driver contacts!',
            },
          ].map((s, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative text-center">
              <div className="w-10 h-10 rounded-full gold-gradient text-navy-900 font-extrabold flex items-center justify-center mx-auto mb-4 text-sm shadow">
                {s.step}
              </div>
              <h4 className="font-serif text-base font-bold text-navy-900 mb-2">{s.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Owner Call To Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="royal-gradient rounded-3xl p-8 sm:p-14 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl border border-gold-500/20">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Join Bihar's Largest Network</span>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold mt-2 text-white">
              Are you a Vehicle Owner or Fleet Operator in Bihar?
            </h3>
            <p className="mt-4 text-slate-300 text-sm leading-relaxed">
              Register your luxury cars, Scorpios, Ertigas, travellers, and buses on ShaadiYatra. Get confirmed wedding bookings, manage your calendar with zero double-booking risk, and receive timely direct payouts.
            </p>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row gap-4">
            <Link
              to="/register-owner"
              className="px-8 py-4 rounded-xl gold-gradient text-navy-900 font-bold text-sm shadow-xl hover:brightness-105 transition-all text-center"
            >
              Register Your Vehicle Fleet
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
