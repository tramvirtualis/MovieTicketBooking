import React, { useState } from 'react';

export default function VoucherAssignModal({ user, vouchers, onClose, onSave }) {
  const [newSelectedIds, setNewSelectedIds] = useState([]);

  const privateVouchers = vouchers?.filter(v => v.isPublic === false) || [];
  const alreadyAssignedIds = vouchers?.filter(v => v.isPublic === false && v.assignedUserIds?.includes(user.userId)).map(v => v.voucherId) || [];

  const handleToggle = (voucherId) => {
    // Cannot uncheck already assigned vouchers
    if (alreadyAssignedIds.includes(voucherId)) {
      return;
    }
    setNewSelectedIds(prev => {
      if (prev.includes(voucherId)) {
        return prev.filter(id => id !== voucherId);
      } else {
        return [...prev, voucherId];
      }
    });
  };

  const handleSave = () => {
    const updatedVouchers = vouchers.map(v => {
      if (!v.isPublic) {
        const currentIds = v.assignedUserIds || [];
        const isAlreadyAssigned = alreadyAssignedIds.includes(v.voucherId);
        const isNewlySelected = newSelectedIds.includes(v.voucherId);
        
        if (isAlreadyAssigned) {
          // Keep already assigned vouchers
          return v;
        } else if (isNewlySelected) {
          // Add newly selected vouchers
          return { ...v, assignedUserIds: [...currentIds, user.userId] };
        } else {
          // Remove if it was previously selected but not saved yet (shouldn't happen, but just in case)
          return { ...v, assignedUserIds: currentIds.filter(id => id !== user.userId) };
        }
      }
      return v;
    });
    onSave(updatedVouchers);
  };

  return (
    <div className="movie-modal-overlay" onClick={onClose}>
      <div className="movie-modal" onClick={(e) => e.stopPropagation()}>
        <div className="movie-modal__header">
          <h2>Gán voucher riêng tư cho {user.username}</h2>
          <button className="movie-modal__close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="movie-modal__content">
          {privateVouchers.length > 0 ? (
            <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: 12, background: 'rgba(20, 15, 16, 0.5)' }}>
              {privateVouchers.map(voucher => {
                const isAlreadyAssigned = alreadyAssignedIds.includes(voucher.voucherId);
                const isSelected = isAlreadyAssigned || newSelectedIds.includes(voucher.voucherId);
                return (
                  <label 
                    key={voucher.voucherId} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 12, 
                      padding: '12px 0', 
                      cursor: isAlreadyAssigned ? 'not-allowed' : 'pointer',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      opacity: isAlreadyAssigned ? 0.7 : 1
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isAlreadyAssigned}
                      onChange={() => handleToggle(voucher.voucherId)}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {voucher.name}
                        {isAlreadyAssigned && (
                          <span style={{ fontSize: '10px', padding: '2px 6px', background: '#4caf50', borderRadius: 4, color: '#fff' }}>
                            Đã gán
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                        Mã: {voucher.code} • {voucher.discountType === 'PERCENT' ? `Giảm ${voucher.discountValue}%` : `Giảm ${new Intl.NumberFormat('vi-VN').format(voucher.discountValue)}đ`}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.5)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 16, opacity: 0.5 }}>
                <path d="M20 7h-4V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                <path d="M12 12v6M9 15h6"/>
              </svg>
              <p>Chưa có voucher riêng tư nào</p>
            </div>
          )}
        </div>
        <div className="movie-modal__footer">
          <button className="btn btn--ghost" onClick={onClose}>Hủy</button>
          <button className="btn btn--primary" onClick={handleSave} disabled={newSelectedIds.length === 0}>
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}


