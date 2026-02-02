export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    PROFILE: '/auth/profile',
  },

  // Car endpoints
  CARS: {
    BASE: '/cars',
    SEARCH: '/cars/search',
    DETAILS: (id) => `/cars/${id}`,
  },

  // Booking endpoints
  BOOKINGS: {
    BASE: '/bookings',
    USER_BOOKINGS: '/bookings/user',
    DETAILS: (id) => `/bookings/${id}`,
    CANCEL: (id) => `/bookings/${id}/cancel`,
  },

  // User endpoints
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile/update',
  },
};
