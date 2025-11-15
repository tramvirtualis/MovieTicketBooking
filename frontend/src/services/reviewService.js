const API_BASE_URL = 'http://localhost:8080/api';

export const reviewService = {
  async createReview(movieId, rating, context) {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('Bạn cần đăng nhập để đánh giá phim');
    }

    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        movieId,
        rating,
        context: context || ''
      })
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Có lỗi xảy ra khi gửi đánh giá');
    }

    return data;
  },

  async getReviewsByMovie(movieId) {
    const response = await fetch(`${API_BASE_URL}/reviews/movie/${movieId}`);
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Có lỗi xảy ra khi lấy đánh giá');
    }

    return data.data || [];
  },

  async getReviewsByUser(userId) {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('Bạn cần đăng nhập');
    }

    const response = await fetch(`${API_BASE_URL}/reviews/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Có lỗi xảy ra khi lấy đánh giá');
    }

    return data.data || [];
  }
};


