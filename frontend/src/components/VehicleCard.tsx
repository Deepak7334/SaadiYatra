import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Users, MapPin, CheckCircle, Plus, Check } from 'lucide-react';

export interface VehicleCardProps {
  vehicle: {
    id: string;
    name: string;
    make: string;
    model: string;
    categoryName?: string;
    capacity: number;
    perDayPrice: number;
    city: string;
    district: string;
    primaryImage?: string;
    isFeatured?: boolean;
    ownerId: string;
    ownerName?: string;
    isOwnerVerified?: boolean;
  };
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const { addToCart, removeFromCart, isInCart } = useCart();
  const inCart = isInCart(vehicle.id);

  const fallbackImage = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800';
  const imageUrl = vehicle.primaryImage || fallbackImage;

  const handleCartToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inCart) {
      removeFromCart(vehicle.id);
    } else {
      addToCart({
        id: vehicle.id,
        name: vehicle.name,
        make: vehicle.make,
        model: vehicle.model,
        categoryName: vehicle.categoryName,
        perDayPrice: vehicle.perDayPrice,
        capacity: vehicle.capacity,
        city: vehicle.city,
        primaryImage: imageUrl,
        ownerId: vehicle.ownerId,
        ownerName: vehicle.ownerName,
      });
    }
  };

  return (
    <div className="wedding-card overflow-hidden group flex flex-col h-full bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Vehicle Image Container */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={vehicle.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Category Badge */}
        <span className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full bg-navy-900/80 backdrop-blur-md text-gold-300 border border-gold-500/30">
          {vehicle.categoryName || 'Wedding Vehicle'}
        </span>

        {/* Featured Tag */}
        {vehicle.isFeatured && (
          <span className="absolute top-3 right-3 px-2.5 py-1 text-[11px] font-bold rounded-full gold-gradient text-navy-900 shadow-md">
            ★ Featured
          </span>
        )}

        {/* Verified Owner Badge */}
        {vehicle.isOwnerVerified && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-300 text-[11px] font-medium border border-emerald-500/30">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Fleet</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold text-slate-900 group-hover:text-gold-600 transition-colors line-clamp-1">
            {vehicle.name}
          </h3>

          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              <span>{vehicle.capacity} Seater</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{vehicle.city}, {vehicle.district}</span>
            </span>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Daily Rate</div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-navy-900">
                ₹{vehicle.perDayPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ day</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/vehicles/${vehicle.id}`}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-navy-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Details
            </Link>

            <button
              onClick={handleCartToggle}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm ${
                inCart
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'gold-gradient text-navy-900 hover:brightness-105'
              }`}
            >
              {inCart ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Added
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
