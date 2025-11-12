import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

const cinemas = [
  { id: '1', name: 'Quốc Thanh', province: 'TP.HCM' },
  { id: '2', name: 'Hai Bà Trưng', province: 'TP.HCM' },
  { id: '3', name: 'Sinh Viên', province: 'TP.HCM' },
  { id: '4', name: 'Satra Quận 6', province: 'TP.HCM' },
  { id: '5', name: 'Huế', province: 'TP. Huế' },
  { id: '6', name: 'Đà Lạt', province: 'Lâm Đồng' },
  { id: '7', name: 'Mỹ Tho', province: 'Đồng Tháp' },
  { id: '8', name: 'Lâm Đồng', province: 'Đức Trọng' },
  { id: '9', name: 'Kiên Giang', province: 'An Giang' },
];

// Sample food and drinks data
const menuData = {
  '1': {
    foods: [
      {
        id: 'f1',
        name: 'Bắp rang bơ',
        description: 'Bắp rang bơ thơm ngon, giòn tan',
        price: 45000,
        image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&h=300&fit=crop',
        category: 'Đồ ăn'
      },
      {
        id: 'f2',
        name: 'Hotdog',
        description: 'Xúc xích thơm ngon với sốt đặc biệt',
        price: 55000,
        image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop',
        category: 'Đồ ăn'
      },
      {
        id: 'f3',
        name: 'Khoai tây chiên',
        description: 'Khoai tây chiên giòn, nóng hổi',
        price: 40000,
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop',
        category: 'Đồ ăn'
      },
      {
        id: 'f4',
        name: 'Gà rán',
        description: 'Gà rán giòn, thơm ngon',
        price: 75000,
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop',
        category: 'Đồ ăn'
      }
    ],
    drinks: [
      {
        id: 'd1',
        name: 'Coca Cola',
        description: 'Nước ngọt có ga',
        price: 30000,
        image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop',
        category: 'Nước uống'
      },
      {
        id: 'd2',
        name: 'Pepsi',
        description: 'Nước ngọt có ga',
        price: 30000,
        image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop',
        category: 'Nước uống'
      },
      {
        id: 'd3',
        name: 'Nước suối',
        description: 'Nước suối tinh khiết',
        price: 20000,
        image: 'https://images.unsplash.com/photo-1548839140-5a9415c45c59?w=400&h=300&fit=crop',
        category: 'Nước uống'
      },
      {
        id: 'd4',
        name: 'Trà sữa',
        description: 'Trà sữa thơm ngon, đậm đà',
        price: 50000,
        image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=300&fit=crop',
        category: 'Nước uống'
      }
    ],
    combos: [
      {
        id: 'c1',
        name: 'Combo 1: Bắp + Nước',
        description: '1 Bắp rang bơ + 1 Nước ngọt',
        price: 65000,
        image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&h=300&fit=crop',
        category: 'Combo',
        originalPrice: 75000
      },
      {
        id: 'c2',
        name: 'Combo 2: Hotdog + Nước',
        description: '1 Hotdog + 1 Nước ngọt',
        price: 75000,
        image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop',
        category: 'Combo',
        originalPrice: 85000
      },
      {
        id: 'c3',
        name: 'Combo 3: Gà rán + Khoai tây + Nước',
        description: '1 Gà rán + 1 Khoai tây chiên + 1 Nước ngọt',
        price: 120000,
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop',
        category: 'Combo',
        originalPrice: 145000
      }
    ]
  }
};

// Default menu for other cinemas (same structure)
Object.keys(cinemas).forEach((key, index) => {
  const cinemaId = String(index + 1);
  if (!menuData[cinemaId]) {
    menuData[cinemaId] = menuData['1']; // Use same menu for all cinemas
  }
});

export default function FoodAndDrinks() {
  const [selectedCinema, setSelectedCinema] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getMenuItems = () => {
    if (!selectedCinema || !menuData[selectedCinema]) return [];
    
    const menu = menuData[selectedCinema];
    // Normal ordering (without ticket) - show all items with regular prices
    return [...menu.foods, ...menu.drinks, ...menu.combos];
  };

  const menuItems = getMenuItems();

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    setShowCart(true);
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== itemId));
    } else {
      setCart(cart.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    // Save cart to localStorage and navigate to checkout
    const cartData = {
      items: cart,
      cinema: cinemas.find(c => c.id === selectedCinema),
      totalAmount: getTotalAmount()
    };
    localStorage.setItem('checkoutCart', JSON.stringify(cartData));
    // Keep pendingBooking in localStorage for checkout page
    window.location.href = '#checkout';
  };

  return (
    <div className="min-h-screen cinema-mood">
      <Header />

      <main className="main">
        <section className="section">
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ffd159' }}>
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
                <path d="M7 2v20"/>
                <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3v0"/>
                <path d="M21 15v7"/>
                <path d="M3 15v7"/>
              </svg>
              <h1 className="section__title" style={{ fontSize: 'clamp(28px, 4vw, 36px)', margin: 0, fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                Đồ ăn nước uống
              </h1>
            </div>

            {/* Cinema Selection */}
            <div className="food-cinema-selector" style={{ marginBottom: '32px' }}>
              <label htmlFor="cinema-select" style={{ 
                display: 'block', 
                marginBottom: '12px', 
                fontSize: '16px', 
                fontWeight: 600, 
                color: '#fff' 
              }}>
                Chọn rạp
              </label>
              <select
                id="cinema-select"
                value={selectedCinema}
                onChange={(e) => setSelectedCinema(e.target.value)}
                className="food-cinema-select"
              >
                <option value="">-- Chọn rạp --</option>
                {cinemas.map((cinema) => (
                  <option key={cinema.id} value={cinema.id}>
                    Cinestar {cinema.name} ({cinema.province})
                  </option>
                ))}
              </select>
            </div>

            {/* Menu Display */}
            {selectedCinema && (
              <>
                {/* Menu Items Grid */}
                {menuItems.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 20px',
                    color: '#c9c4c5'
                  }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 20px', opacity: 0.5 }}>
                      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
                      <path d="M7 2v20"/>
                      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3v0"/>
                    </svg>
                    <p style={{ fontSize: '16px', margin: 0 }}>Không có món nào trong mục này</p>
                  </div>
                ) : (
                  <div className="food-menu-grid">
                    {menuItems.map((item) => (
                      <div key={item.id} className="food-item-card">
                        <div className="food-item-card__image">
                          <img src={item.image} alt={item.name} />
                          {item.category === 'Combo' && item.originalPrice && (
                            <div className="food-item-card__badge">
                              <span className="food-item-card__badge-text">Tiết kiệm</span>
                            </div>
                          )}
                        </div>
                        <div className="food-item-card__content">
                          <div className="food-item-card__category">{item.category}</div>
                          <h3 className="food-item-card__title">{item.name}</h3>
                          <p className="food-item-card__description">{item.description}</p>
                          <div className="food-item-card__footer">
                            {item.originalPrice && (
                              <div className="food-item-card__price-old">
                                {formatPrice(item.originalPrice)}
                              </div>
                            )}
                            <div className="food-item-card__price">
                              {formatPrice(item.price)}
                            </div>
                            <button 
                              className="food-item-card__add-btn"
                              title="Thêm vào giỏ"
                              aria-label="Thêm vào giỏ"
                              onClick={() => addToCart(item)}
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1"/>
                                <circle cx="20" cy="21" r="1"/>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Empty State - No Cinema Selected */}
            {!selectedCinema && (
              <div style={{ 
                textAlign: 'center', 
                padding: '80px 20px',
                color: '#c9c4c5'
              }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 24px', opacity: 0.4 }}>
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
                  <path d="M7 2v20"/>
                  <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3v0"/>
                  <path d="M21 15v7"/>
                  <path d="M3 15v7"/>
                </svg>
                <p style={{ fontSize: '18px', margin: 0, fontWeight: 500 }}>Vui lòng chọn rạp để xem menu</p>
                <p style={{ fontSize: '14px', margin: '8px 0 0', opacity: 0.7 }}>Chọn rạp ở trên để xem các món ăn và thức uống có sẵn</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Cart Modal */}
      {showCart && (
        <div className="food-cart-overlay" onClick={() => setShowCart(false)}>
          <div className="food-cart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="food-cart-modal__header">
              <h2>Giỏ hàng</h2>
              <button className="food-cart-modal__close" onClick={() => setShowCart(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="food-cart-modal__content">
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#c9c4c5' }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 20px', opacity: 0.5 }}>
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  <p style={{ fontSize: '16px', margin: 0 }}>Giỏ hàng trống</p>
                </div>
              ) : (
                <>
                  <div className="food-cart-items">
                    {cart.map((item) => (
                      <div key={item.id} className="food-cart-item">
                        <div className="food-cart-item__image">
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className="food-cart-item__content">
                          <h3 className="food-cart-item__title">{item.name}</h3>
                          <div className="food-cart-item__price">{formatPrice(item.price)}</div>
                        </div>
                        <div className="food-cart-item__quantity">
                          <button 
                            className="food-cart-item__qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="food-cart-item__qty-input"
                          />
                          <button 
                            className="food-cart-item__qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <div className="food-cart-item__total">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        <button 
                          className="food-cart-item__remove"
                          onClick={() => removeFromCart(item.id)}
                          title="Xóa"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="food-cart-modal__footer">
                    <div className="food-cart-modal__total">
                      <span>Tổng cộng:</span>
                      <span className="food-cart-modal__total-amount">{formatPrice(getTotalAmount())}</span>
                    </div>
                    <button className="btn btn--primary food-cart-checkout-btn" onClick={handleCheckout}>
                      Đặt hàng
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

