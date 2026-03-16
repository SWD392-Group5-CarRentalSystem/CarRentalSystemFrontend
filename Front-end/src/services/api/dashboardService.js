import axiosInstance from './axiosConfig';

// BE không có /dashboard/* — dùng /reports/financial và /booking thay thế
export const dashboardService = {
  // Báo cáo tài chính (dùng cho Manager dashboard)
  getFinancialReport: async (from, to) => {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return await axiosInstance.get('/reports/financial', { params });
  },

  // Lấy tất cả booking (dùng để tính stats ở FE)
  getAllBookings: async () => {
    return await axiosInstance.get('/booking');
  },
};
