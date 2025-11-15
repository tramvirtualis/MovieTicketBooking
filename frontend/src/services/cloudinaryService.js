import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Tạo axios instance dùng chung
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Interceptor thêm JWT vào request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor xử lý lỗi
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const errorMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        'Có lỗi xảy ra khi upload ảnh';

      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      return Promise.reject(new Error('Không thể kết nối đến server.'));
    } else {
      return Promise.reject(new Error(error.message || 'Có lỗi xảy ra'));
    }
  }
);

export const cloudinaryService = {
  /**
   * Upload một ảnh lên Cloudinary
   * Tương ứng API backend: POST /api/admin/upload-image
   */
  uploadSingle: async (file) => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      return {
        success: false,
        error: 'Vui lòng đăng nhập để tiếp tục',
      };
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axiosInstance.post('/admin/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // multipart cho upload
        },
      });

      return {
        success: true,
        url: response.data, // Backend trả về secure_url dạng text
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Upload ảnh thất bại',
      };
    }
  },
};

export default cloudinaryService;
