import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { ArrowLeft, Search, Plus, Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import Sidebar from '../../Components/Sidebar';
import Swal from 'sweetalert2';

const KelolaLapangan = ({ lapangans: initialLapangans }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLapangan, setEditingLapangan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const { flash } = usePage().props;

  const [formData, setFormData] = useState({
    nama_lapangan: ''
  });

  // Data dari server
  const [lapangans, setLapangans] = useState(initialLapangans || []);

  // SweetAlert2 untuk flash messages
  useEffect(() => {
    if (flash?.success) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: flash.success,
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }

    if (flash?.error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: flash.error,
        confirmButtonText: 'OK'
      });
    }
  }, [flash]);

  // Update lapangans when props change
  useEffect(() => {
    setLapangans(initialLapangans || []);
  }, [initialLapangans]);

  // Filter dan sort pencarian
  const filteredLapangans = lapangans
    .filter(lapangan =>
      lapangan.nama_lapangan.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const nameA = a.nama_lapangan.toLowerCase();
      const nameB = b.nama_lapangan.toLowerCase();

      if (sortOrder === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });

  // Function untuk toggle sorting
  const handleSort = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };

  // Pagination logic
  const totalItems = filteredLapangans.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLapangans = filteredLapangans.slice(startIndex, endIndex);

  // Reset pagination when filters or items per page change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
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
          onClick={() => handlePageChange(i)}
          disabled={isLoading}
          className={`px-3 py-2 text-sm font-medium border-t border-b border-r border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed ${
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
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
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

  const handleBack = () => {
    window.history.back();
  };

  const handleAddLapangan = () => {
    setFormData({
      nama_lapangan: ''
    });
    setEditingLapangan(null);
    setShowAddModal(true);
  };

  const handleEditLapangan = (lapangan) => {
    setEditingLapangan(lapangan);
    setFormData({
      nama_lapangan: lapangan.nama_lapangan
    });
    setShowEditModal(true);
  };

  const handleDeleteLapangan = async (lapangan) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      html: `Anda akan menghapus lapangan:<br><strong>${lapangan.nama_lapangan}</strong>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      // Show loading
      Swal.fire({
        title: 'Menghapus...',
        text: 'Mohon tunggu sebentar',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      setIsLoading(true);

      router.delete(`/lapangan/${lapangan.id}`, {
        onSuccess: () => {
          setLapangans(lapangans.filter(l => l.id !== lapangan.id));
          setIsLoading(false);

          Swal.fire({
            icon: 'success',
            title: 'Berhasil Dihapus!',
            text: `Lapangan ${lapangan.nama_lapangan} telah dihapus`,
            timer: 3000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        },
        onError: (errors) => {
          setIsLoading(false);
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus!',
            text: 'Terjadi kesalahan saat menghapus lapangan',
            confirmButtonText: 'OK'
          });
        }
      });
    }
  };

  // Handle submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validasi form
    if (!formData.nama_lapangan.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Nama lapangan harus diisi!',
        confirmButtonText: 'OK'
      });
      return;
    }

    setIsLoading(true);

    const payload = {
      nama_lapangan: formData.nama_lapangan.trim()
    };

    if (editingLapangan) {
      // Update lapangan
      router.put(`/lapangan/${editingLapangan.id}`, payload, {
        onSuccess: (page) => {
          // Update state dengan data terbaru dari server
          const updatedLapangans = lapangans.map(lapangan =>
            lapangan.id === editingLapangan.id
              ? { ...lapangan, ...payload }
              : lapangan
          );
          setLapangans(updatedLapangans);

          setShowEditModal(false);
          setEditingLapangan(null);
          resetForm();
          setIsLoading(false);

          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Data lapangan berhasil diupdate',
            timer: 3000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        },
        onError: (errors) => {
          console.error('Update error:', errors);
          setIsLoading(false);

          let errorMessage = 'Terjadi kesalahan saat mengupdate data';
          if (errors.nama_lapangan) {
            errorMessage = errors.nama_lapangan[0];
          }

          Swal.fire({
            icon: 'error',
            title: 'Gagal Update!',
            text: errorMessage,
            confirmButtonText: 'OK'
          });
        }
      });
    } else {
      // Tambah lapangan baru
      router.post('/lapangan', payload, {
        onSuccess: (page) => {
          setShowAddModal(false);
          resetForm();
          setIsLoading(false);

          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Lapangan baru berhasil ditambahkan',
            timer: 3000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          }).then(() => {
            window.location.reload();
          });
        },
        onError: (errors) => {
          console.error('Create error:', errors);
          setIsLoading(false);

          let errorMessage = 'Terjadi kesalahan saat menambah data';
          if (errors.nama_lapangan) {
            errorMessage = errors.nama_lapangan[0];
          }

          Swal.fire({
            icon: 'error',
            title: 'Gagal Menambah!',
            text: errorMessage,
            confirmButtonText: 'OK'
          });
        }
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nama_lapangan: ''
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingLapangan(null);
    resetForm();
  };

  return (
    <>
      <Head title="Kelola Lapangan" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-300">
        <Sidebar currentRoute="lapangan" />

        <div className="flex-1 p-6">
          {/* Loading overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Memproses...</p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center mb-4">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                disabled={isLoading}
              >
                <ArrowLeft size={20} className="mr-2" />
                Back
              </button>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Kelola Data Lapangan</h1>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Cari Lapangan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-80 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    disabled={isLoading}
                  />
                </div>

                {/* Items per page selector */}
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

              <button
                onClick={handleAddLapangan}
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors disabled:opacity-50 flex-shrink-0"
                disabled={isLoading}
              >
                <Plus size={16} className="mr-2" />
                Tambah Data Lapangan
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 w-16">No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <button
                      onClick={handleSort}
                      className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      disabled={isLoading}
                    >
                      <span>Nama Lapangan</span>
                      {sortOrder === 'asc' ? (
                        <ChevronUp size={16} className="text-blue-500" />
                      ) : (
                        <ChevronDown size={16} className="text-blue-500" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 w-32">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLapangans.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'Tidak ada lapangan yang ditemukan' : 'Belum ada data lapangan'}
                    </td>
                  </tr>
                ) : (
                  paginatedLapangans.map((lapangan, index) => (
                    <tr key={lapangan.id} className="border-t dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{startIndex + index + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{lapangan.nama_lapangan}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditLapangan(lapangan)}
                            className="p-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors disabled:opacity-50"
                            disabled={isLoading}
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteLapangan(lapangan)}
                            className="p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors disabled:opacity-50"
                            disabled={isLoading}
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

          {/* Pagination and Info */}
          {totalItems > 0 && (
            <div className="mt-6">
              {/* Pagination */}
              {renderPagination()}

              {/* Page Info */}
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400 gap-2">
                <div>
                  Menampilkan {startIndex + 1}-{Math.min(endIndex, totalItems)} dari {totalItems} lapangan
                  {lapangans.length !== totalItems && ` (difilter dari ${lapangans.length} total)`}
                </div>
                <div className="flex items-center space-x-2">
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                      disabled={isLoading}
                    >
                      Reset pencarian
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Add */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Tambah Lapangan Baru
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Lapangan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nama_lapangan}
                    onChange={(e) => setFormData({ ...formData, nama_lapangan: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Masukkan nama lapangan"
                    required
                    autoFocus
                    disabled={isLoading}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    disabled={isLoading}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Edit */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Edit Lapangan
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Lapangan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nama_lapangan}
                    onChange={(e) => setFormData({ ...formData, nama_lapangan: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Masukkan nama lapangan"
                    required
                    autoFocus
                    disabled={isLoading}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    disabled={isLoading}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Mengupdate...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default KelolaLapangan;
