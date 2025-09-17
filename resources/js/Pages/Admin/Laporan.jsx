import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Sidebar from '@/Components/Sidebar';
import SummaryCards from '@/Components/Laporan/SummaryCards';
import Filters from '@/Components/Laporan/Filters';
import LaporanTable from '@/Components/Laporan/LaporanTable';
import DetailModal from '@/Components/Laporan/DetailModal';

const Laporan = ({ laporanData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filter data
  const filteredData = laporanData.filter((item) => {
    const matchSearch =
      item.namaTim?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fotografer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.editor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lapangan?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      filterStatus === 'all' || item.status === filterStatus;

    return matchSearch && matchStatus;
  });

  // Summary
  const summary = {
    totalJobs: filteredData.length,
    completedJobs: filteredData.filter((item) => item.status === 'completed')
      .length,
    totalJamFotografer: filteredData.reduce(
      (sum, item) => sum + item.jamFotografer,
      0
    ),
    totalJamEditor: filteredData.reduce(
      (sum, item) => sum + item.jamEditor,
      0
    ),
    rataRataJamPerJob:
      filteredData.length > 0
        ? (
            filteredData.reduce((sum, item) => sum + item.totalJam, 0) /
            filteredData.length
          ).toFixed(1)
        : 0,
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Tanggal',
      'Jam Mulai',
      'Jam Selesai',
      'Tim',
      'Fotografer',
      'Editor',
      'Lapangan',
      'Status',
      'Jam Fotografer',
      'Jam Editor',
      'Catatan',
    ];

    const rows = filteredData.map((item) => [
      formatDate(item.tanggal),
      item.jamMulai,
      item.jamSelesai,
      item.namaTim,
      item.fotografer,
      item.editor,
      item.lapangan,
      item.status,
      item.jamFotografer,
      item.jamEditor,
      item.catatan,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'laporan.csv';
    a.click();
  };

  return (
    <>
      <Head title="Laporan" />
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar 
          currentRoute="laporan"
         />

        {/* Main content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center mb-8">
            <button
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={() => window.history.back()}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold ml-4">Laporan Pekerjaan</h1>
          </div>

          {/* Summary cards */}
          <SummaryCards summary={summary} />

          {/* Filters */}
          <Filters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            handleExportCSV={handleExportCSV}
            handleExportPDF={() => window.print()}
          />

          {/* Table */}
          <LaporanTable
            data={filteredData}
            formatDate={formatDate}
            handleShowDetail={(item) => {
              setSelectedDetail(item);
              setShowDetailModal(true);
            }}
          />

          {/* Modal Detail */}
          <DetailModal
            show={showDetailModal}
            detail={selectedDetail}
            onClose={() => setShowDetailModal(false)}
            formatDate={formatDate}
          />
        </main>
      </div>
    </>
  );
};

export default Laporan;
