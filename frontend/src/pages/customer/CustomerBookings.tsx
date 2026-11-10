import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Calendar, MapPin, Clock, CheckCircle2, AlertCircle, ChevronRight, Car } from 'lucide-react';

export const CustomerBookings: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getMyBookings()
      .then((res) => {
        if (res.success) setBookings(res.bookings || []);
        else setError(res.error || 'Failed to load bookings');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
      case 'owner_review':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Owner Review Pending</span>;
      case 'admin_review':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Admin Review</span>;
      case 'approved_pending_payment':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 animate-pulse">Payment Required</span>;
      case 'confirmed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Booking Confirmed</span>;
      case 'cancelled':
      case 'rejected':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">Cancelled</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gold-500 border-t-transparent" />
        <p className="mt-4 text-sm text-slate-500 font-medium">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600">Customer Panel</span>
          <h1 className="font-serif text-3xl font-bold text-navy-900 mt-1">
            My Wedding Bookings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track owner responses, admin approvals, advance payments, and confirmed vehicles.
          </p>
        </div>

        <Link
          to="/vehicles"
          className="px-5 py-2.5 rounded-xl gold-gradient text-navy-900 font-bold text-xs shadow hover:brightness-105"
        >
          + Book More Vehicles
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-lg mx-auto">
          <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-navy-900">No Bookings Yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            You haven't submitted any wedding vehicle booking requests yet.
          </p>
          <Link
            to="/vehicles"
            className="px-6 py-3 rounded-xl gold-gradient text-navy-900 font-bold text-xs"
          >
            Explore Vehicles & Build Cart
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-navy-900">
                      {booking.bookingNumber}
                    </span>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gold-600" />
                      <span>Event Date: <strong>{booking.eventDate}</strong></span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gold-600" />
                      <span>{booking.eventCity}, {booking.eventDistrict}</span>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-extrabold text-navy-900">
                    ₹{booking.totalAmount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {booking.items.length} vehicle(s) combined
                  </div>
                </div>
              </div>

              {/* Items Preview */}
              <div className="py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {booking.items.map((item: any) => (
                  <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    {item.primaryImage && (
                      <img src={item.primaryImage} alt="" className="w-12 h-10 rounded-lg object-cover" />
                    )}
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-navy-900 truncate">{item.vehicleName}</div>
                      <div className="text-[10px] text-slate-500">₹{item.totalItemPrice.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] font-semibold text-gold-700 capitalize">
                        {item.status.replace(/_/g, ' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer action */}
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <div className="text-xs text-slate-500">
                  {booking.status === 'approved_pending_payment' ? (
                    <span className="text-purple-700 font-bold">
                      ⚡ Action Required: Pay ₹{booking.advanceAmountRequired?.toLocaleString('en-IN')} advance
                    </span>
                  ) : booking.status === 'confirmed' ? (
                    <span className="text-emerald-700 font-bold">
                      ✓ Advance Paid: ₹{booking.advanceAmountPaid?.toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span>Awaiting owner & admin reviews</span>
                  )}
                </div>

                <Link
                  to={`/customer/bookings/${booking.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-white text-xs font-bold transition-colors"
                >
                  <span>Track & Manage</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
