import axiosInstance from './axiosConfig';

export const carService = {
  // Get all cars
  getAllCars: async (params) => {
    return await axiosInstance.get('/cars', { params });
  },

  // Get car by ID
  getCarById: async (id) => {
    return await axiosInstance.get(`/cars/${id}`);
  },

  // Create new car
  createCar: async (carData) => {
    return await axiosInstance.post('/cars', carData);
  },

  // Update car
  updateCar: async (id, carData) => {
    return await axiosInstance.put(`/cars/${id}`, carData);
  },

  // Delete car
  deleteCar: async (id) => {
    return await axiosInstance.delete(`/cars/${id}`);
  },

  // Search cars
  searchCars: async (searchParams) => {
    return await axiosInstance.get('/cars/search', { params: searchParams });
  },
};
