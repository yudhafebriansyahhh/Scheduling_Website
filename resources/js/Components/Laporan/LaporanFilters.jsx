import React from 'react';
import { Search, Filter } from 'lucide-react';

const LaporanFilters = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus
}) => {
  return (
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
  );
};

export default LaporanFilters;
