import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { BIHAR_DISTRICTS } from '@shaadiyatra/shared';
import {
  Car,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  IndianRupee,
  ShieldCheck,
  AlertCircle,
  User,
  Phone,
  MapPin,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Layers,
  BadgeCheck,
  CalendarClock,
  Banknote,
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'vehicles' | 'requests' | 'calendar' | 'earnings'>('requests');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add vehicle modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    make: 'Mahindra',
    model: 'Scorpio-N',
    year: 2024,
    registrationNumber: '',
    capacity: 7,
    perDayPrice: 4500,
    perEventPrice: 5000,
    extraKmRate: 16,
    driverAllowance: 500,
    categoryId: '',
    city: 'Patna',
    district: 'Patna',
    address: 'Boring Road, Patna',
    description: 'Pristine wedding vehicle with professional chauffeur, AC, and flower mounting readiness.',
    features: ['Air Conditioning', 'Pushback Seats', 'Floral Rails'],
    rules: ['No smoking inside vehicle', 'Toll taxes extra at actuals'],
    images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000'],
  });

  // Calendar block state
  const [selectedVehicleForCal, setSelectedVehicleForCal] = useState<string>('');
  const [blockDate, setBlockDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vehRes, reqRes, earnRes, catRes] = await Promise.all([
        api.getOwnerVehicles(),
        api.getOwnerBookingRequests(),
        api.getOwnerEarnings(),
        api.getCategories(),
      ]);

      if (vehRes.success) {
        setVehicles(vehRes.vehicles || []);
        if (vehRes.vehicles?.length > 0 && !selectedVehicleForCal) {
          setSelectedVehicleForCal(vehRes.vehicles[0].id);
        }
      }
      if (reqRes.success) setRequests(reqRes.requests || []);
      if (earnRes.success) setEarnings(earnRes.stats || null);
      if (catRes.success) {
        setCategories(catRes.categories || []);
        if (catRes.categories?.length > 0 && !newVehicle.categoryId) {
          setNewVehicle((prev) => ({ ...prev, categoryId: catRes.categories[0].id }));
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Respond to request
  const handleRespond = async (itemId: string, response: 'accepted' | 'rejected') => {
    let reason = '';
    if (response === 'rejected') {
      const promptReason = window.prompt('Optional reason for rejecting this vehicle request:');
      if (promptReason === null) return;
      reason = promptReason;
    }

    try {
      const res = await api.respondToBookingRequest(itemId, { response, reason });
      if (res.success) {
        setSuccessMsg(`Vehicle request ${response} successfully.`);
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchData();
      } else {
        setError(res.error || 'Failed to update response');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Add Vehicle
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createVehicle(newVehicle);
      if (res.success) {
        setShowAddModal(false);
        setSuccessMsg('Vehicle added! It is currently pending admin approval before going live.');
        setTimeout(() => setSuccessMsg(''), 5000);
        fetchData();
      } else {
        setError(res.error || 'Failed to add vehicle');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Manage Calendar
  const handleToggleBlock = async (action: 'block' | 'unblock') => {
    if (!selectedVehicleForCal || !blockDate) return;
    try {
      const res = await api.manageAvailability(selectedVehicleForCal, {
        dates: [blockDate],
        action,
      });
      if (res.success) {
        setSuccessMsg(`Date ${blockDate} marked as ${action}ed.`);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setError(res.error || 'Failed to update calendar');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const pendingRequestsCount = requests.filter((r) => r.status === 'pending_owner').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gold-500 border-t-transparent mb-4" />
          <p className="text-sm text-slate-500 font-medium">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* ── Hero Header Banner ── */}
      <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white px-4 sm:px-8 pt-10 pb-20 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gold-400">
                Owner Portal
              </span>
              {user?.isVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                  <BadgeCheck className="w-3 h-3" /> KYC Verified
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                  KYC Pending
                </span>
              )}
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="mt-1.5 text-sm text-white/60 font-medium">
              {user?.ownerProfile?.businessName || 'Wedding Vehicle Partner'} &nbsp;·&nbsp; {user?.ownerProfile?.city || 'Bihar'}
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl gold-gradient text-navy-900 font-extrabold text-sm shadow-xl hover:brightness-110 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* ── KPI Cards (pulled up over header) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Vehicles</div>
              <div className="text-2xl font-extrabold text-navy-900 mt-0.5">{vehicles.length}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                <span className="text-emerald-600 font-semibold">{vehicles.filter((v) => v.status === 'approved').length} active</span>
                {vehicles.filter((v) => v.status === 'pending_approval').length > 0 && (
                  <span className="ml-1 text-amber-600 font-semibold">· {vehicles.filter((v) => v.status === 'pending_approval').length} pending</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Requests</div>
              <div className="text-2xl font-extrabold text-amber-600 mt-0.5">{pendingRequestsCount}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Awaiting your response</div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Confirmed</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-0.5">{earnings?.totalConfirmedBookings || 0}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Advance paid by customer</div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Est. Payout</div>
              <div className="text-2xl font-extrabold text-navy-900 mt-0.5">
                ₹{(earnings?.estimatedPayout || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">After 10% platform fee</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Toasts */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 shadow-sm">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Tab Bar ── */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
          {[
            { key: 'requests', label: 'Requests', icon: <Clock className="w-3.5 h-3.5" />, badge: pendingRequestsCount },
            { key: 'vehicles', label: 'My Vehicles', icon: <Car className="w-3.5 h-3.5" />, badge: 0 },
            { key: 'calendar', label: 'Availability', icon: <CalendarClock className="w-3.5 h-3.5" />, badge: 0 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-slate-500 hover:text-navy-900'
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

        {/* ── 1. Requests Tab ── */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="bg-white rounded-3xl p-14 text-center border border-slate-200/80 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-gold-50 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-7 h-7 text-gold-600" />
                </div>
                <h3 className="font-serif text-xl font-bold text-navy-900">No Booking Requests Yet</h3>
                <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
                  When customers select your vehicles in their wedding cart, booking requests will appear here.
                </p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.itemId}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                    req.status === 'pending_owner' ? 'border-amber-200' : 'border-slate-200/80'
                  }`}
                >
                  {/* Top accent bar for pending */}
                  {req.status === 'pending_owner' && (
                    <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-400" />
                  )}
                  <div className="p-5 sm:p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-mono text-[11px] font-bold text-slate-400 tracking-wider">
                          #{req.bookingNumber}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          req.status === 'pending_owner'
                            ? 'bg-amber-100 text-amber-800'
                            : req.status === 'accepted_by_owner' || req.status === 'confirmed' || req.status === 'approved_by_admin'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {req.status === 'pending_owner' ? '⏳ Action Required' :
                           req.status === 'accepted_by_owner' ? '✓ Accepted' :
                           req.status === 'approved_by_admin' ? '✓ Approved' :
                           req.status === 'confirmed' ? '✓ Confirmed' :
                           req.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <h3 className="font-serif text-base font-bold text-navy-900 truncate">
                        {req.vehicleName}
                        <span className="ml-2 text-xs font-mono font-normal text-slate-400">
                          {req.registrationNumber}
                        </span>
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                          <strong>{req.eventDate}</strong>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                          {req.eventCity}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                          {req.customerName}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                          {req.customerPhone}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:items-center justify-between lg:justify-end w-full lg:w-auto gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div className="text-left lg:text-right">
                        <div className="text-xl font-extrabold text-navy-900">
                          ₹{req.totalItemPrice.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          ₹{req.pricePerDay.toLocaleString('en-IN')} × {req.daysCount} day{req.daysCount > 1 ? 's' : ''}
                        </div>
                      </div>

                      {req.status === 'pending_owner' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRespond(req.itemId, 'accepted')}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Accept
                          </button>
                          <button
                            onClick={() => handleRespond(req.itemId, 'rejected')}
                            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {req.ownerResponse?.response ? `Responded: ${req.ownerResponse.response}` : 'Auto-processed'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── 2. Vehicles Tab ── */}
        {activeTab === 'vehicles' && (
          <div>
            {vehicles.length === 0 ? (
              <div className="bg-white rounded-3xl p-14 text-center border border-slate-200/80 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-gold-50 flex items-center justify-center mx-auto mb-4">
                  <Car className="w-7 h-7 text-gold-600" />
                </div>
                <h3 className="font-serif text-xl font-bold text-navy-900">No Vehicles Listed</h3>
                <p className="text-xs text-slate-500 mt-2 mb-6 max-w-sm mx-auto">
                  Add your first vehicle to start receiving wedding booking requests.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gold-gradient text-navy-900 font-bold text-xs shadow-md"
                >
                  <Plus className="w-4 h-4" /> Add Your First Vehicle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((v) => (
                  <div key={v.id} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                    {/* Image */}
                    <div className="h-48 w-full bg-slate-100 relative overflow-hidden">
                      {v.primaryImage ? (
                        <img
                          src={v.primaryImage}
                          alt={v.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="w-12 h-12 text-slate-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-transparent" />
                      <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold capitalize backdrop-blur-sm ${
                        v.status === 'approved'
                          ? 'bg-emerald-500/90 text-white'
                          : v.status === 'pending_approval'
                          ? 'bg-amber-500/90 text-white'
                          : 'bg-rose-500/90 text-white'
                      }`}>
                        {v.status === 'approved' ? '✓ Live' : v.status === 'pending_approval' ? '⏳ Pending' : v.status.replace(/_/g, ' ')}
                      </span>
                      <div className="absolute bottom-3 left-3 text-white">
                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">{v.categoryName || 'Vehicle'}</div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h4 className="font-serif text-base font-bold text-navy-900 leading-tight">{v.name}</h4>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{v.registrationNumber}</div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-gold-600" /> {v.capacity} Seater
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gold-600" /> {v.city}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between pt-3 border-t border-slate-100">
                        <span className="text-[11px] text-slate-400 font-medium">Per Day</span>
                        <span className="text-lg font-extrabold text-navy-900">₹{v.perDayPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Vehicle Card */}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="border-2 border-dashed border-slate-200 hover:border-gold-400 rounded-2xl h-full min-h-[16rem] flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-gold-600 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-gold-50 flex items-center justify-center transition-colors">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold">Add Another Vehicle</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── 3. Calendar Tab ── */}
        {activeTab === 'calendar' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              {/* Calendar header */}
              <div className="bg-gradient-to-br from-navy-900 to-navy-800 p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <CalendarClock className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold">Availability Manager</h3>
                    <p className="text-xs text-white/60 mt-0.5">
                      Block dates for maintenance or private bookings made outside ShaadiYatra.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Vehicle Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Select Vehicle
                  </label>
                  <select
                    value={selectedVehicleForCal}
                    onChange={(e) => setSelectedVehicleForCal(e.target.value)}
                    className="w-full p-3 text-sm font-medium border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  >
                    {vehicles.length === 0 ? (
                      <option>No vehicles added yet</option>
                    ) : (
                      vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} — {v.registrationNumber}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Select Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gold-600 absolute left-3 top-3.5 pointer-events-none" />
                    <input
                      type="date"
                      min={new Date().toISOString().slice(0, 10)}
                      value={blockDate}
                      onChange={(e) => setBlockDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-3 text-sm font-medium border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleToggleBlock('block')}
                    disabled={vehicles.length === 0}
                    className="py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Block Date
                  </button>
                  <button
                    onClick={() => handleToggleBlock('unblock')}
                    disabled={vehicles.length === 0}
                    className="py-3.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Unblock Date
                  </button>
                </div>

                {/* Info note */}
                <div className="pt-2 p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-[11px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Dates locked by confirmed bookings cannot be unblocked here — they are automatically managed by the system.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Add Vehicle Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl my-4">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
                  <Car className="w-5 h-5 text-navy-900" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-navy-900">Add Vehicle</h3>
                  <p className="text-[11px] text-slate-500">Will go live after admin approval</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>

            <form id="add-vehicle-form" onSubmit={handleAddVehicle} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Vehicle Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Vehicle Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. White Mahindra Scorpio-N Z8L"
                  value={newVehicle.name}
                  onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                  className="w-full p-3 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                />
              </div>

              {/* Category + Reg */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Category *</label>
                  <select
                    value={newVehicle.categoryId}
                    onChange={(e) => setNewVehicle({ ...newVehicle, categoryId: e.target.value })}
                    className="w-full p-3 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Reg. Plate *</label>
                  <input
                    type="text"
                    required
                    placeholder="BR01PK1234"
                    value={newVehicle.registrationNumber}
                    onChange={(e) => setNewVehicle({ ...newVehicle, registrationNumber: e.target.value })}
                    className="w-full p-3 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                  />
                </div>
              </div>

              {/* Capacity + Prices */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Seats</label>
                  <input
                    type="number"
                    value={newVehicle.capacity}
                    onChange={(e) => setNewVehicle({ ...newVehicle, capacity: parseInt(e.target.value) || 7 })}
                    className="w-full p-3 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Per Day (₹)</label>
                  <input
                    type="number"
                    value={newVehicle.perDayPrice}
                    onChange={(e) => setNewVehicle({ ...newVehicle, perDayPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-3 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Event Pkg (₹)</label>
                  <input
                    type="number"
                    value={newVehicle.perEventPrice}
                    onChange={(e) => setNewVehicle({ ...newVehicle, perEventPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-3 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                  />
                </div>
              </div>

              {/* City + District */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">City</label>
                  <input
                    type="text"
                    value={newVehicle.city}
                    onChange={(e) => setNewVehicle({ ...newVehicle, city: e.target.value })}
                    className="w-full p-3 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">District</label>
                  <select
                    value={newVehicle.district}
                    onChange={(e) => setNewVehicle({ ...newVehicle, district: e.target.value, city: e.target.value })}
                    className="w-full p-3 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                  >
                    {BIHAR_DISTRICTS.map((d) => (
                      <option key={d} value={d.split(' ')[0]}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Photo URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Photo URL</label>
                <input
                  type="text"
                  value={newVehicle.images[0]}
                  onChange={(e) => setNewVehicle({ ...newVehicle, images: [e.target.value] })}
                  className="w-full p-3 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                  placeholder="https://…"
                />
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-6 pt-0 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-vehicle-form"
                className="px-6 py-2.5 rounded-xl gold-gradient text-navy-900 text-sm font-bold shadow-md hover:brightness-105 transition-all"
              >
                Submit for Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
