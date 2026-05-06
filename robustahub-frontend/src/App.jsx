import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import Login from './pages/Login';
import Register from './pages/Register';
import KatalogKopi from './pages/KatalogKopi';
import DashboardPetani from './pages/DashboardPetani';

// Membuat halaman dummy sementara untuk melihat hasil komponen
const BerandaSementara = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Etalase Biji Kopi</h1>
      
      {/* Grid responsif: 1 kolom di HP, 2 di Tablet, 3 di Desktop, 4 di Layar Besar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Kita panggil komponen ProductCard beberapa kali untuk simulasi */}
        <ProductCard />
        <ProductCard product={{ name: "Fine Robusta Premium", price: 65000, processingMethod: "Honey" }} />
        <ProductCard product={{ name: "Robusta Grade 1", price: 55000, processingMethod: "Washed" }} />
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans">
        <Routes>
          {/* Rute Autentikasi (Tidak pakai Navbar) */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<DashboardPetani />} />

          {/* Rute lain (Nanti kita tambahkan Navbar di dalamnya) */}
          <Route path="/katalog" element={<KatalogKopi />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;