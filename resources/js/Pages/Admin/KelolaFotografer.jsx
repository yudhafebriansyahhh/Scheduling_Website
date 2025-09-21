import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { ArrowLeft, Search, Plus } from 'lucide-react';
import Sidebar from '../../Components/Sidebar';
import FormModal from '../../Components/FormModal';

const KelolaFotografer = ({ fotografers: initialFotografers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFotografer, setEditingFotografer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { flash } = usePage().props;

  const [formData, setFormData] = useState({
    nama: '',
    alamat: '',
    no_hp: '',
    email: '',
    photoFile: null,
    photoPreview: null,
  });

  // Data dari server
  const [fotografers, setFotografers] = useState(initialFotografers || []);

  // Filter pencarian
  const filteredFotografers = fotografers.filter(fotografer =>
    fotografer.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fotografer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fotografer.no_hp.includes(searchTerm)
  );

  // Pagination logic
  const totalItems = filteredFotografers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFotografers = filteredFotografers.slice(startIndex, endIndex);

  // Reset pagination when filters or items per page change
  React.useEffect(() => {
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

  const handleAddFotografer = () => {
    setFormData({
      nama: '',
      alamat: '',
      no_hp: '',
      email: '',
      photoFile: null,
      photoPreview: null,
    });
    setEditingFotografer(null);
    setShowAddModal(true);
  };

  const handleEditFotografer = (fotografer) => {
    setEditingFotografer(fotografer);
    setFormData({
      nama: fotografer.nama,
      alamat: fotografer.alamat,
      no_hp: fotografer.no_hp,
      email: fotografer.email,
      photoFile: null,
      photoPreview: fotografer.photo ? `/storage/${fotografer.photo}` : null,
    });
    setShowEditModal(true);
  };

  const handleDeleteFotografer = (fotografer) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus fotografer ${fotografer.nama}?`)) {
      setIsLoading(true);
      router.delete(`/fotografer/${fotografer.id}`, {
        onSuccess: () => {
          setFotografers(fotografers.filter(p => p.id !== fotografer.id));
          setIsLoading(false);
        },
        onError: () => {
          setIsLoading(false);
        }
      });
    }
  };

  // Handle submit form
  const handleSubmit = () => {
    if (!formData.nama.trim()) {
      alert('Nama harus diisi!');
      return;
    }
    if (!formData.email.trim()) {
      alert('Email harus diisi!');
      return;
    }
    if (!formData.no_hp.trim()) {
      alert('No HP harus diisi!');
      return;
    }

    setIsLoading(true);

    const payload = new FormData();
    payload.append('nama', formData.nama.trim());
    payload.append('alamat', formData.alamat.trim());
    payload.append('no_hp', formData.no_hp.trim());
    payload.append('email', formData.email.trim());

    if (formData.photoFile) {
      payload.append('photo', formData.photoFile);
    }

    if (editingFotografer) {
      payload.append('_method', 'PUT');
      router.post(`/fotografer/${editingFotografer.id}`, payload, {
        forceFormData: true,
        onSuccess: (page) => {
          const updatedFotografers = fotografers.map(fotografer =>
            fotografer.id === editingFotografer.id
              ? { ...fotografer, ...formData, photo: page.props.flash?.photo || fotografer.photo }
              : fotografer
          );
          setFotografers(updatedFotografers);

          setShowEditModal(false);
          setEditingFotografer(null);
          resetForm();
          setIsLoading(false);
        },
        onError: (errors) => {
          console.error('Update error:', errors);
          alert('Terjadi kesalahan saat mengupdate data');
          setIsLoading(false);
        }
      });
    } else {
      router.post('/fotografer', payload, {
        forceFormData: true,
        onSuccess: () => {
          window.location.reload();
          setShowAddModal(false);
          resetForm();
          setIsLoading(false);
        },
        onError: (errors) => {
          console.error('Create error:', errors);
          alert('Terjadi kesalahan saat menambah data');
          setIsLoading(false);
        }
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nama: '',
      alamat: '',
      no_hp: '',
      email: '',
      photoFile: null,
      photoPreview: null,
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingFotografer(null);
    resetForm();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Harap pilih file gambar yang valid');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file terlalu besar. Maksimal 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photoFile: file,
          photoPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({
      ...prev,
      photoFile: null,
      photoPreview: editingFotografer?.photo ? `/storage/${editingFotografer.photo}` : null
    }));
    const fileInput = document.getElementById('photo-upload');
    if (fileInput) fileInput.value = '';
  };

  return (
    <>
      <Head title="Kelola Fotografer" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-300">
        <Sidebar currentRoute="fotografer" />

        <div className="flex-1 p-6">
          {/* Loading overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-40">
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

            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Kelola Data Fotografer</h1>

            {/* Flash message */}
            {flash?.success && (
              <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded-lg">
                {flash.success}
              </div>
            )}
            {flash?.error && (
              <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg">
                {flash.error}
              </div>
            )}

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Cari Fotografer..."
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
                onClick={handleAddFotografer}
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors disabled:opacity-50 flex-shrink-0"
                disabled={isLoading}
              >
                <Plus size={16} className="mr-2" />
                Tambah Data Fotografer
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 w-16">No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Photo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Nama</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Alamat</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">No HP</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedFotografers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'Tidak ada fotografer yang ditemukan' : 'Belum ada data fotografer'}
                    </td>
                  </tr>
                ) : (
                  paginatedFotografers.map((fotografer, index) => (
                    <tr key={fotografer.id} className="border-t dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{startIndex + index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          {fotografer.photo ? (
                            <img
                              src={`/storage/${fotografer.photo}`}
                              alt={fotografer.nama}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
                              <span className="text-xs text-gray-500 dark:text-gray-400">No Photo</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{fotografer.nama}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{fotografer.alamat}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{fotografer.no_hp}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{fotografer.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditFotografer(fotografer)}
                            className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 rounded text-xs font-medium hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors disabled:opacity-50"
                            disabled={isLoading}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteFotografer(fotografer)}
                            className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 rounded text-xs font-medium hover:bg-red-200 dark:hover:bg-red-800 transition-colors disabled:opacity-50"
                            disabled={isLoading}
                          >
                            Hapus
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
                  Menampilkan {startIndex + 1}-{Math.min(endIndex, totalItems)} dari {totalItems} fotografer
                  {fotografers.length !== totalItems && ` (difilter dari ${fotografers.length} total)`}
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

        {/* Modals */}
        <FormModal
          title="Tambah Fotografer Baru"
          isVisible={showAddModal}
          onClose={closeModal}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          editingFotografer={editingFotografer}
          handleFileChange={handleFileChange}
          removePhoto={removePhoto}
          isLoading={isLoading}
        />

        <FormModal
          title="Edit Fotografer"
          isVisible={showEditModal}
          onClose={closeModal}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          editingFotografer={editingFotografer}
          handleFileChange={handleFileChange}
          removePhoto={removePhoto}
          isLoading={isLoading}
        />
      </div>
    </>
  );
};

export default KelolaFotografer;
