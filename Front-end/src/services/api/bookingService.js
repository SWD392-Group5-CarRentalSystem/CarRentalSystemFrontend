import axiosInstance from './axiosConfig';

export const bookingService = {
  // Get all bookings
  getAllBookings: async (params) => {
    return await axiosInstance.get('/booking', { params });
  },

  // Get booking by ID
  getBookingById: async (id) => {
    return await axiosInstance.get(`/booking/${id}`);
  },

  // Create new booking
  createBooking: async (bookingData) => {
    return await axiosInstance.post('/booking', bookingData);
  },

  // Update booking info
  updateBooking: async (id, bookingData) => {
    return await axiosInstance.put(`/booking/${id}`, bookingData);
  },

  // Delete booking
  deleteBooking: async (id) => {
    return await axiosInstance.delete(`/booking/${id}`);
  },

  // Update booking status
  updateBookingStatus: async (id, status) => {
    return await axiosInstance.patch(`/booking/${id}/status`, { status });
  },

  // Customer confirms deposit transfer
  customerConfirmDeposit: async (id) => {
    return await axiosInstance.patch(`/booking/${id}/customer-confirm-deposit`);
  },

  // Staff confirms deposit received
  staffConfirmDeposit: async (id) => {
    return await axiosInstance.patch(`/booking/${id}/staff-confirm-deposit`);
  },

  // Get bookings by customer ID
  getBookingsByCustomer: async (customerId) => {
    return await axiosInstance.get(`/booking/customer/${customerId}`);
  },

  // Get bookings by driver ID
  getBookingsByDriver: async (driverId) => {
    return await axiosInstance.get(`/booking/driver/${driverId}`);
  },

  // Get bookings by status
  getBookingsByStatus: async (status) => {
    return await axiosInstance.get(`/booking/status/${status}`);
  },

  // Assign a driver to a booking (staff)
  assignDriver: async (bookingId, driverId) => {
    return await axiosInstance.patch(`/booking/${bookingId}/assign-driver`, { driverId });
  },

  // Get all drivers with availability for a time range
  getDriversAvailability: async (startDate, endDate) => {
    return await axiosInstance.get('/booking/drivers-availability', {
      params: { startDate, endDate },
    });
  },

  // Driver accepts assigned booking
  driverAcceptBooking: async (bookingId, driverId) => {
    return await axiosInstance.patch(`/booking/${bookingId}/driver-accept`, { driverId });
  },

  // Driver rejects assigned booking
  driverRejectBooking: async (bookingId, driverId, reason = '') => {
    return await axiosInstance.patch(`/booking/${bookingId}/driver-reject`, { driverId, reason });
  },
};
