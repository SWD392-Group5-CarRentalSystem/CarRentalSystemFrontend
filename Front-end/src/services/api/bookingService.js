import axiosInstance from './axiosConfig';

export const bookingService = {
  // Get all bookings
  getAllBookings: async (params) => {
    return await axiosInstance.get('/bookings', { params });
  },

  // Get booking by ID
  getBookingById: async (id) => {
    return await axiosInstance.get(`/bookings/${id}`);
  },

  // Create new booking
  createBooking: async (bookingData) => {
    return await axiosInstance.post('/bookings', bookingData);
  },

  // Update booking
  updateBooking: async (id, bookingData) => {
    return await axiosInstance.put(`/bookings/${id}`, bookingData);
  },

  // Cancel booking
  cancelBooking: async (id) => {
    return await axiosInstance.patch(`/bookings/${id}/cancel`);
  },

  // Get user bookings
  getUserBookings: async () => {
    return await axiosInstance.get('/bookings/user');
  },
};
