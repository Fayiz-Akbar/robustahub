import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ShippingAddress from '../components/checkout/ShippingAddress';
import OrderItems from '../components/checkout/OrderItems';
import PaymentSummary from '../components/checkout/PaymentSummary';

const CheckoutPembayaran = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const shippingCost = 150000; 
  const serviceFee = 5000;

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (savedCart.length === 0) { navigate('/keranjang'); }
    setCartItems(savedCart);
  }, [navigate, token]);

  const totalProductPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleProcessPayment = async () => {
    if (!user.address) {
      alert("Mohon lengkapi alamat pengiriman di profil Anda sebelum membayar.");
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({ productId: item.productId, quantity: item.quantity })),
        courierName: "Kurir B2B RobustaHub",
        shippingCost: shippingCost
      };

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (response.ok && result.paymentUrl) {
        localStorage.removeItem('cart'); 
        window.dispatchEvent(new Event('cartUpdated'));
        window.location.href = result.paymentUrl; 
      } else {
        alert(result.message || 'Gagal terhubung ke Xendit');
      }
    } catch (error) {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-[#1A1D20]">
      <Navbar />
      
      <main className="max-w-[1200px] mx-auto px-[5%] py-10">
        <Link to="/keranjang" className="inline-flex items-center gap-2 text-[#6C757D] font-medium text-[15px] mb-6 hover:text-[#A86431] transition-colors no-underline">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Kembali ke Keranjang
        </Link>

        <h1 className="text-[28px] font-bold text-[#1A1D20] mb-8 m-0">Pengiriman & Pembayaran</h1>
        
        {/* LAYOUT GRID DIPERBAIKI SESUAI HTML: 2fr 1fr dengan gap 32px */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-[32px] items-start">
          
          <div className="flex flex-col gap-6">
            <ShippingAddress user={user} />
            <OrderItems items={cartItems} />
            
            {/* Metode Pengiriman */}
            <section className="bg-white border border-[#EFEFEF] rounded-[16px] p-[32px]">
              <h2 className="text-[18px] font-bold m-0 mb-6 flex items-center gap-3 text-[#1A1D20] border-b border-[#EFEFEF] pb-4">
                Metode Pengiriman
              </h2>
              <div className="mt-2">
                <label className="block text-[15px] font-semibold mb-3 text-[#1A1D20]">Pilih Kurir / Kargo Grosir</label>
                <select className="w-full p-[16px] border border-[#EFEFEF] rounded-[12px] outline-none font-sans text-[15px] focus:border-[#A86431] bg-white cursor-pointer transition-colors hover:border-[#A86431]">
                  <option value="dakota">Dakota Cargo - Estimasi 3-4 Hari (Rp 150.000)</option>
                  <option value="indah">Indah Logistik - Estimasi 2-3 Hari (Rp 180.000)</option>
                  <option value="internal">Kurir B2B RobustaHub (Rp 150.000) - Estimasi 2-3 Hari</option>
                </select>
              </div>
            </section>

            {/* Kotak Metode Pembayaran */}
            <section className="bg-white border border-[#EFEFEF] rounded-[16px] p-[32px]">
              <h2 className="text-[18px] font-bold m-0 mb-6 flex items-center gap-3 text-[#1A1D20] border-b border-[#EFEFEF] pb-4">
                Metode Pembayaran
              </h2>
              <div className="flex items-center gap-4 p-4 border border-[#EFEFEF] bg-white rounded-lg">
                <div className="w-12 h-12 bg-[#F8F9FA] rounded-lg flex items-center justify-center text-[#A86431] shrink-0 border border-[#EFEFEF]">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[15px] mb-1 text-[#1A1D20]">Xendit Payment Gateway</div>
                  <div className="text-[13px] text-[#6C757D]">Transfer Bank (VA), E-Wallet, QRIS, Retail</div>
                </div>
                <div className="text-[#10B981]">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
              </div>
            </section>

          </div>
          
          <div className="sidebar-column">
            <PaymentSummary 
              totalProductPrice={totalProductPrice}
              shippingCost={shippingCost}
              serviceFee={serviceFee}
              onPay={handleProcessPayment}
              isLoading={isLoading}
              isAddressComplete={true} 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPembayaran;