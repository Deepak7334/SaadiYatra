import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartVehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  categoryName?: string;
  perDayPrice: number;
  capacity: number;
  city: string;
  primaryImage: string;
  ownerId: string;
  ownerName?: string;
}

export interface BookingDetails {
  eventDate: string;
  eventEndDate: string;
  eventType: string;
  eventCity: string;
  eventDistrict: string;
  pickupAddress: string;
  destinationAddress: string;
  customerNotes?: string;
}

interface CartContextType {
  cart: CartVehicle[];
  bookingDetails: BookingDetails;
  addToCart: (vehicle: CartVehicle) => void;
  removeFromCart: (vehicleId: string) => void;
  clearCart: () => void;
  isInCart: (vehicleId: string) => boolean;
  updateBookingDetails: (details: Partial<BookingDetails>) => void;
  totalAmount: number;
  advanceAmount: number;
  daysCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const DEFAULT_BOOKING_DETAILS: BookingDetails = {
  eventDate: '',
  eventEndDate: '',
  eventType: 'wedding',
  eventCity: 'Patna',
  eventDistrict: 'Patna',
  pickupAddress: '',
  destinationAddress: '',
  customerNotes: '',
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartVehicle[]>(() => {
    try {
      const saved = localStorage.getItem('shaadiyatra_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bookingDetails, setBookingDetails] = useState<BookingDetails>(() => {
    try {
      const saved = localStorage.getItem('shaadiyatra_booking_details');
      return saved ? JSON.parse(saved) : DEFAULT_BOOKING_DETAILS;
    } catch {
      return DEFAULT_BOOKING_DETAILS;
    }
  });

  useEffect(() => {
    localStorage.setItem('shaadiyatra_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('shaadiyatra_booking_details', JSON.stringify(bookingDetails));
  }, [bookingDetails]);

  const addToCart = (vehicle: CartVehicle) => {
    setCart((prev) => {
      if (prev.some((v) => v.id === vehicle.id)) return prev;
      return [...prev, vehicle];
    });
  };

  const removeFromCart = (vehicleId: string) => {
    setCart((prev) => prev.filter((v) => v.id !== vehicleId));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('shaadiyatra_cart');
  };

  const isInCart = (vehicleId: string) => {
    return cart.some((v) => v.id === vehicleId);
  };

  const updateBookingDetails = (details: Partial<BookingDetails>) => {
    setBookingDetails((prev) => ({ ...prev, ...details }));
  };

  // Calculate days
  const d1 = bookingDetails.eventDate ? new Date(bookingDetails.eventDate) : null;
  const d2 = bookingDetails.eventEndDate ? new Date(bookingDetails.eventEndDate) : d1;
  const daysCount = (d1 && d2 && d2 >= d1)
    ? Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1)
    : 1;

  const totalAmount = cart.reduce((sum, v) => sum + (v.perDayPrice * daysCount), 0);
  const advanceAmount = Math.round(totalAmount * 0.25); // 25% advance default

  return (
    <CartContext.Provider
      value={{
        cart,
        bookingDetails,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        updateBookingDetails,
        totalAmount,
        advanceAmount,
        daysCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
