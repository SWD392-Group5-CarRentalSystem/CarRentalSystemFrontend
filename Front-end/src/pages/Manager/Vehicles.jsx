import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { Car, Plus, Search, Filter, Edit, Trash2, Eye, X } from "lucide-react";
import { vehicleService } from "../../services/api";

export default function Vehicles() {
  const { setBreadcrumb } = useOutletContext();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formModal, setFormModal] = useState(null); // null | 'create' | vehicleObj
  const [detailVehicle, setDetailVehicle] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setBreadcrumb({ title: "Vehicles" });
    fetchVehicles();
  }, []);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getAllVehicles();
      setVehicles(response.data || []);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSave = async (formData) => {
    setSaving(true);
    setSaveError("");
    try {
      const payload = {
        vehicleName: formData.vehicleName,
        vehicleType: formData.vehicleType,
        price: formData.price,
        vehicleStatus: formData.vehicleStatus === 'true' || formData.vehicleStatus === true,
        vehicleDetail: {
          vehicleBrands: formData.vehicleBrands,
          vehicleColor: formData.vehicleColor,
          vehicleLicensePlate: formData.vehicleLicensePlate,
          vehicleYear: Number(formData.vehicleYear),
          vehicleSeatCount: Number(formData.vehicleSeatCount),
          vehicleImage: formData.vehicleImage,
        },
      };
      if (formModal && typeof formModal === 'object') {
        await vehicleService.updateVehicle(formModal._id, payload);
      } else {
        await vehicleService.createVehicle(payload);
      }
      setFormModal(null);
      fetchVehicles();
    } catch (err) {
      setSaveError(err?.message || "Lỗi khi lưu xe");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await vehicleService.deleteVehicle(deleteTarget._id);
      setDeleteTarget(null);
      fetchVehicles();
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      available: "bg-emerald-100 text-emerald-700 border-emerald-200",
      unavailable: "bg-red-100 text-red-700 border-red-200",
      rented: "bg-blue-100 text-blue-700 border-blue-200",
      maintenance: "bg-amber-100 text-amber-700 border-amber-200",
    };
    return styles[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusText = (status) => {
    const texts = {
      available: "Sẵn sàng",
      unavailable: "Không sẵn",
      rented: "Đang thuê",
      maintenance: "Bảo trì",
    };
    return texts[status] || status;
  };

  // Convert boolean vehicleStatus to string key
  const getStatusKey = (vehicle) => {
    if (vehicle.vehicleStatus === false) return "unavailable";
    if (vehicle.vehicleStatus === true) return "available";
    return vehicle.status || "available";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vehicleType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vehicleDetail?.vehicleBrands?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý xe</h1>
          <p className="text-gray-600 mt-1">Tổng cộng {vehicles.length} xe</p>
        </div>
        <button
          onClick={() => { setSaveError(""); setFormModal('create'); }}
          className="flex items-center gap-2 px-5 py-3 bg-linear-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl">
          <Plus size={20} />
          <span className="font-medium">Thêm xe mới</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên xe, model, hãng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            <Filter size={20} />
            <span className="font-medium">Lọc</span>
          </button>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => {
          const statusKey = getStatusKey(vehicle);
          return (
          <div
            key={vehicle._id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group hover:-translate-y-1"
          >
            {/* Vehicle Image */}
            <div className="h-48 bg-linear-to-br from-blue-100 via-cyan-50 to-blue-50 relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {vehicle.vehicleDetail?.vehicleImage ? (
                <img
                  src={vehicle.vehicleDetail.vehicleImage}
                  alt={vehicle.vehicleName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">🚗</div>
              )}
            </div>

            {/* Vehicle Info */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {vehicle.vehicleName}
                  </h3>
                  <p className="text-sm text-gray-500">{vehicle.vehicleDetail?.vehicleBrands} • {vehicle.vehicleDetail?.vehicleYear}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusStyle(statusKey)}`}>
                  {getStatusText(statusKey)}
                </span>
              </div>

              <div className="mb-4 pb-4 border-b border-gray-100">
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-700">{vehicle.vehicleType}</span>
                  {vehicle.vehicleDetail?.vehicleSeatCount ? ` • ${vehicle.vehicleDetail.vehicleSeatCount} chỗ` : ""}
                  {vehicle.vehicleDetail?.vehicleColor ? ` • ${vehicle.vehicleDetail.vehicleColor}` : ""}
                </p>                <p className="mt-1 text-base font-bold text-blue-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(vehicle.price) * 1000 || 0)}
                  <span className="text-xs font-normal text-gray-400 ml-1">/ngày</span>
                </p>              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setDetailVehicle(vehicle)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                  <Eye size={16} />
                  <span className="text-sm font-medium">Xem</span>
                </button>
                <button
                  onClick={() => { setSaveError(""); setFormModal(vehicle); }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => setDeleteTarget(vehicle)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          <Car size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 font-medium">Không tìm thấy xe nào</p>
        </div>
      )}

      {/* Vehicle Form Modal */}
      {formModal !== null && (
        <VehicleFormModal
          initial={typeof formModal === 'object' ? formModal : null}
          saving={saving}
          error={saveError}
          onClose={() => setFormModal(null)}
          onSubmit={handleSave}
        />
      )}

      {/* Vehicle Detail Modal */}
      {detailVehicle && (
        <VehicleDetailModal
          vehicle={detailVehicle}
          onClose={() => setDetailVehicle(null)}
          onEdit={() => { setDetailVehicle(null); setSaveError(''); setFormModal(detailVehicle); }}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Xác nhận xoá xe</h2>
            <p className="text-sm text-gray-600">Bạn chắc chắn muốn xoá xe <strong>{deleteTarget.vehicleName}</strong>?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Huỷ</button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">
                {deleting ? 'Đang xoá...' : 'Xoá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Vehicle Form Modal ─────────────────────────────────────────────────────
const VEHICLE_TYPES = ['sedan','suv','truck','van','sport','electric','other'];

function VehicleFormModal({ initial, saving, error, onClose, onSubmit }) {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    vehicleName: initial?.vehicleName || '',
    vehicleType: initial?.vehicleType || 'sedan',
    price: initial?.price || '',
    vehicleStatus: initial ? String(initial.vehicleStatus !== false) : 'true',
    vehicleBrands: initial?.vehicleDetail?.vehicleBrands || '',
    vehicleColor: initial?.vehicleDetail?.vehicleColor || '',
    vehicleLicensePlate: initial?.vehicleDetail?.vehicleLicensePlate || '',
    vehicleYear: initial?.vehicleDetail?.vehicleYear || '',
    vehicleSeatCount: initial?.vehicleDetail?.vehicleSeatCount || '',
    vehicleImage: initial?.vehicleDetail?.vehicleImage || '',
  });
  const set = (k) => (e) => setForm(f => ({...f, [k]: e.target.value}));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">{isEdit ? 'Chỉnh sửa xe' : 'Thêm xe mới'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tên xe *</label>
              <input required value={form.vehicleName} onChange={set('vehicleName')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Loại xe *</label>
              <select required value={form.vehicleType} onChange={set('vehicleType')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Giá/ngày (VNĐ) *</label>
              <input required type="number" value={form.price} onChange={set('price')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Hãng xe</label>
              <input value={form.vehicleBrands} onChange={set('vehicleBrands')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Màu sắc</label>
              <input value={form.vehicleColor} onChange={set('vehicleColor')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Biển số</label>
              <input value={form.vehicleLicensePlate} onChange={set('vehicleLicensePlate')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Năm sản xuất</label>
              <input type="number" value={form.vehicleYear} onChange={set('vehicleYear')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Số chỗ ngồi</label>
              <input type="number" value={form.vehicleSeatCount} onChange={set('vehicleSeatCount')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Trạng thái</label>
              <select value={form.vehicleStatus} onChange={set('vehicleStatus')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="true">Sẵn sàng</option>
                <option value="false">Ngừng hoạt động</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">URL ảnh xe</label>
              <input value={form.vehicleImage} onChange={set('vehicleImage')}
                placeholder="https://..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Huỷ</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo xe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Vehicle Detail Modal ───────────────────────────────────────────────────
function VehicleDetailModal({ vehicle, onClose, onEdit }) {
  const fmt = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(v) * 1000 || 0);
  const rows = [
    ['Tên xe', vehicle.vehicleName],
    ['Loại xe', vehicle.vehicleType],
    ['Giá/ngày', fmt(vehicle.price)],
    ['Hãng', vehicle.vehicleDetail?.vehicleBrands],
    ['Màu', vehicle.vehicleDetail?.vehicleColor],
    ['Biển số', vehicle.vehicleDetail?.vehicleLicensePlate],
    ['Năm SX', vehicle.vehicleDetail?.vehicleYear],
    ['Số chỗ', vehicle.vehicleDetail?.vehicleSeatCount],
    ['Trạng thái', vehicle.vehicleStatus !== false ? 'Sẵn sàng' : 'Ngừng HĐ'],
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Chi tiết xe</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        {vehicle.vehicleDetail?.vehicleImage && (
          <img src={vehicle.vehicleDetail.vehicleImage} alt={vehicle.vehicleName}
            className="w-full h-48 object-cover" />
        )}
        <div className="p-6 space-y-3">
          {rows.map(([label, val]) => val != null && (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-900">{val}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 p-6 pt-0">
          <button onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Đóng</button>
          <button onClick={onEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Chỉnh sửa</button>
        </div>
      </div>
    </div>
  );
}
