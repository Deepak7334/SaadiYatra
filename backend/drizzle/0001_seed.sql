-- Seed data for ShaadiYatra Bihar Wedding Vehicle Marketplace
-- Passwords:
-- Admin: AdminPassword123!
-- Owners: OwnerPassword123!
-- Customers: CustomerPassword123!

-- 1. Users
INSERT OR REPLACE INTO users (id, email, phone, name, role, password_hash, status, is_verified, created_at, updated_at) VALUES
('usr_admin_01', 'admin@shaadiyatra.in', '+919800000001', 'Super Admin (ShaadiYatra)', 'admin', 'affb52946cbb461d7b09e7f9fe03d63a:fb671964e936bfa1f666c660aee2430473d39b7f35e18a4ff3de01e4ce3f0c27', 'active', 1, '2026-11-09T08:38:32.987Z', '2026-11-09T08:38:32.987Z'),
('usr_owner_01', 'rajesh.patna@shaadiyatra.in', '+919876543210', 'Rajesh Kumar', 'owner', '39430a3c4ec4a1a749b117886205aa90:94c5a9ff4776f43b57930886ac16422118d7779f33f7f5d2fda64df41fb8f793', 'active', 1, '2026-11-09T08:38:32.987Z', '2026-11-09T08:38:32.987Z'),
('usr_owner_02', 'amit.mithila@shaadiyatra.in', '+919876543211', 'Amit Singh', 'owner', '39430a3c4ec4a1a749b117886205aa90:94c5a9ff4776f43b57930886ac16422118d7779f33f7f5d2fda64df41fb8f793', 'active', 1, '2026-11-09T08:38:32.987Z', '2026-11-09T08:38:32.987Z'),
('usr_owner_03', 'sunita.gaya@shaadiyatra.in', '+919876543212', 'Sunita Devi', 'owner', '39430a3c4ec4a1a749b117886205aa90:94c5a9ff4776f43b57930886ac16422118d7779f33f7f5d2fda64df41fb8f793', 'active', 1, '2026-11-09T08:38:32.987Z', '2026-11-09T08:38:32.987Z'),
('usr_owner_04', 'tariq.bhagalpur@shaadiyatra.in', '+919876543213', 'Md. Tariq', 'owner', '39430a3c4ec4a1a749b117886205aa90:94c5a9ff4776f43b57930886ac16422118d7779f33f7f5d2fda64df41fb8f793', 'active', 1, '2026-11-09T08:38:32.987Z', '2026-11-09T08:38:32.987Z'),
('usr_cust_01', 'rohit.verma@gmail.com', '+919876543220', 'Rohit Verma', 'customer', '5e698a90af1ff255cf9477a81fca9d16:66ff0e9b2cd336cdf788b3ffd927e4a1ef321e6337d2b142034d47f269c4d621', 'active', 1, '2026-11-09T08:38:32.987Z', '2026-11-09T08:38:32.987Z'),
('usr_cust_02', 'priya.sharma@gmail.com', '+919876543221', 'Priya Sharma', 'customer', '5e698a90af1ff255cf9477a81fca9d16:66ff0e9b2cd336cdf788b3ffd927e4a1ef321e6337d2b142034d47f269c4d621', 'active', 1, '2026-11-09T08:38:32.987Z', '2026-11-09T08:38:32.987Z');

-- 2. Owner Profiles
INSERT OR REPLACE INTO owner_profiles (id, user_id, business_name, address, city, district, state, id_document_type, id_document_url, verification_status, bank_account_details, created_at, updated_at) VALUES
('op_01', 'usr_owner_01', 'Patna Royal Travels', 'Boring Road, Near Alankar Jewellers', 'Patna', 'Patna', 'Bihar', 'Aadhaar Card', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600', 'approved', 'SBI AC: 30485920394 | IFSC: SBIN0001234', '2026-11-09T08:38:32.987Z', '2026-11-09T08:38:32.987Z'),
('op_02', 'usr_owner_02', 'Mithila Wheels & Chauffeurs', 'Station Road, Club Chowk', 'Muzaffarpur', 'Muzaffarpur', 'Bihar', 'Aadhaar Card', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600', 'approved', 'HDFC AC: 501002394012 | IFSC: HDFC0000456', '2026-11-09T08:38:32.987Z', '2026-11-09T08:38:32.987Z'),
('op_03', 'usr_owner_03', 'Magadh Wedding Fleet', 'Bodhgaya Road, Near Circuit House', 'Gaya', 'Gaya', 'Bihar', 'Voter ID', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600', 'approved', 'PNB AC: 04958302910 | IFSC: PUNB0007890', '2026-11-09T08:38:32.987Z', '2026-11-09T08:38:32.987Z'),
('op_04', 'usr_owner_04', 'Anga Luxury Rides', 'Zero Mile, Bypass Road', 'Bhagalpur', 'Bhagalpur', 'Bihar', 'Driving License', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600', 'approved', 'ICICI AC: 002301948576 | IFSC: ICIC0000123', '2026-11-09T08:38:32.987Z', '2026-11-09T08:38:32.987Z');

-- 3. Customer Profiles
INSERT OR REPLACE INTO customer_profiles (id, user_id, alternate_phone, address, city, district, created_at, updated_at) VALUES
('cp_01', 'usr_cust_01', '+919431000001', 'Kankarbagh Colony, Near Shivaji Park', 'Patna', 'Patna', '2026-11-09T08:38:32.987Z', '2026-11-09T08:38:32.987Z'),
('cp_02', 'usr_cust_02', '+919431000002', 'Lalbagh, Tower Chowk', 'Darbhanga', 'Darbhanga', '2026-11-09T08:38:32.987Z', '2026-11-09T08:38:32.987Z');

-- 4. Vehicle Categories
INSERT OR REPLACE INTO vehicle_categories (id, name, slug, description, image_url, icon_name, base_price_hint, is_active, display_order, created_at) VALUES
('cat_luxury', 'Luxury Wedding Cars', 'luxury-wedding-cars', 'Mercedes, Audi, BMW and Jaguar for premium bride & groom arrival', 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800', 'Crown', 12000, 1, 1, '2026-11-09T08:38:32.987Z'),
('cat_suv', 'Premium SUVs', 'premium-suvs', 'Scorpio, Fortuner, Safari and Thar for grand Baraat processions and VIP guests', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800', 'Shield', 4500, 1, 2, '2026-11-09T08:38:32.987Z'),
('cat_sedan', 'Comfort Sedans', 'comfort-sedans', 'Honda City, Dzire, Verna and Ciaz for family and guest transit', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800', 'Car', 2800, 1, 3, '2026-11-09T08:38:32.987Z'),
('cat_tempo', 'Tempo Travellers', 'tempo-travellers', '12, 17 and 26-seater AC Tempo Travellers for Baraati groups and Vidai luggage', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800', 'Users', 6500, 1, 4, '2026-11-09T08:38:32.987Z'),
('cat_bus', 'Wedding Buses', 'wedding-buses', '32 to 52 seater luxury coaches for entire Baraat party travel across Bihar', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800', 'Bus', 14000, 1, 5, '2026-11-09T08:38:32.987Z'),
('cat_vintage', 'Vintage & Open-Top', 'vintage-procession-cars', 'Vintage convertibles and floral-decorated open-roof vehicles for Groom entry', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', 'Sparkles', 15000, 1, 6, '2026-11-09T08:38:32.987Z');

-- 5. Vehicles
INSERT OR REPLACE INTO vehicles (id, owner_id, category_id, name, make, model, year, registration_number, capacity, per_day_price, per_event_price, extra_km_rate, driver_allowance, status, city, district, address, description, features_json, rules_json, is_featured, created_at, updated_at) VALUES
('veh_01', 'usr_owner_01', 'cat_suv', 'White Mahindra Scorpio-N Z8L', 'Mahindra', 'Scorpio-N', 2024, 'BR01PK9901', 7, 4500, 5000, 16, 500, 'approved', 'Patna', 'Patna', 'Boring Road, Patna', 'Pristine White Mahindra Scorpio-N with sunroof, captain seats, premium audio, and dedicated wedding floral mounting rails. Highly popular for Baraat lead.', '["Sunroof","Dual Zone AC","Leather Seats","Floral Mount Ready","Premium Sony Audio","LED DRLs"]', '["No smoking inside vehicle","Toll taxes extra at actuals","Driver duty 12 hrs per day"]', 1, '2026-11-09T08:38:32.987Z', '2026-11-09T08:38:32.987Z'),

('veh_02', 'usr_owner_01', 'cat_luxury', 'Mercedes-Benz E-Class Luxury Sedan', 'Mercedes-Benz', 'E-Class Exclusive', 2023, 'BR01MB0007', 5, 16000, 18000, 45, 1000, 'approved', 'Patna', 'Patna', 'Exhibition Road, Patna', 'Majestic White Mercedes-Benz E-Class with cream leather upholstery, ambient mood lighting, panoramic sunroof, and ultra-smooth ride. Perfect for Vidai and Groom arrival.', '["Ambient Lighting 64 Colors","Panoramic Sunroof","Burmester Surround Sound","Rear Chauffeur Package","Air Suspension"]', '["Alcohol strictly prohibited","Decorations must use non-damaging ribbon ties","Maximum 4 passengers"]', 1, '2026-11-09T08:38:32.987Z', '2026-11-09T08:38:32.987Z'),

('veh_03', 'usr_owner_01', 'cat_tempo', 'Force Urbania 17-Seater Luxury Maharaja Van', 'Force Motors', 'Urbania Luxury', 2024, 'BR01FU1717', 17, 7500, 8500, 22, 600, 'approved', 'Patna', 'Patna', 'Patliputra Industrial Area, Patna', 'Next-gen Force Urbania with wide panoramic windows, reclining pushback seats, individual AC vents, USB charging on every row, and spacious boot for gift baggage.', '["Pushback Seats","Individual AC Vents","Ample Luggage Bay","USB Chargers on all seats","Microphone & PA System"]', '["Night driving surcharge applies after 11 PM","Driver food allowance included"]', 1, '2026-11-09T08:38:32.987Z', '2026-11-09T08:38:32.987Z'),

('veh_04', 'usr_owner_02', 'cat_suv', 'Toyota Fortuner Legender 4x4 Pearl White', 'Toyota', 'Fortuner Legender', 2024, 'BR06FL8888', 7, 9500, 11000, 25, 600, 'approved', 'Muzaffarpur', 'Muzaffarpur', 'Club Chowk, Muzaffarpur', 'Stunning Pearl White Toyota Fortuner Legender with aggressive road presence, bi-tone black/maroon leather interior, 4x4 capability, and commanding presence.', '["Ventilated Seats","JBL 11-Speaker System","Powered Tailgate","Bi-tone Roof","Rear Reclining Seats"]', '["No off-roading stunts","Max speed limit adherence"]', 1, '2026-11-09T08:38:32.987Z', '2026-11-09T08:38:32.987Z'),

('veh_05', 'usr_owner_02', 'cat_bus', 'BharatBenz 36-Seater AC Luxury Wedding Coach', 'BharatBenz', 'Glider AC Coach', 2023, 'BR06BB3636', 36, 14000, 16000, 38, 1000, 'approved', 'Muzaffarpur', 'Muzaffarpur', 'Bairia Bus Stand, Muzaffarpur', 'Air-conditioned luxury coach with push-back seats, LED TV, high-quality audio system, and underbelly luggage holds. Best for transporting family groups between cities.', '["Full Air Conditioning","High-back Pushback Seats","Huge Luggage Hold","LED TV Entertainment","Emergency Exit & First Aid"]', '["Driver sleep break mandatory on routes over 200 km","State permit taxes extra if travelling outside Bihar"]', 1, '2026-11-09T08:38:32.987Z', '2026-11-09T08:38:32.987Z'),

('veh_06', 'usr_owner_03', 'cat_sedan', 'Honda City 5th Gen Pearl White', 'Honda', 'City ZX', 2023, 'BR02HC2023', 5, 3200, 3500, 14, 400, 'approved', 'Gaya', 'Gaya', 'Bodhgaya Road, Gaya', 'Immaculate White Honda City sedan with sunroof, beige leather seats, and whisper-quiet ride. Ideal for bride, groom, and immediate relatives.', '["Sunroof","Beige Leather Upholstery","Rear AC Vents","LaneWatch Camera","Huge 506L Boot"]', '["Standard 12 hr duty","Driver accommodation required if overnight"]', 0, '2026-11-09T08:38:32.987Z', '2026-11-09T08:38:32.987Z'),

('veh_07', 'usr_owner_03', 'cat_suv', 'Mahindra Thar Earth Edition Convertible', 'Mahindra', 'Thar LX Soft-Top', 2024, 'BR02TH4444', 4, 6000, 7000, 18, 500, 'approved', 'Gaya', 'Gaya', 'Civil Lines, Gaya', 'High-energy open-roof / convertible Thar for dramatic groom entry and photo-shoots. Complete with high-bass sound setup and custom lighting.', '["Convertible Soft-Top","Rockford Bass Audio","Alloy Wheels","Off-road DRLs","All-weather Mats"]', '["Standing during vehicle motion prohibited by traffic law","Authorized driver only"]', 1, '2026-11-09T08:38:32.987Z', '2026-11-09T08:38:32.987Z'),

('veh_08', 'usr_owner_04', 'cat_vintage', 'Vintage Royal Open-Top Wedding Tourer', 'Royal Classics', 'Grand Duchess 1934 Replica', 2022, 'BR10VC0001', 4, 15000, 18000, 50, 1000, 'approved', 'Bhagalpur', 'Bhagalpur', 'Zero Mile, Bhagalpur', 'Handcrafted royal vintage tourer in Ivory and Burgundy with brass horns, spoke wheels, velvet seats, and royal wedding crest. The absolute showstopper for groom procession.', '["Royal Ivory Finish","Velvet Cushioned Throne Seats","Brass Horns & Lanterns","Open-Air Panoramic Entry","Trophy Spoke Rims"]', '["Low speed procession only (under 40 km/h)","Vehicle transported via flatbed for distances > 30 km"]', 1, '2026-11-09T08:38:32.987Z', '2026-11-09T08:38:32.987Z'),

('veh_09', 'usr_owner_04', 'cat_tempo', 'Force Traveller 12-Seater Super Executive', 'Force Motors', 'Traveller 3050', 2023, 'BR10FT1212', 12, 5500, 6000, 19, 500, 'approved', 'Bhagalpur', 'Bhagalpur', 'Station Chowk, Bhagalpur', 'Executive 12-seater AC Traveller with individual armrest seats, wide aisle, and curtains. Comfortable and economical for close family transportation.', '["12 Reclining Seats","Roof AC Ducting","Curtains on all windows","Music System"]', '["Overcapacity strictly prohibited"]', 0, '2026-11-09T08:38:32.987Z', '2026-11-09T08:38:32.987Z'),

('veh_10', 'usr_owner_01', 'cat_sedan', 'Maruti Suzuki Dzire VXI White', 'Maruti Suzuki', 'Dzire', 2024, 'BR01DZ5555', 5, 2500, 2800, 13, 400, 'approved', 'Patna', 'Patna', 'Kankarbagh, Patna', 'Reliable, fuel-efficient white Dzire sedan for wedding errands, guest airport/railway station pickups, and shopping runs.', '["AC with Heater","Rear Armrest","Clean Fabric Seats","Spacious Boot"]', '["Standard 250 km per day included"]', 0, '2026-11-09T08:38:32.987Z', '2026-11-09T08:38:32.987Z');

-- 6. Vehicle Images
INSERT OR REPLACE INTO vehicle_images (id, vehicle_id, image_url, is_primary, display_order, created_at) VALUES
('img_01_1', 'veh_01', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000', 1, 0, '2026-11-09T08:38:32.987Z'),
('img_01_2', 'veh_01', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000', 0, 1, '2026-11-09T08:38:32.987Z'),

('img_02_1', 'veh_02', 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1000', 1, 0, '2026-11-09T08:38:32.987Z'),
('img_02_2', 'veh_02', 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1000', 0, 1, '2026-11-09T08:38:32.987Z'),

('img_03_1', 'veh_03', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1000', 1, 0, '2026-11-09T08:38:32.987Z'),

('img_04_1', 'veh_04', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1000', 1, 0, '2026-11-09T08:38:32.987Z'),
('img_04_2', 'veh_04', 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1000', 0, 1, '2026-11-09T08:38:32.987Z'),

('img_05_1', 'veh_05', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000', 1, 0, '2026-11-09T08:38:32.987Z'),

('img_06_1', 'veh_06', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1000', 1, 0, '2026-11-09T08:38:32.987Z'),

('img_07_1', 'veh_07', 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1000', 1, 0, '2026-11-09T08:38:32.987Z'),

('img_08_1', 'veh_08', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000', 1, 0, '2026-11-09T08:38:32.987Z'),

('img_09_1', 'veh_09', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000', 1, 0, '2026-11-09T08:38:32.987Z'),

('img_10_1', 'veh_10', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000', 1, 0, '2026-11-09T08:38:32.987Z');

-- 7. Locations
INSERT OR REPLACE INTO locations (id, city, district, state, is_serviceable, created_at) VALUES
('loc_01', 'Patna', 'Patna', 'Bihar', 1, '2026-11-09T08:38:32.987Z'),
('loc_02', 'Gaya', 'Gaya', 'Bihar', 1, '2026-11-09T08:38:32.987Z'),
('loc_03', 'Muzaffarpur', 'Muzaffarpur', 'Bihar', 1, '2026-11-09T08:38:32.987Z'),
('loc_04', 'Bhagalpur', 'Bhagalpur', 'Bihar', 1, '2026-11-09T08:38:32.987Z'),
('loc_05', 'Darbhanga', 'Darbhanga', 'Bihar', 1, '2026-11-09T08:38:32.987Z'),
('loc_06', 'Purnia', 'Purnia', 'Bihar', 1, '2026-11-09T08:38:32.987Z'),
('loc_07', 'Begusarai', 'Begusarai', 'Bihar', 1, '2026-11-09T08:38:32.987Z'),
('loc_08', 'Arrah', 'Bhojpur', 'Bihar', 1, '2026-11-09T08:38:32.987Z'),
('loc_09', 'Bihar Sharif', 'Nalanda', 'Bihar', 1, '2026-11-09T08:38:32.987Z'),
('loc_10', 'Chhapra', 'Saran', 'Bihar', 1, '2026-11-09T08:38:32.987Z'),
('loc_11', 'Samastipur', 'Samastipur', 'Bihar', 1, '2026-11-09T08:38:32.987Z'),
('loc_12', 'Hajipur', 'Vaishali', 'Bihar', 1, '2026-11-09T08:38:32.987Z'),
('loc_13', 'Bettiah', 'West Champaran', 'Bihar', 1, '2026-11-09T08:38:32.987Z'),
('loc_14', 'Motihari', 'East Champaran', 'Bihar', 1, '2026-11-09T08:38:32.987Z');

-- 8. Platform Settings
INSERT OR REPLACE INTO platform_settings (key, value, description, updated_at) VALUES
('advance_payment_percentage', '25', 'Percentage of total approved vehicle booking amount collected as advance', '2026-11-09T08:38:32.987Z'),
('platform_commission_percentage', '10', 'Platform commission charged to vehicle owners on confirmed bookings', '2026-11-09T08:38:32.987Z'),
('hold_duration_minutes', '60', 'Temporary hold duration on vehicles during checkout before release', '2026-11-09T08:38:32.987Z'),
('cancellation_policy', '100% refund up to 7 days before event. 50% refund 3-6 days before event. Non-refundable within 48 hours.', 'Cancellation and refund terms', '2026-11-09T08:38:32.987Z'),
('support_phone', '+91 98000 12345', 'ShaadiYatra toll-free / WhatsApp customer assistance', '2026-11-09T08:38:32.987Z'),
('support_email', 'support@shaadiyatra.in', 'Customer support email desk', '2026-11-09T08:38:32.987Z'),
('currency_symbol', '₹', 'Currency symbol', '2026-11-09T08:38:32.987Z');
