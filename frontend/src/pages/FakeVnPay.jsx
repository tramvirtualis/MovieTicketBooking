import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import paymentService from '../services/paymentService.js';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function FakeVnPay() {
  const query = useQuery();
  const navigate = useNavigate();

  const txnRef = query.get('txnRef');
  const amount = Number(query.get('amount') || 0);

  const [submitting, setSubmitting] = useState(false);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

  const handleResult = async (success) => {
    if (!txnRef) {
      navigate('/checkout');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        txnRef,
        success,
        bankCode: 'FAKEBANK',
      };
      const result = await paymentService.confirmFakePayment(payload);
      if (!result.success) {
        alert(result.message || 'Không thể cập nhật trạng thái thanh toán.');
        return;
      }

      // Điều hướng về trang kết quả (tái sử dụng VnPayReturn)
      navigate(`/payment/vnpay-return?txnRef=${encodeURIComponent(txnRef)}`);
    } catch (err) {
      console.error('Error confirming fake payment:', err);
      alert(err.message || 'Không thể cập nhật trạng thái thanh toán.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen cinema-mood">
      <Header />

      <main className="main">
        <section className="section">
          <div className="container max-w-xl mx-auto px-4 py-12">
            <div className="bg-gradient-to-br from-[#2d2627] to-[#1a1415] border border-[#4a3f41] rounded-xl p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#e83b41] flex items-center justify-center">
                    <span className="text-white font-bold">V</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm text-[#c9c4c5] uppercase tracking-wide">Cổng thanh toán</div>
                    <div className="text-lg font-extrabold text-white">CinePay (Fake VNPay)</div>
                  </div>
                </div>
                <h1 className="text-2xl font-extrabold text-white">Thanh toán đơn hàng</h1>
              </div>

              <div className="space-y-3 text-sm text-[#c9c4c5] mb-6">
                <div className="flex justify-between">
                  <span>Mã giao dịch</span>
                  <span className="font-semibold text-white">{txnRef || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Số tiền</span>
                  <span className="font-semibold text-[#ffd159] text-lg">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Ngân hàng</span>
                  <span className="font-semibold text-white">FAKEBANK</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  disabled={submitting}
                  onClick={() => handleResult(true)}
                  className="w-full bg-gradient-to-r from-[#4caf50] to-[#66bb6a] hover:from-[#66bb6a] hover:to-[#81c784] text-white font-bold py-3 px-6 rounded-lg disabled:opacity-60"
                >
                  Xác nhận thanh toán thành công
                </button>
                <button
                  disabled={submitting}
                  onClick={() => handleResult(false)}
                  className="w-full bg-[#1a1415] border border-[#4a3f41] text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-60"
                >
                  Hủy giao dịch
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


