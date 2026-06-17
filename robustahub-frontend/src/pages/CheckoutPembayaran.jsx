import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ShippingAddress from '../components/checkout/ShippingAddress';
import OrderItems from '../components/checkout/OrderItems';
import PaymentSummary from '../components/checkout/PaymentSummary';
import briLogo from '../assets/bri.jpg';
import bniLogo from '../assets/bni.png';
import permataLogo from '../assets/permata.png';
import qrisLogo from '../assets/qris.jpg';

// ========================================================
// KOMPONEN LOGO ASLI RELEVAN (MENEMBAK LANGSUNG DARI INTERNET)
// ========================================================
const PaymentLogo = ({ id }) => {
  // Container box putih abu-abu minimalis agar seluruh logo asli memiliki ukuran simetris
  const logoWrapperClass = "w-[88px] h-[36px] bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center p-1.5 shrink-0 overflow-hidden";

  switch (id) {
    case 'BCA':
      return (
        <div className={logoWrapperClass}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg" 
            alt="Logo BCA Asli" 
            className="w-full h-full object-contain" 
            referrerPolicy="no-referrer"
          />
        </div>
      );
    case 'MANDIRI':
      return (
        <div className={logoWrapperClass}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg" 
            alt="Logo Mandiri Asli" 
            className="w-full h-full object-contain scale-110" 
            referrerPolicy="no-referrer"
          />
        </div>
      );
    case 'BRI':
  return (
    <div className={logoWrapperClass}>
      <img
        src={briLogo}
        alt="Logo BRI Asli"
        className="w-full h-full object-contain"
      />
    </div>
  );

case 'BNI':
  return (
    <div className={logoWrapperClass}>
      <img
        src={bniLogo}
        alt="Logo BNI Asli"
        className="w-full h-full object-contain p-0.5"
      />
    </div>
  );

case 'PERMATA':
  return (
    <div className={logoWrapperClass}>
      <img
        src={permataLogo}
        alt="Logo Permata Asli"
        className="w-full h-full object-contain"
      />
    </div>
  );

case 'QRIS':
  return (
    <div className={logoWrapperClass}>
      <img
        src={qrisLogo}
        alt="Logo QRIS Asli"
        className="w-full h-full object-contain scale-95"
      />
    </div>
  );
    case 'ALFAMART':
      return (
        <div className={logoWrapperClass}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/8/86/Alfamart_logo.svg" 
            alt="Logo Alfamart Asli" 
            className="w-full h-full object-contain p-0.5" 
            referrerPolicy="no-referrer"
          />
        </div>
      );
    default:
      return (
        <div className="w-[88px] h-[36px] bg-[#3A2210]/5 text-[#3A2210] rounded-xl border border-[#3A2210]/10 flex items-center justify-center font-black text-[10px] tracking-tighter shrink-0 select-none">
          ROBUSTAHUB
        </div>
      );
  }
};

const CheckoutPembayaran = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [courierType, setCourierType] = useState('dakota');
  const [paymentChannel, setPaymentChannel] = useState('ALL'); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
  
  const serviceFee = 5000;
  const shippingCost = courierType === 'indah' ? 180000 : 150000;

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (savedCart.length === 0) { navigate('/keranjang'); return; }
    setCartItems(savedCart);
  }, [navigate, token]);

  const totalProductPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const channelsList = [
    { id: 'ALL', name: 'Semua Metode Pembayaran', desc: 'Tampilkan pilihan VA, QRIS, E-Wallet, & Retail lengkap' },
    { id: 'BCA', name: 'BCA Virtual Account', desc: 'Transfer otomatis via m-BCA, KlikBCA, atau ATM BCA' },
    { id: 'MANDIRI', name: 'Mandiri Virtual Account', desc: 'Transfer via Livin\' by Mandiri, ATM, atau Mandiri MCM' },
    { id: 'BRI', name: 'BRI Virtual Account (BRIVA)', desc: 'Transfer via BRImo, ATM BRI, atau AgenBRILink' },
    { id: 'BNI', name: 'BNI Virtual Account', desc: 'Transfer via BNI Mobile Banking, ATM, atau BNI Direct' },
    { id: 'PERMATA', name: 'Permata Virtual Account', desc: 'Transfer melalui PermataMobile X atau ATM bersama' },
    { id: 'QRIS', name: 'QRIS (E-Wallet / M-Banking Scan)', desc: 'Scan barcode via OVO, DANA, GoPay, ShopeePay, LinkAja' },
    { id: 'ALFAMART', name: 'Alfamart / Alfamidi Retail', desc: 'Pembayaran tunai langsung melalui kasir gerai Alfamart' }
  ];

  const activeChannel = channelsList.find(c => c.id === paymentChannel) || channelsList[0];

  const handleProcessPayment = async () => {
    if (!user.address) {
      alert("Mohon lengkapi alamat pengiriman di profil Anda sebelum membayar.");
      return;
    }

    setIsLoading(true);
    try {
      const courierNameDisplay = 
        courierType === 'dakota' ? "Dakota Cargo" : 
        courierType === 'indah' ? "Indah Logistik" : "Kurir B2B RobustaHub";

      const orderData = {
        // 📍 AMAN DARI ERROR PRISMA: Menggunakan pertahanan ganda item.id || item.productId agar ID tidak pernah undefined
        items: cartItems.map(item => ({ productId: item.id || item.productId, quantity: item.quantity })),
        courierName: courierNameDisplay,
        shippingCost: shippingCost,
        paymentMethod: paymentChannel 
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
        window.dispatchEvent(new Event('cartUpdate'));
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
        
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-[32px] items-start">
          
          <div className="flex flex-col gap-6">
            <ShippingAddress user={user} />
            <OrderItems items={cartItems} />
            
            {/* Opsi Metode Pengiriman Cargo */}
            <section className="bg-white border border-[#EFEFEF] rounded-[16px] p-[32px]">
              <h2 className="text-[18px] font-bold m-0 mb-6 flex items-center gap-3 text-[#1A1D20] border-b border-[#EFEFEF] pb-4">
                Metode Pengiriman
              </h2>
              <div className="mt-2">
                <label className="block text-[15px] font-semibold mb-3 text-[#1A1D20]">Pilih Kurir / Kargo Grosir</label>
                <select 
                  value={courierType}
                  onChange={(e) => setCourierType(e.target.value)}
                  className="w-full p-[16px] border border-[#EFEFEF] rounded-[12px] outline-none font-sans text-[15px] focus:border-[#A86431] bg-white cursor-pointer transition-colors hover:border-[#A86431]"
                >
                  <option value="dakota">Dakota Cargo - Estimasi 3-4 Hari (Rp 150.000)</option>
                  <option value="indah">Indah Logistik - Estimasi 2-3 Hari (Rp 180.000)</option>
                  <option value="internal">Kurir B2B RobustaHub (Rp 150.000) - Estimasi 2-3 Hari</option>
                </select>
              </div>
            </section>

            {/* BOX DROPDOWN CHANNELS PEMBAYARAN BARU DENGAN LOGO ORIGINAL INTERNET */}
            <section className="bg-white border border-[#EFEFEF] rounded-[16px] p-[32px]">
              <h2 className="text-[18px] font-bold m-0 mb-6 text-[#1A1D20] border-b border-[#EFEFEF] pb-4">
                Pilih Channel Pembayaran
              </h2>
              <p className="text-[13px] text-gray-500 mb-4">Metode yang Anda pilih akan langsung membuka halaman instruksi transaksi spesifik di gerbang aman Xendit.</p>
              
              <div className="relative">
                {/* Tombol Utama Trigger Pemicu Dropdown */}
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full p-4 border border-[#E5E7EB] rounded-2xl bg-white flex items-center justify-between cursor-pointer hover:border-[#A86431] focus:border-[#A86431] transition-all shadow-sm select-none"
                >
                  <div className="flex items-center gap-4">
                    <PaymentLogo id={activeChannel.id} />
                    <div className="text-left">
                      <div className="font-bold text-[15px] text-[#1A1D20]">{activeChannel.name}</div>
                      <div className="text-[12px] text-gray-400 hidden sm:block mt-0.5">{activeChannel.desc}</div>
                    </div>
                  </div>
                  <svg 
                    width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"
                    className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>

                {/* Panel Menu List Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl max-h-[350px] overflow-y-auto z-50 p-2 flex flex-col gap-1.5">
                    {channelsList.map((channel) => (
                      <div
                        key={channel.id}
                        onClick={() => {
                          setPaymentChannel(channel.id);
                          setIsDropdownOpen(false); 
                        }}
                        className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${paymentChannel === channel.id ? 'bg-[#FDF9F5] border border-[#A86431]/30' : 'hover:bg-[#F8F9FA] border border-transparent'}`}
                      >
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center shrink-0">
                          {paymentChannel === channel.id && <div className="w-2 h-2 rounded-full bg-[#A86431]"></div>}
                        </div>
                        <PaymentLogo id={channel.id} />
                        <div className="min-w-0 text-left">
                          <div className="font-bold text-[14px] text-[#1A1D20] truncate">{channel.name}</div>
                          <div className="text-[12px] text-gray-400 truncate hidden sm:block mt-0.5">{channel.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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