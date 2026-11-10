import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BIHAR_DISTRICTS } from '@shaadiyatra/shared';
import { ShieldCheck, User, Mail, Phone, Lock, MapPin, Building2, FileText, AlertCircle, ArrowRight } from 'lucide-react';

export const RegisterOwner: React.FC = () => {
  const { registerOwner } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    businessName: '',
    address: '',
    city: 'Patna',
    district: 'Patna',
    idDocumentType: 'Aadhaar Card',
    idDocumentUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600', // Sample placeholder or doc link
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerOwner(formData);
      navigate('/owner');
    } catch (err: any) {
      setError(err.message || 'Owner registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-16 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl gold-gradient flex items-center justify-center shadow-md mx-auto mb-4">
          <ShieldCheck className="w-7 h-7 text-navy-900" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-navy-900">
          Partner with ShaadiYatra
        </h1>
        <p className="mt-2 text-xs text-slate-500 max-w-md mx-auto">
          List your luxury cars, Scorpios, vans, and buses. Earn high-volume wedding season bookings across Bihar.
        </p>
      </div>

      <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/80 shadow-xl space-y-6">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Owner Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  name="name"
                  placeholder="e.g. Rajesh Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Agency / Fleet Name (Optional)
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  name="businessName"
                  placeholder="e.g. Patna Royal Travels"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  name="email"
                  placeholder="owner@travels.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  required
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Operating District in Bihar *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <select
                  name="district"
                  value={formData.district}
                  onChange={(e) => {
                    handleChange(e);
                    setFormData((prev) => ({ ...prev, city: e.target.value }));
                  }}
                  className="w-full pl-9 pr-3 py-2.5 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                >
                  {BIHAR_DISTRICTS.map((d) => (
                    <option key={d} value={d.split(' ')[0]}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  name="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Garage / Office Address *
            </label>
            <input
              type="text"
              required
              name="address"
              placeholder="e.g. Boring Road, Near Alankar Jewellers, Patna"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2.5 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
            />
          </div>

          {/* Verification Document Info */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <span className="block text-xs font-bold uppercase tracking-wider text-navy-900">
              Identity Verification Document
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Document Type</label>
                <select
                  name="idDocumentType"
                  value={formData.idDocumentType}
                  onChange={handleChange}
                  className="w-full p-2 text-xs font-medium border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="Driving License">Commercial Driving License</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="Business GST">GST Registration Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Document Link / URL</label>
                <input
                  type="text"
                  name="idDocumentUrl"
                  placeholder="URL to scanned copy / cloud document"
                  value={formData.idDocumentUrl}
                  onChange={handleChange}
                  className="w-full p-2 text-xs font-medium border border-slate-200 rounded-lg bg-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl gold-gradient text-navy-900 font-extrabold text-sm shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-navy-900 border-t-transparent" />
            ) : (
              <>
                <span>Complete Partner Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Already registered as an owner?{' '}
          <Link to="/login" className="font-bold text-navy-900 hover:underline">
            Sign In to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
