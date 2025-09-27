import React from 'react';
import { Search, Calendar, X } from 'lucide-react';
import CustomDateInput from "../CustomDateInput";

const LaporanFilters = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterRole,
  setFilterRole,
  filterDateFrom,
  setFilterDateFrom,
  filterDateTo,
  setFilterDateTo,
  itemsPerPage,
  setItemsPerPage,
  filteredCount,
  totalCount,
  isLoading = false
}) => {
  // Dynamic placeholder text based on filterRole
  const getSearchPlaceholder = () => {
    if (filterRole === 'fotografer') {
      return "Cari tim, fotografer, lapangan...";
    } else if (filterRole === 'editor') {
      return "Cari tim, editor utama, assistant editor, lapangan...";
    } else if (filterRole === 'assist') {
      return "Cari tim, assistant fotografer, lapangan...";
    } else if (filterRole === 'editorAssist') {
      return "Cari tim, assistant editor, lapangan...";
    }
    return "Cari tim, fotografer, editor, lapangan...";
  };

  // Reset semua filter
  const resetAllFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterRole('all');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  // Reset hanya filter tanggal
  const resetDateFilters = () => {
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  // Cek apakah ada filter aktif
  const hasActiveFilters = searchTerm || filterStatus !== 'all' || filterRole !== 'all' || filterDateFrom || filterDateTo;
  const hasDateFilters = filterDateFrom || filterDateTo;

  return (
    <div className="space-y-4 mb-6">
      {/* Filter Controls */}
      <div className="space-y-4">
        {/* Row 1: Search, Role, Status */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={getSearchPlaceholder()}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                disabled={isLoading}
                className="w-full lg:w-48 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Semua Role</option>
                <option value="fotografer">Fotografer</option>
                <option value="editor">Editor</option>
                <option value="assist">Assistant Fotografer</option>
                <option value="editorAssist">Assistant Editor</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                disabled={isLoading}
                className="w-full lg:w-48 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">Proses</option>
                <option value="completed">Selesai</option>
              </select>
            </div>
          </div>

          {/* Pagination Control */}
          <div className="flex items-center space-x-2 whitespace-nowrap">
            <span className="text-sm text-gray-700 dark:text-gray-300">Tampilkan:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              disabled={isLoading}
              className="px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm min-w-[70px] appearance-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-700 dark:text-gray-300">per halaman</span>
          </div>
        </div>

        {/* Row 2: Date Filters - Horizontal Layout */}
        <div className="flex flex-wrap items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter Tanggal:</span>
          </div>

          {/* Date From */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Dari:</label>
            <div className="w-40">
              <CustomDateInput
                value={filterDateFrom}
                onChange={(date) => setFilterDateFrom(date)}
                placeholder="Pilih tanggal"
                disabled={isLoading}
                compact={true}
              />
            </div>
          </div>

          {/* Date To */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Sampai:</label>
            <div className="w-40">
              <CustomDateInput
                value={filterDateTo}
                onChange={(date) => setFilterDateTo(date)}
                placeholder="Pilih tanggal"
                disabled={isLoading}
                compact={true}
              />
            </div>
          </div>

          {/* Clear Date Filters */}
          {hasDateFilters && (
            <button
              onClick={resetDateFilters}
              disabled={isLoading}
              className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 rounded ml-2"
              title="Hapus filter tanggal"
            >
              <X className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Filter Info */}
      {hasActiveFilters && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-700 dark:text-blue-300">
            Menampilkan {filteredCount} dari {totalCount} laporan
            {filteredCount !== totalCount && ' (difilter)'}
            {hasDateFilters && (
              <span className="block sm:inline sm:ml-2 mt-1 sm:mt-0">
                {filterDateFrom && filterDateTo
                  ? `Periode: ${new Date(filterDateFrom).toLocaleDateString('id-ID')} - ${new Date(filterDateTo).toLocaleDateString('id-ID')}`
                  : filterDateFrom
                    ? `Dari: ${new Date(filterDateFrom).toLocaleDateString('id-ID')}`
                    : filterDateTo
                      ? `Sampai: ${new Date(filterDateTo).toLocaleDateString('id-ID')}`
                      : ''
                }
              </span>
            )}
          </div>
          <button
            onClick={resetAllFilters}
            disabled={isLoading}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium disabled:opacity-50 whitespace-nowrap"
          >
            Reset Semua Filter
          </button>
        </div>
      )}
    </div>
  );
};

export default LaporanFilters;
