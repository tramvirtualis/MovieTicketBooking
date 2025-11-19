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
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Có lỗi xảy ra';
      return Promise.reject({
        message: errorMessage,
        validationErrors: error.response.data?.errors || null,
      });
    } else if (error.request) {
      return Promise.reject({ message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.' });
    } else {
      return Promise.reject({ message: error.message || 'Có lỗi xảy ra' });
    }
  }
);

const mapVoucherFromBackend = (voucher) => {
  if (!voucher) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const startDate = voucher.startDate ? new Date(voucher.startDate.split('T')[0]) : null;
  const endDate = voucher.endDate ? new Date(voucher.endDate.split('T')[0]) : null;

  let status = 'expired'; // 'upcoming', 'available', 'expired'
  if (startDate && endDate) {
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    if (now < startDate) {
      status = 'upcoming';
    } else if (now >= startDate && now <= endDate) {
      status = 'available';
    } else {
      status = 'expired';
    }
  }

  const discountType = voucher.discountType === 'VALUE' ? 'AMOUNT' : voucher.discountType;
  const discountValue = voucher.discountValue;

  return {
    id: voucher.voucherId,
    voucherId: voucher.voucherId,
    code: voucher.code,
    title: voucher.name,
    name: voucher.name,
    description: voucher.description || '',
    discount: discountType === 'PERCENT' ? 0 : Number(discountValue),
    discountPercent: discountType === 'PERCENT' ? Number(discountValue) : 0,
    discountType: discountType,
    expiryDate: voucher.endDate ? voucher.endDate.split('T')[0] : '',
    startDate: voucher.startDate ? voucher.startDate.split('T')[0] : '',
    status: status,
    image: voucher.image || '',
    minOrder: voucher.minOrderAmount ? Number(voucher.minOrderAmount) : 0,
    maxDiscount: voucher.maxDiscountAmount ? Number(voucher.maxDiscountAmount) : 0,
  };
};

const mapVouchersFromBackend = (vouchers) => {
  return (vouchers || []).map(mapVoucherFromBackend);
};

export const customerVoucherService = {
  /**
   * Lấy danh sách vouchers của user hiện tại
   * @returns {Promise<Object>} Response từ server
   */
  getUserVouchers: async () => {
    try {
      const response = await axiosInstance.get('/customer/vouchers');
      return {
        success: true,
        data: mapVouchersFromBackend(response.data.data || []),
        message: response.data.message || 'Lấy danh sách voucher thành công',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Không thể lấy danh sách voucher',
        data: [],
      };
    }
  },

  /**
   * Lưu voucher cho user hiện tại
   * @param {number} voucherId - ID của voucher
   * @returns {Promise<Object>} Response từ server
   */
  saveVoucher: async (voucherId) => {
    try {
      console.log('customerVoucherService: Saving voucher:', voucherId);
      const response = await axiosInstance.post(`/customer/vouchers/${voucherId}`);
      console.log('customerVoucherService: Save response:', response.data);
      return {
        success: true,
        data: mapVoucherFromBackend(response.data.data),
        message: response.data.message || 'Lưu voucher thành công',
      };
    } catch (error) {
      console.error('customerVoucherService: Error saving voucher:', error);
      console.error('customerVoucherService: Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể lưu voucher';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Xóa voucher khỏi user hiện tại
   * @param {number} voucherId - ID của voucher
   * @returns {Promise<Object>} Response từ server
   */
  removeVoucher: async (voucherId) => {
    try {
      const response = await axiosInstance.delete(`/customer/vouchers/${voucherId}`);
      return {
        success: true,
        message: response.data.message || 'Xóa voucher thành công',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Không thể xóa voucher',
      };
    }
  },

  /**
   * Kiểm tra user đã lưu voucher chưa và đã sử dụng chưa
   * @param {number} voucherId - ID của voucher
   * @returns {Promise<Object>} Response từ server với hasVoucher: boolean, isUsed: boolean
   */
  checkVoucher: async (voucherId) => {
    try {
      const response = await axiosInstance.get(`/customer/vouchers/${voucherId}/check`);
      return {
        success: true,
        hasVoucher: response.data.hasVoucher || false,
        isUsed: response.data.isUsed || false,
        message: response.data.message || 'Kiểm tra voucher thành công',
      };
    } catch (error) {
      return {
        success: false,
        hasVoucher: false,
        isUsed: false,
        error: error.message || 'Không thể kiểm tra voucher',
      };
    }
  },

  mapVoucherFromBackend,
  mapVouchersFromBackend,
};

export default customerVoucherService;

