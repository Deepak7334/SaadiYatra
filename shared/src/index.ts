export type UserRole = 'customer' | 'owner' | 'admin';

export type UserStatus = 'active' | 'suspended' | 'pending';

export type VehicleStatus = 'pending_approval' | 'approved' | 'rejected' | 'suspended';

export type BookingStatus =
  | 'submitted'
  | 'owner_review'
  | 'admin_review'
  | 'approved_pending_payment'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type BookingItemStatus =
  | 'pending_owner'
  | 'accepted_by_owner'
  | 'rejected_by_owner'
  | 'approved_by_admin'
  | 'rejected_by_admin'
  | 'confirmed'
  | 'cancelled';

export type AvailabilityStatus = 'available' | 'blocked' | 'held' | 'booked';

export type PaymentStatus = 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';

export type PaymentType = 'advance' | 'balance' | 'refund';

export type OwnerVerificationStatus = 'pending' | 'approved' | 'rejected';

export interface UserSummary {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  createdAt: string;
}

export interface OwnerProfile {
  id: string;
  userId: string;
  businessName?: string;
  address: string;
  city: string;
  district: string;
  state: string;
  idDocumentType: string;
  idDocumentUrl: string;
  verificationStatus: OwnerVerificationStatus;
  bankAccountDetails?: string;
  createdAt: string;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  district?: string;
  createdAt: string;
}

export interface VehicleCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  iconName: string;
  basePriceHint: number;
  isActive: boolean;
  displayOrder: number;
}

export interface VehicleImage {
  id: string;
  vehicleId: string;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  documentType: 'rc' | 'insurance' | 'fitness' | 'permit';
  documentUrl: string;
  expiryDate?: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
}

export interface Vehicle {
  id: string;
  ownerId: string;
  ownerName?: string;
  ownerPhone?: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  capacity: number;
  perDayPrice: number;
  perEventPrice: number;
  extraKmRate: number;
  driverAllowance: number;
  status: VehicleStatus;
  city: string;
  district: string;
  address: string;
  description: string;
  features: string[];
  rules: string[];
  isFeatured: boolean;
  primaryImage?: string;
  images?: VehicleImage[];
  createdAt: string;
  updatedAt: string;
}

export interface VehicleAvailabilityRecord {
  id: string;
  vehicleId: string;
  date: string; // YYYY-MM-DD
  status: AvailabilityStatus;
  bookingId?: string;
  holdExpiresAt?: string;
}

export interface BookingItem {
  id: string;
  bookingId: string;
  vehicleId: string;
  vehicleName?: string;
  vehicleCategory?: string;
  vehicleImage?: string;
  ownerId: string;
  ownerName?: string;
  ownerPhone?: string;
  pricePerDay: number;
  daysCount: number;
  totalItemPrice: number;
  status: BookingItemStatus;
  snapshotData?: Record<string, any>;
  ownerResponse?: {
    response: 'accepted' | 'rejected';
    reason?: string;
    respondedAt: string;
  };
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  eventDate: string; // YYYY-MM-DD
  eventEndDate: string; // YYYY-MM-DD
  eventType: string; // 'wedding' | 'reception' | 'engagement' | 'religious' | 'other'
  eventCity: string;
  eventDistrict: string;
  pickupAddress: string;
  destinationAddress: string;
  totalAmount: number;
  advancePercentage: number;
  advanceAmountRequired: number;
  advanceAmountPaid: number;
  balanceAmount: number;
  status: BookingStatus;
  customerNotes?: string;
  adminNotes?: string;
  items: BookingItem[];
  payments?: PaymentRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  paymentType: PaymentType;
  amount: number;
  currency: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: PaymentStatus;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking_update' | 'owner_request' | 'admin_alert' | 'payment_success';
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface LocationItem {
  id: string;
  city: string;
  district: string;
  state: string;
  isServiceable: boolean;
}

export interface PlatformSetting {
  key: string;
  value: string;
  description: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalOwners: number;
  totalVehicles: number;
  pendingVehicleApprovals: number;
  activeVehicles: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingPayments: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
}

// Request / Response DTOs
export interface CreateBookingRequestDto {
  eventDate: string; // YYYY-MM-DD
  eventEndDate: string; // YYYY-MM-DD
  eventType: string;
  eventCity: string;
  eventDistrict: string;
  pickupAddress: string;
  destinationAddress: string;
  customerNotes?: string;
  vehicleIds: string[];
}

export interface OwnerResponseDto {
  bookingItemId: string;
  response: 'accepted' | 'rejected';
  reason?: string;
}

export interface AdminApprovalDto {
  approvedItemIds: string[];
  rejectedItemIds: string[];
  adminNotes?: string;
  advancePercentage?: number;
}

export interface RazorpayVerificationDto {
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export * from './constants';
