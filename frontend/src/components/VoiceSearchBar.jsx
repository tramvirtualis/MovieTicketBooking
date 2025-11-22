import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const VoiceSearchBar = ({ onSearch, placeholder = "Tìm kiếm phim..." }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Kiểm tra hỗ trợ Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'vi-VN'; // Tiếng Việt

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let transcript = event.results[0][0].transcript;
        
        // Loại bỏ dấu câu (dấu chấm, dấu phẩy, dấu chấm hỏi, dấu chấm than, v.v.)
        transcript = transcript
          .replace(/[.,!?;:]/g, '') // Loại bỏ các dấu câu phổ biến
          .replace(/\s+/g, ' ') // Loại bỏ khoảng trắng thừa
          .trim(); // Loại bỏ khoảng trắng ở đầu và cuối
        
        setSearchTerm(transcript);
        setIsListening(false);
        
        // Tự động navigate đến trang search results sau khi nhận diện
        if (transcript.trim()) {
          navigate(`/search?q=${encodeURIComponent(transcript.trim())}`);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        // Hiển thị thông báo lỗi phù hợp
        if (event.error === 'no-speech') {
          alert('Không phát hiện giọng nói. Vui lòng thử lại.');
        } else if (event.error === 'not-allowed') {
          alert('Quyền truy cập microphone bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt.');
        } else {
          alert('Có lỗi xảy ra khi nhận diện giọng nói. Vui lòng thử lại.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onSearch]);

  const handleVoiceSearch = () => {
    if (!isSupported) {
      alert('Trình duyệt của bạn không hỗ trợ tìm kiếm bằng giọng nói. Vui lòng sử dụng Chrome, Edge hoặc Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        alert('Không thể bắt đầu nhận diện giọng nói. Vui lòng thử lại.');
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Luôn navigate đến trang search results
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      // Nếu có callback onSearch, vẫn gọi nó (cho các trường hợp đặc biệt)
      if (onSearch) {
        onSearch(searchTerm.trim());
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <form 
      onSubmit={handleSearch}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '100%'
      }}
    >
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(45, 38, 39, 0.9)',
        border: `1.5px solid ${isListening ? '#e83b41' : 'rgba(255, 255, 255, 0.2)'}`,
        borderRadius: '50px',
        padding: '4px 10px',
        transition: 'all 0.3s ease',
        boxShadow: isListening 
          ? '0 0 15px rgba(232, 59, 65, 0.4)' 
          : '0 1px 4px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Search Icon - Clickable */}
        <button
          type="submit"
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            margin: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '6px'
          }}
          title="Tìm kiếm"
        >
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            style={{
              color: '#e6e1e2',
              flexShrink: 0
            }}
          >
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </button>

        {/* Input */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#e6e1e2',
            fontSize: '13px',
            padding: '0',
            minWidth: '120px'
          }}
        />

        {/* Voice Search Button */}
        <button
          type="button"
          onClick={handleVoiceSearch}
          disabled={!isSupported}
          style={{
            background: isListening 
              ? 'rgba(232, 59, 65, 0.2)' 
              : 'transparent',
            border: 'none',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isSupported ? 'pointer' : 'not-allowed',
            marginLeft: '4px',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
          title={isSupported 
            ? (isListening ? 'Đang nghe... (Nhấn để dừng)' : 'Tìm kiếm bằng giọng nói')
            : 'Trình duyệt không hỗ trợ tìm kiếm bằng giọng nói'}
        >
          {isListening ? (
            <>
              {/* Pulsing animation */}
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'rgba(232, 59, 65, 0.3)',
                animation: 'pulse 1.5s ease-in-out infinite'
              }} />
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="currentColor"
                style={{
                  color: '#e83b41',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </>
          ) : (
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{
                color: isSupported ? '#e6e1e2' : '#666',
                transition: 'color 0.3s ease'
              }}
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          )}
        </button>
      </div>

      {/* CSS Animation for pulse */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.3;
          }
        }
      `}</style>
    </form>
  );
};

export default VoiceSearchBar;

