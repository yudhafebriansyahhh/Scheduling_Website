import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { ArrowLeft, Clock } from 'lucide-react';
import Sidebar from '../../Components/Sidebar';

const EditSchedule = ({ scheduleData = null }) => {
  const [formData, setFormData] = useState({
    tanggal: '',
    jamMulai: '',
    jamSelesai: '',
    namaKomunitas: '',
    namaFotografer: '',
    namaLapangan: '',
    jamEditor: '',
    status: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Populate form with existing data
  useEffect(() => {
    if (scheduleData) {
      setFormData({
        tanggal: scheduleData.tanggal || '',
        jamMulai: scheduleData.jamMulai || '',
        jamSelesai: scheduleData.jamSelesai || '',
        namaKomunitas: scheduleData.namaKomunitas || '',
        namaFotografer: scheduleData.namaFotografer || '',
        namaLapangan: scheduleData.namaLapangan || '',
        jamEditor: scheduleData.jamEditor || '',
        status: scheduleData.status || ''
      });
      setIsLoading(false);
    } else {
      // Sample data for demo - in real app, this would come from API/props
      setTimeout(() => {
        setFormData({
          tanggal: '2025-09-20',
          jamMulai: '09:00',
          jamSelesai: '12:00',
          namaKomunitas: 'Tim Garuda FC',
          namaFotografer: 'Ahmad Fotografer',
          namaLapangan: 'Lapangan Utama',
          jamEditor: '14:00',
          status: 'in_progress'
        });
        setIsLoading(false);
      }, 500);
    }
  }, [scheduleData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdate = async () => {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Schedule berhasil diupdate!');
      // In real app, redirect or show success message
      // router.visit('/admin/fotografer');
    }, 1000);
  };

  const handleBack = () => {
    if (window.confirm('Perubahan akan hilang. Yakin ingin kembali?')) {
      window.history.back();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <Head title="Edit Schedule" />
        <div className="min-h-screen bg-gray-50 flex">
          <Sidebar
            currentRoute="fotografer"
            onLogout={() => {
              if (window.confirm('Apakah Anda yakin ingin logout?')) {
                window.location.href = '/login';
              }
            }}
          />

          <div className="flex-1 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="text-gray-600">Loading schedule data...</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head title="Edit Schedule" />

      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <Sidebar
          currentRoute="fotografer"
          onLogout={() => {
            if (window.confirm('Apakah Anda yakin ingin logout?')) {
              window.location.href = '/login';
            }
          }}
        />

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Edit Schedule</h1>
            <p className="text-sm text-gray-600 mt-1">Update informasi schedule yang sudah ada</p>
          </div>

          {/* Form Container */}
          <div className="max-w-2xl">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Information</h2>

              <div className="space-y-6">
                {/* Tanggal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => handleInputChange('tanggal', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                {/* Jam Mulai & Jam Selesai */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jam Mulai
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={formData.jamMulai}
                        onChange={(e) => handleInputChange('jamMulai', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                      <Clock size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jam Selesai
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={formData.jamSelesai}
                        onChange={(e) => handleInputChange('jamSelesai', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                      <Clock size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Nama Komunitas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Komunitas
                  </label>
                  <input
                    type="text"
                    value={formData.namaKomunitas}
                    onChange={(e) => handleInputChange('namaKomunitas', e.target.value)}
                    placeholder="Masukkan Nama Komunitas"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                {/* Nama Fotografer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Fotografer
                  </label>
                  <div className="relative">
                    <select
                      value={formData.namaFotografer}
                      onChange={(e) => handleInputChange('namaFotografer', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                      required
                    >
                      <option value="">Pilih Fotografer</option>
                      <option value="Ahmad Fotografer">Ahmad Fotografer</option>
                      <option value="Budi Fotografer">Budi Fotografer</option>
                      <option value="Citra Fotografer">Citra Fotografer</option>
                      <option value="Doni Fotografer">Doni Fotografer</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Nama Lapangan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lapangan
                  </label>
                  <input
                    type="text"
                    value={formData.namaLapangan}
                    onChange={(e) => handleInputChange('namaLapangan', e.target.value)}
                    placeholder="Masukkan Nama Lapangan"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                {/* Jam Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jam Editor
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={formData.jamEditor}
                      onChange={(e) => handleInputChange('jamEditor', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                    <Clock size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Waktu mulai editing setelah foto selesai</p>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                      required
                    >
                      <option value="">Pilih Status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="photo_completed">Photo Completed</option>
                      <option value="editing">Editing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="mt-1">
                    {formData.status && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        formData.status === 'completed' ? 'bg-green-100 text-green-800' :
                        formData.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        formData.status === 'editing' ? 'bg-yellow-100 text-yellow-800' :
                        formData.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        formData.status === 'confirmed' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {formData.status === 'pending' ? 'Menunggu Konfirmasi' :
                         formData.status === 'confirmed' ? 'Terkonfirmasi' :
                         formData.status === 'in_progress' ? 'Sedang Berlangsung' :
                         formData.status === 'photo_completed' ? 'Foto Selesai' :
                         formData.status === 'editing' ? 'Sedang Diedit' :
                         formData.status === 'completed' ? 'Selesai' :
                         formData.status === 'cancelled' ? 'Dibatalkan' :
                         formData.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleUpdate}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      'Update Schedule'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    <strong>Tips:</strong> Pastikan semua informasi sudah benar sebelum menyimpan perubahan.
                    Perubahan jadwal akan mempengaruhi notifikasi yang sudah dikirim ke fotografer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditSchedule;
