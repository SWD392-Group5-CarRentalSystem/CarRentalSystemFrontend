import PropTypes from 'prop-types';
import PrivateRoute from './PrivateRoute';
import { ROLES } from '../context/AuthContext';

/**
 * ManagerRoute - Chỉ manager được truy cập
 */
export const ManagerRoute = ({ children }) => {
  return (
    <PrivateRoute allowedRoles={[ROLES.MANAGER]} redirectTo="/">
      {children}
    </PrivateRoute>
  );
};

ManagerRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * StaffRoute - Manager và staff được truy cập
 */
export const StaffRoute = ({ children }) => {
  return (
    <PrivateRoute allowedRoles={[ROLES.MANAGER, ROLES.STAFF]} redirectTo="/">
      {children}
    </PrivateRoute>
  );
};

StaffRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * DriverRoute - Chỉ driver được truy cập
 */
export const DriverRoute = ({ children }) => {
  return (
    <PrivateRoute allowedRoles={[ROLES.DRIVER]} redirectTo="/">
      {children}
    </PrivateRoute>
  );
};

DriverRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * CustomerRoute - Chỉ customer được truy cập
 */
export const CustomerRoute = ({ children }) => {
  return (
    <PrivateRoute allowedRoles={[ROLES.CUSTOMER]} redirectTo="/">
      {children}
    </PrivateRoute>
  );
};

CustomerRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
