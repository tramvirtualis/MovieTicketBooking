import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Tạo axios instance với cấu hình mặc định (giống authService)
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Quan trọng: cho phép gửi và nhận cookies/session
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm token vào header nếu có
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý lỗi một cách thống nhất
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Có lỗi xảy ra';
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      return Promise.reject(new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'));
    } else {
      return Promise.reject(new Error(error.message || 'Có lỗi xảy ra'));
    }
  }
);

export const updateCustomerProfile = async (userId, profileData) => {
  try {
    const res = await axiosInstance.put(`/customer/${userId}/profile`, profileData);
    // Backend trả về { success, message, data }
    if (res.data.success && res.data.data) {
      return res.data.data;
    }
    throw new Error(res.data.message || 'Cập nhật thất bại');
  } catch (err) {
    throw err;
  }
};