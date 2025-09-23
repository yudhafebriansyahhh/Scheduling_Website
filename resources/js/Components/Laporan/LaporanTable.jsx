import React from 'react';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileText } from 'lucide-react';
import { router } from '@inertiajs/react';

const LaporanTable = ({
  filteredData,
  onShowDetail,
  filterRole,
  currentPage,
  itemsPerPage,
  onPageChange
}) => {
  // Pagination calculation
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Handler functions seperti di ScheduleTable
  const handleEdit = (item) => {
    router.visit(`/schedule/${item.id}/edit`);
  };

  const handleDelete = (item) => {
    if (confirm("Yakin hapus schedule ini?")) {
      router.delete(`/schedule/${item.id}`);
    }
  };

  // Format jam untuk display
  const formatJam = (jam) => {
    if (!jam) return '-';
    const numJam = parseFloat(jam);
    return numJam % 1 === 0 ? parseInt(numJam).toString() : jam.toString().replace('.', ',');
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

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
      switch (status) {
        case 'pending':
          return {
            text: 'Menunggu',
            bg: 'bg-yellow-100 dark:bg-yellow-900',
            text_color: 'text-yellow-800 dark:text-yellow-200'
          };
        case 'in_progress':
          return {
            text: 'Berlangsung',
            bg: 'bg-blue-100 dark:bg-blue-900',
            text_color: 'text-blue-800 dark:text-blue-200'
          };
        case 'completed':
          return {
            text: 'Selesai',
            bg: 'bg-green-100 dark:bg-green-900',
            text_color: 'text-green-800 dark:text-green-200'
          };
        default:
          return {
            text: 'Unknown',
            bg: 'bg-gray-100 dark:bg-gray-700',
            text_color: 'text-gray-800 dark:text-gray-200'
          };
      }
    };

    const config = getStatusConfig(status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text_color}`}>
        {config.text}
      </span>
    );
  };

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Sebelumnya
      </button>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-2 text-sm font-medium border-t border-b border-r border-gray-300 dark:border-gray-600 ${
            currentPage === i
              ? 'bg-blue-50 text-blue-600 border-blue-500 dark:bg-blue-900/20 dark:text-blue-300'
              : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Selanjutnya
      </button>
    );

    return (
      <div className="flex items-center justify-center mt-6">
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          {pages}
        </nav>
      </div>
    );
  };

  // Table headers based on filterRole - DIPERBAIKI
  const getTableHeaders = () => {
    const baseHeaders = ['No', 'Info Event', 'Waktu'];

    if (filterRole === 'fotografer') {
      return [...baseHeaders, 'Fotografer', 'Status', 'Aksi'];
    } else if (filterRole === 'editor') {
      // PERUBAHAN: Header untuk filter editor
      return [...baseHeaders, 'Editor Utama', 'Assistant', 'Status', 'Aksi'];
    } else if (filterRole === 'assist') {
      return [...baseHeaders, 'Fotografer Utama', 'Assistant', 'Status', 'Aksi'];
    } else if (filterRole === 'editorAssist') {
      // PERUBAHAN: Header untuk filter editorAssist
      return [...baseHeaders, 'Editor Utama', 'Assistant', 'Status', 'Aksi'];
    } else {
      // Role 'all'
      return [...baseHeaders, 'Fotografer', 'Editor', 'Status', 'Aksi'];
    }
  };

  // Empty state
  if (paginatedData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Tidak ada data</h3>
        <p className="text-gray-500 dark:text-gray-400">Tidak ada laporan yang sesuai dengan filter yang dipilih.</p>
      </div>
    );
  }

  const headers = getTableHeaders();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className={`px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                      header === 'Aksi' ? 'text-center' : ''
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedData.map((item, index) => (
                <tr
                  key={`${item.id}-${item.isAssistRow ? `assist-${item.currentAssist?.id}` : item.isEditorAssistRow ? `editor-assist-${item.currentEditorAssist?.id}` : 'main'}-${index}`}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {/* No */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {startIndex + index + 1}
                  </td>

                  {/* Info Event */}
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

                  {/* Waktu */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      <div>{item.jamMulai ? item.jamMulai.slice(0, 5) : '-'} - {item.jamSelesai ? item.jamSelesai.slice(0, 5) : '-'}</div>
                    </div>
                  </td>

                  {/* Fotografer - for fotografer role or all */}
                  {(filterRole === 'fotografer' || filterRole === 'all') && (
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {item.fotografer?.nama || '-'}
                        </div>
                        <div className="text-purple-600 dark:text-purple-400 text-xs">
                          {formatHours(item.jamFotografer)} jam
                        </div>
                      </div>
                    </td>
                  )}

                  {/* Editor - for editor role or all */}
                  {(filterRole === 'all') && (
                    <td className="px-6 py-4">
                      {item.editor?.nama ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {item.editor.nama}
                          </div>
                          <div className="text-orange-600 dark:text-orange-400 text-xs">
                            {formatHours(item.jamEditor)} jam
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          -
                        </div>
                      )}
                    </td>
                  )}

                  {/* PERUBAHAN: Editor Utama - for editor role */}
                  {filterRole === 'editor' && (
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {item.mainEditor?.nama || item.editor?.nama || '-'}
                        </div>
                      </div>
                    </td>
                  )}

                  {/* PERUBAHAN: Assistant Editor - for editor role */}
                  {filterRole === 'editor' && (
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {item.assistEditor?.nama || '-'}
                        </div>
                        <div className="text-purple-600 dark:text-purple-400 text-xs">
                          {formatHours(item.jamAssist)} jam
                        </div>
                      </div>
                    </td>
                  )}

                  {/* Fotografer Utama - for assist role */}
                  {filterRole === 'assist' && (
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {item.mainFotografer?.nama || item.fotografer?.nama || '-'}
                        </div>
                      </div>
                    </td>
                  )}

                  {/* Assistant Fotografer - for assist role */}
                  {filterRole === 'assist' && (
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {item.assistFotografer?.nama || '-'}
                        </div>
                        <div className="text-blue-600 dark:text-blue-400 text-xs">
                          {formatHours(item.jamAssist)} jam
                        </div>
                      </div>
                    </td>
                  )}

                  {/* PERUBAHAN: Editor Utama - for editorAssist role */}
                  {filterRole === 'editorAssist' && (
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {item.mainEditor?.nama || item.editor?.nama || '-'}
                        </div>
                      </div>
                    </td>
                  )}

                  {/* PERUBAHAN: Assistant Editor - for editorAssist role */}
                  {filterRole === 'editorAssist' && (
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {item.assistEditor?.nama || '-'}
                        </div>
                        <div className="text-purple-600 dark:text-purple-400 text-xs">
                          {formatHours(item.jamAssist)} jam
                        </div>
                      </div>
                    </td>
                  )}

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={item.status} />
                  </td>

                  {/* Aksi */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => onShowDetail(item)}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Detail"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards - PERUBAHAN JUGA DI SINI */}
        <div className="lg:hidden space-y-4 p-4">
          {paginatedData.map((item, index) => (
            <div key={`${item.id}-mobile-${index}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    #{startIndex + index + 1} {item.namaEvent}
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

              {(filterRole === 'all') && item.editor && (
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

              {/* PERUBAHAN: Mobile view untuk editor filter */}
              {filterRole === 'editor' && (
                <>
                  <div className="flex justify-between items-center py-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Editor Utama:</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {item.mainEditor?.nama || item.editor?.nama || '-'}
                      </div>
                    </div>
                  </div>
                  {item.assistEditor?.nama && (
                    <div className="flex justify-between items-center py-2 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Assistant Editor:</span>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.assistEditor.nama}
                        </div>
                        <div className="text-xs text-purple-600 dark:text-purple-400">
                          {formatHours(item.jamAssist)}h
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {filterRole === 'assist' && (
                <>
                  {(item.mainFotografer?.nama || item.fotografer?.nama) && (
                    <div className="flex justify-between items-center py-2 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Fotografer Utama:</span>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.mainFotografer?.nama || item.fotografer?.nama}
                        </div>
                      </div>
                    </div>
                  )}
                  {item.assistFotografer?.nama && (
                    <div className="flex justify-between items-center py-2 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Assistant:</span>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.assistFotografer.nama}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          {formatHours(item.jamAssist)}h
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* PERUBAHAN: Mobile view untuk editorAssist filter */}
              {filterRole === 'editorAssist' && (
                <>
                  <div className="flex justify-between items-center py-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Editor Utama:</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {item.mainEditor?.nama || item.editor?.nama || '-'}
                      </div>
                    </div>
                  </div>
                  {item.assistEditor?.nama && (
                    <div className="flex justify-between items-center py-2 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Assistant Editor:</span>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.assistEditor.nama}
                        </div>
                        <div className="text-xs text-purple-600 dark:text-purple-400">
                          {formatHours(item.jamAssist)}h
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => onShowDetail(item)}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  <Eye className="h-3 w-3" />
                  Detail
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-md hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {renderPagination()}

      {/* Page Info */}
      {filteredData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 dark:text-gray-400 gap-2">
          <div>
            Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredData.length)} dari {filteredData.length} laporan
          </div>
        </div>
      )}
    </div>
  );
};

export default LaporanTable;
