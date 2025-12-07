// API Configuration
// Sử dụng biến môi trường từ .env file
// Trong Vite, biến môi trường phải bắt đầu bằng VITE_
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

