import axiosInstance from './axiosConfig';

/**
 * Fetch full user profile from DB.
 * Token chỉ có { userId, username } nên tự detect role bằng cách thử từng endpoint.
 * Thứ tự: staff → driver → user (customer)
 */
const getProfile = async (user) => {
  if (!user?._id) return null;

  // Nếu role đã biết chắc, gọi thẳng
  if (user.role === 'staff') {
    try {
      const res = await axiosInstance.get(`/auth/staff/${user._id}`);
      return { ...(res?.data ?? res), detectedRole: 'staff' };
    } catch { /* fall through */ }
  }
  if (user.role === 'driver') {
    try {
      const res = await axiosInstance.get(`/auth/driver/${user._id}`);
      return { ...(res?.data ?? res), detectedRole: 'driver' };
    } catch { /* fall through */ }
  }
  if (user.role === 'customer') {
    try {
      const res = await axiosInstance.get(`/auth/user/${user._id}`);
      return { ...(res?.data ?? res), detectedRole: 'customer' };
    } catch { /* fall through */ }
  }

  // Role unknown (token default) → tự detect
  try {
    const res = await axiosInstance.get(`/auth/staff/${user._id}`);
    return { ...(res?.data ?? res), detectedRole: 'staff' };
  } catch { /* not staff */ }

  try {
    const res = await axiosInstance.get(`/auth/driver/${user._id}`);
    return { ...(res?.data ?? res), detectedRole: 'driver' };
  } catch { /* not driver */ }

  try {
    const res = await axiosInstance.get(`/auth/user/${user._id}`);
    return { ...(res?.data ?? res), detectedRole: 'customer' };
  } catch { /* not found */ }

  return null;
};

/**
 * Update profile theo detectedRole.
 */
const updateProfile = async (user, profileData, detectedRole) => {
  if (!user?._id) throw new Error('Không tìm thấy thông tin người dùng');
  const role = detectedRole || user.role;
  if (role === 'staff') {
    const res = await axiosInstance.put(`/auth/staff/${user._id}`, profileData);
    return res?.data ?? res;
  }
  if (role === 'driver') {
    const res = await axiosInstance.put(`/auth/driver/${user._id}`, profileData);
    return res?.data ?? res;
  }
  if (role === 'customer') {
    const res = await axiosInstance.put(`/auth/user/${user._id}`, profileData);
    return res?.data ?? res;
  }
  throw new Error('Không xác định được loại tài khoản');
};

export const profileService = { getProfile, updateProfile };


