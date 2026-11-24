import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  Users,
  Car,
  CalendarCheck,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  AlertCircle,
  TrendingUp,
  MapPin,
  IndianRupee,
  BadgeCheck,
  FileText,
  Zap,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'vehicles' | 'owners' | 'settings'>('bookings');

  const [stats, setStats] = useState<any | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Review Booking Modal state
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<any | null>(null);
  const [approvedItemIds, setApprovedItemIds] = useState<string[]>([]);
  const [rejectedItemIds, setRejectedItemIds] = useState<string[]>([]);
  const [advancePct, setAdvancePct] = useState<number>(25);

  const fetchAllAdminData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [statsRes, bookRes, vehRes, ownRes, setRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminBookings(),
        api.getAdminVehicles(),
        api.getAdminOwners(),
        api.getAdminSettings(),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (bookRes.success) setBookings(bookRes.bookings || []);
      if (vehRes.success) setVehicles(vehRes.vehicles || []);
      if (ownRes.success) setOwners(ownRes.owners || []);
      if (setRes.success) setSettings(setRes.settings || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAllAdminData(); }, []);

  const handleVerifyOwner = async (ownerId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await api.verifyOwner(ownerId, status);
      if (res.success) {
        setSuccessMsg(`Owner KYC status updated to ${status}.`);
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchAllAdminData(true);
      }
    } catch (err: any) { setError(err.message); }
  };

  const handleUpdateVehicleStatus = async (vehicleId: string, status: string) => {
    try {
      const res = await api.updateVehicleStatus(vehicleId, status);
      if (res.success) {
        setSuccessMsg(`Vehicle status updated to ${status}.`);
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchAllAdminData(true);
      }
    } catch (err: any) { setError(err.message); }
  };

  const openReviewModal = (booking: any) => {
    setSelectedBookingForReview(booking);
    const acceptedIds = booking.items
      .filter((i: any) => i.status === 'accepted_by_owner' || i.status === 'pending_owner' || i.status === 'approved_by_admin')
      .map((i: any) => i.id);
    const rejectedIds = booking.items
      .filter((i: any) => i.status === 'rejected_by_owner')
      .map((i: any) => i.id);
    setApprovedItemIds(acceptedIds);
    setRejectedItemIds(rejectedIds);
    setAdvancePct(booking.advancePercentage || 25);
  };

  const handleFinalizeBookingReview = async () => {
    if (!selectedBookingForReview) return;
    if (approvedItemIds.length === 0) { alert('Please approve at least one vehicle item.'); return; }
    try {
      const res = await api.reviewBooking(selectedBookingForReview.id, {
        approvedItemIds,
        rejectedItemIds,
        advancePercentage: advancePct,
      });
      if (res.success) {
        setSelectedBookingForReview(null);
        setSuccessMsg('Booking review finalized. Customer has been notified to pay advance!');
        setTimeout(() => setSuccessMsg(''), 5000);
        fetchAllAdminData(true);
      } else {
        setError(res.error || 'Failed to review booking');
      }
    } catch (err: any) { setError(err.message); }
  };

  const pendingVehicles = vehicles.filter((v) => v.status === 'pending_approval').length;
  const pendingOwners = owners.filter((o) => o.verificationStatus === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gold-500 border-t-transparent mb-4" />
          <p className="text-sm text-slate-500 font-medium">Loading control center…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">

      {/* ── Hero Banner ── */}
      <div className="bg-gradient-to-br from-slate-900 via-navy-900 to-slate-900 text-white px-4 sm:px-8 pt-10 pb-20 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-1/3 w-96 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gold-400">Administration</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gold-500/20 border border-gold-500/30 text-gold-300 text-[10px] font-bold">
                <Zap className="w-3 h-3" /> Super Admin
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight">
              Control Center
            </h1>
            <p className="mt-1.5 text-sm text-white/50 font-medium">
              ShaadiYatra · Real-time platform governance across Bihar
            </p>
          </div>

          <button
            onClick={() => fetchAllAdminData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 hover:border-white/40 text-white/80 hover:text-white text-xs font-bold transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* ── KPI Cards (pulled up) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-12 relative z-10">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total Bookings', value: stats.totalBookings, sub: `${stats.confirmedBookings} confirmed`, color: 'blue', icon: <CalendarCheck className="w-4 h-4 text-blue-600" /> },
              { label: 'Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`, sub: 'Advance collected', color: 'emerald', icon: <IndianRupee className="w-4 h-4 text-emerald-600" /> },
              { label: 'Pending Approvals', value: stats.pendingVehicleApprovals, sub: 'Vehicles to review', color: 'amber', icon: <Clock className="w-4 h-4 text-amber-600" />, alert: stats.pendingVehicleApprovals > 0 },
              { label: 'Owners', value: stats.totalOwners, sub: 'Registered partners', color: 'purple', icon: <Users className="w-4 h-4 text-purple-600" /> },
              { label: 'Total Vehicles', value: stats.totalVehicles, sub: `${stats.activeVehicles} active`, color: 'indigo', icon: <Car className="w-4 h-4 text-indigo-600" /> },
              { label: 'Customers', value: stats.totalCustomers, sub: 'Registered users', color: 'rose', icon: <TrendingUp className="w-4 h-4 text-rose-600" /> },
            ].map((kpi, i) => (
              <div key={i} className={`bg-white rounded-2xl p-4 shadow-lg border flex items-start gap-3 ${kpi.alert ? 'border-amber-200 ring-1 ring-amber-200' : 'border-slate-100'}`}>
                <div className={`w-9 h-9 rounded-xl bg-${kpi.color}-50 flex items-center justify-center shrink-0`}>
                  {kpi.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">{kpi.label}</div>
                  <div className={`text-xl font-extrabold mt-0.5 ${kpi.alert ? 'text-amber-600' : 'text-navy-900'}`}>{kpi.value}</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">{kpi.sub}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">

        {/* Toasts */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />{successMsg}
          </div>
        )}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 shadow-sm">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />{error}
          </div>
        )}

        {/* ── Tab Bar ── */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit overflow-x-auto">
          {[
            { key: 'bookings', label: 'Bookings', icon: <CalendarCheck className="w-3.5 h-3.5" />, badge: 0 },
            { key: 'vehicles', label: 'Vehicle Approvals', icon: <Car className="w-3.5 h-3.5" />, badge: pendingVehicles },
            { key: 'owners', label: 'Owners & KYC', icon: <Users className="w-3.5 h-3.5" />, badge: pendingOwners },
            { key: 'settings', label: 'Settings', icon: <Settings className="w-3.5 h-3.5" />, badge: 0 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.key ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-navy-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full leading-none">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── 1. Bookings Tab ── */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-14 text-center border border-slate-200/80 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-gold-50 flex items-center justify-center mx-auto mb-4">
                  <CalendarCheck className="w-7 h-7 text-gold-600" />
                </div>
                <h3 className="font-serif text-xl font-bold text-navy-900">No Bookings Yet</h3>
                <p className="text-xs text-slate-500 mt-1">Bookings from customers will appear here.</p>
              </div>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                    booking.status === 'approved_pending_payment' ? 'border-purple-200' :
                    booking.status === 'confirmed' ? 'border-emerald-200' :
                    'border-slate-200/80'
                  }`}
                >
                  {/* Status accent bar */}
                  <div className={`h-1 w-full ${
                    booking.status === 'confirmed' ? 'bg-gradient-to-r from-emerald-400 to-teal-400' :
                    booking.status === 'approved_pending_payment' ? 'bg-gradient-to-r from-purple-400 to-indigo-400' :
                    booking.status === 'admin_review' ? 'bg-gradient-to-r from-blue-400 to-cyan-400' :
                    'bg-gradient-to-r from-amber-400 to-orange-400'
                  }`} />

                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="font-mono text-sm font-bold text-navy-900">{booking.bookingNumber}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                            booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                            booking.status === 'approved_pending_payment' ? 'bg-purple-100 text-purple-800' :
                            booking.status === 'admin_review' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {booking.status === 'approved_pending_payment' ? '⚡ Payment Pending' :
                             booking.status === 'confirmed' ? '✓ Confirmed' :
                             booking.status === 'admin_review' ? '👁 Admin Review' :
                             booking.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <span className="font-semibold text-navy-800">{booking.customerName}</span>
                            {booking.customerPhone && <span>· {booking.customerPhone}</span>}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarCheck className="w-3.5 h-3.5 text-gold-600" />
                            {booking.eventDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gold-600" />
                            {booking.eventCity}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-extrabold text-navy-900">₹{booking.totalAmount.toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-gold-700 font-bold">
                            Advance: ₹{booking.advanceAmountRequired?.toLocaleString('en-IN')} ({booking.advancePercentage}%)
                          </div>
                        </div>
                        <button
                          onClick={() => openReviewModal(booking)}
                          className="px-4 py-2 rounded-xl gold-gradient text-navy-900 text-xs font-bold shadow-sm hover:brightness-105 whitespace-nowrap"
                        >
                          Review
                        </button>
                      </div>
                    </div>

                    {/* Vehicle breakdown */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {booking.items.map((item: any) => (
                        <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-xs font-bold text-navy-900 truncate">{item.vehicleName}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5 truncate">Owner: {item.ownerName}</div>
                          <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-slate-100">
                            <span className="text-xs font-extrabold text-navy-900">₹{item.totalItemPrice.toLocaleString('en-IN')}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold capitalize ${
                              item.status === 'accepted_by_owner' || item.status === 'approved_by_admin' || item.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'rejected_by_owner' || item.status === 'rejected_by_admin'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}>
                              {item.status === 'approved_by_admin' ? 'approved' :
                               item.status === 'pending_owner' ? 'pending' :
                               item.status.replace(/_/g, ' ').replace(/by .+/, '').trim()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── 2. Vehicle Approvals Tab ── */}
        {activeTab === 'vehicles' && (
          <div>
            {vehicles.length === 0 ? (
              <div className="bg-white rounded-3xl p-14 text-center border border-slate-200/80 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-gold-50 flex items-center justify-center mx-auto mb-4">
                  <Car className="w-7 h-7 text-gold-600" />
                </div>
                <h3 className="font-serif text-xl font-bold text-navy-900">No Vehicles Yet</h3>
              </div>
            ) : (
              <div className="space-y-3">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:shadow-md transition-shadow ${
                      v.status === 'pending_approval' ? 'border-amber-200' : 'border-slate-200/80'
                    }`}
                  >
                    {/* Image */}
                    <div className="w-full sm:w-28 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      {v.primaryImage ? (
                        <img src={v.primaryImage} alt={v.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="w-8 h-8 text-slate-300" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-serif text-sm font-bold text-navy-900">{v.name}</span>
                        <span className="font-mono text-[11px] text-slate-400">{v.registrationNumber}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          v.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          v.status === 'pending_approval' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {v.status === 'pending_approval' ? '⏳ Pending Review' : v.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-1.5 text-xs text-slate-500">
                        <span>Owner: <strong className="text-slate-700">{v.ownerName}</strong> · {v.ownerPhone}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gold-600" />{v.city}</span>
                        <span>₹<strong className="text-navy-900">{v.perDayPrice?.toLocaleString('en-IN')}</strong>/day</span>
                        <span>{v.capacity} Seater</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {v.status !== 'approved' && (
                        <button
                          onClick={() => handleUpdateVehicleStatus(v.id, 'approved')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                      )}
                      {v.status !== 'rejected' && (
                        <button
                          onClick={() => handleUpdateVehicleStatus(v.id, 'rejected')}
                          className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      )}
                      {v.status === 'approved' && (
                        <button
                          onClick={() => handleUpdateVehicleStatus(v.id, 'suspended')}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 3. Owners & KYC Tab ── */}
        {activeTab === 'owners' && (
          <div>
            {owners.length === 0 ? (
              <div className="bg-white rounded-3xl p-14 text-center border border-slate-200/80 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-gold-50 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-gold-600" />
                </div>
                <h3 className="font-serif text-xl font-bold text-navy-900">No Owners Yet</h3>
              </div>
            ) : (
              <div className="space-y-3">
                {owners.map((o) => (
                  <div
                    key={o.id}
                    className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col lg:flex-row items-start lg:items-center gap-5 hover:shadow-md transition-shadow ${
                      o.verificationStatus === 'pending' ? 'border-amber-200' : 'border-slate-200/80'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {o.name?.charAt(0).toUpperCase()}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-6 text-xs">
                      <div>
                        <div className="font-bold text-navy-900 text-sm">{o.name}</div>
                        <div className="text-slate-400 mt-0.5">{o.phone}</div>
                        <div className="text-slate-500 mt-0.5">{o.email}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Business</div>
                        <div className="font-semibold text-slate-700 mt-0.5">{o.businessName || 'Independent Partner'}</div>
                        <div className="text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />{o.city}, {o.district}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">KYC Document</div>
                        <div className="font-semibold text-slate-700 mt-0.5">{o.idDocumentType || 'Not submitted'}</div>
                        {o.idDocumentUrl && (
                          <a href={o.idDocumentUrl} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 text-gold-600 hover:text-gold-700 hover:underline mt-0.5">
                            <FileText className="w-3 h-3" /> View Document
                          </a>
                        )}
                        <div className="text-slate-400 mt-0.5">{o.vehicleCount} vehicle{o.vehicleCount !== 1 ? 's' : ''} listed</div>
                      </div>
                    </div>

                    {/* Status + Actions */}
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        o.verificationStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        o.verificationStatus === 'rejected' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {o.verificationStatus === 'approved' ? '✓ KYC Verified' :
                         o.verificationStatus === 'rejected' ? '✗ KYC Rejected' :
                         '⏳ KYC Pending'}
                      </span>
                      <div className="flex gap-2">
                        {o.verificationStatus !== 'approved' && (
                          <button
                            onClick={() => handleVerifyOwner(o.id, 'approved')}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <BadgeCheck className="w-3.5 h-3.5" /> Approve KYC
                          </button>
                        )}
                        {o.verificationStatus !== 'rejected' && (
                          <button
                            onClick={() => handleVerifyOwner(o.id, 'rejected')}
                            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 4. Settings Tab ── */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              {/* Settings header */}
              <div className="bg-gradient-to-br from-navy-900 to-navy-800 p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold">Platform Parameters</h3>
                    <p className="text-xs text-white/60 mt-0.5">
                      Financial & operational settings applied to all bookings.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 divide-y divide-slate-100">
                {settings.map((s) => (
                  <div key={s.key} className="py-4 flex justify-between items-center gap-4">
                    <div>
                      <div className="text-sm font-bold text-navy-900 capitalize">
                        {s.key.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{s.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-navy-900 text-lg bg-gold-50 border border-gold-200 px-3 py-1 rounded-xl">
                        {s.value}
                      </span>
                    </div>
                  </div>
                ))}
                {settings.length === 0 && (
                  <div className="py-8 text-center text-sm text-slate-400">No settings configured.</div>
                )}
              </div>

              <div className="px-6 pb-6">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Settings are currently read-only. Use the backend seed or D1 console to update platform configuration values.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Booking Review Modal ── */}
      {selectedBookingForReview && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl my-4 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-br from-navy-900 to-navy-800 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gold-400">Admin Authority Review</span>
                  <h3 className="font-serif text-xl font-bold mt-1">
                    Booking #{selectedBookingForReview.bookingNumber}
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    {selectedBookingForReview.customerName} · {selectedBookingForReview.eventDate} · {selectedBookingForReview.eventCity}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBookingForReview(null)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                >✕</button>
              </div>
            </div>

            <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
              {/* Vehicle items */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Toggle Vehicle Approval
                </div>
                <div className="space-y-2">
                  {selectedBookingForReview.items.map((item: any) => {
                    const isApproved = approvedItemIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${
                          isApproved
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-rose-50/50 border-rose-100'
                        }`}
                        onClick={() => {
                          if (isApproved) {
                            setApprovedItemIds(approvedItemIds.filter((i) => i !== item.id));
                            setRejectedItemIds([...rejectedItemIds, item.id]);
                          } else {
                            setApprovedItemIds([...approvedItemIds, item.id]);
                            setRejectedItemIds(rejectedItemIds.filter((i) => i !== item.id));
                          }
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-navy-900 truncate">{item.vehicleName}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Owner: <strong>{item.ownerName}</strong> ·
                            Status: <span className="text-gold-700 font-semibold capitalize">
                              {item.ownerResponse?.response || item.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-extrabold text-navy-900 text-sm">
                            ₹{item.totalItemPrice.toLocaleString('en-IN')}
                          </span>
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm transition-colors ${
                            isApproved ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {isApproved ? '✓' : '✗'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Advance % */}
              <div className="p-4 rounded-2xl bg-gold-50 border border-gold-200 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-navy-900">Advance Percentage</div>
                  <div className="text-xs text-slate-500 mt-0.5">Override for this specific booking</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={advancePct}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setAdvancePct(parseInt(e.target.value) || 25)}
                    className="w-16 p-2 text-center text-sm font-bold border border-gold-300 rounded-xl bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                  <span className="font-bold text-navy-900 text-sm">%</span>
                </div>
              </div>

              {/* Approved summary */}
              <div className="text-xs text-slate-500 text-center">
                <span className="font-bold text-emerald-700">{approvedItemIds.length} vehicle{approvedItemIds.length !== 1 ? 's' : ''} approved</span>
                {rejectedItemIds.length > 0 && <span className="ml-2 text-rose-600">· {rejectedItemIds.length} rejected</span>}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-0 flex items-center justify-end gap-3 border-t border-slate-100 mt-2">
              <button
                type="button"
                onClick={() => setSelectedBookingForReview(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalizeBookingReview}
                disabled={approvedItemIds.length === 0}
                className="px-6 py-2.5 rounded-xl gold-gradient text-navy-900 text-sm font-bold shadow-md hover:brightness-105 transition-all disabled:opacity-40"
              >
                Approve & Notify Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
