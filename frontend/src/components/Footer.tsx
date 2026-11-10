import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-900 text-slate-300 border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
                <Car className="w-6 h-6 text-navy-900" />
              </div>
              <span className="font-serif text-2xl font-bold gold-text-gradient">ShaadiYatra</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Bihar's premier multi-vendor wedding & event vehicle booking marketplace. Book luxury bridal cars, Baraat SUVs, and guest buses together under one combined booking.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs text-gold-400">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Verified Owners & Vehicles</span>
            </div>
          </div>

          {/* Service Areas */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-4">Top Bihar Cities</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/vehicles?city=Patna" className="hover:text-gold-400">Patna & Danapur</Link></li>
              <li><Link to="/vehicles?city=Muzaffarpur" className="hover:text-gold-400">Muzaffarpur & Vaishali</Link></li>
              <li><Link to="/vehicles?city=Gaya" className="hover:text-gold-400">Gaya & Bodhgaya</Link></li>
              <li><Link to="/vehicles?city=Bhagalpur" className="hover:text-gold-400">Bhagalpur & Munger</Link></li>
              <li><Link to="/vehicles?city=Darbhanga" className="hover:text-gold-400">Darbhanga & Madhubani</Link></li>
              <li><Link to="/vehicles?city=Begusarai" className="hover:text-gold-400">Begusarai & Samastipur</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/vehicles" className="hover:text-gold-400">Browse All Vehicles</Link></li>
              <li><Link to="/cart" className="hover:text-gold-400">Multi-Vehicle Event Cart</Link></li>
              <li><Link to="/register-owner" className="hover:text-gold-400 font-medium text-gold-400">Register as Vehicle Owner</Link></li>
              <li><Link to="/login" className="hover:text-gold-400">Customer & Owner Login</Link></li>
              <li><Link to="/admin" className="hover:text-gold-400">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-4">Wedding Desk Support</h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <span>+91 98000 12345 (Toll-Free)</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <span>support@shaadiyatra.in</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-1" />
                <span>Dak Bungalow Road, Patna, Bihar - 800001</span>
              </div>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 text-xs rounded-full bg-navy-800 border border-gold-500/30 text-gold-300">
                  ⚡ 25% Advance • 75% After Journey
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-navy-800 text-center text-xs text-slate-400 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} ShaadiYatra. All rights reserved. Built for grand weddings across Bihar, India.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-wine-700 fill-current" /> for celebration journeys
          </p>
        </div>
      </div>
    </footer>
  );
};
