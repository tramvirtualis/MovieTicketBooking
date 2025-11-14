import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Tạo axios instance với cấu hình mặc định
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

export const movieService = {
  /**
   * Lấy tất cả phim
   * @returns {Promise<Object>} Response từ server
   */
  getAllMovies: async () => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        return {
          success: false,
          error: 'Vui lòng đăng nhập để tiếp tục',
        };
      }

      const response = await axiosInstance.get('/admin/movies');
      
      // Xử lý response data
      let movies = [];
      if (response.data) {
        if (Array.isArray(response.data.data)) {
          movies = response.data.data;
        } else if (Array.isArray(response.data)) {
          movies = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          movies = response.data.data;
        }
      }

      return {
        success: true,
        data: movies,
      };
    } catch (error) {
      let errorMessage = 'Không thể lấy danh sách phim';
      
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          // Xóa token nếu không hợp lệ
          localStorage.removeItem('jwt');
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Lấy phim theo ID
   * @param {number} movieId - ID của phim
   * @returns {Promise<Object>} Response từ server
   */
  getMovieById: async (movieId) => {
    try {
      const response = await axiosInstance.get(`/admin/movies/${movieId}`);
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Không thể lấy thông tin phim',
      };
    }
  },

  /**
   * Tạo phim mới
   * @param {Object} movieData - Dữ liệu phim
   * @returns {Promise<Object>} Response từ server
   */
  createMovie: async (movieData) => {
    try {
      const response = await axiosInstance.post('/admin/movies', movieData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Tạo phim thành công',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Không thể tạo phim',
      };
    }
  },

  /**
   * Cập nhật phim
   * @param {number} movieId - ID của phim
   * @param {Object} movieData - Dữ liệu phim cần cập nhật
   * @returns {Promise<Object>} Response từ server
   */
  updateMovie: async (movieId, movieData) => {
    try {
      const response = await axiosInstance.put(`/admin/movies/${movieId}`, movieData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Cập nhật phim thành công',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Không thể cập nhật phim',
      };
    }
  },

  /**
   * Xóa phim
   * @param {number} movieId - ID của phim
   * @returns {Promise<Object>} Response từ server
   */
  deleteMovie: async (movieId) => {
    try {
      const response = await axiosInstance.delete(`/admin/movies/${movieId}`);
      return {
        success: true,
        message: response.data.message || 'Xóa phim thành công',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Không thể xóa phim',
      };
    }
  },
};

export default movieService;

