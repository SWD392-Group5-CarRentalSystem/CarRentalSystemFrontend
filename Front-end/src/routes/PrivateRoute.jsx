import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuthContext } from '../context';

/**
 * PrivateRoute - Bảo vệ routes yêu cầu đăng nhập và phân quyền theo role
 * 
 * @param {ReactNode} children - Component con cần render
 * @param {string|string[]} allowedRoles - Role hoặc mảng roles được phép truy cập
 * @param {string} redirectTo - Đường dẫn redirect khi không có quyền (mặc định: /)
 */
const PrivateRoute = ({ children, allowedRoles, redirectTo = '/' }) => {
  const { isAuthenticated, loading, user, hasAnyRole } = useAuthContext();

  // Đang loading, hiển thị loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  // Chưa đăng nhập, redirect về login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có yêu cầu role cụ thể, kiểm tra quyền
  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!hasAnyRole(roles)) {
      // Không có quyền, redirect về trang được chỉ định hoặc trang chủ
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Có quyền, render component
  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  redirectTo: PropTypes.string,
};

export default PrivateRoute;
