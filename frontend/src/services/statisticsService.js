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

export const statisticsService = {
  /**
   * Lấy tất cả các thống kê cho admin dashboard
   */
  getAllStatistics: async () => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        return { success: false, error: 'Chưa đăng nhập' };
      }

      const response = await axiosInstance.get('/admin/statistics');
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      }
      
      return { success: false, error: response.data?.message || 'Không thể lấy thống kê' };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {
        success: false,
        error: error.message || 'Không thể lấy thống kê'
      };
    }
  },

  /**
   * Lấy doanh thu và tổng vé bán ra theo tất cả các rạp
   */
  getStatisticsByCinema: async () => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        return { success: false, error: 'Chưa đăng nhập' };
      }

      const response = await axiosInstance.get('/admin/statistics/by-cinema');
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      }
      
      return { success: false, error: response.data?.message || 'Không thể lấy thống kê theo rạp' };
    } catch (error) {
      console.error('Error fetching statistics by cinema:', error);
      return {
        success: false,
        error: error.message || 'Không thể lấy thống kê theo rạp'
      };
    }
  },

  /**
   * Lấy doanh thu và tổng vé bán ra cho một rạp cụ thể
   */
  getStatisticsByCinemaId: async (complexId) => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        return { success: false, error: 'Chưa đăng nhập' };
      }

      const response = await axiosInstance.get(`/admin/statistics/by-cinema/${complexId}`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      }
      
      return { success: false, error: response.data?.message || 'Không thể lấy thống kê theo rạp' };
    } catch (error) {
      console.error('Error fetching statistics by cinema ID:', error);
      return {
        success: false,
        error: error.message || 'Không thể lấy thống kê theo rạp'
      };
    }
  },

  /**
   * Lấy doanh thu và tổng vé bán ra theo tất cả các phim
   */
  getStatisticsByMovie: async () => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        return { success: false, error: 'Chưa đăng nhập' };
      }

      const response = await axiosInstance.get('/admin/statistics/by-movie');
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      }
      
      return { success: false, error: response.data?.message || 'Không thể lấy thống kê theo phim' };
    } catch (error) {
      console.error('Error fetching statistics by movie:', error);
      return {
        success: false,
        error: error.message || 'Không thể lấy thống kê theo phim'
      };
    }
  },

  /**
   * Lấy doanh thu và tổng vé bán ra cho một phim cụ thể
   */
  getStatisticsByMovieId: async (movieId) => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        return { success: false, error: 'Chưa đăng nhập' };
      }

      const response = await axiosInstance.get(`/admin/statistics/by-movie/${movieId}`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      }
      
      return { success: false, error: response.data?.message || 'Không thể lấy thống kê theo phim' };
    } catch (error) {
      console.error('Error fetching statistics by movie ID:', error);
      return {
        success: false,
        error: error.message || 'Không thể lấy thống kê theo phim'
      };
    }
  }
};

