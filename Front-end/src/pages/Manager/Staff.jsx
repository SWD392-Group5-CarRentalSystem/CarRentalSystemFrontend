import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Search, Plus, Pencil, Trash2, X, Mail, Phone, Calendar,
  UserCheck, RefreshCw, ShieldCheck, Eye, EyeOff,
} from "lucide-react";
import { staffService } from "../../services/api/staffService";

const inp = "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors";

const Avatar = ({ name, grad }) => (
  <div className={`w-11 h-11 rounded-2xl bg-linear-to-br ${grad} flex items-center justify-center text-white text-base font-black shrink-0 shadow-md`}>
    {(name || "?").charAt(0).toUpperCase()}
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
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

function StaffFormModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    isEdit
      ? { username: initial.username || "", email: initial.email || "", phoneNumber: initial.phoneNumber || "", DOB: initial.DOB?.slice(0, 10) || "", password: "" }
      : { username: "", email: "", phoneNumber: "", DOB: "", password: "" }
  );
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { ...form };
      if (isEdit && !payload.password) delete payload.password;
      isEdit ? await staffService.updateStaff(initial._id, payload) : await staffService.createStaff(payload);
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message ?? err?.message ?? "Lỗi khi lưu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={isEdit ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Tên đăng nhập {!isEdit && <span className="text-red-400">*</span>}</label>
            <input className={inp} value={form.username} onChange={set("username")} required={!isEdit} placeholder="username" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Số điện thoại</label>
            <input className={inp} value={form.phoneNumber} onChange={set("phoneNumber")} placeholder="09xxxxxxxx" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email {!isEdit && <span className="text-red-400">*</span>}</label>
          <input type="email" className={inp} value={form.email} onChange={set("email")} required={!isEdit} placeholder="email@example.com" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Ngày sinh</label>
            <input type="date" className={inp} value={form.DOB} onChange={set("DOB")} />
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
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
            Huỷ
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-md disabled:opacity-60">
            {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo nhân viên"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Staff() {
  const { setBreadcrumb } = useOutletContext();
  const [staffList, setStaffList]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [fetchError, setFetchError]     = useState("");
  const [search, setSearch]             = useState("");
  const [formTarget, setFormTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  useEffect(() => { setBreadcrumb({ title: "Quản lý nhân viên" }); }, [setBreadcrumb]);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res  = await staffService.getAllStaff();
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setStaffList(list);
    } catch (err) {
      setFetchError(err?.response?.data?.message ?? err?.message ?? "Không thể tải danh sách nhân viên");
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await staffService.deleteStaff(deleteTarget._id);
      setDeleteTarget(null);
      fetchStaff();
    } catch { /* ignore */ } finally { setDeleting(false); }
  };

  const filtered = staffList.filter((s) =>
    [s.username, s.email, s.phoneNumber].some((v) => (v || "").toLowerCase().includes(search.toLowerCase()))
  );

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "—";

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Quản lý nhân viên</h1>
          <p className="text-sm text-gray-400 mt-0.5">{staffList.length} nhân viên trong hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchStaff}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Làm mới
          </button>
          <button onClick={() => setFormTarget("create")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold shadow-md hover:opacity-90 transition-all">
            <Plus size={14} /> Thêm nhân viên
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên, email, SĐT..."
          className="pl-9 pr-4 py-2.5 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Đang tải...</p>
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <p className="text-red-500 font-medium text-sm">{fetchError}</p>
            <button onClick={fetchStaff} className="text-xs text-blue-600 hover:underline">Thử lại</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <UserCheck size={36} className="text-gray-200" />
            <p className="text-sm text-gray-400">Không có nhân viên nào</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <span className="w-11" />
              <span>Tên đăng nhập</span>
              <span>Email</span>
              <span>Số điện thoại / Ngày sinh</span>
              <span>Thao tác</span>
            </div>
            <div className="divide-y divide-gray-50">
              {filtered.map((s, idx) => (
                <div key={s._id}
                  className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-3.5 hover:bg-blue-50/30 transition-colors">
                  <Avatar name={s.username} grad={idx % 2 === 0 ? "from-blue-400 to-indigo-500" : "from-violet-400 to-purple-500"} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{s.username}</p>
                    <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold">
                      <ShieldCheck size={10} /> Nhân viên
                    </span>
                  </div>
                  <div className="min-w-0 flex items-center gap-1.5 text-sm text-gray-500 truncate">
                    <Mail size={13} className="text-gray-300 shrink-0" />
                    {s.email || "—"}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Phone size={12} className="text-gray-300 shrink-0" />
                      {s.phoneNumber || "—"}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Calendar size={11} className="text-gray-300 shrink-0" />
                      {fmtDate(s.DOB)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setFormTarget(s)}
                      className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors" title="Chỉnh sửa">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteTarget(s)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors" title="Xoá">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Form Modal */}
      {formTarget !== null && (
        <StaffFormModal
          initial={formTarget === "create" ? null : formTarget}
          onClose={() => setFormTarget(null)}
          onSaved={() => { setFormTarget(null); fetchStaff(); }}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <Modal title="Xác nhận xoá" onClose={() => setDeleteTarget(null)}>
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
              <Trash2 size={18} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700">
                Xoá nhân viên <strong>{deleteTarget.username}</strong>? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Huỷ</button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50">
                {deleting ? "Đang xoá..." : "Xoá nhân viên"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
