import axiosInstance from './axiosConfig';

export const reportService = {
  /**
   * Lấy báo cáo tài chính
   * @param {string} [from] - ISO date string (optional)
   * @param {string} [to]   - ISO date string (optional)
   * Returns: { totalRevenue, completedBookings, topBookedVehicles, from, to }
   */
  getFinancialReport: async (from, to) => {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return await axiosInstance.get('/reports/financial', { params });
  },
};
