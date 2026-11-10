import { sqliteTable, text, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// 1. Users Table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull().unique(),
  name: text('name').notNull(),
  role: text('role', { enum: ['customer', 'owner', 'admin'] }).notNull().default('customer'),
  passwordHash: text('password_hash').notNull(),
  status: text('status', { enum: ['active', 'suspended', 'pending'] }).notNull().default('active'),
  isVerified: integer('is_verified', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  uniqueIndex('users_email_idx').on(table.email),
  uniqueIndex('users_phone_idx').on(table.phone),
]);

// 2. Owner Profiles
export const ownerProfiles = sqliteTable('owner_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  businessName: text('business_name'),
  address: text('address').notNull(),
  city: text('city').notNull(),
  district: text('district').notNull(),
  state: text('state').notNull().default('Bihar'),
  idDocumentType: text('id_document_type').notNull().default('Aadhaar'),
  idDocumentUrl: text('id_document_url').notNull(),
  verificationStatus: text('verification_status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  bankAccountDetails: text('bank_account_details'), // Stored JSON or masked string
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('owner_user_idx').on(table.userId),
]);

// 3. Customer Profiles
export const customerProfiles = sqliteTable('customer_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  alternatePhone: text('alternate_phone'),
  address: text('address'),
  city: text('city'),
  district: text('district'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('customer_user_idx').on(table.userId),
]);

// 4. Vehicle Categories
export const vehicleCategories = sqliteTable('vehicle_categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  imageUrl: text('image_url'),
  iconName: text('icon_name'),
  basePriceHint: real('base_price_hint').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

// 5. Vehicles
export const vehicles = sqliteTable('vehicles', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: text('category_id').notNull().references(() => vehicleCategories.id),
  name: text('name').notNull(),
  make: text('make').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),
  registrationNumber: text('registration_number').notNull().unique(),
  capacity: integer('capacity').notNull(),
  perDayPrice: real('per_day_price').notNull(),
  perEventPrice: real('per_event_price').notNull(),
  extraKmRate: real('extra_km_rate').notNull().default(15),
  driverAllowance: real('driver_allowance').notNull().default(500),
  status: text('status', { enum: ['pending_approval', 'approved', 'rejected', 'suspended'] }).notNull().default('pending_approval'),
  city: text('city').notNull(),
  district: text('district').notNull(),
  address: text('address').notNull(),
  description: text('description').notNull(),
  featuresJson: text('features_json').notNull().default('[]'),
  rulesJson: text('rules_json').notNull().default('[]'),
  isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('vehicle_owner_idx').on(table.ownerId),
  index('vehicle_category_idx').on(table.categoryId),
  index('vehicle_city_idx').on(table.city),
  index('vehicle_district_idx').on(table.district),
  index('vehicle_status_idx').on(table.status),
]);

// 6. Vehicle Images
export const vehicleImages = sqliteTable('vehicle_images', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  isPrimary: integer('is_primary', { mode: 'boolean' }).notNull().default(false),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('vehicle_img_vehicle_idx').on(table.vehicleId),
]);

// 7. Vehicle Documents
export const vehicleDocuments = sqliteTable('vehicle_documents', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  documentType: text('document_type', { enum: ['rc', 'insurance', 'fitness', 'permit'] }).notNull(),
  documentUrl: text('document_url').notNull(),
  expiryDate: text('expiry_date'),
  verificationStatus: text('verification_status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('vehicle_doc_vehicle_idx').on(table.vehicleId),
]);

// 8. Vehicle Availability
export const vehicleAvailability = sqliteTable('vehicle_availability', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // YYYY-MM-DD
  status: text('status', { enum: ['available', 'blocked', 'held', 'booked'] }).notNull().default('available'),
  bookingId: text('booking_id'),
  holdExpiresAt: text('hold_expires_at'),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('vehicle_avail_lookup_idx').on(table.vehicleId, table.date),
]);

// 9. Bookings
export const bookings = sqliteTable('bookings', {
  id: text('id').primaryKey(),
  bookingNumber: text('booking_number').notNull().unique(),
  customerId: text('customer_id').notNull().references(() => users.id),
  eventDate: text('event_date').notNull(),
  eventEndDate: text('event_end_date').notNull(),
  eventType: text('event_type').notNull(),
  eventCity: text('event_city').notNull(),
  eventDistrict: text('event_district').notNull(),
  pickupAddress: text('pickup_address').notNull(),
  destinationAddress: text('destination_address').notNull(),
  totalAmount: real('total_amount').notNull().default(0),
  advancePercentage: real('advance_percentage').notNull().default(25),
  advanceAmountRequired: real('advance_amount_required').notNull().default(0),
  advanceAmountPaid: real('advance_amount_paid').notNull().default(0),
  balanceAmount: real('balance_amount').notNull().default(0),
  status: text('status', {
    enum: [
      'submitted',
      'owner_review',
      'admin_review',
      'approved_pending_payment',
      'confirmed',
      'completed',
      'cancelled',
      'rejected',
    ]
  }).notNull().default('submitted'),
  customerNotes: text('customer_notes'),
  adminNotes: text('admin_notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  uniqueIndex('booking_number_idx').on(table.bookingNumber),
  index('booking_customer_idx').on(table.customerId),
  index('booking_status_idx').on(table.status),
  index('booking_date_idx').on(table.eventDate),
]);

// 10. Booking Items
export const bookingItems = sqliteTable('booking_items', {
  id: text('id').primaryKey(),
  bookingId: text('booking_id').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  vehicleId: text('vehicle_id').notNull().references(() => vehicles.id),
  ownerId: text('owner_id').notNull().references(() => users.id),
  pricePerDay: real('price_per_day').notNull(),
  daysCount: integer('days_count').notNull().default(1),
  totalItemPrice: real('total_item_price').notNull(),
  status: text('status', {
    enum: [
      'pending_owner',
      'accepted_by_owner',
      'rejected_by_owner',
      'approved_by_admin',
      'rejected_by_admin',
      'confirmed',
      'cancelled',
    ]
  }).notNull().default('pending_owner'),
  snapshotDataJson: text('snapshot_data_json'), // Preserves full vehicle pricing/spec snapshot at time of booking
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('booking_item_booking_idx').on(table.bookingId),
  index('booking_item_owner_idx').on(table.ownerId),
  index('booking_item_vehicle_idx').on(table.vehicleId),
]);

// 11. Owner Responses
export const ownerResponses = sqliteTable('owner_responses', {
  id: text('id').primaryKey(),
  bookingItemId: text('booking_item_id').notNull().references(() => bookingItems.id, { onDelete: 'cascade' }),
  ownerId: text('owner_id').notNull().references(() => users.id),
  response: text('response', { enum: ['accepted', 'rejected'] }).notNull(),
  reason: text('reason'),
  respondedAt: text('responded_at').notNull(),
}, (table) => [
  index('owner_resp_item_idx').on(table.bookingItemId),
  index('owner_resp_owner_idx').on(table.ownerId),
]);

// 12. Payments
export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  bookingId: text('booking_id').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  paymentType: text('payment_type', { enum: ['advance', 'balance', 'refund'] }).notNull().default('advance'),
  amount: real('amount').notNull(),
  currency: text('currency').notNull().default('INR'),
  razorpayOrderId: text('razorpay_order_id'),
  razorpayPaymentId: text('razorpay_payment_id'),
  razorpaySignature: text('razorpay_signature'),
  status: text('status', { enum: ['created', 'authorized', 'captured', 'failed', 'refunded'] }).notNull().default('created'),
  metadataJson: text('metadata_json'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('payments_booking_idx').on(table.bookingId),
  index('payments_order_idx').on(table.razorpayOrderId),
]);

// 13. Payment Transactions
export const paymentTransactions = sqliteTable('payment_transactions', {
  id: text('id').primaryKey(),
  paymentId: text('payment_id').notNull().references(() => payments.id, { onDelete: 'cascade' }),
  transactionType: text('transaction_type').notNull(),
  amount: real('amount').notNull(),
  status: text('status').notNull(),
  gatewayResponseJson: text('gateway_response_json'),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('payment_tx_payment_idx').on(table.paymentId),
]);

// 14. Notifications
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type', { enum: ['booking_update', 'owner_request', 'admin_alert', 'payment_success'] }).notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  metadataJson: text('metadata_json'),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('notif_user_idx').on(table.userId),
]);

// 15. Reviews
export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey(),
  bookingId: text('booking_id').notNull().references(() => bookings.id),
  vehicleId: text('vehicle_id').notNull().references(() => vehicles.id),
  customerId: text('customer_id').notNull().references(() => users.id),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  isApproved: integer('is_approved', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('reviews_vehicle_idx').on(table.vehicleId),
  index('reviews_customer_idx').on(table.customerId),
]);

// 16. Locations
export const locations = sqliteTable('locations', {
  id: text('id').primaryKey(),
  city: text('city').notNull(),
  district: text('district').notNull(),
  state: text('state').notNull().default('Bihar'),
  isServiceable: integer('is_serviceable', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
}, (table) => [
  uniqueIndex('locations_city_district_idx').on(table.city, table.district),
]);

// 17. Platform Settings
export const platformSettings = sqliteTable('platform_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  description: text('description'),
  updatedAt: text('updated_at').notNull(),
});

// 18. Audit Logs
export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  detailsJson: text('details_json'),
  ipAddress: text('ip_address'),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('audit_logs_user_idx').on(table.userId),
  index('audit_logs_entity_idx').on(table.entityType, table.entityId),
]);

// Table Relations
export const vehicleCategoriesRelations = relations(vehicleCategories, ({ many }) => ({
  vehicles: many(vehicles),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  ownerProfile: one(ownerProfiles),
  customerProfile: one(customerProfiles),
  vehicles: many(vehicles),
  customerBookings: many(bookings),
  notifications: many(notifications),
}));

export const ownerProfilesRelations = relations(ownerProfiles, ({ one }) => ({
  user: one(users, { fields: [ownerProfiles.userId], references: [users.id] }),
}));

export const customerProfilesRelations = relations(customerProfiles, ({ one }) => ({
  user: one(users, { fields: [customerProfiles.userId], references: [users.id] }),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  owner: one(users, { fields: [vehicles.ownerId], references: [users.id] }),
  category: one(vehicleCategories, { fields: [vehicles.categoryId], references: [vehicleCategories.id] }),
  images: many(vehicleImages),
  documents: many(vehicleDocuments),
  availability: many(vehicleAvailability),
  bookingItems: many(bookingItems),
  reviews: many(reviews),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  customer: one(users, { fields: [bookings.customerId], references: [users.id] }),
  items: many(bookingItems),
  payments: many(payments),
}));

export const bookingItemsRelations = relations(bookingItems, ({ one }) => ({
  booking: one(bookings, { fields: [bookingItems.bookingId], references: [bookings.id] }),
  vehicle: one(vehicles, { fields: [bookingItems.vehicleId], references: [vehicles.id] }),
  owner: one(users, { fields: [bookingItems.ownerId], references: [users.id] }),
  ownerResponse: one(ownerResponses, { fields: [bookingItems.id], references: [ownerResponses.bookingItemId] }),
}));

export const vehicleImagesRelations = relations(vehicleImages, ({ one }) => ({
  vehicle: one(vehicles, { fields: [vehicleImages.vehicleId], references: [vehicles.id] }),
}));

export const vehicleDocumentsRelations = relations(vehicleDocuments, ({ one }) => ({
  vehicle: one(vehicles, { fields: [vehicleDocuments.vehicleId], references: [vehicles.id] }),
}));

export const vehicleAvailabilityRelations = relations(vehicleAvailability, ({ one }) => ({
  vehicle: one(vehicles, { fields: [vehicleAvailability.vehicleId], references: [vehicles.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  vehicle: one(vehicles, { fields: [reviews.vehicleId], references: [vehicles.id] }),
  customer: one(users, { fields: [reviews.customerId], references: [users.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, { fields: [payments.bookingId], references: [bookings.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const ownerResponsesRelations = relations(ownerResponses, ({ one }) => ({
  bookingItem: one(bookingItems, { fields: [ownerResponses.bookingItemId], references: [bookingItems.id] }),
  owner: one(users, { fields: [ownerResponses.ownerId], references: [users.id] }),
}));
