import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Nanti kita sambungkan ke API Backend di sini
    console.log('Login dengan:', email, password);
    navigate('/katalog'); // Sementara langsung arahkan ke katalog
  };

  return (
    // Container utama: flexbox, responsif padding, dan background
    <div className="flex items-center justify-center min-h-screen px-4 py-12 sm:px-6 lg:px-8 bg-gray-100">
      
      {/* Card Login: Lebar 100% di HP, maksimal ukuran md di layar besar */}
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl">
            RobustaHub
          </h2>
          <p className="mt-2 text-sm text-gray-600 md:text-base">
            Masuk untuk mulai bertransaksi kopi
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                required
                className="block w-full px-4 py-3 mt-1 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                placeholder="email@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                className="block w-full px-4 py-3 mt-1 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white transition-colors bg-amber-600 border border-transparent rounded-md shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;