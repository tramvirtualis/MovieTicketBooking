import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/auth';

// Tạo axios instance với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Quan trọng: cho phép gửi và nhận cookies/session
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để xử lý lỗi một cách thống nhất
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi từ server
    if (error.response) {
      // Server trả về response nhưng có status code lỗi (4xx, 5xx)
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Có lỗi xảy ra';
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      return Promise.reject(new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'));
    } else {
      // Lỗi khác
      return Promise.reject(new Error(error.message || 'Có lỗi xảy ra'));
    }
  }
);

export const authService = {
  /**
   * Gửi OTP đến email
   * @param {string} email - Email người dùng
   * @returns {Promise<Object>} Response từ server
   */
  sendOtp: async (email) => {
    try {
      const response = await axiosInstance.post('/send-otp', { email });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Không thể gửi OTP',
      };
    }
  },

  /**
   * Đăng ký tài khoản mới
   * @param {Object} formData - Dữ liệu đăng ký
   * @returns {Promise<Object>} Response từ server
   */
  register: async (formData) => {
    try {
      const response = await axiosInstance.post('/register', formData);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Đăng ký thất bại',
      };
    }
  },

  /**
   * Đăng nhập (placeholder cho tương lai)
   * @param {string} username - Tên đăng nhập
   * @param {string} password - Mật khẩu
   * @returns {Promise<Object>} Response từ server
   */
  login: async (username, password) => {
    try {
      const response = await axiosInstance.post('/login', { username, password });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Đăng nhập thất bại',
      };
    }
  },
};

export default authService;