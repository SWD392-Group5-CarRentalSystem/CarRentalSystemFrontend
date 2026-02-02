import axiosInstance from "./axiosConfig";

export const authService = {
  // Login
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      if (response.token) {
        localStorage.setItem("token", response.token);
      }
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Register
  register: async (userData) => {
    try {
      const response = await axiosInstance.post("/auth/register", userData);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Refresh token
  refreshToken: async () => {
    return await axiosInstance.post("/auth/refresh-token");
  },
};
