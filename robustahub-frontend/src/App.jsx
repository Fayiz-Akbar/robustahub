import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import KatalogKopi from './pages/KatalogKopi';
// Import halaman lainnya nanti di sini...

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Navbar bisa ditaruh di sini nanti jika ingin muncul di semua halaman */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/katalog" element={<KatalogKopi />} />
          {/* Tambahkan rute lain dari hasil Figma-mu di sini */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;