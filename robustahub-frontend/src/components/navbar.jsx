import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-amber-800 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold tracking-wider">
              RobustaHub
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/katalog" className="hover:text-amber-300 transition-colors">Katalog Kopi</Link>
            <Link to="/dashboard" className="hover:text-amber-300 transition-colors">Dashboard Petani</Link>
            <Link to="/pesanan" className="hover:text-amber-300 transition-colors">Pesanan Saya</Link>
          </div>

          {/* Tombol Login / Profil */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/login" 
              className="bg-white text-amber-800 px-4 py-2 rounded-md font-medium hover:bg-amber-100 transition-colors"
            >
              Masuk
            </Link>
          </div>

          {/* Mobile Menu Button (Hamburger) - Sederhana untuk sekarang */}
          <div className="md:hidden flex items-center">
            <button className="text-white hover:text-amber-300 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;