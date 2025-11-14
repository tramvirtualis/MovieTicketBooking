import { SEAT_TYPES } from './constants';

// Generate seats for a room with realistic layout
export function generateSeats(rows, cols) {
  const seats = [];
  const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  // Calculate walkway positions (every 4-5 seats, and in the middle if cols > 10)
  const walkwayPositions = new Set();
  for (let col = 5; col <= cols; col += 5) {
    walkwayPositions.add(col);
  }
  // Add middle walkway if room is wide enough
  if (cols > 10) {
    const middle = Math.floor(cols / 2);
    walkwayPositions.add(middle);
    walkwayPositions.add(middle + 1);
  }
  
  for (let row = 0; row < rows; row++) {
    for (let col = 1; col <= cols; col++) {
      // Skip walkway columns
      if (walkwayPositions.has(col)) continue;
      
      // Determine seat type based on row position
      let seatType = 'NORMAL';
      if (row < Math.floor(rows * 0.15)) {
        // First ~15% rows are VIP
        seatType = 'VIP';
      } else if (row >= rows - 2 && cols > 12) {
        // Last 2 rows might have couple seats in wide rooms
        // Randomly assign some couple seats (about 20%)
        if (Math.random() < 0.2) {
          seatType = 'COUPLE';
        }
      }
      
      seats.push({
        seatId: `${rowLetters[row]}${col}`,
        row: rowLetters[row],
        column: col,
        type: seatType,
        status: true
      });
    }
  }
  
  return seats;
}

// Format genre for display
export const formatGenre = (genre) => {
  return genre.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Format status for display
export const formatStatus = (status) => {
  const statusMap = {
    'COMING_SOON': 'Sắp chiếu',
    'NOW_SHOWING': 'Đang chiếu',
    'ENDED': 'Đã kết thúc'
  };
  return statusMap[status] || status;
};

// Get status badge color
export const getStatusColor = (status) => {
  const colorMap = {
    'COMING_SOON': '#ff9800',
    'NOW_SHOWING': '#4caf50',
    'ENDED': '#9e9e9e'
  };
  return colorMap[status] || '#9e9e9e';
};

// Helper function to map ageRating from backend to frontend
export const mapAgeRatingFromBackend = (ageRating) => {
  const mapping = {
    'AGE_13_PLUS': '13+',
    'AGE_16_PLUS': '16+',
    'AGE_18_PLUS': '18+',
    'P': 'P',
    'K': 'K'
  };
  return mapping[ageRating] || ageRating;
};

// Helper function to map ageRating from frontend to backend
export const mapAgeRatingToBackend = (ageRating) => {
  const mapping = {
    '13+': 'AGE_13_PLUS',
    '16+': 'AGE_16_PLUS',
    '18+': 'AGE_18_PLUS',
    'P': 'P',
    'K': 'K'
  };
  return mapping[ageRating] || ageRating;
};

// Helper function to map RoomType from frontend to backend
export const mapRoomTypeToBackend = (roomType) => {
  const mapping = {
    '2D': 'TYPE_2D',
    '3D': 'TYPE_3D',
    'DELUXE': 'DELUXE'
  };
  return mapping[roomType] || roomType;
};

// Helper function to map RoomType from backend to frontend
export const mapRoomTypeFromBackend = (roomType) => {
  const mapping = {
    'TYPE_2D': '2D',
    'TYPE_3D': '3D',
    'DELUXE': 'DELUXE',
    '2D': '2D', // Fallback
    '3D': '3D'  // Fallback
  };
  return mapping[roomType] || roomType;
};

// Helper function to map formats array from backend to frontend
export const mapFormatsFromBackend = (formats) => {
  if (!formats || !Array.isArray(formats)) return [];
  return formats.map(f => mapRoomTypeFromBackend(f));
};

// Helper function to extract formats and languages from movie
export const extractFormatsAndLanguages = (movie) => {
  let formats = [];
  let languages = [];

  // Nếu movie có formats và languages trực tiếp từ backend (từ MovieResponseDTO)
  if (movie.formats || movie.languages) {
    formats = mapFormatsFromBackend(movie.formats);
    languages = movie.languages || [];
  }
  // Nếu movie có versions (fallback - từ entity trực tiếp)
  else if (movie.versions && Array.isArray(movie.versions) && movie.versions.length > 0) {
    formats = [...new Set(movie.versions.map(v => mapRoomTypeFromBackend(v.roomType)))];
    languages = [...new Set(movie.versions.map(v => v.language))];
  }

  return { formats, languages };
};

// Get seat color based on type
export const getSeatColor = (type) => {
  const colorMap = {
    'NORMAL': '#4a90e2',
    'VIP': '#ffd159',
    'COUPLE': '#e83b41'
  };
  return colorMap[type] || '#4a90e2';
};

