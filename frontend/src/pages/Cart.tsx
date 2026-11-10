import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { BIHAR_DISTRICTS, EVENT_TYPES } from '@shaadiyatra/shared';
import {
  Trash2,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Car,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, clearCart, bookingDetails, updateBookingDetails, totalAmount, advanceAmount, daysCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availabilityWarning, setAvailabilityWarning] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    updateBookingDetails({ [e.target.name]: e.target.value });
  };

  const handleCheckAvailability = async () => {
    if (!bookingDetails.eventDate) {
      setError('Please select an Event Date first');
      return false;
    }
    try {
      const res = await api.checkMultipleAvailability(
        cart.map((v) => v.id),
        bookingDetails.eventDate
      );
      if (res.success) {
        if (!res.allAvailable) {
          setAvailabilityWarning(res.unavailableVehicleIds || []);
          setError('One or more vehicles in your cart are already booked on this date. Please remove them.');
          return false;
        } else {
          setAvailabilityWarning([]);
          setError('');
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (cart.length === 0) {
      setError('Your event cart is empty. Please add vehicles first.');
      return;
    }

    if (!user) {
      // Redirect to login
      navigate('/login?redirect=/cart');
      return;
    }

    if (!bookingDetails.eventDate) {
      setError('Please select the Event Date');
      return;
    }

    if (!bookingDetails.pickupAddress || !bookingDetails.destinationAddress) {
      setError('Please specify both Pickup and Destination addresses');
      return;
    }

    setLoading(true);

    try {
      // 1. Availability check
      const isAvailable = await handleCheckAvailability();
      if (!isAvailable) {
        setLoading(false);
        return;
      }

      // 2. Submit combined multi-vehicle booking
      const payload = {
        eventDate: bookingDetails.eventDate,
        eventEndDate: bookingDetails.eventEndDate || bookingDetails.eventDate,
        eventType: bookingDetails.eventType,
        eventCity: bookingDetails.eventCity,
        eventDistrict: bookingDetails.eventDistrict,
        pickupAddress: bookingDetails.pickupAddress,
        destinationAddress: bookingDetails.destinationAddress,
        customerNotes: bookingDetails.customerNotes,
        vehicleIds: cart.map((v) => v.id),
      };

      const res = await api.createBooking(payload);

      if (res.success && res.booking) {
        clearCart();
        navigate(`/customer/bookings/${res.booking.id}?new=true`);
      } else {
        setError(res.error || 'Failed to submit booking request');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating booking');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-gold-50 text-gold-600 flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-navy-900 mb-2">Your Event Cart is Empty</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
            Add bride arrival cars, groom Baraat SUVs, and guest buses together to create a unified wedding fleet booking.
          </p>
          <Link
            to="/vehicles"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl gold-gradient text-navy-900 font-bold text-sm shadow-md hover:brightness-105 transition-all"
          >
            <span>Browse Wedding Fleet</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-600">Multi-Vehicle System</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-navy-900 mt-1">
          Combined Wedding Fleet Cart ({cart.length} Vehicles)
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          All selected vehicles will be booked together under 1 booking ID with verified individual owner responses.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left Column: Vehicle Selection List (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="font-serif text-lg font-bold text-navy-900">Selected Vehicles</h2>
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
              >
                Clear Cart
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {cart.map((veh) => {
                const isUnavailable = availabilityWarning.includes(veh.id);
                return (
                  <div key={veh.id} className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={veh.primaryImage}
                        alt={veh.name}
                        className="w-20 h-16 rounded-xl object-cover bg-slate-100 shrink-0"
                      />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gold-600 tracking-wider">
                          {veh.categoryName || 'Vehicle'}
                        </span>
                        <h4 className="font-serif text-base font-bold text-navy-900">{veh.name}</h4>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {veh.capacity} Seater • Base: {veh.city} • Owner: {veh.ownerName || 'Verified Partner'}
                        </div>
                        {isUnavailable && (
                          <span className="mt-1 inline-block text-[10px] text-rose-600 font-bold">
                            ⚠️ Unavailable on selected date
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      <div className="text-right">
                        <div className="text-base font-extrabold text-navy-900">
                          ₹{(veh.perDayPrice * daysCount).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          ₹{veh.perDayPrice.toLocaleString('en-IN')} x {daysCount} day{daysCount > 1 ? 's' : ''}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(veh.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove vehicle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event Details Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <h2 className="font-serif text-lg font-bold text-navy-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-600" />
              <span>Event & Destination Coordinates</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Event Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Event Start Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gold-600 absolute left-3 top-3.5" />
                  <input
                    type="date"
                    required
                    name="eventDate"
                    min={new Date().toISOString().slice(0, 10)}
                    value={bookingDetails.eventDate}
                    onChange={handleInputChange}
                    onBlur={handleCheckAvailability}
                    className="w-full pl-9 pr-3 py-2.5 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                  />
                </div>
              </div>

              {/* Event End Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Event End Date (Optional)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gold-600 absolute left-3 top-3.5" />
                  <input
                    type="date"
                    name="eventEndDate"
                    min={bookingDetails.eventDate || new Date().toISOString().slice(0, 10)}
                    value={bookingDetails.eventEndDate}
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-3 py-2.5 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                  />
                </div>
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Ceremony Type *
                </label>
                <select
                  name="eventType"
                  value={bookingDetails.eventType}
                  onChange={handleInputChange}
                  className="w-full p-2.5 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  District in Bihar *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gold-600 absolute left-3 top-3.5" />
                  <select
                    name="eventDistrict"
                    value={bookingDetails.eventDistrict}
                    onChange={(e) => {
                      handleInputChange(e);
                      updateBookingDetails({ eventCity: e.target.value });
                    }}
                    className="w-full pl-9 pr-3 py-2.5 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                  >
                    {BIHAR_DISTRICTS.map((d) => (
                      <option key={d} value={d.split(' ')[0]}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pickup Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Pickup Address (e.g. Groom Residence / Hotel) *
                </label>
                <input
                  type="text"
                  required
                  name="pickupAddress"
                  placeholder="Street address, landmark, colony, city..."
                  value={bookingDetails.pickupAddress}
                  onChange={handleInputChange}
                  className="w-full p-3 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                />
              </div>

              {/* Destination Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Destination / Marriage Hall Address *
                </label>
                <input
                  type="text"
                  required
                  name="destinationAddress"
                  placeholder="Wedding hall, banquet, resort, or village address..."
                  value={bookingDetails.destinationAddress}
                  onChange={handleInputChange}
                  className="w-full p-3 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                />
              </div>

              {/* Notes */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Special Instructions / Flower Mounting Requirements (Optional)
                </label>
                <textarea
                  name="customerNotes"
                  rows={2}
                  placeholder="Floral decoration requirements, specific arrival timing for Baraat, route stops..."
                  value={bookingDetails.customerNotes}
                  onChange={handleInputChange}
                  className="w-full p-3 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Combined Summary & Advance Payment Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-lg sticky top-28">
            <h3 className="font-serif text-lg font-bold text-navy-900 mb-4">Combined Booking Summary</h3>

            <div className="space-y-3 pb-4 border-b border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Vehicles</span>
                <span className="font-bold text-navy-900">{cart.length} vehicles</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Booking Duration</span>
                <span className="font-bold text-navy-900">{daysCount} day{daysCount > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Combined Cost</span>
                <span className="font-bold text-navy-900">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Advance structure */}
            <div className="py-4 space-y-3 border-b border-slate-100">
              <div className="p-3.5 rounded-2xl bg-gold-50 border border-gold-200/60">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gold-700">Advance Payable (25%)</div>
                <div className="text-2xl font-extrabold text-navy-900 mt-1">
                  ₹{advanceAmount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 leading-snug">
                  * Payable online only after Vehicle Owners and Admin approve availability.
                </div>
              </div>

              <div className="flex justify-between text-xs text-slate-600 pt-1">
                <span>Remaining 75% Balance</span>
                <span className="font-bold text-navy-900">
                  ₹{(totalAmount - advanceAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl gold-gradient text-navy-900 font-extrabold text-sm shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-navy-900 border-t-transparent" />
                ) : (
                  <>
                    <span>Submit Combined Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {!user && (
                <p className="mt-2 text-center text-[11px] text-slate-500">
                  You will be prompted to sign in before submission.
                </p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero Double Booking Guarantee</span>
              </div>
              <div>• Temporary lock placed on vehicles upon submission.</div>
              <div>• 100% refund policy if cancelled 7 days in advance.</div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
