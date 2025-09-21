import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Search, Filter } from 'lucide-react';

const ScheduleTable = ({ schedules = [], onAdd, onEdit, onDelete, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('all');
  const [sortField, setSortField] = useState('jam');
  const [sortDirection, setSortDirection] = useState('asc');


  const data = schedules || [];

  // Filter and search logic
  const filteredData = data.filter(item => {
    const searchMatch = searchTerm === '' ||
      Object.values(item).some(value =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

    const filterMatch = filterField === 'all' ||
      item[filterField]?.toLowerCase().includes(searchTerm.toLowerCase());

    return searchMatch && filterMatch;
  });

  // Sort logic
  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';

    if (sortDirection === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAdd = () => {
    if (onAdd) {
      onAdd();
    } else {
      alert('Fitur tambah jadwal akan segera tersedia!');
    }
  };

  const handleEdit = (schedule) => {
    if (onEdit) {
      onEdit(schedule);
    } else {
      alert(`Edit jadwal: ${schedule.namaTim}`);
    }
  };

  const handleDelete = (schedule) => {
    if (window.confirm(`Hapus jadwal ${schedule.namaTim}?`)) {
      if (onDelete) {
        onDelete(schedule.id);
      } else {
        alert(`Jadwal ${schedule.namaTim} dihapus!`);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status || 'Unknown'}
      </span>
    );
  };

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h4 className="text-lg font-semibold text-gray-900">Jadwal</h4>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari jadwal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterField}
              onChange={(e) => setFilterField(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="all">Semua</option>
              <option value="namaTim">Tim</option>
              <option value="fotografer">Fotografer</option>
              <option value="editor">Editor</option>
              <option value="lapangan">Lapangan</option>
            </select>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAdd}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm transition-colors whitespace-nowrap"
          >
            <Plus size={16} className="mr-2" />
            Tambah
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-4 px-4 font-semibold text-gray-700 w-16">No</th>
              <th
                className="text-left py-4 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('jam')}
              >
                <div className="flex items-center">
                  Jam
                  {sortField === 'jam' && (
                    <span className="ml-1 text-blue-500">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="text-left py-4 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('namaTim')}
              >
                <div className="flex items-center">
                  Nama Tim
                  {sortField === 'namaTim' && (
                    <span className="ml-1 text-blue-500">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="text-left py-4 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('fotografer')}
              >
                <div className="flex items-center">
                  Fotografer
                  {sortField === 'fotografer' && (
                    <span className="ml-1 text-blue-500">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="text-left py-4 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('editor')}
              >
                <div className="flex items-center">
                  Editor
                  {sortField === 'editor' && (
                    <span className="ml-1 text-blue-500">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="text-left py-4 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('lapangan')}
              >
                <div className="flex items-center">
                  Lapangan
                  {sortField === 'lapangan' && (
                    <span className="ml-1 text-blue-500">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-center py-4 px-4 font-semibold text-gray-700 w-32">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  {searchTerm ? 'Tidak ada jadwal yang ditemukan' : 'Belum ada jadwal'}
                </td>
              </tr>
            ) : (
              sortedData.map((schedule, index) => (
                <tr
                  key={schedule.id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4 text-gray-600">{index + 1}</td>
                  <td className="py-4 px-4 font-medium text-gray-900">{schedule.jam}</td>
                  <td className="py-4 px-4 text-gray-900">{schedule.namaTim}</td>
                  <td className="py-4 px-4 text-gray-700">{schedule.fotografer}</td>
                  <td className="py-4 px-4 text-gray-700">{schedule.editor}</td>
                  <td className="py-4 px-4 text-gray-700">{schedule.lapangan}</td>
                  <td className="py-4 px-4">{getStatusBadge(schedule.status)}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(schedule)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(schedule)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      {sortedData.length > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <div>
            Menampilkan {sortedData.length} dari {data.length} jadwal
          </div>
          <div className="flex items-center space-x-2">
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Reset pencarian
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleTable;
