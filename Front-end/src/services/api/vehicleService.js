import axiosInstance from './axiosConfig';

export const vehicleService = {
  // Get all vehicles
  getAllVehicles: async (params) => {
    return await axiosInstance.get('/vehicle', { params });
  },

  // Get vehicle by ID
  getVehicleById: async (id) => {
    return await axiosInstance.get(`/vehicle/${id}`);
  },

  // Create new vehicle
  createVehicle: async (vehicleData) => {
    return await axiosInstance.post('/vehicle', vehicleData);
  },

  // Update vehicle
  updateVehicle: async (id, vehicleData) => {
    return await axiosInstance.patch(`/vehicle/${id}`, vehicleData);
  },

  // Delete vehicle
  deleteVehicle: async (id) => {
    return await axiosInstance.delete(`/vehicle/${id}`);
  },
};
