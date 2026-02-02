const Footer = () => {
  return (
    <footer className="bg-slate-800 text-white mt-auto py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Car Rental System</h3>
            <p className="text-slate-300">Hệ thống cho thuê xe uy tín và chuyên nghiệp</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Liên hệ</h4>
            <p className="text-slate-300 mb-2">Email: contact@carrental.com</p>
            <p className="text-slate-300">Điện thoại: 0123-456-789</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Theo dõi chúng tôi</h4>
            <div className="flex flex-col space-y-2">
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                Facebook
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                Instagram
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                Twitter
              </a>
            </div>
          </div>
        </div>
        <div className="text-center pt-8 border-t border-slate-700">
          <p className="text-slate-400 mb-0">&copy; 2026 Car Rental System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
