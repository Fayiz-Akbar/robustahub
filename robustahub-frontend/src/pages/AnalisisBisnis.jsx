import { useState, useEffect, useMemo } from 'react';
import SidebarPetani from '../components/SidebarPetani';

const AnalisisBisnis = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  
  // State filter bulan untuk cetak PDF
  const [pdfSelectedMonths, setPdfSelectedMonths] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  const [showPdfFilter, setShowPdfFilter] = useState(false);

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

  // Parameter Umum Operasional Tetap
  const [params, setParams] = useState(() => {
    const saved = localStorage.getItem('business_general_params');
    return saved ? JSON.parse(saved) : {
      targetOmset: 50000000,
      fixedCost: 1500000,
      packingCostPerOrder: 5000
    };
  });

  // State Penyimpanan Modal Pokok HPP per Varian Kopi
  const [productConfigs, setProductConfigs] = useState(() => {
    const saved = localStorage.getItem('product_hpp_configs');
    return saved ? JSON.parse(saved) : {}; 
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  // FETCH DATA PENJUALAN UTAMA DARI BACKEND
  useEffect(() => {
    const fetchRealBusinessData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/orders/incoming', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const result = await response.json();
          setOrders(result.data || []);
        }
      } catch (error) {
        console.error("Gagal mengambil laporan keuangan bisnis:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchRealBusinessData();
  }, [token]);

  const successfulOrders = useMemo(() => {
    return orders.filter(o => o.status === 'PAID' || o.status === 'SHIPPED' || o.status === 'COMPLETED');
  }, [orders]);

  // EXTRAK DAFTAR PRODUK UNIK DARI DATABASE
  const uniqueProducts = useMemo(() => {
    const productsMap = {};
    successfulOrders.forEach(order => {
      order.items?.forEach(item => {
        if (item.product) {
          productsMap[item.product.id] = {
            id: item.product.id,
            name: item.product.name,
            currentPrice: item.priceAtBuy
          };
        }
      });
    });
    return Object.values(productsMap);
  }, [successfulOrders]);

  const handleSaveAllConfigs = (e) => {
    e.preventDefault();
    localStorage.setItem('business_general_params', JSON.stringify(params));
    localStorage.setItem('product_hpp_configs', JSON.stringify(productConfigs));
    setSaveStatus('Konfigurasi Bisnis Disimpan!');
    setTimeout(() => setSaveStatus(''), 2500);
  };

  const handleGeneralParamChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value === '' ? 0 : Number(value) }));
  };

  const handleProductHppChange = (productId, value) => {
    setProductConfigs(prev => ({
      ...prev,
      [productId]: { modalPerKg: value === '' ? 0 : Number(value) }
    }));
  };

  // DATA TOP PRODUCTS
  const topProducts = useMemo(() => {
    const productStats = {};
    successfulOrders.forEach(order => {
      order.items?.forEach(item => {
        const pName = item.product?.name || 'Komoditas Kopi Lainnya';
        if (!productStats[pName]) productStats[pName] = { quantity: 0, revenue: 0 };
        productStats[pName].quantity += item.quantity;
        productStats[pName].revenue += (item.priceAtBuy * item.quantity);
      });
    });
    return Object.entries(productStats).sort((a, b) => b[1].quantity - a[1].quantity).slice(0, 4);
  }, [successfulOrders]);

  // ========================================================
  // ENGINE KALKULASI FINANSIAL UTAMA DASBOR
  // ========================================================
  const grossRevenue = successfulOrders.reduce((acc, order) => acc + order.totalAmount, 0);

  const totalProductionCost = useMemo(() => {
    return successfulOrders.reduce((acc, order) => {
      let orderCost = 0;
      order.items?.forEach(item => {
        const configuredModal = productConfigs[item.productId]?.modalPerKg || 40000;
        orderCost += item.quantity * configuredModal;
      });
      return acc + orderCost;
    }, 0);
  }, [successfulOrders, productConfigs]);

  const variableCost = successfulOrders.length * params.packingCostPerOrder;
  const totalExpenses = totalProductionCost + variableCost + Number(params.fixedCost);
  const netProfit = grossRevenue - totalExpenses;
  const profitMargin = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : 0;
  const targetProgress = params.targetOmset > 0 ? ((grossRevenue / params.targetOmset) * 100).toFixed(1) : 0;
  
  // 📍 FIX BUG: Menambahkan deklarasi penentu status pencapaian target agar terbaca oleh grafik SVG bawah
  const isTargetAchieved = grossRevenue >= params.targetOmset;

  const totalVolumeKg = successfulOrders.reduce((acc, order) => {
    return acc + (order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0);
  }, 0);

  const chartData = useMemo(() => {
    const monthlySales = {};
    successfulOrders.forEach(order => {
      const date = new Date(order.createdAt || Date.now());
      const monthKey = monthAbbr[date.getMonth()];
      if (!monthlySales[monthKey]) monthlySales[monthKey] = 0;
      monthlySales[monthKey] += order.totalAmount;
    });
    return Object.keys(monthlySales).map(month => ({ month, revenue: monthlySales[month] }));
  }, [successfulOrders]);

  const maxChartRevenue = chartData.length > 0 ? Math.max(...chartData.map(d => d.revenue), params.targetOmset) : params.targetOmset;

  const handleToggleMonthPdf = (monthIndex) => {
    setPdfSelectedMonths(prev => 
      prev.includes(monthIndex) 
        ? prev.filter(m => m !== monthIndex) 
        : [...prev, monthIndex]
    );
  };

  // ENGINE DOWNLOAD PDF AUDIT REPORT
  const handleDownloadPDFReport = () => {
    if (pdfSelectedMonths.length === 0) {
      alert("Mohon pilih minimal satu bulan untuk dicetak!");
      return;
    }

    const pdfOrders = successfulOrders.filter(order => {
      const date = new Date(order.createdAt || Date.now());
      return pdfSelectedMonths.includes(date.getMonth());
    });

    const pdfGrossRevenue = pdfOrders.reduce((acc, order) => acc + order.totalAmount, 0);
    const pdfVolumeKg = pdfOrders.reduce((acc, order) => acc + (order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0), 0);
    
    const pdfProductionCost = pdfOrders.reduce((acc, order) => {
      let cost = 0;
      order.items?.forEach(item => {
        const modal = productConfigs[item.productId]?.modalPerKg || 40000;
        cost += item.quantity * modal;
      });
      return acc + cost;
    }, 0);

    const pdfVariableCost = pdfOrders.length * params.packingCostPerOrder;
    const monthsCount = pdfSelectedMonths.length;
    const pdfFixedCost = (Number(params.fixedCost) / 12) * monthsCount;
    const pdfTotalExpenses = pdfProductionCost + pdfVariableCost + pdfFixedCost;
    const pdfNetProfit = pdfGrossRevenue - pdfTotalExpenses;
    const pdfTargetOmsetTotal = (Number(params.targetOmset) / 12) * monthsCount;

    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const printedMonthsText = pdfSelectedMonths.map(m => monthNames[m]).join(', ');

    printWindow.document.write(`
      <html>
        <head>
          <title>Audit Keuangan Resmi - RobustaHub</title>
          <style>
            body { font-family: Arial, sans-serif; color: #1A1D20; padding: 40px; line-height: 1.5; }
            .header-table { width: 100%; border-bottom: 3px double #3A2210; padding-bottom: 12px; margin-bottom: 25px; }
            .company-title { font-size: 24px; font-weight: bold; color: #3A2210; }
            .report-title { font-size: 16px; font-weight: bold; text-align: right; color: #A86431; }
            .grid-kpi { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .kpi-card { border: 1px solid #EFEFEF; padding: 15px; background: #F8F9FA; width: 25%; }
            .kpi-title { font-size: 10px; font-weight: bold; color: #6C757D; text-transform: uppercase; }
            .kpi-value { font-size: 15px; font-weight: bold; color: #1A1D20; margin-top: 5px; }
            .section-heading { font-size: 13px; font-weight: bold; color: #3A2210; border-left: 4px solid #A86431; padding-left: 8px; margin-bottom: 15px; margin-top: 25px; text-transform: uppercase; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
            .data-table th { background: #3A2210; color: white; text-align: left; padding: 10px; font-size: 11px; }
            .data-table td { padding: 10px; border-bottom: 1px solid #EFEFEF; }
            .data-table tr.total-row { background: #FDF9F5; font-weight: bold; }
            .text-right { text-align: right; }
            .filter-badge { background: #EEE; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; color: #444; }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td>
                <div class="company-title">RobustaHub B2B Network</div>
                <div style="font-size: 12px; color: #6C757D;">Sistem Akuntansi Penjualan Komoditas Kopi Unggulan Lampung</div>
              </td>
              <td class="report-title">
                Neraca & Audit Finansial Berkala<br/>
                <span style="font-size: 11px; color: #6C757D; font-weight: normal;">Dicetak: ${currentDate}</span>
              </td>
            </tr>
          </table>

          <div style="margin-bottom: 20px; font-size: 13px;">
            <b>Cakupan Audit Bulan:</b> <span class="filter-badge">${printedMonthsText}</span>
          </div>

          <div class="section-heading">Rangkuman Kinerja Finansial (Filtered)</div>
          <table class="grid-kpi">
            <tr>
              <td class="kpi-card">
                <div class="kpi-title">Gross Revenue</div>
                <div class="kpi-value">Rp ${pdfGrossRevenue.toLocaleString('id-ID')}</div>
              </td>
              <td class="kpi-card">
                <div class="kpi-title">Total Pengeluaran</div>
                <div class="kpi-value" style="color: #EF4444;">Rp ${pdfTotalExpenses.toLocaleString('id-ID')}</div>
              </td>
              <td class="kpi-card">
                <div class="kpi-title">Net Profit Bersih</div>
                <div class="kpi-value" style="color: #10B981;">Rp ${pdfNetProfit.toLocaleString('id-ID')}</div>
              </td>
              <td class="kpi-card">
                <div class="kpi-title">Volume Terjual</div>
                <div class="kpi-value">${pdfVolumeKg.toLocaleString('id-ID')} Kg</div>
              </td>
            </tr>
          </table>

          <div class="section-heading">Laporan Kas Laba Rugi (Profit & Loss Statement)</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Komponen Keuangan</th>
                <th>Deskripsi Buku Kas Operasional</th>
                <th class="text-right">Jumlah Keuangan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Pemasukan Omset Kotor (Revenue)</b></td>
                <td>Total pendapatan dari kargo kopi lunas pada periode terpilih</td>
                <td class="text-right" style="color: #10B981;">+ Rp ${pdfGrossRevenue.toLocaleString('id-ID')}</td>
              </tr>
              <tr>
                <td><b>Harga Pokok Penjualan (Total HPP)</b></td>
                <td>Akumulasi biaya pokok produksi berdasarkan varietas varian</td>
                <td class="text-right" style="color: #EF4444;">- Rp ${pdfProductionCost.toLocaleString('id-ID')}</td>
              </tr>
              <tr>
                <td><b>Biaya Pengemasan (Variable Packing)</b></td>
                <td>Karung goni kain, karung plastik, lakban sealer x ${pdfOrders.length} order terpilih</td>
                <td class="text-right" style="color: #EF4444;">- Rp ${pdfVariableCost.toLocaleString('id-ID')}</td>
              </tr>
              <tr>
                <td><b>Beban Tetap (Fixed Cost Proporsional)</b></td>
                <td>Gaji & abodemen listrik mesin disesuaikan untuk ${monthsCount} bulan</td>
                <td class="text-right" style="color: #EF4444;">- Rp ${Math.round(pdfFixedCost).toLocaleString('id-ID')}</td>
              </tr>
              <tr class="total-row">
                <td colspan="2">LABA BERSIH OPERASIONAL (NET MARGIN)</td>
                <td class="text-right">Rp ${pdfNetProfit.toLocaleString('id-ID')}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 50px; font-size: 12px; color: #6C757D;">
            *Target omset gabungan untuk bulan terpilih adalah <b>Rp ${Math.round(pdfTargetOmsetTotal).toLocaleString('id-ID')}</b>. Status target: <b>${pdfGrossRevenue >= pdfTargetOmsetTotal ? 'TERCAPAI' : 'BELUM TERCAPAI'}</b>.
          </div>

          <div style="margin-top: 60px; text-align: right; font-size: 13px;">
            <p>Penanggung Jawab Laporan,<br/><br/><br/><br/><b>${user.name || 'Pemilik Komoditas Kopi'}</b></p>
          </div>

          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-[#F3F4F6] min-h-screen font-sans flex text-[#1A1D20]">
      <SidebarPetani isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="analisis-bisnis" />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center lg:justify-end sticky top-0 z-40 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#3A2210] p-1 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="font-bold text-[14px] text-[#1A1D20]">{user.name || 'Owner Bisnis'}</div>
              <div className="text-[12px] text-gray-500 uppercase font-semibold tracking-wider">Enterprise Panel</div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-[#3A2210] to-[#A86431] text-white rounded-xl flex items-center justify-center font-bold uppercase text-[14px] shadow-md">
              {user.name ? user.name.substring(0,2).toUpperCase() : 'PE'}
            </div>
          </div>
        </header>

        <main className="p-6 md:p-8 flex-1 overflow-y-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 relative">
            <div>
              <div className="text-[12px] font-bold text-[#A86431] uppercase tracking-widest mb-1">Financial ERP Dashboard</div>
              <h1 className="text-[28px] font-black text-[#1A1D20] m-0 tracking-tight">Intelligence Bisnis & Neraca</h1>
              <p className="text-gray-500 text-[14px] mt-1.5 m-0 max-w-2xl">Atur modal pokok kustom untuk tiap produk varietas kopi. Keuntungan dihitung dari harga jual dikurangi modal per kg masing-masing varian.</p>
            </div>
            
            <div className="relative">
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowPdfFilter(!showPdfFilter)}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-xl font-bold text-[13px] shadow-sm hover:bg-gray-50 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                  Filter Bulan PDF ({pdfSelectedMonths.length})
                </button>
                <button 
                  onClick={handleDownloadPDFReport}
                  className="bg-[#3A2210] text-white px-5 py-3 rounded-xl font-bold text-[13px] shadow-md hover:bg-[#A86431] flex items-center gap-2 transition-all cursor-pointer border-none"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Unduh Laporan Audit PDF
                </button>
              </div>

              {showPdfFilter && (
                <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 z-50 w-72 grid grid-cols-2 gap-2">
                  <div className="col-span-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 border-b pb-1">Pilih Bulan Audit</div>
                  {monthNames.map((name, index) => (
                    <label key={index} className="flex items-center gap-2 text-[12px] font-semibold text-gray-700 cursor-pointer p-1 hover:bg-gray-50 rounded-lg">
                      <input 
                        type="checkbox" 
                        checked={pdfSelectedMonths.includes(index)} 
                        onChange={() => handleToggleMonthPdf(index)}
                        className="rounded text-[#A86431] focus:ring-[#A86431] cursor-pointer"
                      />
                      {monthAbbr[index]}
                    </label>
                  ))}
                  <button 
                    onClick={() => setShowPdfFilter(false)}
                    className="col-span-2 mt-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[11px] py-1.5 rounded-lg border-none cursor-pointer"
                  >
                    Terapkan Filter
                  </button>
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A86431]"></div>
            </div>
          ) : (
            <>
              {/* METRIK UTAMA */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                  <div className="text-gray-500 font-bold text-[11px] uppercase tracking-wider mb-1">Gross Revenue (Omset)</div>
                  <div className="text-[24px] font-black text-[#1A1D20]">Rp {grossRevenue.toLocaleString('id-ID')}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                  <div className="text-gray-500 font-bold text-[11px] uppercase tracking-wider mb-1">Total Pengeluaran & HPP</div>
                  <div className="text-[24px] font-black text-[#1A1D20]">Rp {totalExpenses.toLocaleString('id-ID')}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${netProfit >= 0 ? 'bg-emerald-500' : 'bg-red-600'}`}></div>
                  <div className="text-gray-500 font-bold text-[11px] uppercase tracking-wider mb-1">Laba Bersih Toko</div>
                  <div className={`text-[24px] font-black ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    Rp {netProfit.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                  <div className="text-gray-500 font-bold text-[11px] uppercase tracking-wider mb-1">Volume Kopi Terjual</div>
                  <div className="text-[24px] font-black text-[#1A1D20]">{totalVolumeKg.toLocaleString('id-ID')} <span className="text-[13px] text-gray-400 font-medium">Kg</span></div>
                </div>
              </div>

              {/* GRAFIK KOMPARASI TARGET VS REALISASI */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="m-0 text-[16px] font-bold text-[#1A1D20]">Komparasi Finansial: Target vs Realisasi</h3>
                    <p className="m-0 text-[12px] text-gray-500 mt-0.5">Analisis visual omset kotor berjalan terhadap batas target bulanan pebisnis.</p>
                  </div>
                  <div className="flex gap-4 text-[11px] font-bold">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <span className="w-3 h-3 bg-gray-300 rounded inline-block"></span> Target Omset
                    </div>
                    <div className="flex items-center gap-1.5 text-[#A86431]">
                      <span className="w-3 h-3 bg-gradient-to-t from-[#3A2210] to-[#A86431] rounded inline-block"></span> Realisasi Omset
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#F8F9FA] p-6 rounded-2xl border border-gray-100 items-center">
                  <div className="w-full">
                    <svg viewBox="0 0 400 160" className="w-full h-auto overflow-visible">
                      <line x1="80" y1="20" x2="380" y2="20" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4" />
                      <line x1="80" y1="80" x2="380" y2="80" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4" />
                      <line x1="80" y1="130" x2="380" y2="130" stroke="#CBD5E1" strokeWidth="1.5" />

                      <text x="70" y="45" textAnchor="end" fontSize="11" fill="#64748B" fontWeight="bold">Target</text>
                      <rect x="80" y="32" width="280" height="20" rx="4" fill="#E5E7EB" />
                      <text x="90" y="46" fontSize="10" fill="#475569" fontWeight="bold">Rp {params.targetOmset.toLocaleString('id-ID')}</text>

                      <text x="70" y="105" textAnchor="end" fontSize="11" fill="#A86431" fontWeight="bold">Realisasi</text>
                      <rect x="80" y="92" width="280" height="20" rx="4" fill="#F3EAD8" />
                      <rect 
                        x="80" y="92" 
                        width={`${Math.min((grossRevenue / (params.targetOmset || 1)) * 280, 280)}`} 
                        height="20" rx="4" 
                        fill="url(#realisasiGrad)" 
                      />
                      <text x="90" y="106" fontSize="10" fill="#FFF" fontWeight="bold">Rp {grossRevenue.toLocaleString('id-ID')}</text>

                      <defs>
                        <linearGradient id="realisasiGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#3A2210" />
                          <stop offset="100%" stopColor="#A86431" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  <div className="border-l-2 border-gray-200 pl-6 text-left">
                    <div className="text-[12px] font-bold text-gray-400 uppercase">Status Kelayakan Kuota</div>
                    <div className="text-[22px] font-black text-[#1A1D20] mt-0.5">{targetProgress}%</div>
                    <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
                      {isTargetAchieved 
                        ? "🎉 Selamat! Omset realisasi gudang Anda telah sukses menembus target finansial buku berjalan kuartal ini."
                        : `Sistem mendeteksi Anda membutuhkan omset tambahan sebesar Rp ${(params.targetOmset - grossRevenue).toLocaleString('id-ID')} lagi untuk menyentuh target kuota awal.`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* BARIS KONTROL PARAMETER & P&L */}
              <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-6 mb-6 items-start">
                
                {/* TABEL PENGATURAN MODAL PER VARIAN */}
                <form onSubmit={handleSaveAllConfigs} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 px-5 py-4 flex items-center justify-between">
                    <h3 className="m-0 text-[15px] font-bold text-[#1A1D20]">Atur Modal per Produk Kopi</h3>
                    {saveStatus && <span className="text-emerald-600 font-bold text-[12px]">{saveStatus}</span>}
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                    <p className="text-[12px] text-gray-500 m-0">Sistem mendeteksi produk terupload kamu yang terjual. Isi modal pokok per kg untuk tiap varian berikut:</p>
                    
                    <div className="max-h-[220px] overflow-y-auto flex flex-col gap-3 pr-1">
                      {uniqueProducts.map((prod) => (
                        <div key={prod.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-1.5">
                          <div className="font-bold text-[13px] text-[#1A1D20] truncate">{prod.name}</div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[11px] font-semibold text-gray-400">Harga Jual: Rp {prod.currentPrice.toLocaleString('id-ID')}/Kg</span>
                            <div className="relative w-36">
                              <span className="absolute left-2.5 top-2 text-[12px] font-bold text-gray-400">Rp</span>
                              <input 
                                type="number" 
                                value={productConfigs[prod.id]?.modalPerKg ?? 40000} 
                                onChange={(e) => handleProductHppChange(prod.id, e.target.value)}
                                className="w-full p-1.5 pl-8 border border-gray-300 rounded-lg text-[12px] font-bold text-[#1A1D20] outline-none focus:border-[#A86431]"
                                placeholder="Modal/Kg"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-dashed border-gray-200 pt-3 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Gaji/Listrik Bulanan</label>
                        <input type="number" name="fixedCost" value={params.fixedCost} onChange={handleGeneralParamChange} className="w-full p-2 border border-gray-300 rounded-lg text-[12px] font-bold" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Target Omset</label>
                        <input type="number" name="targetOmset" value={params.targetOmset} onChange={handleGeneralParamChange} className="w-full p-2 border border-gray-300 rounded-lg text-[12px] font-bold" />
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-[#3A2210] hover:bg-[#A86431] text-white font-bold text-[12px] py-2.5 rounded-xl transition-all cursor-pointer border-none shadow-sm mt-2">
                      Simpan Seluruh Pengaturan Modal
                    </button>
                  </div>
                </form>

                {/* REAL-TIME PROFIT & LOSS */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col justify-between">
                  <div className="bg-gray-50 border-b border-gray-200 px-5 py-4">
                    <h3 className="m-0 text-[15px] font-bold text-[#1A1D20]">Profit & Loss Statement (Real-time Audit)</h3>
                  </div>
                  <div className="p-0 flex flex-col text-[13px] flex-1">
                    <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-emerald-50/20">
                      <div>
                        <div className="font-bold text-[#1A1D20]">Total Omset Penjualan</div>
                        <div className="text-[11px] text-gray-500">Kalkulasi bruto {successfulOrders.length} resi pesanan sukses</div>
                      </div>
                      <span className="font-bold text-[14px] text-emerald-600">+ Rp {grossRevenue.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-red-50/10">
                      <div>
                        <div className="font-bold text-[#1A1D20]">Total HPP Komoditas Terjual</div>
                        <div className="text-[11px] text-red-400 font-medium">Akumulasi modal kustom varietas kopi x volume Kg terjual</div>
                      </div>
                      <span className="font-bold text-[14px] text-red-500">- Rp {totalProductionCost.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-red-50/10">
                      <div>
                        <div className="font-bold text-[#1A1D20]">Beban Tambahan Gudang (Packing)</div>
                        <div className="text-[11px] text-red-400 font-medium">Flat Rp {params.packingCostPerOrder.toLocaleString('id-ID')} x {successfulOrders.length} Order</div>
                      </div>
                      <span className="font-bold text-[14px] text-red-500">- Rp {variableCost.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-red-50/10">
                      <div>
                        <div className="font-bold text-[#1A1D20]">Beban Tetap Bulanan (Fixed Cost)</div>
                        <div className="text-[11px] text-red-400 font-medium">Alokasi sewa ruko gudang, abodemen listrik mesin giling</div>
                      </div>
                      <span className="font-bold text-[14px] text-red-500">- Rp {Number(params.fixedCost).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center p-5 bg-[#1A1D20] text-white mt-auto">
                      <div>
                        <div className="font-black text-[14px] tracking-wide uppercase">LABA BERSIH OPERASIONAL</div>
                        <div className="text-[11px] text-gray-400 font-medium mt-0.5">Margin Keuntungan Bersih: {profitMargin}%</div>
                      </div>
                      <span className={`font-black text-[22px] ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        Rp {netProfit.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* TREN BAR CHART BULANAN */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"></path></svg>
                  </div>
                  <div>
                    <h3 className="m-0 text-[16px] font-bold text-[#1A1D20]">Tren Grafik Penjualan Bulanan (Live)</h3>
                    <p className="m-0 text-[12px] text-gray-500">Visualisasi omset berkala berdasarkan tanggal entri pesanan di database.</p>
                  </div>
                </div>
                <div className="w-full bg-[#F8F9FA] rounded-2xl p-6 border border-gray-100 flex items-end justify-around h-60 relative pt-10">
                  <div className="absolute top-10 left-0 w-full border-t border-dashed border-gray-200"></div>
                  <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-gray-200"></div>
                  {chartData.map((data, idx) => {
                    const heightPercent = (data.revenue / maxChartRevenue) * 100;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 relative group w-1/6">
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded-md transition-opacity whitespace-nowrap z-10">
                          Rp {data.revenue.toLocaleString('id-ID')}
                        </div>
                        <div className="w-12 bg-indigo-100 rounded-t-md relative flex items-end justify-center h-36">
                          <div className="w-full bg-gradient-to-t from-indigo-700 to-indigo-500 rounded-t-md shadow-sm transition-all duration-700" style={{ height: `${heightPercent}%` }}></div>
                        </div>
                        <span className="text-[12px] font-bold text-gray-500 mt-1">{data.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DAFTAR METRIK PRODUK TERLARIS */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="m-0 text-[16px] font-bold text-[#1A1D20] mb-4">Volume Penjualan Berdasarkan Varietas (Riil)</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
                  {topProducts.map(([name, stats], index) => {
                    const maxVolume = topProducts[0][1].quantity;
                    const widthPercent = (stats.quantity / maxVolume) * 100;
                    return (
                      <div key={index} className="flex flex-col gap-2">
                        <div className="flex justify-between items-end text-[13px]">
                          <div className="font-bold text-[#1A1D20] truncate max-w-xs">{name}</div>
                          <span className="font-black text-[#A86431]">{stats.quantity} Kg</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#3A2210] to-[#A86431] rounded-full" style={{ width: `${widthPercent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AnalisisBisnis;