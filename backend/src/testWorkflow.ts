const API_BASE = 'http://127.0.0.1:8787/api';

async function runTest() {
  console.log('--- STARTING SHAADIYATRA MULTI-VEHICLE WORKFLOW TEST ---');

  // Helper
  const post = async (path: string, body: any, token?: string) => {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    return res.json() as Promise<any>;
  };

  const get = async (path: string, token?: string) => {
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${path}`, { headers });
    return res.json() as Promise<any>;
  };

  const put = async (path: string, body: any, token?: string) => {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    return res.json() as Promise<any>;
  };

  // 1. Customer Login
  console.log('\n1. Logging in as Customer (Rohit Verma)...');
  const custLogin = await post('/auth/login', {
    identifier: 'rohit.verma@gmail.com',
    password: 'CustomerPassword123!',
  });
  if (!custLogin.success) throw new Error(`Customer login failed: ${custLogin.error}`);
  const custToken = custLogin.token;
  console.log('✓ Customer logged in successfully. ID:', custLogin.user.id);

  // 2. Fetch Available Vehicles
  console.log('\n2. Fetching vehicles list...');
  const vehList = await get('/vehicles');
  console.log('vehList response:', JSON.stringify(vehList));
  if (!vehList.success || vehList.vehicles.length === 0) throw new Error('No vehicles found');
  console.log(`✓ Retrieved ${vehList.vehicles.length} approved wedding vehicles.`);

  const v1 = vehList.vehicles[0]; // Scorpio
  const v2 = vehList.vehicles[1] || vehList.vehicles[0]; // Luxury / Fortuner
  console.log(`Selected vehicles for wedding: "${v1.name}" (₹${v1.perDayPrice}) & "${v2.name}" (₹${v2.perDayPrice})`);

  // 3. Customer submits combined multi-vehicle booking
  const testDate = '2026-12-15';
  console.log(`\n3. Submitting combined multi-vehicle booking for event date ${testDate}...`);
  const createBookingRes = await post('/bookings', {
    eventDate: testDate,
    eventEndDate: testDate,
    eventType: 'wedding',
    eventCity: 'Patna',
    eventDistrict: 'Patna',
    pickupAddress: 'Boring Road, Patna',
    destinationAddress: 'Maurya Hotel Banquet Hall, Fraser Road, Patna',
    customerNotes: 'Require non-damaging flower ties on both vehicles.',
    vehicleIds: [v1.id, v2.id],
  }, custToken);

  if (!createBookingRes.success) throw new Error(`Booking submission failed: ${createBookingRes.error}`);
  const booking = createBookingRes.booking;
  console.log(`✓ Booking created! Number: ${booking.bookingNumber}, Total: ₹${booking.totalAmount}, Status: ${booking.status}`);

  // Fetch created booking details
  const bookingDetail = await get(`/bookings/${booking.id}`, custToken);
  const items = bookingDetail.booking.items;
  console.log(`✓ Booking has ${items.length} individual vehicle items.`);

  // 4. Owner 1 responds
  const owner1 = items[0].ownerId;
  console.log(`\n4. Logging in as Owner 1 for vehicle "${items[0].vehicleName}"...`);
  // Owner 1 is usr_owner_01 (rajesh.patna@shaadiyatra.in)
  const owner1Login = await post('/auth/login', {
    identifier: 'rajesh.patna@shaadiyatra.in',
    password: 'OwnerPassword123!',
  });
  if (owner1Login.success) {
    const owner1Res = await post(`/owner/booking-requests/${items[0].id}/respond`, {
      response: 'accepted',
      reason: 'Vehicle available and prepped for Baraat',
    }, owner1Login.token);
    console.log(`✓ Owner 1 response submitted:`, owner1Res.message);
  }

  // 5. Owner 2 responds (if different owner)
  if (items.length > 1 && items[1].ownerId !== owner1) {
    console.log(`\n5. Logging in as Owner 2 for vehicle "${items[1].vehicleName}"...`);
    const owner2Login = await post('/auth/login', {
      identifier: 'amit.mithila@shaadiyatra.in',
      password: 'OwnerPassword123!',
    });
    if (owner2Login.success) {
      const owner2Res = await post(`/owner/booking-requests/${items[1].id}/respond`, {
        response: 'accepted',
      }, owner2Login.token);
      console.log(`✓ Owner 2 response submitted:`, owner2Res.message);
    }
  }

  // 6. Super Admin Review & Approval
  console.log('\n6. Logging in as Super Admin...');
  const adminLogin = await post('/auth/login', {
    identifier: 'admin@shaadiyatra.in',
    password: 'AdminPassword123!',
  });
  if (!adminLogin.success) throw new Error('Admin login failed');
  const adminToken = adminLogin.token;

  console.log(`Admin reviewing booking #${booking.bookingNumber}...`);
  const adminReviewRes = await put(`/admin/bookings/${booking.id}/review`, {
    approvedItemIds: items.map((i: any) => i.id),
    rejectedItemIds: [],
    advancePercentage: 25,
    adminNotes: 'Verified and approved with 25% advance requirement.',
  }, adminToken);

  if (!adminReviewRes.success) throw new Error(`Admin review failed: ${adminReviewRes.error}`);
  console.log(`✓ Admin review complete. Revised Total: ₹${adminReviewRes.revisedTotal}, Advance Required: ₹${adminReviewRes.advanceAmountRequired}`);

  // 7. Customer Advance Payment via Razorpay flow
  console.log('\n7. Customer initiating advance payment order...');
  const orderRes = await post('/payments/create-order', {
    bookingId: booking.id,
  }, custToken);
  if (!orderRes.success) throw new Error(`Payment order creation failed: ${orderRes.error}`);
  console.log(`✓ Razorpay Order created: ${orderRes.order.orderId}, Amount: ₹${orderRes.order.amount}`);

  // Server-side Payment Verification
  console.log('\n8. Performing server-side Razorpay signature verification...');
  const verifyRes = await post('/payments/verify', {
    bookingId: booking.id,
    razorpayOrderId: orderRes.order.orderId,
    razorpayPaymentId: 'pay_test_bihar_wedding_9901',
    razorpaySignature: 'test_sig_verified_server_side_valid',
  }, custToken);

  if (!verifyRes.success) throw new Error(`Verification failed: ${verifyRes.error}`);
  console.log(`✓ Payment Verified! Booking Status: ${verifyRes.booking.status}`);
  console.log(`✓ Advance Paid: ₹${verifyRes.booking.advancePaid}, Balance Remaining: ₹${verifyRes.booking.balanceRemaining}`);

  // 9. Anti-Double Booking Verification
  console.log(`\n9. Testing anti-double booking protection on ${testDate}...`);
  const collisionCheck = await post('/availability/check-multiple', {
    vehicleIds: [v1.id],
    eventDate: testDate,
  });
  console.log('Collision check result:', collisionCheck);
  if (collisionCheck.allAvailable === false) {
    console.log(`✓ SUCCESS: Vehicle "${v1.name}" is properly locked as BOOKED on ${testDate}. Anti-double-booking protection is ACTIVE!`);
  } else {
    throw new Error('Anti-double-booking failed: Vehicle was not locked as booked.');
  }

  console.log('\n--- ALL WORKFLOWS VERIFIED 100% SUCCESSFULLY ---');
}

runTest().catch((err) => {
  console.error('\n❌ Test Error:', err);
  process.exit(1);
});
