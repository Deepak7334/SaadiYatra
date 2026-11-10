import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useCart } from '../context/CartContext';
import {
  Users,
  MapPin,
  ShieldCheck,
  Calendar,
  CheckCircle,
  Plus,
  Check,
  ArrowLeft,
  Fuel,
  Sparkles,
  Info,
} from 'lucide-react';

export const VehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, removeFromCart, isInCart } = useCart();

  const [vehicle, setVehicle] = useState<any | null>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [activeImage, setActiveImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const inCart = id ? isInCart(id) : false;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.getVehicle(id),
      api.getAvailability(id),
    ])
      .then(([vehRes, availRes]) => {
        if (vehRes.success && vehRes.vehicle) {
          setVehicle(vehRes.vehicle);
          const primary = vehRes.vehicle.primaryImage || vehRes.vehicle.images?.[0]?.imageUrl || '';
          setActiveImage(primary);
        } else {
          setError(vehRes.error || 'Vehicle not found');
        }

        if (availRes.success) {
          setAvailability(availRes.availability || []);
        }
      })
      .catch((err) => setError(err.message || 'Error loading vehicle'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gold-500 border-t-transparent" />
        <p className="mt-4 text-sm text-slate-500 font-medium">Loading vehicle specifications...</p>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen py-20 px-4 text-center max-w-md mx-auto">
        <h2 className="font-serif text-2xl font-bold text-navy-900 mb-2">Vehicle Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'The requested vehicle is currently unavailable.'}</p>
        <Link to="/vehicles" className="px-6 py-2.5 rounded-xl gold-gradient text-navy-900 font-bold text-xs">
          Return to Fleet Catalog
        </Link>
      </div>
    );
  }

  const handleCartToggle = () => {
    if (inCart) {
      removeFromCart(vehicle.id);
    } else {
      addToCart({
        id: vehicle.id,
        name: vehicle.name,
        make: vehicle.make,
        model: vehicle.model,
        categoryName: vehicle.category?.name,
        perDayPrice: vehicle.perDayPrice,
        capacity: vehicle.capacity,
        city: vehicle.city,
        primaryImage: activeImage,
        ownerId: vehicle.ownerId,
        ownerName: vehicle.ownerName,
      });
    }
  };

  // Build calendar dates for next 14 days
  const upcomingDays = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const record = availability.find((a) => a.date === dateStr);
    const isBooked = record?.status === 'booked';
    const isBlocked = record?.status === 'blocked' || record?.status === 'held';
    return {
      date: dateStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      status: isBooked ? 'Booked' : isBlocked ? 'Blocked' : 'Available',
    };
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Back Link */}
      <Link
        to="/vehicles"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-navy-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Vehicles</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Image Gallery & Specifications (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Photo Gallery */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="h-96 w-full rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={activeImage}
                alt={vehicle.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail selector */}
            {vehicle.images && vehicle.images.length > 1 && (
              <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-2">
                {vehicle.images.map((img: any) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.imageUrl)}
                    className={`h-20 w-28 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImage === img.imageUrl
                        ? 'border-gold-500 shadow-md scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.imageUrl} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vehicle Overview */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-navy-900 text-gold-300">
                  {vehicle.category?.name || 'Wedding Vehicle'}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Reg Plate: <strong className="text-navy-900 font-mono">{vehicle.registrationNumber}</strong>
                </span>
              </div>
              <h1 className="font-serif text-3xl font-extrabold text-navy-900 mt-3">
                {vehicle.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-6 text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <Users className="w-4 h-4 text-gold-600" />
                  <span>{vehicle.capacity} Passengers Capacity</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-gold-600" />
                  <span>{vehicle.city}, {vehicle.district} (Bihar)</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-4 h-4 text-gold-600" />
                  <span>{vehicle.year} Model • {vehicle.make}</span>
                </span>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Description */}
            <div>
              <h3 className="font-serif text-lg font-bold text-navy-900 mb-2">About This Vehicle</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{vehicle.description}</p>
            </div>

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div>
                <h3 className="font-serif text-lg font-bold text-navy-900 mb-3">Ceremony & Luxury Features</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {vehicle.features.map((feat: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rules / Terms */}
            {vehicle.rules && vehicle.rules.length > 0 && (
              <div>
                <h3 className="font-serif text-lg font-bold text-navy-900 mb-3">Service Guidelines</h3>
                <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside">
                  {vehicle.rules.map((rule: string, idx: number) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 14-Day Availability Preview */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-navy-900">Live Availability Calendar</h3>
                <p className="text-xs text-slate-500 mt-1">Upcoming 14-day schedule. Real-time anti-double booking protection.</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Booked</span>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 pt-2">
              {upcomingDays.map((d, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl text-center border text-xs font-medium ${
                    d.status === 'Available'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-800 opacity-60'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold text-slate-400">{d.dayName}</div>
                  <div className="text-base font-extrabold my-0.5">{d.dayNumber}</div>
                  <div className="text-[10px] uppercase">{d.month}</div>
                  <div className="mt-1 font-semibold text-[9px] uppercase tracking-wider">{d.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Cart Booking Action */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-lg sticky top-28">
            <div className="text-xs font-bold uppercase tracking-widest text-gold-600 mb-1">Pricing Breakdown</div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-extrabold text-navy-900">
                ₹{vehicle.perDayPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-slate-500 font-semibold">/ day</span>
            </div>

            {/* Commercial terms */}
            <div className="space-y-3 py-4 border-y border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Per-Event Package</span>
                <span className="font-bold text-navy-900">₹{vehicle.perEventPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Driver Daily Allowance</span>
                <span className="font-bold text-navy-900">₹{vehicle.driverAllowance} / day</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Extra Km Rate</span>
                <span className="font-bold text-navy-900">₹{vehicle.extraKmRate} / km</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Advance Required at Booking</span>
                <span className="font-bold text-gold-600">25% (Post-Admin Approval)</span>
              </div>
            </div>

            {/* Owner badge */}
            <div className="my-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy-800 text-gold-400 font-bold flex items-center justify-center shrink-0">
                {vehicle.ownerName?.[0] || 'O'}
              </div>
              <div>
                <div className="text-xs font-bold text-navy-900">{vehicle.ownerBusiness || vehicle.ownerName}</div>
                <div className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Vehicle Owner
                </div>
              </div>
            </div>

            {/* Cart Button */}
            <button
              onClick={handleCartToggle}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                inCart
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'gold-gradient text-navy-900 hover:brightness-105'
              }`}
            >
              {inCart ? (
                <>
                  <Check className="w-4 h-4" /> Added to Event Cart (Click to Remove)
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Add to Multi-Vehicle Cart
                </>
              )}
            </button>

            {inCart && (
              <Link
                to="/cart"
                className="mt-3 block w-full text-center py-3 px-4 rounded-2xl bg-navy-800 text-white hover:bg-navy-700 text-xs font-bold transition-colors"
              >
                Proceed to Event Cart & Checkout →
              </Link>
            )}

            <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400 justify-center">
              <Info className="w-3.5 h-3.5" />
              <span>You can combine multiple vehicles for the same date!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
