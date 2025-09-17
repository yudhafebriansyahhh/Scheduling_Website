import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

// Import components
import Sidebar from '../../Components/Sidebar';
import LaporanSummaryCards from '../../Components/Laporan/LaporanSummaryCards';
import LaporanFilters from '../../Components/Laporan/LaporanFilters';
import LaporanExportButtons from '../../Components/Laporan/LaporanExportButtons';
import LaporanTable from '../../Components/Laporan/LaporanTable';

// Import utilities
import { exportToCSV, exportToPDF } from '../../utils/laporanExportUtils';

// Custom hooks untuk data management
const useLaporanData = () => {
  const [laporanData] = useState([
    {
      id: 1,
      tanggal: '2025-09-15',
      jamMulai: '08:00',
      jamSelesai: '17:00',
      namaTim: 'Tim Alpha',
      fotografer: 'John Doe',
      editor: 'Jane Smith',
      lapangan: 'Lapangan A',
      status: 'completed',
      totalJam: 9,
      jamFotografer: 9,
      jamEditor: 6,
      catatan: 'Sesi pemotretan lengkap'
    },
    {
      id: 2,
      tanggal: '2025-09-14',
      jamMulai: '09:00',
      jamSelesai: '15:00',
      namaTim: 'Tim Beta',
      fotografer: 'Mike Johnson',
      editor: 'Sarah Wilson',
      lapangan: 'Lapangan B',
      status: 'completed',
      totalJam: 6,
      jamFotografer: 6,
      jamEditor: 8,
      catatan: 'Editing tambahan diperlukan'
    },
    {
      id: 3,
      tanggal: '2025-09-13',
      jamMulai: '07:30',
      jamSelesai: '18:00',
      namaTim: 'Tim Gamma',
      fotografer: 'Alex Brown',
      editor: 'Lisa Davis',
      lapangan: 'Lapangan C',
      status: 'in_progress',
      totalJam: 10.5,
      jamFotografer: 10.5,
      jamEditor: 5,
      catatan: 'Masih dalam proses editing'
    },
    {
      id: 4,
      tanggal: '2025-09-12',
      jamMulai: '10:00',
      jamSelesai: '16:30',
      namaTim: 'Tim Delta',
      fotografer: 'Chris Wilson',
      editor: 'Mark Taylor',
      lapangan: 'Lapangan A',
      status: 'completed',
      totalJam: 6.5,
      jamFotografer: 6.5,
      jamEditor: 7,
      catatan: 'Project selesai tepat waktu'
    }
  ]);

  return laporanData;
};

// Custom hook untuk filtering dan summary
const useFilteredData = (data, searchTerm, filterStatus) => {
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch =
        item.namaTim.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fotografer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.editor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lapangan.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = filterStatus === 'all' || item.status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [data, searchTerm, filterStatus]);

  const summary = useMemo(() => ({
    totalJobs: filteredData.length,
    completedJobs: filteredData.filter(item => item.status === 'completed').length,
    totalJamFotografer: filteredData.reduce((sum, item) => sum + item.jamFotografer, 0),
    totalJamEditor: filteredData.reduce((sum, item) => sum + item.jamEditor, 0),
    rataRataJamPerJob: filteredData.length > 0 ?
      (filteredData.reduce((sum, item) => sum + item.totalJam, 0) / filteredData.length).toFixed(1) : 0
  }), [filteredData]);

  return { filteredData, summary };
};

const Laporan = ({ stats }) => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Data management
  const laporanData = useLaporanData();
  const { filteredData, summary } = useFilteredData(laporanData, searchTerm, filterStatus);

  // Event handlers
  const handleBack = () => {
    window.history.back();
  };

  const handleExportCSV = () => {
    exportToCSV(filteredData);
  };

  const handleExportPDF = () => {
    exportToPDF(filteredData, summary);
  };

  const handleShowDetail = (item) => {
    setSelectedDetail(item);
    setShowDetailModal(true);
  };

  const handleAddSchedule = () => {
    alert('Fitur tambah jadwal baru');
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      router.post('/logout', {}, {
        onSuccess: () => {
          console.log('Logout successful');
        },
        onError: (errors) => {
          console.error('Logout failed:', errors);
          alert('Gagal logout, silahkan coba lagi');
        }
      });
    }
  };

  return (
    <>
      <Head title="Laporan" />

      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <Sidebar
          currentRoute="laporan"
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back
              </button>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-6">Laporan</h1>

            {/* Summary Cards */}
            <LaporanSummaryCards summary={summary} />

            {/* Filters and Actions */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <LaporanFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
              />

              <LaporanExportButtons
                onExportCSV={handleExportCSV}
                onExportPDF={handleExportPDF}
                onAddSchedule={handleAddSchedule}
              />
            </div>
          </div>

          {/* Table */}
          <LaporanTable
            filteredData={filteredData}
            onShowDetail={handleShowDetail}
            searchTerm={searchTerm}
            filterStatus={filterStatus}
            totalData={laporanData.length}
          />

          {/* Table Footer */}
          {filteredData.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 gap-4">
              <div>
                Menampilkan {filteredData.length} dari {laporanData.length} data laporan
              </div>
              <div className="flex items-center gap-4">
                <div>Total Jam Fotografer: <span className="font-semibold text-purple-600">{summary.totalJamFotografer}h</span></div>
                <div>Total Jam Editor: <span className="font-semibold text-orange-600">{summary.totalJamEditor}h</span></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal (if needed) */}
      {showDetailModal && selectedDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Detail Laporan</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Tim:</strong> {selectedDetail.namaTim}</p>
              <p><strong>Tanggal:</strong> {selectedDetail.tanggal}</p>
              <p><strong>Fotografer:</strong> {selectedDetail.fotografer}</p>
              <p><strong>Editor:</strong> {selectedDetail.editor}</p>
              <p><strong>Catatan:</strong> {selectedDetail.catatan}</p>
            </div>
            <div className="flex justify-end mt-6 space-x-2">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Laporan;
