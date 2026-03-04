import axiosInstance from "./axiosConfig";
import { jwtDecode } from "jwt-decode";

export const authService = {
  // Login
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      if (response.token) {
        localStorage.setItem("token", response.token);

        // Decode token to get user info
        try {
          const decoded = jwtDecode(response.token);
          console.log("Decoded token:", decoded);
          const user = {
            _id: decoded.userId,
            username: decoded.username,
            email: response.data?.email || decoded.email || "",
            phoneNumber: response.data?.phoneNumber || decoded.phoneNumber || "",
            // Lấy role từ token (payload BE), fallback response.data, không hardcode
            role: decoded.role || response.data?.role || "",
          };
          console.log("User from token:", user);
          localStorage.setItem("user", JSON.stringify(user));
          response.user = user; // Add user to response for AuthContext
        } catch (decodeError) {
          console.error("Error decoding token:", decodeError);
        }
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
