export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },

  // Staff endpoints
  STAFF: {
    BASE: '/auth/staff',
    DETAILS: (id) => `/auth/staff/${id}`,
  },

  // Driver endpoints
  DRIVER: {
    BASE: '/auth/driver',
    DETAILS: (id) => `/auth/driver/${id}`,
  },

  // Vehicle endpoints
  VEHICLES: {
    BASE: '/vehicle',
    DETAILS: (id) => `/vehicle/${id}`,
  },

  // Booking endpoints
  BOOKINGS: {
    BASE: '/booking',
    DETAILS: (id) => `/booking/${id}`,
    UPDATE_STATUS: (id) => `/booking/${id}/status`,
    CUSTOMER_CONFIRM_DEPOSIT: (id) => `/booking/${id}/customer-confirm-deposit`,
    STAFF_CONFIRM_DEPOSIT: (id) => `/booking/${id}/staff-confirm-deposit`,
    RECEIVE_VEHICLE: (id) => `/booking/${id}/receive-vehicle`,
    ASSIGN_DRIVER: (id) => `/booking/${id}/assign-driver`,
    DRIVER_ACCEPT: (id) => `/booking/${id}/driver-accept`,
    DRIVER_REJECT: (id) => `/booking/${id}/driver-reject`,
    BY_CUSTOMER: (customerId) => `/booking/customer/${customerId}`,
    BY_DRIVER: (driverId) => `/booking/driver/${driverId}`,
    BY_STATUS: (status) => `/booking/status/${status}`,
  },

  // Report endpoints
  REPORTS: {
    FINANCIAL: '/reports/financial',
  },

  // Chat endpoint
  CHAT: {
    BASE: '/chat',
  },
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  AWAITING_DEPOSIT_CONFIRMATION: 'awaiting_deposit_confirmation',
  CONFIRMED: 'confirmed',
  VEHICLE_DELIVERED: 'vehicle_delivered',
  IN_PROGRESS: 'in_progress',
  VEHICLE_RETURNED: 'vehicle_returned',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DEPOSIT_LOST: 'deposit_lost',
};
