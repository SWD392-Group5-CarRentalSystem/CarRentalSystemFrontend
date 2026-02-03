import axiosInstance from './axiosConfig';

export const dashboardService = {
  // Get dashboard statistics
  getStats: async () => {
    return await axiosInstance.get('/dashboard/stats');
  },

  // Get recent bookings for dashboard
  getRecentBookings: async (limit = 5) => {
    return await axiosInstance.get('/dashboard/recent-bookings', { 
      params: { limit } 
    });
  },

  // Get revenue statistics
  getRevenue: async (period = 'today') => {
    return await axiosInstance.get('/dashboard/revenue', { 
      params: { period } 
    });
  },
};
