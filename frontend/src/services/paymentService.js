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
      const message = error.response.data?.message || 'Có lỗi xảy ra';
      return Promise.reject(new Error(message));
    }
    if (error.request) {
      return Promise.reject(new Error('Không thể kết nối đến server. Vui lòng thử lại sau.'));
    }
    return Promise.reject(new Error(error.message || 'Có lỗi xảy ra'));
  }
);

export const paymentService = {
  createMomoPayment: async (payload) => {
    const response = await axiosInstance.post('/payments/momo/create', payload);
    return {
      success: response.data?.success,
      message: response.data?.message,
      data: response.data?.data,
    };
  },
  getOrderByTxnRef: async (txnRef) => {
    const response = await axiosInstance.get(`/payments/orders/${txnRef}`);
    return {
      success: response.data?.success,
      message: response.data?.message,
      data: response.data?.data,
    };
  },
};

export default paymentService;


