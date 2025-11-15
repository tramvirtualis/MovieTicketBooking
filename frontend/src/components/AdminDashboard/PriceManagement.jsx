import React, { useState, useEffect, useMemo } from 'react';
import { useEnums } from '../../hooks/useEnums';
import { enumService } from '../../services/enumService';

// Price Management Component
function PriceManagement({ prices: initialPricesList, onPricesChange }) {
  const { enums } = useEnums();
  const [prices, setPrices] = useState(initialPricesList || []);
  
  // Map room types from backend (TYPE_2D) to display format (2D)
  const roomTypes = enums.roomTypes?.map(rt => enumService.mapRoomTypeToDisplay(rt)) || [];
  const seatTypes = enums.seatTypes || [];

  // Build an in-memory matrix for easy inline editing: key `${roomType}-${seatType}` -> price
  const matrix = useMemo(() => {
    const map = new Map();
    (prices || []).forEach(p => {
      if (p && p.roomType && p.seatType) {
        map.set(`${p.roomType}-${p.seatType}`, Number(p.price) || 0);
      }
    });
    return map;
  }, [prices]);

  const [draft, setDraft] = useState(() => {
    const obj = {};
    // Initialize all combinations with 0 if not in prices
    roomTypes.forEach(rt => {
      seatTypes.forEach(st => {
        const existing = (prices || []).find(p => p && p.roomType === rt && p.seatType === st);
        obj[`${rt}-${st}`] = existing ? Number(existing.price) || 0 : 0;
      });
    });
    return obj;
  });

  useEffect(() => {
    if (onPricesChange) onPricesChange(prices);
  }, [prices, onPricesChange]);

  useEffect(() => {
    // Sync draft when prices change externally - initialize all combinations
    const obj = {};
    roomTypes.forEach(rt => {
      seatTypes.forEach(st => {
        const existing = (prices || []).find(p => p && p.roomType === rt && p.seatType === st);
        obj[`${rt}-${st}`] = existing ? Number(existing.price) || 0 : 0;
      });
    });
    setDraft(obj);
  }, [prices]);

  const getPrice = (roomType, seatType) =>
    draft[`${roomType}-${seatType}`] ?? matrix.get(`${roomType}-${seatType}`) ?? 0;

  const setPrice = (roomType, seatType, value) => {
    setDraft(prev => ({
      ...prev,
      [`${roomType}-${seatType}`]: value
    }));
  };

  const applyQuickFillRow = (seatType, value) => {
    const num = Number(value) || 0;
    const next = { ...draft };
    roomTypes.forEach(rt => { next[`${rt}-${seatType}`] = num; });
    setDraft(next);
  };

  const applyQuickFillCol = (roomType, value) => {
    const num = Number(value) || 0;
    const next = { ...draft };
    seatTypes.forEach(st => { next[`${roomType}-${st}`] = num; });
    setDraft(next);
  };

  const handleReset = () => {
    const obj = {};
    (prices || []).forEach(p => { obj[`${p.roomType}-${p.seatType}`] = Number(p.price); });
    setDraft(obj);
  };

  const handleSaveAll = () => {
    // Convert draft matrix -> normalized array (unique pairs)
    const items = [];
    roomTypes.forEach(rt => {
      seatTypes.forEach(st => {
        const price = Number(getPrice(rt, st) || 0);
        if (price >= 0) {
          const exist = prices.find(p => p.roomType === rt && p.seatType === st);
          if (exist) {
            items.push({ ...exist, price });
          } else {
            items.push({
              id: Math.max(0, ...prices.map(p => p.id)) + items.length + 1,
              roomType: rt,
              seatType: st,
              price
            });
          }
        }
      });
    });
    setPrices(items);
  };

  const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <h2 className="admin-card__title">Bảng giá</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn--ghost" onClick={handleReset}>Hoàn tác</button>
          <button className="btn btn--primary" onClick={handleSaveAll}>
            Lưu bảng giá
          </button>
        </div>
      </div>
      <div className="admin-card__content">
        <div className="admin-table" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                  Loại ghế / Loại phòng
                </th>
                {roomTypes.map(rt => (
                  <th key={rt} style={{ padding: '16px', textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                    {rt}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {seatTypes.map(st => (
                <tr key={st}>
                  <td style={{ padding: '16px', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {st}
                  </td>
                  {roomTypes.map(rt => {
                    const val = getPrice(rt, st);
                    return (
                      <td key={`${rt}-${st}`} style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <input
                          type="number"
                          min="0"
                          value={val}
                          onChange={(e)=>setPrice(rt, st, Number(e.target.value))}
                          style={{
                            width: '120px',
                            padding: '10px',
                            background: 'rgba(20, 15, 16, 0.8)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '14px',
                            textAlign: 'center'
                          }}
                        />
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#ffd159' }}>
                          {formatCurrency(val || 0)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PriceManagement;
