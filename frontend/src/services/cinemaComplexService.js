import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm JWT token vào header
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

// Interceptor để xử lý lỗi
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const errorMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        'Có lỗi xảy ra';
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      return Promise.reject(
        new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.')
      );
    } else {
      return Promise.reject(new Error(error.message || 'Có lỗi xảy ra'));
    }
  }
);

export const cinemaComplexService = {
  /**
   * Lấy tất cả cụm rạp
   * @returns {Promise<Object>} Response từ server
   */
  getAllCinemaComplexes: async () => {
    try {
      const response = await axiosInstance.get('/admin/cinema-complexes');
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Lấy danh sách cụm rạp thành công',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Không thể lấy danh sách cụm rạp',
      };
    }
  },

  /**
   * Lấy cụm rạp theo ID
   * @param {number} complexId - ID của cụm rạp
   * @returns {Promise<Object>} Response từ server
   */
  getCinemaComplexById: async (complexId) => {
    try {
      const response = await axiosInstance.get(`/admin/cinema-complexes/${complexId}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Lấy thông tin cụm rạp thành công',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Không thể lấy thông tin cụm rạp',
      };
    }
  },

  /**
   * Tạo cụm rạp mới
   * @param {Object} cinemaComplexData - Dữ liệu cụm rạp { name, addressDescription, addressProvince }
   * @returns {Promise<Object>} Response từ server
   */
  createCinemaComplex: async (cinemaComplexData) => {
    try {
      const response = await axiosInstance.post('/admin/cinema-complexes', cinemaComplexData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Tạo cụm rạp thành công',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Không thể tạo cụm rạp',
      };
    }
  },

  /**
   * Cập nhật cụm rạp
   * @param {number} complexId - ID của cụm rạp
   * @param {Object} cinemaComplexData - Dữ liệu cụm rạp cần cập nhật
   * @returns {Promise<Object>} Response từ server
   */
  updateCinemaComplex: async (complexId, cinemaComplexData) => {
    try {
      const response = await axiosInstance.put(
        `/admin/cinema-complexes/${complexId}`,
        cinemaComplexData
      );
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Cập nhật cụm rạp thành công',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Không thể cập nhật cụm rạp',
      };
    }
  },

  /**
   * Xóa cụm rạp
   * @param {number} complexId - ID của cụm rạp
   * @returns {Promise<Object>} Response từ server
   */
  deleteCinemaComplex: async (complexId) => {
    try {
      const response = await axiosInstance.delete(`/admin/cinema-complexes/${complexId}`);
      return {
        success: true,
        message: response.data.message || 'Xóa cụm rạp thành công',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Không thể xóa cụm rạp',
      };
    }
  },
};

export default cinemaComplexService;

