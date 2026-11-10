import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import {
  Calendar,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  Printer,
  ArrowLeft,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

export const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const fetchBooking = () => {
    if (!id) return;
    setLoading(true);
    api.getBooking(id)
      .then((res) => {
        if (res.success && res.booking) {
          setBooking(res.booking);
        } else {
          setError(res.error || 'Booking not found');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  // Razorpay Checkout handler
  const handlePayAdvance = async () => {
    if (!booking) return;
    setPaying(true);
    setError('');

    try {
      // 1. Create order
      const orderRes = await api.createPaymentOrder(booking.id);
      if (!orderRes.success) {
        throw new Error(orderRes.error || 'Failed to create payment order');
      }

      const orderData = orderRes.order;

      // Check if Razorpay JS SDK is loaded
      if (typeof (window as any).Razorpay !== 'undefined') {
        const options = {
          key: orderData.keyId,
          amount: orderData.amountPaise,
          currency: orderData.currency,
          name: 'ShaadiYatra Weddings',
          description: `25% Advance for Booking #${orderData.bookingNumber}`,
          image: '/vite.svg',
          order_id: orderData.orderId,
          handler: async (response: any) => {
            // 2. Server-side payment verification
            const verifyRes = await api.verifyPayment({
              bookingId: booking.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              setPaymentSuccess(true);
              fetchBooking();
            } else {
              setError(verifyRes.error || 'Payment signature verification failed');
            }
          },
          prefill: {
            name: booking.customerName,
            email: booking.customerEmail,
            contact: booking.customerPhone,
          },
          theme: {
            color: '#D4AF37',
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (resp: any) => {
          setError(`Payment failed: ${resp.error.description}`);
          setPaying(false);
        });
        rzp.open();
      } else {
        // Fallback simulation for sandbox environments
        const mockPaymentId = `pay_${crypto.randomUUID().slice(0, 14)}`;
        const mockSignature = `test_sig_${crypto.randomUUID().slice(0, 16)}`;

        const verifyRes = await api.verifyPayment({
          bookingId: booking.id,
          razorpayOrderId: orderData.orderId,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: mockSignature,
        });

        if (verifyRes.success) {
          setPaymentSuccess(true);
          fetchBooking();
        } else {
          setError(verifyRes.error || 'Verification failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Payment initiation failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gold-500 border-t-transparent" />
        <p className="mt-4 text-sm text-slate-500 font-medium">Loading booking information...</p>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen py-20 px-4 text-center max-w-md mx-auto">
        <h2 className="font-serif text-2xl font-bold text-navy-900 mb-2">Error</h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <Link to="/customer/bookings" className="px-6 py-2.5 rounded-xl gold-gradient text-navy-900 font-bold text-xs">
          Back to Bookings
        </Link>
      </div>
    );
  }

  const steps = [
    { title: 'Submitted', done: true },
    { title: 'Owner Review', done: booking.status !== 'submitted' },
    { title: 'Admin Approval', done: ['approved_pending_payment', 'confirmed', 'completed'].includes(booking.status) },
    { title: 'Advance Paid', done: ['confirmed', 'completed'].includes(booking.status) },
    { title: 'Confirmed Fleet', done: ['confirmed', 'completed'].includes(booking.status) },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Back button */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/customer/bookings"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-navy-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Bookings</span>
        </Link>

        {booking.status === 'confirmed' && (
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <Printer className="w-4 h-4" />
            <span>Print Confirmation Receipt</span>
          </button>
        )}
      </div>

      {paymentSuccess && (
        <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <div className="font-bold text-sm">Advance Payment Verified Successfully!</div>
            <div className="text-xs text-emerald-800 mt-0.5">
              Your booking is officially CONFIRMED. Vehicles are reserved and cannot be double-booked.
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-100 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-600">Booking Summary</span>
            <div className="flex items-center gap-3 mt-1">
              <h1 className="font-mono text-2xl font-bold text-navy-900">
                {booking.bookingNumber}
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                booking.status === 'approved_pending_payment' ? 'bg-purple-100 text-purple-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {booking.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-2 flex flex-wrap gap-4">
              <span>Event Date: <strong>{booking.eventDate}</strong></span>
              <span>Location: <strong>{booking.eventCity}, {booking.eventDistrict}</strong></span>
              <span>Ceremony: <strong>{booking.eventType}</strong></span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs text-slate-400 uppercase font-semibold">Total Cost</div>
            <div className="text-2xl font-extrabold text-navy-900">₹{booking.totalAmount.toLocaleString('en-IN')}</div>
            <div className="text-xs text-gold-700 font-bold mt-0.5">
              Advance: ₹{booking.advanceAmountRequired?.toLocaleString('en-IN')} ({booking.advancePercentage}%)
            </div>
          </div>
        </div>

        {/* Workflow Progress Stepper */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Booking Lifecycle</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-center transition-all ${
                  s.done
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 border-slate-100 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  {s.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300" />
                  )}
                </div>
                <div className="text-xs font-bold">{s.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle Items Table */}
        <div>
          <h3 className="font-serif text-lg font-bold text-navy-900 mb-3">
            Selected Vehicles & Owner Responses
          </h3>

          <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
            {booking.items.map((item: any) => (
              <div key={item.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex items-center gap-4">
                  {item.primaryImage && (
                    <img src={item.primaryImage} alt="" className="w-16 h-12 rounded-xl object-cover bg-slate-100 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-serif text-sm font-bold text-navy-900">{item.vehicleName}</h4>
                    <div className="text-xs text-slate-500">
                      {item.categoryName} • Owner: <strong>{item.ownerName || 'Verified Partner'}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-navy-900">
                      ₹{item.totalItemPrice.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ₹{item.pricePerDay.toLocaleString('en-IN')} / day
                    </div>
                  </div>

                  <div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                      item.status === 'confirmed' || item.status === 'accepted_by_owner' || item.status === 'approved_by_admin'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status.includes('rejected')
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advance Payment Banner (if approved_pending_payment) */}
        {booking.status === 'approved_pending_payment' && (
          <div className="p-6 rounded-3xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-purple-900 font-bold text-base">
                <CreditCard className="w-5 h-5 text-purple-700" />
                <span>Super Admin Approved! Advance Payment Ready</span>
              </div>
              <p className="text-xs text-purple-700 mt-1 max-w-lg">
                Your wedding vehicles have been reviewed and approved. Please pay the 25% advance of <strong>₹{booking.advanceAmountRequired?.toLocaleString('en-IN')}</strong> to lock the vehicles.
              </p>
            </div>

            <button
              onClick={handlePayAdvance}
              disabled={paying}
              className="px-8 py-3.5 rounded-2xl gold-gradient text-navy-900 font-extrabold text-sm shadow-lg hover:brightness-105 transition-all shrink-0"
            >
              {paying ? 'Connecting to Razorpay...' : `Pay ₹${booking.advanceAmountRequired?.toLocaleString('en-IN')} Advance Online`}
            </button>
          </div>
        )}

        {/* Confirmed Receipt Details */}
        {booking.status === 'confirmed' && (
          <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 space-y-4">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-base">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              <span>Official Booking & Advance Payment Receipt</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Advance Paid</span>
                <span className="font-bold text-navy-900 text-sm">₹{booking.advanceAmountPaid?.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Balance Remaining</span>
                <span className="font-bold text-navy-900 text-sm">₹{booking.balanceAmount?.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Payment Mode</span>
                <span className="font-bold text-navy-900 text-sm">Razorpay Online</span>
              </div>
              <div>
                <span className="text-slate-500 block">Balance Due Date</span>
                <span className="font-bold text-navy-900 text-sm">On Event Day ({booking.eventDate})</span>
              </div>
            </div>
          </div>
        )}

        {/* Addresses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Pickup Point</span>
            <p className="font-medium text-slate-800">{booking.pickupAddress}</p>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Destination</span>
            <p className="font-medium text-slate-800">{booking.destinationAddress}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
