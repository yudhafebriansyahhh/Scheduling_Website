import React from 'react';
import { Eye, Edit, Trash2, FileText } from 'lucide-react';
import { Link } from '@inertiajs/react';

const LaporanTable = ({
  filteredData,
  onShowDetail,
  filterRole,
}) => {
  // Status Badge Component
  const StatusBadge = ({ status }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'completed':
          return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
        case 'pending':
          return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
        case 'in_progress':
          return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
        case 'cancelled':
          return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
        default:
          return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case 'completed':
          return 'Selesai';
        case 'pending':
          return 'Pending';
        case 'in_progress':
          return 'Proses';
        case 'cancelled':
          return 'Dibatalkan';
        default:
          return status;
      }
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
        {getStatusText(status)}
      </span>
    );
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
    const num = Number(value) || 0;
    return Number.isInteger(num) ? num : num.toFixed(1);
  }

  // Empty state
  if (filteredData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Tidak ada data</h3>
        <p className="text-gray-500 dark:text-gray-400">Tidak ada laporan yang sesuai dengan filter Anda.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                No
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Info Event
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Waktu
              </th>
              {(filterRole === 'all' || filterRole === 'fotografer') && (
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fotografer
                </th>
              )}
              {(filterRole === 'all' || filterRole === 'editor') && (
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Editor
                </th>
              )}
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredData.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {index + 1}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {item.namaEvent}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">
                      {formatDate(item.tanggal)} • {item.lapangan}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    <div>{item.jamMulai ? item.jamMulai.slice(0, 5) : '-'} - {item.jamSelesai ? item.jamSelesai.slice(0, 5) : '-'}</div>
                  </div>
                </td>
                {(filterRole === 'all' || filterRole === 'fotografer') && (
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {item.fotografer?.nama || '-'}
                      </div>
                      <div className="text-purple-600 dark:text-purple-400 text-xs">
                        {formatHours(item.jamFotografer)}h
                      </div>
                    </div>
                  </td>
                )}
                {(filterRole === 'all' || filterRole === 'editor') && (
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {item.editor?.nama || '-'}
                      </div>
                      <div className="text-orange-600 dark:text-orange-400 text-xs">
                        {formatHours(item.jamEditor)}h
                      </div>
                    </div>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onShowDetail(item)}
                      className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Detail"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <Link
                      href={route('schedule.edit', item.id)}
                      className="p-1 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <Link
                      href={route('schedule.destroy', item.id)}
                      method="delete"
                      as="button"
                      className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      title="Hapus"
                      onClick={(e) => {
                        if (!confirm("Yakin hapus schedule ini?")) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 p-4">
        {filteredData.map((item, index) => (
          <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  #{index + 1} {item.namaEvent}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(item.tanggal)} • {item.lapangan}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {item.jamMulai ? item.jamMulai.slice(0, 5) : '-'} - {item.jamSelesai ? item.jamSelesai.slice(0, 5) : '-'}
                </p>
              </div>
              <StatusBadge status={item.status} />
            </div>

            {(filterRole === 'all' || filterRole === 'fotografer') && item.fotografer && (
              <div className="flex justify-between items-center py-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Fotografer:</span>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.fotografer.nama}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">
                    {formatHours(item.jamFotografer)}h
                  </div>
                </div>
              </div>
            )}

            {(filterRole === 'all' || filterRole === 'editor') && item.editor && (
              <div className="flex justify-between items-center py-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Editor:</span>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.editor.nama}
                  </div>
                  <div className="text-xs text-orange-600 dark:text-orange-400">
                    {formatHours(item.jamEditor)}h
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => onShowDetail(item)}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                <Eye className="h-3 w-3" />
                Detail
              </button>
              <Link
                href={route('schedule.edit', item.id)}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-md hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
              >
                <Edit className="h-3 w-3" />
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LaporanTable;
