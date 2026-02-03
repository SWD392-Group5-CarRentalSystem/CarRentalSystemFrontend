import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { authService } from '../services/api';

// Định nghĩa các role trong hệ thống (đồng bộ với BE)
export const ROLES = {
  MANAGER: 'manager',
  STAFF: 'staff',
  DRIVER: 'driver',
  CUSTOMER: 'customer',
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Kiểm tra user có role cụ thể không
  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  // Kiểm tra user có một trong các roles không
  const hasAnyRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  // Kiểm tra user là manager
  const isManager = () => {
    return hasRole(ROLES.MANAGER);
  };

  // Kiểm tra user là staff trở lên (manager, staff)
  const isStaffOrAbove = () => {
    return hasAnyRole([ROLES.MANAGER, ROLES.STAFF]);
  };

  // Kiểm tra user là driver
  const isDriver = () => {
    return hasRole(ROLES.DRIVER);
  };

  // Kiểm tra user là customer
  const isCustomer = () => {
    return hasRole(ROLES.CUSTOMER);
  };

  // Lấy redirect path dựa trên role
  const getDefaultRedirectPath = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case ROLES.MANAGER:
        return '/admin/dashboard';
      case ROLES.STAFF:
        return '/staff/dashboard';
      case ROLES.DRIVER:
        return '/driver/dashboard';
      case ROLES.CUSTOMER:
      default:
        return '/';
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    loading,
    // Role helpers
    hasRole,
    hasAnyRole,
    isManager,
    isStaffOrAbove,
    isDriver,
    isCustomer,
    getDefaultRedirectPath,
    ROLES,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
