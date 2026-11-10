-- ShaadiYatra Database Initialization
-- All 18 normalized tables for Bihar Wedding Vehicle Marketplace

CREATE TABLE IF NOT EXISTS `users` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL UNIQUE,
  `phone` text NOT NULL UNIQUE,
  `name` text NOT NULL,
  `role` text NOT NULL DEFAULT 'customer',
  `password_hash` text NOT NULL,
  `status` text NOT NULL DEFAULT 'active',
  `is_verified` integer NOT NULL DEFAULT 1,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS `users_email_idx` ON `users` (`email`);
CREATE UNIQUE INDEX IF NOT EXISTS `users_phone_idx` ON `users` (`phone`);

CREATE TABLE IF NOT EXISTS `owner_profiles` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `business_name` text,
  `address` text NOT NULL,
  `city` text NOT NULL,
  `district` text NOT NULL,
  `state` text NOT NULL DEFAULT 'Bihar',
  `id_document_type` text NOT NULL DEFAULT 'Aadhaar',
  `id_document_url` text NOT NULL,
  `verification_status` text NOT NULL DEFAULT 'pending',
  `bank_account_details` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `owner_user_idx` ON `owner_profiles` (`user_id`);

CREATE TABLE IF NOT EXISTS `customer_profiles` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `alternate_phone` text,
  `address` text,
  `city` text,
  `district` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `customer_user_idx` ON `customer_profiles` (`user_id`);

CREATE TABLE IF NOT EXISTS `vehicle_categories` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL UNIQUE,
  `slug` text NOT NULL UNIQUE,
  `description` text,
  `image_url` text,
  `icon_name` text,
  `base_price_hint` real DEFAULT 0,
  `is_active` integer NOT NULL DEFAULT 1,
  `display_order` integer NOT NULL DEFAULT 0,
  `created_at` text NOT NULL
);

CREATE TABLE IF NOT EXISTS `vehicles` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `category_id` text NOT NULL REFERENCES `vehicle_categories`(`id`),
  `name` text NOT NULL,
  `make` text NOT NULL,
  `model` text NOT NULL,
  `year` integer NOT NULL,
  `registration_number` text NOT NULL UNIQUE,
  `capacity` integer NOT NULL,
  `per_day_price` real NOT NULL,
  `per_event_price` real NOT NULL,
  `extra_km_rate` real NOT NULL DEFAULT 15,
  `driver_allowance` real NOT NULL DEFAULT 500,
  `status` text NOT NULL DEFAULT 'pending_approval',
  `city` text NOT NULL,
  `district` text NOT NULL,
  `address` text NOT NULL,
  `description` text NOT NULL,
  `features_json` text NOT NULL DEFAULT '[]',
  `rules_json` text NOT NULL DEFAULT '[]',
  `is_featured` integer NOT NULL DEFAULT 0,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `vehicle_owner_idx` ON `vehicles` (`owner_id`);
CREATE INDEX IF NOT EXISTS `vehicle_category_idx` ON `vehicles` (`category_id`);
CREATE INDEX IF NOT EXISTS `vehicle_city_idx` ON `vehicles` (`city`);
CREATE INDEX IF NOT EXISTS `vehicle_district_idx` ON `vehicles` (`district`);
CREATE INDEX IF NOT EXISTS `vehicle_status_idx` ON `vehicles` (`status`);

CREATE TABLE IF NOT EXISTS `vehicle_images` (
  `id` text PRIMARY KEY NOT NULL,
  `vehicle_id` text NOT NULL REFERENCES `vehicles`(`id`) ON DELETE CASCADE,
  `image_url` text NOT NULL,
  `is_primary` integer NOT NULL DEFAULT 0,
  `display_order` integer NOT NULL DEFAULT 0,
  `created_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `vehicle_img_vehicle_idx` ON `vehicle_images` (`vehicle_id`);

CREATE TABLE IF NOT EXISTS `vehicle_documents` (
  `id` text PRIMARY KEY NOT NULL,
  `vehicle_id` text NOT NULL REFERENCES `vehicles`(`id`) ON DELETE CASCADE,
  `document_type` text NOT NULL,
  `document_url` text NOT NULL,
  `expiry_date` text,
  `verification_status` text NOT NULL DEFAULT 'pending',
  `created_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `vehicle_doc_vehicle_idx` ON `vehicle_documents` (`vehicle_id`);

CREATE TABLE IF NOT EXISTS `vehicle_availability` (
  `id` text PRIMARY KEY NOT NULL,
  `vehicle_id` text NOT NULL REFERENCES `vehicles`(`id`) ON DELETE CASCADE,
  `date` text NOT NULL,
  `status` text NOT NULL DEFAULT 'available',
  `booking_id` text,
  `hold_expires_at` text,
  `created_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `vehicle_avail_lookup_idx` ON `vehicle_availability` (`vehicle_id`, `date`);

CREATE TABLE IF NOT EXISTS `bookings` (
  `id` text PRIMARY KEY NOT NULL,
  `booking_number` text NOT NULL UNIQUE,
  `customer_id` text NOT NULL REFERENCES `users`(`id`),
  `event_date` text NOT NULL,
  `event_end_date` text NOT NULL,
  `event_type` text NOT NULL,
  `event_city` text NOT NULL,
  `event_district` text NOT NULL,
  `pickup_address` text NOT NULL,
  `destination_address` text NOT NULL,
  `total_amount` real NOT NULL DEFAULT 0,
  `advance_percentage` real NOT NULL DEFAULT 25,
  `advance_amount_required` real NOT NULL DEFAULT 0,
  `advance_amount_paid` real NOT NULL DEFAULT 0,
  `balance_amount` real NOT NULL DEFAULT 0,
  `status` text NOT NULL DEFAULT 'submitted',
  `customer_notes` text,
  `admin_notes` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS `booking_number_idx` ON `bookings` (`booking_number`);
CREATE INDEX IF NOT EXISTS `booking_customer_idx` ON `bookings` (`customer_id`);
CREATE INDEX IF NOT EXISTS `booking_status_idx` ON `bookings` (`status`);
CREATE INDEX IF NOT EXISTS `booking_date_idx` ON `bookings` (`event_date`);

CREATE TABLE IF NOT EXISTS `booking_items` (
  `id` text PRIMARY KEY NOT NULL,
  `booking_id` text NOT NULL REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  `vehicle_id` text NOT NULL REFERENCES `vehicles`(`id`),
  `owner_id` text NOT NULL REFERENCES `users`(`id`),
  `price_per_day` real NOT NULL,
  `days_count` integer NOT NULL DEFAULT 1,
  `total_item_price` real NOT NULL,
  `status` text NOT NULL DEFAULT 'pending_owner',
  `snapshot_data_json` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `booking_item_booking_idx` ON `booking_items` (`booking_id`);
CREATE INDEX IF NOT EXISTS `booking_item_owner_idx` ON `booking_items` (`owner_id`);
CREATE INDEX IF NOT EXISTS `booking_item_vehicle_idx` ON `booking_items` (`vehicle_id`);

CREATE TABLE IF NOT EXISTS `owner_responses` (
  `id` text PRIMARY KEY NOT NULL,
  `booking_item_id` text NOT NULL REFERENCES `booking_items`(`id`) ON DELETE CASCADE,
  `owner_id` text NOT NULL REFERENCES `users`(`id`),
  `response` text NOT NULL,
  `reason` text,
  `responded_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `owner_resp_item_idx` ON `owner_responses` (`booking_item_id`);
CREATE INDEX IF NOT EXISTS `owner_resp_owner_idx` ON `owner_responses` (`owner_id`);

CREATE TABLE IF NOT EXISTS `payments` (
  `id` text PRIMARY KEY NOT NULL,
  `booking_id` text NOT NULL REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  `payment_type` text NOT NULL DEFAULT 'advance',
  `amount` real NOT NULL,
  `currency` text NOT NULL DEFAULT 'INR',
  `razorpay_order_id` text,
  `razorpay_payment_id` text,
  `razorpay_signature` text,
  `status` text NOT NULL DEFAULT 'created',
  `metadata_json` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `payments_booking_idx` ON `payments` (`booking_id`);
CREATE INDEX IF NOT EXISTS `payments_order_idx` ON `payments` (`razorpay_order_id`);

CREATE TABLE IF NOT EXISTS `payment_transactions` (
  `id` text PRIMARY KEY NOT NULL,
  `payment_id` text NOT NULL REFERENCES `payments`(`id`) ON DELETE CASCADE,
  `transaction_type` text NOT NULL,
  `amount` real NOT NULL,
  `status` text NOT NULL,
  `gateway_response_json` text,
  `created_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `payment_tx_payment_idx` ON `payment_transactions` (`payment_id`);

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `title` text NOT NULL,
  `message` text NOT NULL,
  `type` text NOT NULL,
  `is_read` integer NOT NULL DEFAULT 0,
  `metadata_json` text,
  `created_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `notif_user_idx` ON `notifications` (`user_id`);

CREATE TABLE IF NOT EXISTS `reviews` (
  `id` text PRIMARY KEY NOT NULL,
  `booking_id` text NOT NULL REFERENCES `bookings`(`id`),
  `vehicle_id` text NOT NULL REFERENCES `vehicles`(`id`),
  `customer_id` text NOT NULL REFERENCES `users`(`id`),
  `rating` integer NOT NULL,
  `comment` text,
  `is_approved` integer NOT NULL DEFAULT 1,
  `created_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `reviews_vehicle_idx` ON `reviews` (`vehicle_id`);
CREATE INDEX IF NOT EXISTS `reviews_customer_idx` ON `reviews` (`customer_id`);

CREATE TABLE IF NOT EXISTS `locations` (
  `id` text PRIMARY KEY NOT NULL,
  `city` text NOT NULL,
  `district` text NOT NULL,
  `state` text NOT NULL DEFAULT 'Bihar',
  `is_serviceable` integer NOT NULL DEFAULT 1,
  `created_at` text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS `locations_city_district_idx` ON `locations` (`city`, `district`);

CREATE TABLE IF NOT EXISTS `platform_settings` (
  `key` text PRIMARY KEY NOT NULL,
  `value` text NOT NULL,
  `description` text,
  `updated_at` text NOT NULL
);

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text,
  `action` text NOT NULL,
  `entity_type` text NOT NULL,
  `entity_id` text,
  `details_json` text,
  `ip_address` text,
  `created_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `audit_logs_user_idx` ON `audit_logs` (`user_id`);
CREATE INDEX IF NOT EXISTS `audit_logs_entity_idx` ON `audit_logs` (`entity_type`, `entity_id`);
