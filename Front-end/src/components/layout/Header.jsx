import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-electric-blue hover:text-electric-dark transition-colors">
            <h1 className="text-2xl font-bold mb-0">⚡ EcoDrive</h1>
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-electric-blue font-medium transition-colors">
              Trang chủ
            </Link>
            <Link to="/cars" className="text-gray-700 hover:text-electric-blue font-medium transition-colors">
              Xe điện
            </Link>
            <Link to="/booking" className="text-gray-700 hover:text-electric-blue font-medium transition-colors">
              Đặt xe
            </Link>
            <Link to="/profile" className="text-gray-700 hover:text-electric-blue font-medium transition-colors">
              Tài khoản
            </Link>
          </nav>
          <div className="flex space-x-4">
            <Link 
              to="/login" 
              className="px-4 py-2 text-electric-blue border border-electric-blue rounded-md hover:bg-electric-blue hover:text-white transition-all font-medium"
            >
              Đăng nhập
            </Link>
            <Link 
              to="/register" 
              className="px-4 py-2 bg-electric-blue text-white rounded-md hover:bg-electric-dark transition-all font-medium"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
