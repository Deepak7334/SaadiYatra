import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';
import {
  Car,
  ShoppingCart,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  LayoutDashboard,
  CalendarCheck,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    if (user) {
      api.getNotifications()
        .then((res) => {
          if (res.success) setUnreadNotifs(res.unreadCount || 0);
        })
        .catch(() => {});
    }
  }, [user]);

  return (
    <nav className="sticky top-0 z-50 glass-nav border-b border-navy-700/50 shadow-lg text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center shadow-md transform group-hover:scale-105 transition-transform duration-200">
              <Car className="w-7 h-7 text-navy-900" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight gold-text-gradient">
                ShaadiYatra
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-gold-300 font-medium">
                Wedding Vehicle Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link to="/vehicles" className="text-slate-200 hover:text-gold-400 transition-colors">
              Browse Vehicles
            </Link>
            <Link to="/vehicles?category=luxury-wedding-cars" className="text-slate-200 hover:text-gold-400 transition-colors">
              Luxury Baraat Cars
            </Link>
            <Link to="/vehicles?category=tempo-travellers" className="text-slate-200 hover:text-gold-400 transition-colors">
              Baraati Vans & Buses
            </Link>
            {!user && (
              <Link to="/register-owner" className="text-gold-400 hover:text-gold-300 transition-colors flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-4 h-4" /> List Your Vehicle
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-5">
            {/* Booking Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl bg-navy-700 hover:bg-navy-600 text-slate-200 hover:text-gold-400 transition-colors border border-navy-600 flex items-center gap-2 text-sm font-medium"
            >
              <ShoppingCart className="w-5 h-5 text-gold-400" />
              <span>Event Cart</span>
              {cart.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-gold-500 text-navy-900 rounded-full animate-pulse">
                  {cart.length}
                </span>
              )}
            </Link>

            {/* User State */}
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Role-based dashboard button */}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="px-3.5 py-2 rounded-xl bg-wine-800 text-white hover:bg-wine-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-wine-700 shadow-sm"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Super Admin
                  </Link>
                )}

                {user.role === 'owner' && (
                  <Link
                    to="/owner"
                    className="px-3.5 py-2 rounded-xl gold-gradient text-navy-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:brightness-105"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Owner Panel
                  </Link>
                )}

                {user.role === 'customer' && (
                  <Link
                    to="/customer/bookings"
                    className="px-3.5 py-2 rounded-xl bg-navy-700 hover:bg-navy-600 text-gold-300 border border-gold-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <CalendarCheck className="w-4 h-4" /> My Bookings
                  </Link>
                )}

                {/* User menu / Logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-navy-700">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-200">{user.name}</div>
                    <div className="text-[10px] text-gold-400 uppercase tracking-wider">{user.role}</div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    title="Logout"
                    className="p-2 rounded-lg hover:bg-navy-700 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-200 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl gold-gradient text-navy-900 text-sm font-bold shadow-md hover:brightness-105 transition-all"
                >
                  Book Vehicles
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            <Link to="/cart" className="relative p-2 text-gold-400">
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 px-1.5 py-0.2 text-[10px] font-bold bg-gold-500 text-navy-900 rounded-full">
                  {cart.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy-900 border-b border-navy-700 px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/vehicles"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-200 hover:text-gold-400"
          >
            Browse Vehicles
          </Link>
          <Link
            to="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-200 hover:text-gold-400"
          >
            Event Cart ({cart.length})
          </Link>

          {user ? (
            <div className="pt-3 border-t border-navy-800 space-y-2">
              <div className="text-xs text-gold-400 font-semibold">{user.name} ({user.role})</div>
              {user.role === 'customer' && (
                <Link
                  to="/customer/bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm text-slate-200"
                >
                  My Bookings
                </Link>
              )}
              {user.role === 'owner' && (
                <Link
                  to="/owner"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm text-gold-400 font-bold"
                >
                  Vehicle Owner Dashboard
                </Link>
              )}
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm text-gold-400 font-bold"
                >
                  Super Admin Panel
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/');
                }}
                className="w-full text-left py-2 text-sm text-red-400"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-navy-800 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-navy-600 text-slate-200 text-sm font-semibold"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl gold-gradient text-navy-900 text-sm font-bold shadow-md"
              >
                Book Vehicles
              </Link>
              <Link
                to="/register-owner"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs text-gold-400 font-medium"
              >
                List Your Vehicle (Owner Registration)
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
