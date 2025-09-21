import React from 'react';
import { Search } from 'lucide-react';

const LaporanFilters = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterRole,
  setFilterRole
}) => {
  // Dynamic placeholder text based on filterRole
  const getSearchPlaceholder = () => {
    if (filterRole === 'fotografer') {
      return "Cari tim, fotografer, lapangan...";
    } else if (filterRole === 'editor') {
      return "Cari tim, editor, lapangan...";
    }
    return "Cari tim, fotografer, editor, lapangan...";
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-6">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder={getSearchPlaceholder()}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Role Filter */}
      <div className="relative">
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="w-full lg:w-48 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Semua Role</option>
          <option value="fotografer">Fotografer</option>
          <option value="editor">Editor</option>
        </select>
      </div>

      {/* Status Filter */}
      <div className="relative">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full lg:w-48 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>
  );
};

export default LaporanFilters;
