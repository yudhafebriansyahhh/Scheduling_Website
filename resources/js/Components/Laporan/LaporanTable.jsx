import React from 'react';
import { Clock } from 'lucide-react';
import { Link } from '@inertiajs/react';

const LaporanTable = ({
  filteredData,
  onShowDetail,
  searchTerm,
  filterStatus,
  filterRole,
}) => {
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

  function formatHours(value) {
    const num = Number(value) || 0; // pastikan number, kalau null/string kosong jadi 0
    return Number.isInteger(num) ? num : num.toFixed(1);
  }

  // Calculate colspan for empty state
  const calculateColspan = () => {
    let baseColumns = 6; // No, Tanggal, Jam Mulai, Jam Selesai, Nama Event, Status, Aksi

    if (filterRole === 'all') {
      baseColumns += 4; // Fotografer, Editor, Jam Fotografer, Jam Editor
    } else if (filterRole === 'fotografer') {
      baseColumns += 2; // Fotografer, Jam Fotografer
    } else if (filterRole === 'editor') {
      baseColumns += 2; // Editor, Jam Editor
    }

    baseColumns += 1; // Lapangan (always shown)

    return baseColumns;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-16">No</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tanggal</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Jam Mulai</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Jam Selesai</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nama Event</th>

              {/* Conditional headers based on filterRole */}
              {(filterRole === 'all' || filterRole === 'fotografer') && (
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Fotografer</th>
              )}

              {(filterRole === 'all' || filterRole === 'editor') && (
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Editor</th>
              )}

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Lapangan</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>

              {(filterRole === 'all' || filterRole === 'fotografer') && (
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Jam Fotografer</th>
              )}

              {(filterRole === 'all' || filterRole === 'editor') && (
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Jam Editor</th>
              )}

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={calculateColspan()} className="px-6 py-12 text-center text-gray-500">
                  {searchTerm || filterStatus !== 'all'
                    ? 'Tidak ada data yang ditemukan'
                    : 'Belum ada data laporan'}
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{formatDate(item.tanggal)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {item.jamMulai ? item.jamMulai.slice(0, 5) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {item.jamSelesai ? item.jamSelesai.slice(0, 5) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.namaTim}</td>

                  {/* Conditional columns based on filterRole */}
                  {(filterRole === 'all' || filterRole === 'fotografer') && (
                    <td className="px-6 py-4 text-sm text-gray-700">{item.fotografer?.nama || '-'}</td>
                  )}

                  {(filterRole === 'all' || filterRole === 'editor') && (
                    <td className="px-6 py-4 text-sm text-gray-700">{item.editor?.nama || '-'}</td>
                  )}

                  <td className="px-6 py-4 text-sm text-gray-700">{item.lapangan}</td>
                  <td className="px-6 py-4">{getStatusBadge(item.status)}</td>

                  {(filterRole === 'all' || filterRole === 'fotografer') && (
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1 text-purple-400" />
                        {formatHours(item.jamFotografer)}h
                      </div>
                    </td>
                  )}

                  {(filterRole === 'all' || filterRole === 'editor') && (
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1 text-orange-400" />
                        {formatHours(item.jamEditor)}h
                      </div>
                    </td>
                  )}

                  <td className="px-6 py-4">
                    <button
                      onClick={() => onShowDetail(item)}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                    >
                      Detail
                    </button>

                    <Link
                      href={route('schedule.edit', item.id)}
                      className="px-3 py-1 mx-3 bg-yellow-400 text-white rounded text-xs font-medium hover:bg-yellow-500 transition-colors"
                    >
                      Edit
                    </Link>

                    <Link
                      href={route('schedule.destroy', item.id)}
                      method="delete"
                      as="button"
                      className="px-3 py-1 mx-3 bg-red-400 text-white rounded text-xs font-medium hover:bg-red-500 transition-colors"
                      onClick={(e) => {
                        if (!confirm("Yakin hapus schedule ini?")) {
                          e.preventDefault();
                        }
                      }}
                    >
                      Hapus
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LaporanTable;
