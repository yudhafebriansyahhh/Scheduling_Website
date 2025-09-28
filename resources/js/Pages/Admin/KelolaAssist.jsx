import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { ArrowLeft, Search, Plus, Edit2, Trash2 } from 'lucide-react';
import Sidebar from '../../Components/Sidebar';
import CustomTimeInputAssist from '../../Components/CustomTimeInputAssist';
import CustomDateInput from '../../Components/CustomDateInput';
import Swal from 'sweetalert2';

const KelolaAssist = ({ assists: initialAssists, assistsOptions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAssist, setEditingAssist] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { flash } = usePage().props;

  // State untuk pencarian orang
  const [personSearchTerm, setPersonSearchTerm] = useState('');
  const [filteredPeople, setFilteredPeople] = useState(assistsOptions || []);
  const [showPersonDropdown, setShowPersonDropdown] = useState(false);

  const [formData, setFormData] = useState({
    person_id: '',
    tanggal: '',
    jamMulai: '',
    jamSelesai: ''
  });

  // Use assists from props
  const [assists, setAssists] = useState(initialAssists || []);

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

  // Filter pencarian assist
  const filteredAssists = assists.filter(assist => {
    const assistName = assist.assistable?.nama || '';
    const searchLower = searchTerm.toLowerCase();
    return assistName.toLowerCase().includes(searchLower) ||
           assist.tanggal.includes(searchTerm);
  });

  // Pagination logic
  const totalItems = filteredAssists.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAssists = filteredAssists.slice(startIndex, endIndex);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  // Update assists when props change
  useEffect(() => {
    setAssists(initialAssists || []);
  }, [initialAssists]);

  // Filter people berdasarkan pencarian
  useEffect(() => {
    if (personSearchTerm.length >= 2) {
      const filtered = (assistsOptions || []).filter(person =>
        person.nama.toLowerCase().includes(personSearchTerm.toLowerCase())
      );
      setFilteredPeople(filtered);
    } else {
      setFilteredPeople(assistsOptions || []);
    }
  }, [personSearchTerm, assistsOptions]);

  // Function untuk menentukan status berdasarkan tanggal dan jam
  const determineStatus = (tanggal, jamMulai, jamSelesai) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

    // Format tanggal dari data assist (bisa dalam format yang berbeda)
    let scheduleDate;
    if (tanggal instanceof Date) {
      scheduleDate = tanggal.toISOString().split('T')[0];
    } else {
      // Jika tanggal dalam format string, pastikan dalam format YYYY-MM-DD
      const date = new Date(tanggal);
      if (!isNaN(date.getTime())) {
        scheduleDate = date.toISOString().split('T')[0];
      } else {
        scheduleDate = tanggal;
      }
    }

    // Jika jam selesai lebih kecil dari jam mulai, berarti lewat tengah malam
    if (jamSelesai <= jamMulai) {
      // Untuk perhitungan status, anggap hari berikutnya
      const nextDay = new Date(scheduleDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];

      if (today < scheduleDate) {
        return 'pending';
      } else if (today === scheduleDate) {
        if (currentTime < jamMulai) {
          return 'pending';
        } else {
          return 'in_progress';
        }
      } else if (today === nextDayStr) {
        if (currentTime <= jamSelesai) {
          return 'in_progress';
        } else {
          return 'completed';
        }
      } else if (today > nextDayStr) {
        return 'completed';
      }
    } else {
      // Jam normal dalam satu hari
      if (today < scheduleDate) {
        return 'pending';
      } else if (today === scheduleDate) {
        if (currentTime < jamMulai) {
          return 'pending';
        } else if (currentTime >= jamMulai && currentTime <= jamSelesai) {
          return 'in_progress';
        } else if (currentTime > jamSelesai) {
          return 'completed';
        }
      } else if (today > scheduleDate) {
        return 'completed';
      }
    }

    return 'pending';
  };

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

  const addOneHour = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const nextHour = (parseInt(hours) + 1) % 24;
    return `${nextHour.toString().padStart(2, "0")}:${minutes}`;
  };

  const handleJamMulaiChange = (time) => {
    const nextHour = addOneHour(time);
    setFormData((prevData) => ({
      ...prevData,
      jamMulai: time,
      jamSelesai: nextHour,
    }));
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleAddAssist = () => {
    setFormData({
      person_id: '',
      tanggal: '',
      jamMulai: '',
      jamSelesai: ''
    });
    setEditingAssist(null);
    setPersonSearchTerm('');
    setShowAddModal(true);
  };

  const handleEditAssist = (assist) => {
    setEditingAssist(assist);
    const personId = generatePersonId(assist);
    const selectedPerson = (assistsOptions || []).find(p => p.id === personId);

    // Format date properly - ensure it's in YYYY-MM-DD format
    let formattedDate = assist.tanggal;
    if (assist.tanggal) {
      // If the date is already a Date object or needs formatting
      const date = new Date(assist.tanggal);
      if (!isNaN(date.getTime())) {
        formattedDate = date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
      }
    }

    setFormData({
      person_id: personId,
      tanggal: formattedDate || '',
      jamMulai: assist.jamMulai ? assist.jamMulai.substring(0, 5) : '',
      jamSelesai: assist.jamSelesai ? assist.jamSelesai.substring(0, 5) : ''
    });

    if (selectedPerson) {
      // Use nama instead of display_name to show only the name without role
      setPersonSearchTerm(selectedPerson.nama);
    }

    setShowEditModal(true);
  };

  const generatePersonId = (assist) => {
    const type = assist.assistable_type.includes('Fotografer') ? 'fotografer' : 'editor';
    return type + '|' + assist.assistable_id;
  };

  const handleDeleteAssist = async (assist) => {
    const assistName = assist.assistable?.nama || 'Unknown';
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      html: `Anda akan menghapus jadwal assist untuk:<br><strong>${assistName}</strong>`,
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

      router.delete(`/assist/${assist.id}`, {
        onSuccess: () => {
          setAssists(assists.filter(a => a.id !== assist.id));
          setIsLoading(false);

          Swal.fire({
            icon: 'success',
            title: 'Berhasil Dihapus!',
            text: `Jadwal assist ${assistName} telah dihapus`,
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
            text: 'Terjadi kesalahan saat menghapus jadwal assist',
            confirmButtonText: 'OK'
          });
        }
      });
    }
  };

  const handleSubmit = () => {
    if (!formData.person_id) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Pilih fotografer atau editor terlebih dahulu!',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!formData.tanggal || !formData.jamMulai || !formData.jamSelesai) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Semua field harus diisi!',
        confirmButtonText: 'OK'
      });
      return;
    }

    setIsLoading(true);

    const data = {
      person_id: formData.person_id,
      tanggal: formData.tanggal,
      jamMulai: formData.jamMulai,
      jamSelesai: formData.jamSelesai
    };

    if (editingAssist) {
      // Update assist
      router.put(`/assist/${editingAssist.id}`, data, {
        onSuccess: () => {
          setShowEditModal(false);
          resetForm();
          setIsLoading(false);

          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Data assist berhasil diupdate',
            timer: 3000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        },
        onError: () => {
          setIsLoading(false);
          Swal.fire({
            icon: 'error',
            title: 'Gagal Update!',
            text: 'Terjadi kesalahan saat mengupdate data',
            confirmButtonText: 'OK'
          });
        }
      });
    } else {
      // Tambah assist baru
      router.post('/assist', data, {
        onSuccess: () => {
          setShowAddModal(false);
          resetForm();
          setIsLoading(false);

          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Jadwal assist baru berhasil ditambahkan',
            timer: 3000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        },
        onError: () => {
          setIsLoading(false);
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menambah!',
            text: 'Terjadi kesalahan saat menambah data',
            confirmButtonText: 'OK'
          });
        }
      });
    }
  };

  const resetForm = () => {
    setFormData({
      person_id: '',
      tanggal: '',
      jamMulai: '',
      jamSelesai: ''
    });
    setPersonSearchTerm('');
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingAssist(null);
    setShowPersonDropdown(false);
    resetForm();
  };

  const handlePersonSelect = (person) => {
    setFormData({ ...formData, person_id: person.id });
    // Use nama instead of display_name to show only the name without role
    setPersonSearchTerm(person.nama);
    setShowPersonDropdown(false);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', text: 'Menunggu' },
      in_progress: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', text: 'Berlangsung' },
      completed: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', text: 'Selesai' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <>
      <Head title="Kelola Assist" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-300">
        <Sidebar currentRoute="assists" />

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

            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Kelola Data Assist</h1>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Cari Assist..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-80 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    disabled={isLoading}
                  />
                </div>

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
                onClick={handleAddAssist}
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors disabled:opacity-50 flex-shrink-0"
                disabled={isLoading}
              >
                <Plus size={16} className="mr-2" />
                Tambah Jadwal Assist
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 w-16">No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Nama</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Tanggal</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Jam Mulai</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Jam Selesai</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAssists.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'Tidak ada assist yang ditemukan' : 'Belum ada jadwal assist'}
                    </td>
                  </tr>
                ) : (
                  paginatedAssists.map((assist, index) => {
                    const status = determineStatus(assist.tanggal, assist.jamMulai, assist.jamSelesai);
                    return (
                      <tr key={assist.id} className="border-t dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{startIndex + index + 1}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {assist.assistable?.nama || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {new Date(assist.tanggal).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {assist.jamMulai ? assist.jamMulai.substring(0, 5) : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {assist.jamSelesai ? assist.jamSelesai.substring(0, 5) : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {getStatusBadge(status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditAssist(assist)}
                              className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 rounded text-xs font-medium hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors disabled:opacity-50"
                              disabled={isLoading}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAssist(assist)}
                              className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 rounded text-xs font-medium hover:bg-red-200 dark:hover:bg-red-800 transition-colors disabled:opacity-50"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination and Info */}
          {totalItems > 0 && (
            <div className="mt-6">
              {renderPagination()}

              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400 gap-2">
                <div>
                  Menampilkan {startIndex + 1}-{Math.min(endIndex, totalItems)} dari {totalItems} jadwal assist
                  {assists.length !== totalItems && ` (difilter dari ${assists.length} total)`}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 mb-40 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Tambah Jadwal Assist
              </h3>

              <div className="space-y-4">
                {/* Person Selection with Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pilih Fotografer/Editor <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={personSearchTerm}
                      onChange={(e) => {
                        setPersonSearchTerm(e.target.value);
                        setShowPersonDropdown(true);
                      }}
                      onFocus={() => setShowPersonDropdown(true)}
                      placeholder="Cari nama fotografer atau editor..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      autoComplete="off"
                    />

                    {/* Dropdown */}
                    {showPersonDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredPeople.length === 0 ? (
                          <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                            Tidak ada hasil ditemukan
                          </div>
                        ) : (
                          filteredPeople.map((person) => (
                            <button
                              key={person.id}
                              type="button"
                              onClick={() => handlePersonSelect(person)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 focus:bg-gray-100 dark:focus:bg-gray-600 focus:outline-none text-sm"
                            >
                              <div className="font-medium text-gray-900 dark:text-gray-100">{person.nama}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {person.type === 'fotografer' ? 'Fotografer' : 'Editor'}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected person indicator */}
                  {formData.person_id && (
                    <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                      ✓ {(assistsOptions || []).find(p => p.id === formData.person_id)?.nama}
                    </div>
                  )}
                </div>

                {/* Tanggal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <CustomDateInput
                    value={formData.tanggal}
                    onChange={(date) => setFormData({ ...formData, tanggal: date })}
                    placeholder="Pilih tanggal assist"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Jam */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Jam Mulai <span className="text-red-500">*</span>
                    </label>
                    <CustomTimeInputAssist
                      value={formData.jamMulai}
                      onChange={handleJamMulaiChange}
                      placeholder="Pilih jam mulai"
                      required
                      disabled={isLoading}
                      className="time-input-assist"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Jam Selesai <span className="text-red-500">*</span>
                    </label>
                    <CustomTimeInputAssist
                      value={formData.jamSelesai}
                      onChange={(time) => setFormData({ ...formData, jamSelesai: time })}
                      placeholder="Pilih jam selesai"
                      required
                      disabled={isLoading}
                      className="time-input-assist"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Edit */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex mb-40 items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Edit Jadwal Assist
              </h3>

              <div className="space-y-4">
                {/* Person Selection with Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pilih Fotografer/Editor <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={personSearchTerm}
                      onChange={(e) => {
                        setPersonSearchTerm(e.target.value);
                        setShowPersonDropdown(true);
                      }}
                      onFocus={() => setShowPersonDropdown(true)}
                      placeholder="Cari nama fotografer atau editor..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      autoComplete="off"
                    />

                    {/* Dropdown */}
                    {showPersonDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredPeople.length === 0 ? (
                          <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                            Tidak ada hasil ditemukan
                          </div>
                        ) : (
                          filteredPeople.map((person) => (
                            <button
                              key={person.id}
                              type="button"
                              onClick={() => handlePersonSelect(person)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 focus:bg-gray-100 dark:focus:bg-gray-600 focus:outline-none text-sm"
                            >
                              <div className="font-medium text-gray-900 dark:text-gray-100">{person.nama}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {person.type === 'fotografer' ? 'Fotografer' : 'Editor'}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected person indicator */}
                  {formData.person_id && (
                    <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                      ✓ {(assistsOptions || []).find(p => p.id === formData.person_id)?.nama}
                    </div>
                  )}
                </div>

                {/* Tanggal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <CustomDateInput
                    value={formData.tanggal}
                    onChange={(date) => setFormData({ ...formData, tanggal: date })}
                    placeholder="Pilih tanggal assist"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Jam */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Jam Mulai <span className="text-red-500">*</span>
                    </label>
                    <CustomTimeInputAssist
                      value={formData.jamMulai}
                      onChange={handleJamMulaiChange}
                      placeholder="Pilih jam mulai"
                      required
                      disabled={isLoading}
                      className="time-input-assist"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Jam Selesai <span className="text-red-500">*</span>
                    </label>
                    <CustomTimeInputAssist
                      value={formData.jamSelesai}
                      onChange={(time) => setFormData({ ...formData, jamSelesai: time })}
                      placeholder="Pilih jam selesai"
                      required
                      disabled={isLoading}
                      className="time-input-assist"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Mengupdate...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Click outside to close dropdown */}
        {showPersonDropdown && (
          <div
            className="fixed inset-0 z-5"
            onClick={() => setShowPersonDropdown(false)}
          />
        )}
      </div>

      {/* Custom Scrollbar and Time Input Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }

        /* Prevent time input dropdown from overlapping */
        .time-input-assist > div:last-child {
          z-index: 1000 !important;
        }
      `}</style>
    </>
  );
};

export default KelolaAssist;
