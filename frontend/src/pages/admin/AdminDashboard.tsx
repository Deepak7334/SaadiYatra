import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  Users,
  Car,
  CalendarCheck,
  CreditCard,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  AlertCircle,
  DollarSign,
  ChevronRight,
  TrendingUp,
  MapPin,
  FileCheck,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'bookings' | 'vehicles' | 'owners' | 'settings'>('bookings');

  const [stats, setStats] = useState<any | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Review Booking Modal state
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<any | null>(null);
  const [approvedItemIds, setApprovedItemIds] = useState<string[]>([]);
  const [rejectedItemIds, setRejectedItemIds] = useState<string[]>([]);
  const [advancePct, setAdvancePct] = useState<number>(25);

  const fetchAllAdminData = async () => {
    setLoading(true);
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
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  // Owner KYC verification
  const handleVerifyOwner = async (ownerId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await api.verifyOwner(ownerId, status);
      if (res.success) {
        setSuccessMsg(`Owner KYC status updated to ${status}.`);
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchAllAdminData();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Vehicle status update
  const handleUpdateVehicleStatus = async (vehicleId: string, status: string) => {
    try {
      const res = await api.updateVehicleStatus(vehicleId, status);
      if (res.success) {
        setSuccessMsg(`Vehicle status updated to ${status}.`);
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchAllAdminData();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Open Review Booking Modal
  const openReviewModal = (booking: any) => {
    setSelectedBookingForReview(booking);
    // Pre-select accepted items for approval
    const acceptedIds = booking.items
      .filter((i: any) => i.status === 'accepted_by_owner' || i.status === 'pending_owner')
      .map((i: any) => i.id);
    const rejectedIds = booking.items
      .filter((i: any) => i.status === 'rejected_by_owner')
      .map((i: any) => i.id);
    setApprovedItemIds(acceptedIds);
    setRejectedItemIds(rejectedIds);
    setAdvancePct(booking.advancePercentage || 25);
  };

  // Finalize Admin Booking Review
  const handleFinalizeBookingReview = async () => {
    if (!selectedBookingForReview) return;
    if (approvedItemIds.length === 0) {
      alert('Please approve at least one vehicle item.');
      return;
    }

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
        fetchAllAdminData();
      } else {
        setError(res.error || 'Failed to review booking');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200/80 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-600">Administration</span>
            <span className="px-2.5 py-0.5 rounded-full bg-wine-800 text-white text-[10px] font-bold">
              Super Admin Authority
            </span>
          </div>
          <h1 className="font-serif text-3xl font-extrabold text-navy-900 mt-1">
            ShaadiYatra Control Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-vehicle marketplace governance across Bihar.
          </p>
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

      {/* Analytics KPI Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[10px] font-bold uppercase text-slate-400">Total Bookings</div>
            <div className="text-2xl font-extrabold text-navy-900 mt-1">{stats.totalBookings}</div>
            <div className="text-[10px] text-emerald-600 font-semibold">{stats.confirmedBookings} confirmed</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[10px] font-bold uppercase text-slate-400">Platform Revenue</div>
            <div className="text-xl font-extrabold text-navy-900 mt-1">₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-slate-400 font-semibold">Advance collected</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[10px] font-bold uppercase text-slate-400">Pending Approvals</div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{stats.pendingVehicleApprovals}</div>
            <div className="text-[10px] text-amber-600 font-semibold">Vehicles awaiting review</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[10px] font-bold uppercase text-slate-400">Registered Owners</div>
            <div className="text-2xl font-extrabold text-navy-900 mt-1">{stats.totalOwners}</div>
            <div className="text-[10px] text-slate-400 font-semibold">Fleet operators</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[10px] font-bold uppercase text-slate-400">Total Vehicles</div>
            <div className="text-2xl font-extrabold text-navy-900 mt-1">{stats.totalVehicles}</div>
            <div className="text-[10px] text-emerald-600 font-semibold">{stats.activeVehicles} active</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[10px] font-bold uppercase text-slate-400">Customers</div>
            <div className="text-2xl font-extrabold text-navy-900 mt-1">{stats.totalCustomers}</div>
            <div className="text-[10px] text-slate-400 font-semibold">Verified users</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'bookings'
              ? 'border-gold-500 text-navy-900'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Bookings ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vehicles')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'vehicles'
              ? 'border-gold-500 text-navy-900'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Vehicle Approvals ({vehicles.length})</span>
          {vehicles.filter((v) => v.status === 'pending_approval').length > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
              {vehicles.filter((v) => v.status === 'pending_approval').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('owners')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'owners'
              ? 'border-gold-500 text-navy-900'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Owners & KYC ({owners.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-gold-500 text-navy-900'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Platform Settings</span>
        </button>
      </div>

      {/* 1. Master Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-navy-900">
                      {booking.bookingNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                      booking.status === 'approved_pending_payment' ? 'bg-purple-100 text-purple-800' :
                      booking.status === 'admin_review' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {booking.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Customer: <strong>{booking.customerName}</strong> ({booking.customerPhone}) • Date: <strong>{booking.eventDate}</strong> • City: {booking.eventCity}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-base font-extrabold text-navy-900">
                      ₹{booking.totalAmount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-gold-700 font-bold">
                      Advance: ₹{booking.advanceAmountRequired?.toLocaleString('en-IN')} ({booking.advancePercentage}%)
                    </div>
                  </div>

                  <button
                    onClick={() => openReviewModal(booking)}
                    className="px-4 py-2 rounded-xl gold-gradient text-navy-900 text-xs font-bold shadow-sm hover:brightness-105"
                  >
                    Review & Finalize
                  </button>
                </div>
              </div>

              {/* Vehicle breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {booking.items.map((item: any) => (
                  <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="font-bold text-navy-900 truncate">{item.vehicleName}</div>
                    <div className="text-slate-500 text-[11px]">Owner: {item.ownerName}</div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
                      <span className="font-extrabold text-navy-900">₹{item.totalItemPrice.toLocaleString('en-IN')}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                        item.status === 'accepted_by_owner' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'rejected_by_owner' ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Vehicles Approval Tab */}
      {activeTab === 'vehicles' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Reg Plate</th>
                <th className="p-4">Daily Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-navy-900 flex items-center gap-3">
                    {v.primaryImage && (
                      <img src={v.primaryImage} alt="" className="w-12 h-10 rounded-lg object-cover" />
                    )}
                    <span>{v.name}</span>
                  </td>
                  <td className="p-4 text-slate-600">{v.ownerName} ({v.ownerPhone})</td>
                  <td className="p-4 font-mono font-bold text-slate-800">{v.registrationNumber}</td>
                  <td className="p-4 font-bold text-navy-900">₹{v.perDayPrice.toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold capitalize ${
                      v.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      v.status === 'pending_approval' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {v.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {v.status !== 'approved' && (
                      <button
                        onClick={() => handleUpdateVehicleStatus(v.id, 'approved')}
                        className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                    )}
                    {v.status !== 'rejected' && (
                      <button
                        onClick={() => handleUpdateVehicleStatus(v.id, 'rejected')}
                        className="px-3 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold hover:bg-rose-200"
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. Owners & KYC Tab */}
      {activeTab === 'owners' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Owner Name</th>
                <th className="p-4">Agency / Business</th>
                <th className="p-4">Location</th>
                <th className="p-4">ID Document</th>
                <th className="p-4">Fleet Size</th>
                <th className="p-4">KYC Status</th>
                <th className="p-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {owners.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-navy-900">{o.name} <div className="text-[11px] text-slate-400 font-normal">{o.phone}</div></td>
                  <td className="p-4 font-medium text-slate-700">{o.businessName || 'Independent'}</td>
                  <td className="p-4 text-slate-600">{o.city}, {o.district}</td>
                  <td className="p-4 text-slate-600">
                    <span className="font-semibold">{o.idDocumentType}</span>
                    <a href={o.idDocumentUrl} target="_blank" rel="noreferrer" className="block text-gold-600 hover:underline text-[10px]">
                      View Document Scans
                    </a>
                  </td>
                  <td className="p-4 font-bold text-navy-900">{o.vehicleCount} vehicles</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold capitalize ${
                      o.verificationStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {o.verificationStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {o.verificationStatus !== 'approved' && (
                      <button
                        onClick={() => handleVerifyOwner(o.id, 'approved')}
                        className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                      >
                        Approve KYC
                      </button>
                    )}
                    {o.verificationStatus !== 'rejected' && (
                      <button
                        onClick={() => handleVerifyOwner(o.id, 'rejected')}
                        className="px-3 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold hover:bg-rose-200"
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm max-w-xl mx-auto space-y-6">
          <h3 className="font-serif text-xl font-bold text-navy-900">Platform Financial Parameters</h3>
          <div className="space-y-4 text-xs">
            {settings.map((s) => (
              <div key={s.key} className="flex justify-between items-center py-2 border-b border-slate-100">
                <div>
                  <span className="font-bold text-navy-900 capitalize">{s.key.replace(/_/g, ' ')}</span>
                  <div className="text-[10px] text-slate-400">{s.description}</div>
                </div>
                <span className="font-mono font-extrabold text-navy-900 text-sm">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Booking Review Modal */}
      {selectedBookingForReview && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold-600">Admin Authority Review</span>
              <h3 className="font-serif text-2xl font-bold text-navy-900 mt-1">
                Booking #{selectedBookingForReview.bookingNumber}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select which vehicles to approve for this wedding. Partial bookings are supported!
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold uppercase text-slate-400">Individual Vehicle Items</div>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {selectedBookingForReview.items.map((item: any) => {
                  const isApproved = approvedItemIds.includes(item.id);
                  return (
                    <div key={item.id} className="p-4 flex items-center justify-between bg-slate-50">
                      <div>
                        <div className="text-sm font-bold text-navy-900">{item.vehicleName}</div>
                        <div className="text-xs text-slate-500">
                          Owner: <strong>{item.ownerName}</strong> • Owner Status: <strong className="text-gold-700 capitalize">{item.ownerResponse?.response || 'pending'}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="font-extrabold text-navy-900 text-sm">
                            ₹{item.totalItemPrice.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (isApproved) {
                              setApprovedItemIds(approvedItemIds.filter((i) => i !== item.id));
                              setRejectedItemIds([...rejectedItemIds, item.id]);
                            } else {
                              setApprovedItemIds([...approvedItemIds, item.id]);
                              setRejectedItemIds(rejectedItemIds.filter((i) => i !== item.id));
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isApproved ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {isApproved ? 'Approved ✓' : 'Rejected ✗'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Advance Percentage Adjustment */}
            <div className="p-4 rounded-2xl bg-gold-50 border border-gold-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-navy-900">Advance Percentage to Require</span>
                <p className="text-[11px] text-slate-500">Configurable for this specific booking</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={10}
                  max={100}
                  value={advancePct}
                  onChange={(e) => setAdvancePct(parseInt(e.target.value) || 25)}
                  className="w-16 p-2 text-center text-xs font-bold border border-gold-300 rounded-lg bg-white"
                />
                <span className="font-bold text-navy-900">%</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedBookingForReview(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalizeBookingReview}
                className="px-6 py-2.5 rounded-xl gold-gradient text-navy-900 text-xs font-bold shadow-md hover:brightness-105"
              >
                Approve & Generate Payment Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
