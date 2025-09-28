import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { ArrowLeft, Search, Plus } from 'lucide-react';
import Sidebar from '../../Components/Sidebar';
import FormModal from '../../Components/FormModal';
import Swal from 'sweetalert2';

const KelolaEditor = ({ editors: initialEditors }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEditor, setEditingEditor] = useState(null);
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
    photoPreview: null
  });

  // Data dari server
  const [editors, setEditors] = useState(initialEditors || []);

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

  // Filter pencarian
  const filteredEditors = editors.filter(editor =>
    editor.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    editor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    editor.no_hp.includes(searchTerm)
  );

  // Pagination logic
  const totalItems = filteredEditors.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEditors = filteredEditors.slice(startIndex, endIndex);

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

  const handleAddEditor = () => {
    setFormData({
      nama: '',
      alamat: '',
      no_hp: '',
      email: '',
      photoFile: null,
      photoPreview: null
    });
    setEditingEditor(null);
    setShowAddModal(true);
  };

  const handleEditEditor = (editor) => {
    setEditingEditor(editor);
    setFormData({
      nama: editor.nama,
      alamat: editor.alamat,
      no_hp: editor.no_hp,
      email: editor.email,
      photoFile: null,
      photoPreview: editor.photo ? `/storage/${editor.photo}` : null
    });
    setShowEditModal(true);
  };

  const handleDeleteEditor = async (editor) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      html: `Anda akan menghapus editor:<br><strong>${editor.nama}</strong>`,
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

      router.delete(`/editor/${editor.id}`, {
        onSuccess: () => {
          setEditors(editors.filter(p => p.id !== editor.id));
          setIsLoading(false);

          Swal.fire({
            icon: 'success',
            title: 'Berhasil Dihapus!',
            text: `Editor ${editor.nama} telah dihapus`,
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
            text: 'Terjadi kesalahan saat menghapus editor',
            confirmButtonText: 'OK'
          });
        }
      });
    }
  };

  // Handle submit form
  const handleSubmit = () => {
    // Validasi form
    if (!formData.nama.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Nama harus diisi!',
        confirmButtonText: 'OK'
      });
      return;
    }
    if (!formData.email.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Email harus diisi!',
        confirmButtonText: 'OK'
      });
      return;
    }
    if (!formData.no_hp.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'No HP harus diisi!',
        confirmButtonText: 'OK'
      });
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

    if (editingEditor) {
      // Update editor
      payload.append('_method', 'PUT');
      router.post(`/editor/${editingEditor.id}`, payload, {
        forceFormData: true,
        onSuccess: (page) => {
          // Update state dengan data terbaru dari server
          const updatedEditors = editors.map(editor =>
            editor.id === editingEditor.id
              ? { ...editor, ...formData, photo: page.props.flash?.photo || editor.photo }
              : editor
          );
          setEditors(updatedEditors);

          setShowEditModal(false);
          setEditingEditor(null);
          resetForm();
          setIsLoading(false);

          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Data editor berhasil diupdate',
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
          if (errors.email) {
            errorMessage = errors.email[0];
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
      // Tambah editor baru
      router.post('/editor', payload, {
        forceFormData: true,
        onSuccess: (page) => {
          setShowAddModal(false);
          resetForm();
          setIsLoading(false);

          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Editor baru berhasil ditambahkan',
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
          if (errors.email) {
            errorMessage = errors.email[0];
          } else if (errors.nama) {
            errorMessage = errors.nama[0];
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
      nama: '',
      alamat: '',
      no_hp: '',
      email: '',
      photoFile: null,
      photoPreview: null
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingEditor(null);
    resetForm();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'File Tidak Valid!',
          text: 'Harap pilih file gambar yang valid (JPG, PNG, GIF)',
          confirmButtonText: 'OK'
        });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File Terlalu Besar!',
          text: 'Ukuran file maksimal 5MB',
          confirmButtonText: 'OK'
        });
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
      photoPreview: editingEditor?.photo ? `/storage/${editingEditor.photo}` : null
    }));
    const fileInput = document.getElementById('photo-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <>
      <Head title="Kelola Editor" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-300">
        <Sidebar currentRoute="editor" />

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

            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Kelola Data Editor</h1>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Cari Editor..."
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
                onClick={handleAddEditor}
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors disabled:opacity-50 flex-shrink-0"
                disabled={isLoading}
              >
                <Plus size={16} className="mr-2" />
                Tambah Data Editor
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
                {paginatedEditors.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'Tidak ada editor yang ditemukan' : 'Belum ada data editor'}
                    </td>
                  </tr>
                ) : (
                  paginatedEditors.map((editor, index) => (
                    <tr key={editor.id} className="border-t dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{startIndex + index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          {editor.photo ? (
                            <img
                              src={`/storage/${editor.photo}`}
                              alt={editor.nama}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
                              <span className="text-xs text-gray-500 text-center dark:text-gray-400">No Photo</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{editor.nama}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{editor.alamat}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{editor.no_hp}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{editor.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditEditor(editor)}
                            className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 rounded text-xs font-medium hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors disabled:opacity-50"
                            disabled={isLoading}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEditor(editor)}
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
                  Menampilkan {startIndex + 1}-{Math.min(endIndex, totalItems)} dari {totalItems} editor
                  {editors.length !== totalItems && ` (difilter dari ${editors.length} total)`}
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
          title="Tambah Editor Baru"
          isVisible={showAddModal}
          onClose={closeModal}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          editingEditor={editingEditor}
          handleFileChange={handleFileChange}
          removePhoto={removePhoto}
          isLoading={isLoading}
        />

        <FormModal
          title="Edit Editor"
          isVisible={showEditModal}
          onClose={closeModal}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          editingEditor={editingEditor}
          handleFileChange={handleFileChange}
          removePhoto={removePhoto}
          isLoading={isLoading}
        />
      </div>
    </>
  );
};

export default KelolaEditor;
