import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context';

/**
 * Protected route component that redirects users based on their role after login
 */
const ProtectedAuthRoute = ({ children }) => {
  const { isAuthenticated, loading, getDefaultRedirectPath } = useAuthContext();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  // If authenticated, redirect to appropriate dashboard based on role
  if (isAuthenticated) {
    return <Navigate to={getDefaultRedirectPath()} replace />;
  }

  // Not authenticated, render the auth component (Login/Register)
  return children;
};

export default ProtectedAuthRoute;