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
    BASE: '/bookings',
    DETAILS: (id) => `/bookings/${id}`,
    UPDATE_STATUS: (id) => `/bookings/${id}/status`,
    CUSTOMER_CONFIRM_DEPOSIT: (id) => `/bookings/${id}/customer-confirm-deposit`,
    STAFF_CONFIRM_DEPOSIT: (id) => `/bookings/${id}/staff-confirm-deposit`,
    BY_CUSTOMER: (customerId) => `/bookings/customer/${customerId}`,
    BY_DRIVER: (driverId) => `/bookings/driver/${driverId}`,
    BY_STATUS: (status) => `/bookings/status/${status}`,
  },
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRM: 'confirm',
  VEHICLE_DELIVERED: 'vehicle_delivered',
  IN_PROGRESS: 'in_progress',
  VEHICLE_RETURNED: 'vehicle_returned',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DEPOSIT_LOST: 'deposit_lost',
};
