import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // State baru untuk mengatur visibilitas password
  const [showPassword, setShowPassword] = useState(false); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      // Menembak API Backend Express.js
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password 
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // 1. Simpan Token JWT ke Browser
        localStorage.setItem('token', result.token);
        
        // 2. Simpan Data User (Nama, Email, Role) ke Browser
        localStorage.setItem('user', JSON.stringify(result.data));

        // ======================================================
        // 3. LOGIKA REDIRECT BERDASARKAN ROLE (PETANI vs PEMBELI)
        // ======================================================
        if (result.data.role === 'PETANI') {
          // Petani langsung dilempar ke Dashboard
          navigate('/dashboard'); 
        } else {
          // Coffee Shop (pembeli) dilempar ke Katalog
          navigate('/katalog'); 
        }
        
      } else {
        // Menampilkan pesan error dari backend
        alert(`Login Gagal: ${result.message}`);
      }
    } catch (error) {
      console.error("Error fetching:", error);
      alert('Tidak dapat terhubung ke server backend. Pastikan server menyala!');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FAF7F2]">
      
      {/* Sisi Kiri - Gambar Visual */}
      <div 
        className="hidden md:flex flex-[1.2] flex-col justify-end p-14 lg:p-16 text-white relative bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=1000&q=80')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#4A2B13]/40 to-[#4A2B13]/80"></div>
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
      <div className="flex-1 flex items-center justify-center p-6 md:p-8 lg:p-12 md:bg-white min-h-screen md:min-h-0 pt-[60px] md:pt-8">
        
        <div className="w-full max-w-[400px] bg-white p-8 md:p-0 rounded-2xl md:rounded-none shadow-[0_4px_20px_rgba(0,0,0,0.05)] md:shadow-none">
          
          <div className="text-center md:text-left mb-8">
            <h1 className="text-[28px] md:text-[24px] font-bold text-[#4A2B13]">
              RobustaHub
            </h1>
          </div>
          
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
            
            {/* Input Password dengan Tombol Mata */}
            <div>
              <label className="block text-[14px] font-semibold text-[#2D2D2D] mb-2">
                Password
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-[14px] pr-12 border border-[#E2D9CC] rounded-lg text-[15px] outline-none transition-all duration-200 focus:border-[#804A23] focus:shadow-[0_0_0_3px_rgba(128,74,35,0.1)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#804A23] transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

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

            <button 
              type="submit" 
              className="w-full py-[14px] bg-[#804A23] hover:bg-[#4A2B13] text-white rounded-lg text-[16px] font-semibold transition-colors mb-6"
            >
              Masuk ke Dashboard
            </button>

            <div className="text-center text-[14px] text-[#717171]">
              Belum punya akun?{' '}
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