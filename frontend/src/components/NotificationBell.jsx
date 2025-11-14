import React, { useState, useRef, useEffect } from 'react';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Phim mới: Wicked',
      message: 'Đặt vé ngay cho bom tấn âm nhạc Wicked - Khởi chiếu 22/11',
      time: '2 giờ trước',
      isRead: false
    },
    {
      id: 2,
      title: 'Ưu đãi đặc biệt',
      message: 'Mua 2 tặng 1 vé xem phim - Áp dụng cuối tuần này',
      time: '5 giờ trước',
      isRead: false
    },
    {
      id: 3,
      title: 'Gladiator II',
      message: 'Bom tấn hành động đỉnh cao đã có lịch chiếu tại rạp',
      time: '1 ngày trước',
      isRead: false
    },
    {
      id: 4,
      title: 'Thành viên VIP',
      message: 'Tích điểm đổi quà - Giảm 30% combo bắp nước cho thành viên Gold',
      time: '2 ngày trước',
      isRead: false
    },
    {
      id: 5,
      title: 'Moana 2',
      message: 'Phim hoạt hình Disney mới nhất sắp ra mắt - Đặt vé trước ngay',
      time: '3 ngày trước',
      isRead: false
    }
  ]);
  const [showAll, setShowAll] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const displayedNotifications = showAll ? notifications : notifications.slice(0, 3);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };

  const markAllAsRead = () => {
    setNotifications([]);
    setShowAll(false);
  };

  return (
    <div className="relative" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#e6e1e2] hover:text-white transition-colors"
        aria-label="Thông báo"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span 
            className="absolute top-0 right-0 bg-[#e83b41] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
            style={{
              minWidth: '20px',
              padding: '0 4px',
              fontSize: '10px',
              lineHeight: '1',
              boxShadow: '0 2px 8px rgba(232, 59, 65, 0.5)'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 bg-[#2d2627] border border-[#4a3f41] rounded-lg shadow-2xl z-50 max-h-96 overflow-hidden flex flex-col"
          style={{
            top: '100%',
            marginTop: '8px',
            zIndex: 200
          }}
        >
          <div className="p-4 border-b border-[#4a3f41] flex items-center justify-between">
            <h3 className="text-white font-semibold">Thông báo</h3>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-[#ffd159] hover:text-[#ffeb9e] transition-colors"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-[#c9c4c5]">
                <svg className="mx-auto mb-3 w-12 h-12 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <p>Không có thông báo mới</p>
              </div>
            ) : (
              <>
                {displayedNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 border-b border-[#4a3f41] hover:bg-[#1a1415] transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-medium text-sm truncate">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-[#4caf50] rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-[#c9c4c5] text-xs mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <span className="text-[#9e9e9e] text-xs">{notification.time}</span>
                      </div>
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-[#9e9e9e] hover:text-white transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                        aria-label="Đánh dấu đã đọc"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {notifications.length > 3 && (
            <div className="p-3 border-t border-[#4a3f41]">
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full text-center text-sm text-[#ffd159] hover:text-[#ffeb9e] transition-colors"
              >
                {showAll ? 'Thu gọn' : `Xem thêm (${notifications.length - 3})`}
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;