import { Link } from "react-router-dom";
import { MdCalendarToday, MdArrowBack } from "react-icons/md";

const Booking = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <MdArrowBack />
          Quay lại trang chủ
        </Link>

        <div className="bg-white rounded-3xl shadow-lg p-8 lg:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-sky-500/10 rounded-2xl flex items-center justify-center">
              <MdCalendarToday className="text-3xl text-sky-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Đặt Xe</h1>
              <p className="text-gray-500">Chọn xe và thời gian thuê phù hợp</p>
            </div>
          </div>

          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MdCalendarToday className="text-4xl text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              Trang đặt xe đang được phát triển
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Chức năng đặt xe sẽ sớm được cập nhật. Vui lòng quay lại sau.
            </p>
            <Link
              to="/cars"
              className="inline-block mt-8 px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-full font-bold transition-colors"
            >
              Xem danh sách xe
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
