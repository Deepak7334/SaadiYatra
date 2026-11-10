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
  Lock,
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
      if (promptReason === null) return; // user cancelled prompt
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

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200/80 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-600">Owner Portal</span>
            {user?.isVerified ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> KYC Verified
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                KYC Verification Pending
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl font-extrabold text-navy-900 mt-1">
            {user?.name}'s Fleet Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {user?.ownerProfile?.businessName || 'Wedding Fleet Partner'} • Base: {user?.ownerProfile?.city || 'Bihar'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl gold-gradient text-navy-900 font-bold text-xs shadow-md hover:brightness-105 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 my-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-bold uppercase text-slate-400">Total Vehicles</div>
          <div className="text-2xl font-extrabold text-navy-900 mt-1">{vehicles.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {vehicles.filter((v) => v.status === 'approved').length} Active • {vehicles.filter((v) => v.status === 'pending_approval').length} Pending
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-bold uppercase text-slate-400">Pending Requests</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{pendingRequestsCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Requires your response</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-bold uppercase text-slate-400">Confirmed Bookings</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{earnings?.totalConfirmedBookings || 0}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Advance paid by customer</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-bold uppercase text-slate-400">Estimated Payout</div>
          <div className="text-2xl font-extrabold text-navy-900 mt-1">
            ₹{(earnings?.estimatedPayout || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Net after 10% platform fee</div>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('requests')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'border-gold-500 text-navy-900'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          <span>Booking Requests</span>
          {pendingRequestsCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
              {pendingRequestsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('vehicles')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'vehicles'
              ? 'border-gold-500 text-navy-900'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          My Vehicles ({vehicles.length})
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'calendar'
              ? 'border-gold-500 text-navy-900'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          Manage Availability Calendar
        </button>
      </div>

      {/* 1. Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="font-serif text-lg font-bold text-navy-900">No Booking Requests</h3>
              <p className="text-xs text-slate-500 mt-1">When customers add your vehicles to their wedding cart, requests appear here.</p>
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.itemId}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      Booking #{req.bookingNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      req.status === 'pending_owner' ? 'bg-amber-100 text-amber-800' :
                      req.status === 'accepted_by_owner' || req.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-bold text-navy-900 mt-1">
                    {req.vehicleName} <span className="text-xs font-mono font-normal text-slate-500">({req.registrationNumber})</span>
                  </h3>

                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gold-600" />
                      <span>Date: <strong>{req.eventDate}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gold-600" />
                      <span>Location: {req.eventCity}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gold-600" />
                      <span>Customer: <strong>{req.customerName}</strong> ({req.customerPhone})</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:items-center justify-between lg:justify-end w-full lg:w-auto gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-left lg:text-right">
                    <div className="text-base font-extrabold text-navy-900">
                      ₹{req.totalItemPrice.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ₹{req.pricePerDay.toLocaleString('en-IN')} x {req.daysCount} day{req.daysCount > 1 ? 's' : ''}
                    </div>
                  </div>

                  {req.status === 'pending_owner' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRespond(req.itemId, 'accepted')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button
                        onClick={() => handleRespond(req.itemId, 'rejected')}
                        className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-slate-500">
                      Responded: {req.ownerResponse?.response?.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. Vehicles Tab */}
      {activeTab === 'vehicles' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="h-44 w-full bg-slate-100 relative">
                {v.primaryImage && (
                  <img src={v.primaryImage} alt="" className="w-full h-full object-cover" />
                )}
                <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                  v.status === 'approved' ? 'bg-emerald-900/80 text-emerald-300' :
                  v.status === 'pending_approval' ? 'bg-amber-900/80 text-amber-300' :
                  'bg-rose-900/80 text-rose-300'
                }`}>
                  {v.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <h4 className="font-serif text-base font-bold text-navy-900">{v.name}</h4>
                <div className="text-xs text-slate-500 font-mono">{v.registrationNumber} • {v.capacity} Seater</div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-400">Daily Rate</span>
                  <span className="text-base font-extrabold text-navy-900">₹{v.perDayPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="font-serif text-xl font-bold text-navy-900">Manage Unavailable Dates</h3>
            <p className="text-xs text-slate-500 mt-1">
              Block dates when your vehicle is under maintenance or booked outside ShaadiYatra.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Select Vehicle</label>
              <select
                value={selectedVehicleForCal}
                onChange={(e) => setSelectedVehicleForCal(e.target.value)}
                className="w-full p-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.name} ({v.registrationNumber})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Date to Block / Unblock</label>
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                className="w-full p-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50"
              >
              </input>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleToggleBlock('block')}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
              >
                Block Date (Mark Unavailable)
              </button>
              <button
                onClick={() => handleToggleBlock('unblock')}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold"
              >
                Unblock Date (Make Available)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-bold text-navy-900 mb-4">Add Vehicle to ShaadiYatra</h3>

            <form onSubmit={handleAddVehicle} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Vehicle Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. White Mahindra Scorpio-N Z8L"
                  value={newVehicle.name}
                  onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                  className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Category *</label>
                  <select
                    value={newVehicle.categoryId}
                    onChange={(e) => setNewVehicle({ ...newVehicle, categoryId: e.target.value })}
                    className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Reg Plate *</label>
                  <input
                    type="text"
                    required
                    placeholder="BR01PK1234"
                    value={newVehicle.registrationNumber}
                    onChange={(e) => setNewVehicle({ ...newVehicle, registrationNumber: e.target.value })}
                    className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Seating Cap.</label>
                  <input
                    type="number"
                    value={newVehicle.capacity}
                    onChange={(e) => setNewVehicle({ ...newVehicle, capacity: parseInt(e.target.value) || 7 })}
                    className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Per Day Price</label>
                  <input
                    type="number"
                    value={newVehicle.perDayPrice}
                    onChange={(e) => setNewVehicle({ ...newVehicle, perDayPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Event Package</label>
                  <input
                    type="number"
                    value={newVehicle.perEventPrice}
                    onChange={(e) => setNewVehicle({ ...newVehicle, perEventPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">City</label>
                  <input
                    type="text"
                    value={newVehicle.city}
                    onChange={(e) => setNewVehicle({ ...newVehicle, city: e.target.value })}
                    className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">District</label>
                  <select
                    value={newVehicle.district}
                    onChange={(e) => setNewVehicle({ ...newVehicle, district: e.target.value, city: e.target.value })}
                    className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                  >
                    {BIHAR_DISTRICTS.map((d) => (
                      <option key={d} value={d.split(' ')[0]}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Photo URL</label>
                <input
                  type="text"
                  value={newVehicle.images[0]}
                  onChange={(e) => setNewVehicle({ ...newVehicle, images: [e.target.value] })}
                  className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl gold-gradient text-navy-900 text-xs font-bold shadow-md"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
