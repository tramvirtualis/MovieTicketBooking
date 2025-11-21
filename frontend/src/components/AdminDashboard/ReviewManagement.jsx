import React, { useState, useEffect } from 'react';
import { reviewService } from '../../services/reviewService';

function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'reported', 'hidden'
  const [searchTerm, setSearchTerm] = useState('');

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Load all reviews
  const loadAllReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const reviewsData = await reviewService.getAllReviews();
      setReviews(reviewsData);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách đánh giá');
      showNotification(err.message || 'Không thể tải danh sách đánh giá', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load reported reviews
  const loadReportedReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const reviewsData = await reviewService.getReportedReviews();
      setReviews(reviewsData);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách đánh giá');
      showNotification(err.message || 'Không thể tải danh sách đánh giá', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filter === 'reported') {
      loadReportedReviews();
    } else {
      // For 'all' and 'hidden', load all reviews and filter client-side
      loadAllReviews();
    }
  }, [filter]);

  // Toggle review visibility
  const handleToggleVisibility = async (reviewId) => {
    try {
      const updatedReview = await reviewService.toggleReviewVisibility(reviewId);
      setReviews(prev => prev.map(r => 
        r.reviewId === reviewId 
          ? { ...r, isHidden: updatedReview.isHidden }
          : r
      ));
      showNotification(
        updatedReview.isHidden ? 'Đã ẩn đánh giá' : 'Đã hiển thị đánh giá',
        'success'
      );
    } catch (err) {
      showNotification(err.message || 'Có lỗi xảy ra', 'error');
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'reported' ? review.reportCount > 0 :
      filter === 'hidden' ? review.isHidden === true : true;
    
    const matchesSearch = 
      !searchTerm ||
      review.context?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.movieTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ padding: '24px', color: '#fff' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '24px', fontWeight: 700 }}>
          Quản lý đánh giá
        </h2>
        
        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '16px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '8px 16px',
                background: filter === 'all' ? '#e83b41' : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: filter === 'all' ? 600 : 400
              }}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter('reported')}
              style={{
                padding: '8px 16px',
                background: filter === 'reported' ? '#e83b41' : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: filter === 'reported' ? 600 : 400
              }}
            >
              Bị báo cáo ({reviews.filter(r => r.reportCount > 0).length})
            </button>
            <button
              onClick={() => setFilter('hidden')}
              style={{
                padding: '8px 16px',
                background: filter === 'hidden' ? '#e83b41' : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: filter === 'hidden' ? 600 : 400
              }}
            >
              Đã ẩn ({reviews.filter(r => r.isHidden).length})
            </button>
          </div>
          
          <input
            type="text"
            placeholder="Tìm kiếm theo nội dung, người dùng, phim..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: '#fff',
              minWidth: '300px',
              flex: 1
            }}
          />
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div style={{
          padding: '12px 16px',
          background: notification.type === 'success' ? '#4caf50' : '#f44336',
          borderRadius: '8px',
          marginBottom: '16px',
          color: '#fff'
        }}>
          {notification.message}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: '12px 16px',
          background: '#f44336',
          borderRadius: '8px',
          marginBottom: '16px',
          color: '#fff'
        }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.7)' }}>
          Đang tải...
        </div>
      )}

      {/* Reviews List */}
      {!loading && filteredReviews.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.7)' }}>
          Không có đánh giá nào
        </div>
      )}

      {!loading && filteredReviews.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredReviews.map(review => (
            <div
              key={review.reviewId}
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                      {review.username || 'Người dùng'}
                    </h4>
                    <span style={{
                      padding: '4px 8px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {review.movieTitle}
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} style={{ color: i < review.rating ? '#ffd159' : 'rgba(255,255,255,0.3)' }}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p style={{ 
                    margin: '0 0 8px', 
                    color: 'rgba(255,255,255,0.8)',
                    lineHeight: '1.5'
                  }}>
                    {review.context}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                    <span>Ngày: {formatDate(review.createdAt)}</span>
                    {review.reportCount > 0 && (
                      <span style={{ color: '#ff9800' }}>
                        🚩 {review.reportCount} báo cáo
                      </span>
                    )}
                    {review.isHidden && (
                      <span style={{ color: '#f44336' }}>
                        👁️ Đã ẩn
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleToggleVisibility(review.reviewId)}
                    style={{
                      padding: '8px 16px',
                      background: review.isHidden ? '#4caf50' : '#ff9800',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '14px'
                    }}
                    title={review.isHidden ? 'Hiển thị đánh giá' : 'Ẩn đánh giá'}
                  >
                    {review.isHidden ? '👁️ Hiển thị' : '🙈 Ẩn'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewManagement;


