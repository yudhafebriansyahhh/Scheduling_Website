import React, { useState, useMemo } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

// Import components
import Sidebar from '../../Components/Sidebar';
import LaporanSummaryCards from '../../Components/Laporan/LaporanSummaryCards';
// import SummaryCards from '@/Components/Laporan/SummaryCards'
import LaporanFilters from '../../Components/Laporan/LaporanFilters';
import LaporanExportButtons from '../../Components/Laporan/LaporanExportButtons';
import LaporanTable from '../../Components/Laporan/LaporanTable';
import Filters from '@/Components/Laporan/Filters'

// Import utilities
import { exportToCSV, exportToPDF } from '../../utils/laporanExportUtils';

// Custom hook untuk filtering dan summary
const useFilteredData = (data, searchTerm, filterStatus, filterRole) => {
  // Konversi ke menit
  const timeToMinutes = (timeValue) => {
    if (!timeValue) return 0;

    // Kalau number (misalnya 9.5)
    if (typeof timeValue === 'number') {
      const hours = Math.floor(timeValue);
      const minutes = Math.round((timeValue - hours) * 60);
      return hours * 60 + minutes;
    }

    // Kalau string angka desimal
    if (!isNaN(timeValue)) {
      const num = parseFloat(timeValue);
      const hours = Math.floor(num);
      const minutes = Math.round((num - hours) * 60);
      return hours * 60 + minutes;
    }

    // Kalau format HH:MM(:SS)
    const timeStr = timeValue.toString().trim();
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      const hours = parseInt(parts[0], 10) || 0;
      const minutes = parseInt(parts[1], 10) || 0;
      const seconds = parts.length > 2 ? parseInt(parts[2], 10) || 0 : 0;
      return hours * 60 + minutes + Math.round(seconds / 60);
    }

    return 0;
  };

  // Konversi menit → jam desimal
  const minutesToDecimal = (totalMinutes) => {
    const value = totalMinutes / 60;
    return value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Dynamic search based on filterRole
      let matchSearch = false;

      // Always search in these fields
      const basicSearch =
        item.namaEvent.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lapangan.toLowerCase().includes(searchTerm.toLowerCase());

      // Role-specific search
      if (filterRole === 'all') {
        // Search in both fotografer and editor when showing all
        matchSearch = basicSearch ||
          item.fotografer?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.editor?.nama?.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (filterRole === 'fotografer') {
        // Only search in fotografer when filtering by fotografer
        matchSearch = basicSearch ||
          item.fotografer?.nama?.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (filterRole === 'editor') {
        // Only search in editor when filtering by editor
        matchSearch = basicSearch ||
          item.editor?.nama?.toLowerCase().includes(searchTerm.toLowerCase());
      } else {
        matchSearch = basicSearch;
      }

      const matchStatus = filterStatus === 'all' || item.status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [data, searchTerm, filterStatus, filterRole]); // Add filterRole to dependencies

  const summary = useMemo(() => {
    const totalMinutesFotografer = filteredData.reduce((sum, item) => {
      return sum + timeToMinutes(item.jamFotografer);
    }, 0);

    const totalMinutesEditor = filteredData.reduce((sum, item) => {
      return sum + timeToMinutes(item.jamEditor);
    }, 0);

    return {
      totalJobs: filteredData.length,
      completedJobs: filteredData.filter(item => item.status === 'completed').length,
      totalJamFotografer: minutesToDecimal(totalMinutesFotografer),
      totalJamEditor: minutesToDecimal(totalMinutesEditor),
      totalMinutesFotografer,
      totalMinutesEditor,
      filterRole // Pass filterRole to summary
    };
  }, [filteredData, filterRole]);

  return { filteredData, summary };
};

const Laporan = ({ stats }) => {
  // Ambil props dari Laravel (ScheduleController)
  const { schedules } = usePage().props;

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all'); // New state for role filter
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { filteredData, summary } = useFilteredData(schedules, searchTerm, filterStatus, filterRole);

  // Event handlers
  const handleBack = () => {
    window.history.back();
  };

  // PENTING: Pastikan filterRole ter-pass dengan benar
  const handleExportCSV = () => {
    console.log('Export CSV with filterRole:', filterRole); // Debug log
    exportToCSV(filteredData, filterRole);
  };

  const handleExportPDF = () => {
    console.log('Export PDF with filterRole:', filterRole); // Debug log
    exportToPDF(filteredData, summary, filterRole);
  };

  const handleShowDetail = (item) => {
    setSelectedDetail(item);
    setShowDetailModal(true);
  };

  const handleAddSchedule = () => {
    router.visit(route('schedule.create'));
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
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar
          currentRoute="schedule"
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
                filterRole={filterRole}
                setFilterRole={setFilterRole}
              />

              <LaporanExportButtons
                onExportCSV={handleExportCSV}
                onExportPDF={handleExportPDF}
                onAddSchedule={handleAddSchedule}
              />
            </div>
          </div>

          {/* Summary cards */}
          {/* <SummaryCards summary={summary} /> */}

          {/* Filters */}
          {/* <Filters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            handleExportCSV={handleExportCSV}
            handleExportPDF={() => window.print()}
          /> */}

          {/* Table */}
          <LaporanTable
            filteredData={filteredData}
            onShowDetail={handleShowDetail}
            searchTerm={searchTerm}
            filterStatus={filterStatus}
            filterRole={filterRole}
            totalData={schedules.length}
          />

          {/* Table Footer */}
          {filteredData.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 gap-4">
              <div>
                Menampilkan {filteredData.length} dari {schedules.length} data laporan
              </div>
              <div className="flex items-center gap-4">
                {/* Conditional display based on filterRole */}
                {(filterRole === 'all' || filterRole === 'fotografer') && (
                  <div>Total Jam Fotografer: <span className="font-semibold text-purple-600">{summary.totalJamFotografer}h</span></div>
                )}
                {(filterRole === 'all' || filterRole === 'editor') && (
                  <div>Total Jam Editor: <span className="font-semibold text-orange-600">{summary.totalJamEditor}h</span></div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-10 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Detail Laporan</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Tim:</strong> {selectedDetail.namaEvent}</p>
              <p><strong>Tanggal:</strong> {selectedDetail.tanggal}</p>

              {/* Conditional display in modal based on filterRole */}
              {(filterRole === 'all' || filterRole === 'fotografer') && (
                <>
                  <p><strong>Fotografer:</strong> {selectedDetail.fotografer?.nama}</p>
                  <p><strong>Jam Fotografer:</strong> {selectedDetail.jamFotografer}h</p>
                </>
              )}

              {(filterRole === 'all' || filterRole === 'editor') && (
                <>
                  <p><strong>Editor:</strong> {selectedDetail.editor?.nama}</p>
                  <p><strong>Jam Editor:</strong> {selectedDetail.jamEditor}h</p>
                </>
              )}

              <p><strong>Catatan:</strong> {selectedDetail.catatan}</p>

              {(filterRole === 'all' || filterRole === 'fotografer') && (
                <p>
                  <strong>Link Drive Fotografer:</strong>{' '}
                  {selectedDetail.linkGdriveFotografer ? (
                    <a
                      href={selectedDetail.linkGdriveFotografer}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 underline break-all"
                    >
                      Buka Link
                    </a>
                  ) : (
                    'Tidak ada link'
                  )}
                </p>
              )}

              {(filterRole === 'all' || filterRole === 'editor') && (
                <p>
                  <strong>Link Drive Editor:</strong>{' '}
                  {selectedDetail.linkGdriveEditor ? (
                    <a
                      href={selectedDetail.linkGdriveEditor}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 underline break-all"
                    >
                      Buka Link
                    </a>
                  ) : (
                    'Tidak ada link'
                  )}
                </p>
              )}
            </div>
            <div className="flex justify-end mt-6 space-x-2">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
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
