import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Login dicoba dengan:", email, password);
    // TODO: Nanti sambungkan dengan API Backend
    // Simulasi sukses login, arahkan ke katalog
    navigate('/katalog'); 
  };

  return (
    // split-layout: flexbox, responsif kolom (HP) dan baris (Desktop)
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FAF7F2]">
      
      {/* Sisi Kiri - Gambar Visual (Sembunyi di Mobile, Muncul di md ke atas) */}
      <div 
        className="hidden md:flex flex-[1.2] flex-col justify-end p-14 lg:p-16 text-white relative bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=1000&q=80')" }}
      >
        {/* Overlay Gelap (Sesuai rgba di CSS kamu) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#4A2B13]/40 to-[#4A2B13]/80"></div>
        
        {/* Konten Teks di atas overlay */}
        <div className="relative z-10">
          <h2 className="text-[40px] font-bold mb-4 leading-tight">
            Hubungkan Bisnis Kopimu
          </h2>
          <p className="text-[#E2D9CC] text-[18px] max-w-[90%] leading-relaxed">
            Platform B2B terpercaya untuk transaksi biji kopi langsung dari kebun hingga ke mesin espresso Anda.
          </p>
        </div>
      </div>

      {/* Sisi Kanan - Formulir */}
      {/* Background krem di HP, putih di Desktop */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-8 lg:p-12 md:bg-white min-h-screen md:min-h-0 pt-[60px] md:pt-8">
        
        {/* Container Form */}
        {/* Di HP punya background putih + shadow + border-radius. Di desktop menyatu dengan background */}
        <div className="w-full max-w-[400px] bg-white p-8 md:p-0 rounded-2xl md:rounded-none shadow-[0_4px_20px_rgba(0,0,0,0.05)] md:shadow-none">
          
          {/* Logo */}
          <div className="text-center md:text-left mb-8">
            <h1 className="text-[28px] md:text-[24px] font-bold text-[#4A2B13]">
              RobustaHub
            </h1>
          </div>
          
          {/* Judul & Subjudul */}
          <h1 className="text-[28px] font-bold text-[#2D2D2D] mb-2">Selamat Datang</h1>
          <p className="text-[15px] text-[#717171] mb-8 leading-[1.5]">
            Silakan masukkan email dan password Anda untuk masuk.
          </p>

          <form onSubmit={handleLogin} className="space-y-[20px]">
            {/* Input Email */}
            <div>
              <label className="block text-[14px] font-semibold text-[#2D2D2D] mb-2">
                Email Address
              </label>
              <input 
                type="email" 
                required
                placeholder="contoh@coffeeshop.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-[14px] border border-[#E2D9CC] rounded-lg text-[15px] outline-none transition-all duration-200 focus:border-[#804A23] focus:shadow-[0_0_0_3px_rgba(128,74,35,0.1)]"
              />
            </div>
            
            {/* Input Password */}
            <div>
              <label className="block text-[14px] font-semibold text-[#2D2D2D] mb-2">
                Password
              </label>
              <input 
                type="password" 
                required
                placeholder="Masukkan password Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-[14px] border border-[#E2D9CC] rounded-lg text-[15px] outline-none transition-all duration-200 focus:border-[#804A23] focus:shadow-[0_0_0_3px_rgba(128,74,35,0.1)]"
              />
            </div>

            {/* Opsi Ingat Saya & Lupa Password */}
            <div className="flex justify-between items-center text-[14px] mb-8">
              <label className="flex items-center gap-2 text-[#717171] cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-[#804A23] focus:ring-[#804A23]" 
                /> 
                Ingat Saya
              </label>
              <a href="#" className="text-[#804A23] font-semibold hover:underline">
                Lupa Password?
              </a>
            </div>

            {/* Tombol Submit */}
            <button 
              type="submit" 
              className="w-full py-[14px] bg-[#804A23] hover:bg-[#4A2B13] text-white rounded-lg text-[16px] font-semibold transition-colors mb-6"
            >
              Masuk ke Dashboard
            </button>

            {/* Link Register */}
            <div className="text-center text-[14px] text-[#717171]">
              Belum punya akun?{' '}
              {/* Kita gunakan tag <Link> dari react-router-dom agar transisi halamannya instan tanpa loading */}
              <Link to="/register" className="text-[#804A23] font-semibold hover:underline">
                Daftar Sekarang
              </Link>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
};

export default Login;