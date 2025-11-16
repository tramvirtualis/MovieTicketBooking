import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Thêm JWT
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem("jwt");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const priceService = {
  // Lấy bảng giá
  getAllPrices: async () => {
    try {
      const res = await axiosInstance.get("/admin/prices");

      return {
        success: true,
        data: res.data.data || res.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Không thể lấy bảng giá"
      };
    }
  },

  // Lưu toàn bộ bảng giá
  saveAllPrices: async (priceList) => {
    try {
      const res = await axiosInstance.post("/admin/prices/save", priceList);

      return {
        success: true,
        data: res.data.data || res.data,
        message: res.data.message || "Lưu bảng giá thành công"
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Không thể lưu bảng giá",
      };
    }
  }
};

export default priceService;
