import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Search, Plus, Pencil, Trash2, X, Mail, Phone, Calendar,
  Star, CreditCard, RefreshCw, Car, Eye, EyeOff, AlertCircle,
} from "lucide-react";
import { staffService } from "../../services/api";

const inp = "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-colors";

const DriverAvatar = ({ name }) => (
  <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-base font-black shrink-0 shadow-md">
    {(name || "?").charAt(0).toUpperCase()}
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
          <X size={17} className="text-gray-500" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const EMPTY_FORM = { username: "", email: "", phoneNumber: "", DOB: "", password: "", licenseNumber: "" };

function DriverFormModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    isEdit
      ? { username: initial.username || "", email: initial.email || "", phoneNumber: initial.phoneNumber || "", DOB: initial.DOB?.slice(0, 10) || "", password: "", licenseNumber: initial.licenseNumber ?? "" }
      : EMPTY_FORM
  );
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEdit && (!form.username || !form.email || !form.phoneNumber || !form.DOB || !form.password || !form.licenseNumber)) {
      setError("Vui lòng điền đầy đủ tất cả các trường bắt buộc."); return;
    }
    setError(""); setLoading(true);
    try {
      const payload = { ...form, licenseNumber: Number(form.licenseNumber) };
      if (isEdit && !payload.password) delete payload.password;
      isEdit ? await staffService.updateDriver(initial._id, payload) : await staffService.createDriver(payload);
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message ?? err?.message ?? "Lỗi khi lưu");
    } finally { setLoading(false); }
  };

  return (
    <Modal title={isEdit ? "Chỉnh sửa tài xế" : "Thêm tài xế mới"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Họ tên {!isEdit && <span className="text-red-400">*</span>}</label>
            <input className={inp} value={form.username} onChange={set("username")} required={!isEdit} placeholder="Nguyễn Văn A" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Số điện thoại {!isEdit && <span className="text-red-400">*</span>}</label>
            <input className={inp} value={form.phoneNumber} onChange={set("phoneNumber")} required={!isEdit} placeholder="09xxxxxxxx" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email {!isEdit && <span className="text-red-400">*</span>}</label>
          <input type="email" className={inp} value={form.email} onChange={set("email")} required={!isEdit} placeholder="email@example.com" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Ngày sinh {!isEdit && <span className="text-red-400">*</span>}</label>
            <input type="date" className={inp} value={form.DOB} onChange={set("DOB")} required={!isEdit} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Số GPLX {!isEdit && <span className="text-red-400">*</span>}</label>
            <input type="number" className={inp} value={form.licenseNumber} onChange={set("licenseNumber")} required={!isEdit} placeholder="Số giấy phép" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            {isEdit ? "Mật khẩu mới" : <span>Mật khẩu <span className="text-red-400">*</span></span>}
          </label>
          <div className="relative">
            <input type={showPwd ? "text" : "password"} className={inp + " pr-9"} value={form.password}
              onChange={set("password")} required={!isEdit} placeholder={isEdit ? "Bỏ trống nếu không đổi" : "••••••••"} />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">Huỷ</button>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-md disabled:opacity-60">
            {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo tài xế"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Drivers() {
  const { setBreadcrumb } = useOutletContext();
  const [drivers, setDrivers]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [fetchError, setFetchError]     = useState("");
  const [search, setSearch]             = useState("");
  const [formTarget, setFormTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  useEffect(() => { setBreadcrumb({ title: "Quản lý tài xế" }); }, [setBreadcrumb]);

  const fetchDrivers = useCallback(async () => {
    setLoading(true); setFetchError("");
    try {
      const res  = await staffService.getAllDrivers();
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setDrivers(list);
    } catch (err) {
      setFetchError(err?.response?.data?.message ?? err?.message ?? "Không thể tải danh sách tài xế");
      setDrivers([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await staffService.deleteDriver(deleteTarget._id);
      setDeleteTarget(null);
      fetchDrivers();
    } catch { /* ignore */ } finally { setDeleting(false); }
  };

  const filtered = drivers.filter((d) =>
    [d.username, d.email, d.phoneNumber].some((v) => (v || "").toLowerCase().includes(search.toLowerCase()))
  );

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "—";

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Quản lý tài xế</h1>
          <p className="text-sm text-gray-400 mt-0.5">{drivers.length} tài xế trong hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchDrivers}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Làm mới
          </button>
          <button onClick={() => setFormTarget("create")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold shadow-md hover:opacity-90 transition-all">
            <Plus size={14} /> Thêm tài xế
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên, email, SĐT..."
          className="pl-9 pr-4 py-2.5 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Đang tải...</p>
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center h-48 gap-2 bg-white rounded-2xl border border-red-100 shadow-sm">
          <AlertCircle size={32} className="text-red-300" />
          <p className="text-red-500 font-medium text-sm">{fetchError}</p>
          <button onClick={fetchDrivers} className="text-xs text-emerald-600 hover:underline">Thử lại</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Car size={40} className="text-gray-200" />
          <p className="text-sm text-gray-400 font-medium">Không tìm thấy tài xế nào</p>
          <button onClick={() => setFormTarget("create")}
            className="text-xs text-emerald-600 font-semibold hover:underline">Thêm tài xế mới →</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            <span className="w-11" />
            <span>Tên tài xế</span>
            <span>Email</span>
            <span>SĐT / Ngày sinh / GPLX</span>
            <span>Thao tác</span>
          </div>
          <div className="divide-y divide-gray-50">
            {filtered.map((d) => (
              <div key={d._id}
                className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-3.5 hover:bg-emerald-50/30 transition-colors">
                <DriverAvatar name={d.username} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{d.username}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    <span className="text-[11px] text-amber-600 font-semibold">{Number(d.Rating || 0).toFixed(1)}</span>
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold">Tài xế</span>
                  </div>
                </div>
                <div className="min-w-0 flex items-center gap-1.5 text-sm text-gray-500 truncate">
                  <Mail size={13} className="text-gray-300 shrink-0" />
                  {d.email || "—"}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Phone size={12} className="text-gray-300 shrink-0" />
                    {d.phoneNumber || "—"}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar size={11} className="text-gray-300 shrink-0" />
                    {fmtDate(d.DOB)}
                  </div>
                  {d.licenseNumber && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <CreditCard size={11} className="text-gray-300 shrink-0" />
                      GPLX: {d.licenseNumber}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setFormTarget(d)}
                    className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors" title="Chỉnh sửa">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleteTarget(d)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors" title="Xoá">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {formTarget !== null && (
        <DriverFormModal
          initial={formTarget === "create" ? null : formTarget}
          onClose={() => setFormTarget(null)}
          onSaved={() => { setFormTarget(null); fetchDrivers(); }}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <Modal title="Xác nhận xoá tài xế" onClose={() => setDeleteTarget(null)}>
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
              <Trash2 size={18} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700">
                Xoá tài xế <strong>{deleteTarget.username}</strong>? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Huỷ</button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50">
                {deleting ? "Đang xoá..." : "Xoá tài xế"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
