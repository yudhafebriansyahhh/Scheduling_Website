import React from 'react';
import { Search, Download, FileText, Plus  } from 'lucide-react';

const Filters = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  handleExportCSV,
  handleTambahData,
  handleExportPDF,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cari tim, fotografer, editor..."
            className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Semua Status</option>
          <option value="completed">Selesai</option>
          <option value="pending">Pending</option>
          <option value="in_progress">Dalam Proses</option>
        </select>
      </div>

      <div className="flex space-x-2">

        <button
          onClick={handleTambahData}
          className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          <Plus  size={16} />
          <span>Tambah Schedule</span>
        </button>
        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          <Download size={16} />
          <span>Export CSV</span>
        </button>
        <button
          onClick={handleExportPDF}
          className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          <FileText size={16} />
          <span>Export PDF</span>
        </button>
      </div>
    </div>
  );
};

export default Filters;
