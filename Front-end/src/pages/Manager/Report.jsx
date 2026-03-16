import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { BarChart2, RefreshCw, TrendingUp, CheckCircle, Car } from "lucide-react";
import { reportService } from "../../services/api";

const fmtVND = (v) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(v) || 0);

const today = () => new Date().toISOString().slice(0, 10);
const firstOfMonth = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
};

export default function Report() {
  const { setBreadcrumb } = useOutletContext();
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Set breadcrumb once on mount
  useEffect(() => {
    setBreadcrumb({ title: "Báo cáo tài chính" });
  }, []);

  const fetchReport = async () => {
    if (!from || !to) { setError("Vui lòng chọn khoảng thời gian."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await reportService.getFinancialReport(from, to);
      setData(res?.data ?? res);
    } catch (err) {
      setError(err?.response?.data?.message ?? err?.message ?? "Lỗi khi tải báo cáo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Báo cáo tài chính</h1>
          <p className="text-gray-600 mt-1">Thống kê doanh thu theo khoảng thời gian</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Từ ngày</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Đến ngày</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={fetchReport}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            <span className="font-medium">{loading ? "Đang tải..." : "Xem báo cáo"}</span>
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
        )}
      </div>

      {/* Summary Cards */}
      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <TrendingUp size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Tổng doanh thu</p>
                  <p className="text-2xl font-bold text-gray-800">{fmtVND(data.totalRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <CheckCircle size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Đơn hoàn thành</p>
                  <p className="text-2xl font-bold text-gray-800">{data.completedBookings ?? 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top vehicles table */}
          {Array.isArray(data.topBookedVehicles) && data.topBookedVehicles.length > 0 && (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
                <Car size={20} className="text-blue-500" />
                <h2 className="text-lg font-bold text-gray-800">Top xe theo lượt thuê</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">#</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Tên xe</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Loại</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Lượt thuê</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.topBookedVehicles.map((v, i) => (
                      <tr key={v.vehicleId ?? i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-500 font-medium">{i + 1}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{v.vehicleName}</td>
                        <td className="px-6 py-4 text-gray-600 capitalize">{v.vehicleType}</td>
                        <td className="px-6 py-4 text-gray-900">{v.bookingCount}</td>
                        <td className="px-6 py-4 text-green-700 font-semibold">{fmtVND(v.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!data && !loading && (
        <div className="text-center py-16">
          <BarChart2 size={52} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Chọn khoảng thời gian và nhấn &ldquo;Xem báo cáo&rdquo;</p>
        </div>
      )}
    </div>
  );
}
