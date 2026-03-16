import axiosInstance from './axiosConfig';

export const staffService = {
  // ==================== STAFF ====================

  // Create a new staff
  createStaff: async (staffData) => {
    return await axiosInstance.post('/auth/staff', staffData);
  },

  // Get all staff
  getAllStaff: async (params) => {
    return await axiosInstance.get('/auth/staff', { params });
  },

  // Get staff by ID
  getStaffById: async (id) => {
    return await axiosInstance.get(`/auth/staff/${id}`);
  },

  // Update staff
  updateStaff: async (id, staffData) => {
    return await axiosInstance.put(`/auth/staff/${id}`, staffData);
  },

  // Delete staff
  deleteStaff: async (id) => {
    return await axiosInstance.delete(`/auth/staff/${id}`);
  },

  // ==================== DRIVER ====================

  // Create a new driver
  createDriver: async (driverData) => {
    return await axiosInstance.post('/auth/driver', driverData);
  },

  // Get all drivers
  getAllDrivers: async (params) => {
    return await axiosInstance.get('/auth/driver', { params });
  },

  // Get driver by ID
  getDriverById: async (id) => {
    return await axiosInstance.get(`/auth/driver/${id}`);
  },

  // Update driver
  updateDriver: async (id, driverData) => {
    return await axiosInstance.put(`/auth/driver/${id}`, driverData);
  },

  // Delete driver
  deleteDriver: async (id) => {
    return await axiosInstance.delete(`/auth/driver/${id}`);
  },
};
