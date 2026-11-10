const API_BASE = '/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('shaadiyatra_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth
  registerCustomer: (data: any) => apiRequest('/auth/register-customer', { method: 'POST', body: JSON.stringify(data) }),
  registerOwner: (data: any) => apiRequest('/auth/register-owner', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => apiRequest('/auth/me'),

  // Vehicles
  getVehicles: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/vehicles${query ? `?${query}` : ''}`);
  },
  getVehicle: (id: string) => apiRequest(`/vehicles/${id}`),
  createVehicle: (data: any) => apiRequest('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  updateVehicle: (id: string, data: any) => apiRequest(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Categories
  getCategories: () => apiRequest('/categories'),

  // Availability
  getAvailability: (vehicleId: string, startDate?: string) =>
    apiRequest(`/availability/${vehicleId}${startDate ? `?startDate=${startDate}` : ''}`),
  manageAvailability: (vehicleId: string, data: { dates: string[]; action: 'block' | 'unblock' }) =>
    apiRequest(`/availability/${vehicleId}/manage`, { method: 'POST', body: JSON.stringify(data) }),
  checkMultipleAvailability: (vehicleIds: string[], eventDate: string) =>
    apiRequest('/availability/check-multiple', {
      method: 'POST',
      body: JSON.stringify({ vehicleIds, eventDate }),
    }),

  // Bookings
  createBooking: (data: any) => apiRequest('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  getMyBookings: () => apiRequest('/bookings/my'),
  getBooking: (id: string) => apiRequest(`/bookings/${id}`),

  // Owner Panel
  getOwnerVehicles: () => apiRequest('/owner/vehicles'),
  getOwnerBookingRequests: () => apiRequest('/owner/booking-requests'),
  respondToBookingRequest: (itemId: string, data: { response: 'accepted' | 'rejected'; reason?: string }) =>
    apiRequest(`/owner/booking-requests/${itemId}/respond`, { method: 'POST', body: JSON.stringify(data) }),
  getOwnerEarnings: () => apiRequest('/owner/earnings'),

  // Super Admin Panel
  getAdminStats: () => apiRequest('/admin/stats'),
  getAdminOwners: () => apiRequest('/admin/owners'),
  verifyOwner: (id: string, status: 'approved' | 'rejected') =>
    apiRequest(`/admin/owners/${id}/verify`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getAdminVehicles: () => apiRequest('/admin/vehicles'),
  updateVehicleStatus: (id: string, status: string) =>
    apiRequest(`/admin/vehicles/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getAdminBookings: () => apiRequest('/admin/bookings'),
  reviewBooking: (id: string, data: { approvedItemIds: string[]; rejectedItemIds: string[]; advancePercentage?: number; adminNotes?: string }) =>
    apiRequest(`/admin/bookings/${id}/review`, { method: 'PUT', body: JSON.stringify(data) }),
  getAdminSettings: () => apiRequest('/admin/settings'),
  updateAdminSettings: (data: Record<string, string>) =>
    apiRequest('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
  getAdminLocations: () => apiRequest('/admin/locations'),

  // Payments
  createPaymentOrder: (bookingId: string) =>
    apiRequest('/payments/create-order', { method: 'POST', body: JSON.stringify({ bookingId }) }),
  verifyPayment: (data: { bookingId: string; razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) =>
    apiRequest('/payments/verify', { method: 'POST', body: JSON.stringify(data) }),

  // Notifications
  getNotifications: () => apiRequest('/notifications'),
  markNotificationRead: (id: string) => apiRequest(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => apiRequest('/notifications/read-all', { method: 'PUT' }),
};
