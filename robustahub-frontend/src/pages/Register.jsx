import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [role, setRole] = useState('');
  const [passwordError, setPasswordError] = useState(''); 
  const navigate = useNavigate();

  // Fungsi untuk mengecek kekuatan password
  const validatePassword = (pass) => {
    if (pass.length < 8) return "Password harus memiliki minimal 8 karakter.";
    if (!/[A-Z]/.test(pass)) return "Password harus mengandung minimal 1 huruf besar.";
    if (!/[a-z]/.test(pass)) return "Password harus mengandung minimal 1 huruf kecil.";
    if (!/\d/.test(pass)) return "Password harus mengandung minimal 1 angka.";
    return ""; // Jika kosong, berarti password aman
  };

  const handleRegister = (e) => {
    e.preventDefault();
    
    // Cek password sebelum memproses form
    const errorMsg = validatePassword(password);
    if (errorMsg) {
      setPasswordError(errorMsg); // Tampilkan pesan error di UI
      return; // Hentikan proses pendaftaran
    }

    setPasswordError(''); // Bersihkan error jika password sudah aman

    console.log("Mencoba mendaftar dengan:", { name, email, password, role });
    // TODO: Nanti sambungkan ke endpoint POST /api/auth/register di backend
    
    // Simulasi sukses register, arahkan ke halaman login
    navigate('/'); 
  };

  return (
    <div className="flex flex-col-reverse md:flex-row min-h-screen bg-[#FAF7F2]">
      
      {/* Sisi Kiri - Formulir */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-8 lg:p-12 md:bg-white min-h-screen md:min-h-0 pt-[40px] overflow-y-auto">
        <div className="w-full max-w-[420px] my-[40px] bg-white p-8 md:p-0 rounded-[16px] md:rounded-none shadow-[0_4px_20px_rgba(0,0,0,0.05)] md:shadow-none mx-auto">
          
          <div className="text-center md:text-left mb-6">
            <h1 className="text-[28px] md:text-[24px] font-bold text-[#4A2B13]">
              RobustaHub
            </h1>
          </div>
          
          <h1 className="text-[28px] font-bold text-[#2D2D2D] mb-2">Buat Akun Baru</h1>
          <p className="text-[15px] text-[#717171] mb-6 leading-[1.5]">
            Mulai perjalanan bisnis kopi Anda bersama kami.
          </p>

          <form onSubmit={handleRegister} className="space-y-[16px]">
            <div>
              <label className="block text-[14px] font-semibold text-[#2D2D2D] mb-2">
                Nama Lengkap / Nama Bisnis
              </label>
              <input 
                type="text" 
                required
                placeholder="Masukkan nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-[14px] border border-[#E2D9CC] rounded-lg text-[15px] outline-none transition-all duration-200 focus:border-[#804A23] focus:shadow-[0_0_0_3px_rgba(128,74,35,0.1)] bg-white"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-[#2D2D2D] mb-2">
                Email Address
              </label>
              <input 
                type="email" 
                required
                placeholder="contoh@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-[14px] border border-[#E2D9CC] rounded-lg text-[15px] outline-none transition-all duration-200 focus:border-[#804A23] focus:shadow-[0_0_0_3px_rgba(128,74,35,0.1)] bg-white"
              />
            </div>
            
            {/* Bagian Input Password yang Diperbarui */}
            <div>
              <label className="block text-[14px] font-semibold text-[#2D2D2D] mb-2">
                Password
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="Minimal 8 karakter (Huruf besar & angka)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if(passwordError) setPasswordError(''); // Hilangkan teks merah saat user mulai ngetik ulang
                  }}
                  // Jika error, border input berubah jadi merah
                  className={`w-full px-4 py-[14px] pr-12 border rounded-lg text-[15px] outline-none transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(128,74,35,0.1)] bg-white ${
                    passwordError ? 'border-red-500 focus:border-red-500' : 'border-[#E2D9CC] focus:border-[#804A23]'
                  }`}
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
              {/* Pesan Error Muncul di Sini */}
              {passwordError && (
                <p className="text-red-500 text-[13px] mt-2 font-medium">
                  {passwordError}
                </p>
              )}
              
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-[#2D2D2D] mb-2">
                Daftar Sebagai (Role)
              </label>
              <select 
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-[14px] border border-[#E2D9CC] rounded-lg text-[15px] outline-none transition-all duration-200 focus:border-[#804A23] focus:shadow-[0_0_0_3px_rgba(128,74,35,0.1)] bg-white appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23717171%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px top 50%',
                  backgroundSize: '12px auto'
                }}
              >
                <option value="" disabled>Pilih jenis akun...</option>
                <option value="PETANI"> Petani Kopi</option>
                <option value="COFFEE_SHOP"> Pemilik Coffee Shop</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="w-full py-[14px] mt-2 mb-6 bg-[#804A23] hover:bg-[#4A2B13] text-white rounded-lg text-[16px] font-semibold transition-colors"
            >
              Daftar Sekarang
            </button>

            <div className="text-center text-[14px] text-[#717171]">
              Sudah punya akun?{' '}
              <Link to="/" className="text-[#804A23] font-semibold hover:underline">
                Masuk di sini
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Sisi Kanan - Gambar Visual */}
      <div 
        className="hidden md:flex flex-[1.2] flex-col justify-end p-14 lg:p-[60px] text-white relative bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?auto=format&fit=crop&w=1000&q=80')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#4A2B13]/30 to-[#4A2B13]/80"></div>
        <div className="relative z-10">
          <h2 className="text-[40px] font-bold mb-4 leading-tight">
            Dari Kebun ke Cangkir
          </h2>
          <p className="text-[#E2D9CC] text-[18px] max-w-[90%] leading-relaxed">
            Bergabunglah dengan komunitas petani dan pemilik coffee shop untuk menciptakan ekosistem kopi yang lebih baik.
          </p>
        </div>
      </div>

    </div>
  );
};

export default Register;