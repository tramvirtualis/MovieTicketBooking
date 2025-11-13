const API_BASE_URL = 'http://localhost:8080/api/auth';

const fetchWithCredentials = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Cho phép gửi và nhận cookies/session
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  return response;
};

export const authService = {
  /**
   * Gửi OTP đến email
   * @param {string} email - Email người dùng
   * @returns {Promise<Object>} Response từ server
   */
  sendOtp: async (email) => {
    try {
      const response = await fetchWithCredentials(`${API_BASE_URL}/send-otp`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Không thể gửi OTP');
      }

      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Không thể kết nối đến server' 
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
      const response = await fetchWithCredentials(`${API_BASE_URL}/register`, {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký thất bại');
      }

      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Không thể kết nối đến server' 
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
      const response = await fetchWithCredentials(`${API_BASE_URL}/login`, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Không thể kết nối đến server' 
      };
    }
  },
};

export default authService;