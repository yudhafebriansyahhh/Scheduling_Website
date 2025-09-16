import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { ArrowLeft, Search, Download, FileText, Filter, Calendar, Clock } from 'lucide-react';
import Sidebar from '../../Components/Sidebar';

const Laporan = ({ stats }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Sample data laporan
  const [laporanData, setLaporanData] = useState([
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

  // Filter data berdasarkan search dan status
  const filteredData = laporanData.filter(item => {
    const matchSearch =
      item.namaTim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fotografer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.editor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lapangan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = filterStatus === 'all' || item.status === filterStatus;

    return matchSearch && matchStatus;
  });

  // Summary calculations
  const summary = {
    totalJobs: filteredData.length,
    completedJobs: filteredData.filter(item => item.status === 'completed').length,
    totalJamFotografer: filteredData.reduce((sum, item) => sum + item.jamFotografer, 0),
    totalJamEditor: filteredData.reduce((sum, item) => sum + item.jamEditor, 0),
    rataRataJamPerJob: filteredData.length > 0 ?
      (filteredData.reduce((sum, item) => sum + item.totalJam, 0) / filteredData.length).toFixed(1) : 0
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleExportCSV = () => {
    const headers = ['No', 'Tanggal', 'Jam Mulai', 'Jam Selesai', 'Nama Tim', 'Fotografer', 'Editor', 'Lapangan', 'Status', 'Total Jam', 'Jam Fotografer', 'Jam Editor', 'Catatan'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map((item, index) => [
        index + 1,
        item.tanggal,
        item.jamMulai,
        item.jamSelesai,
        `"${item.namaTim}"`,
        `"${item.fotografer}"`,
        `"${item.editor}"`,
        `"${item.lapangan}"`,
        item.status,
        item.totalJam,
        item.jamFotografer,
        item.jamEditor,
        `"${item.catatan}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `laporan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const printContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Laporan Pekerjaan</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ddd; padding-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .summary-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
        .summary-number { font-size: 24px; font-weight: bold; color: #4f46e5; }
        .summary-label { font-size: 12px; color: #666; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background-color: #f8f9fa; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .status-completed { background-color: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 12px; }
        .status-progress { background-color: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 12px; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Laporan Pekerjaan</h1>
        <p>Periode: ${new Date().toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</p>
    </div>

    <div class="summary">
        <div class="summary-card">
            <div class="summary-number">${summary.totalJobs}</div>
            <div class="summary-label">Total Pekerjaan</div>
        </div>
        <div class="summary-card">
            <div class="summary-number">${summary.completedJobs}</div>
            <div class="summary-label">Selesai</div>
        </div>
        <div class="summary-card">
            <div class="summary-number">${summary.totalJamFotografer}h</div>
            <div class="summary-label">Jam Fotografer</div>
        </div>
        <div class="summary-card">
            <div class="summary-number">${summary.totalJamEditor}h</div>
            <div class="summary-label">Jam Editor</div>
        </div>
        <div class="summary-card">
            <div class="summary-number">${summary.rataRataJamPerJob}h</div>
            <div class="summary-label">Rata-rata Jam/Job</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Jam</th>
                <th>Tim</th>
                <th>Fotografer</th>
                <th>Editor</th>
                <th>Lapangan</th>
                <th>Status</th>
                <th>Jam Fotografer</th>
                <th>Jam Editor</th>
                <th>Total Jam</th>
            </tr>
        </thead>
        <tbody>
            ${filteredData.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${formatDate(item.tanggal)}</td>
                    <td>${item.jamMulai} - ${item.jamSelesai}</td>
                    <td>${item.namaTim}</td>
                    <td>${item.fotografer}</td>
                    <td>${item.editor}</td>
                    <td>${item.lapangan}</td>
                    <td>
                        <span class="status-${item.status === 'completed' ? 'completed' : 'progress'}">
                            ${item.status === 'completed' ? 'Selesai' : item.status === 'in_progress' ? 'Proses' : 'Pending'}
                        </span>
                    </td>
                    <td>${item.jamFotografer}h</td>
                    <td>${item.jamEditor}h</td>
                    <td>${item.totalJam}h</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="footer">
        <p>Total Jam Fotografer: ${summary.totalJamFotografer} jam | Total Jam Editor: ${summary.totalJamEditor} jam</p>
        <p>Laporan dihasilkan pada: ${new Date().toLocaleString('id-ID')}</p>
    </div>
</body>
</html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
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
      window.location.href = '/login';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Selesai
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            Proses
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            Pending
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="text-2xl font-bold text-blue-600">{summary.totalJobs}</div>
                <div className="text-sm text-gray-600">Total Pekerjaan</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="text-2xl font-bold text-green-600">{summary.completedJobs}</div>
                <div className="text-sm text-gray-600">Selesai</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="text-2xl font-bold text-purple-600">{summary.totalJamFotografer}</div>
                <div className="text-sm text-gray-600">Jam Fotografer</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="text-2xl font-bold text-orange-600">{summary.totalJamEditor}</div>
                <div className="text-sm text-gray-600">Jam Editor</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="text-2xl font-bold text-indigo-600">{summary.rataRataJamPerJob}</div>
                <div className="text-sm text-gray-600">Rata-rata Jam/Job</div>
              </div>
            </div>

            {/* Filters and Actions */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                {/* Search */}
                <div className="relative w-full sm:w-80">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari tim, fotografer, editor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="all">Semua Status</option>
                    <option value="completed">Selesai</option>
                    <option value="in_progress">Proses</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Export Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors text-sm"
                >
                  <Download size={16} className="mr-2" />
                  Export CSV
                </button>
                <button
                  onClick={handleExportPDF}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors text-sm"
                >
                  <FileText size={16} className="mr-2" />
                  Export PDF
                </button>
                <button
                  onClick={handleAddSchedule}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors text-sm"
                >
                  <Calendar size={16} className="mr-2" />
                  Tambah Data Schedule
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-16">No</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tanggal</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Jam Mulai</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Jam Selesai</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nama Tim</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Fotografer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Editor</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Lapangan</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Total Jam</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Jam Fotografer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Jam Editor</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="13" className="px-6 py-12 text-center text-gray-500">
                        {searchTerm || filterStatus !== 'all' ? 'Tidak ada data yang ditemukan' : 'Belum ada data laporan'}
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, index) => (
                      <tr key={item.id} className="border-t hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{formatDate(item.tanggal)}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{item.jamMulai}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{item.jamSelesai}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.namaTim}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{item.fotografer}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{item.editor}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{item.lapangan}</td>
                        <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div className="flex items-center">
                            <Clock size={14} className="mr-1 text-gray-400" />
                            {item.totalJam}h
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div className="flex items-center">
                            <Clock size={14} className="mr-1 text-purple-400" />
                            {item.jamFotografer}h
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div className="flex items-center">
                            <Clock size={14} className="mr-1 text-orange-400" />
                            {item.jamEditor}h
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleShowDetail(item)}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

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
    </>
  );
};

export default Laporan;
