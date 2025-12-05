import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error || 'Có lỗi xảy ra';
      return Promise.reject(new Error(message));
    }
    if (error.request) {
      return Promise.reject(new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'));
    }
    return Promise.reject(new Error(error.message || 'Có lỗi xảy ra'));
  }
);

export const walletService = {
  getWallet: async () => {
    const res = await axiosInstance.get('/wallet/me');
    if (res.data.success) {
      return res.data.data;
    }
    throw new Error(res.data.message || 'Không thể tải thông tin ví');
  },

  getTransactions: async () => {
    const res = await axiosInstance.get('/wallet/me/transactions');
    if (res.data.success) {
      return res.data.data || [];
    }
    throw new Error(res.data.message || 'Không thể tải lịch sử giao dịch');
  },

  topUp: async ({ amount, note }) => {
    const res = await axiosInstance.post('/wallet/me/top-up', { amount, note });
    if (res.data.success) {
      return res.data.data;
    }
    throw new Error(res.data.message || 'Nạp ví thất bại');
  },
};

