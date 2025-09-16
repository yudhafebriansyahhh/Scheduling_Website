import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { ArrowLeft, Search, Plus } from 'lucide-react';
import Sidebar from '../../Components/Sidebar';

const KelolaFotografer = ({ stats }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPhotographer, setEditingPhotographer] = useState(null);

  // Sample data fotografer
  const [photographers, setPhotographers] = useState([
    {
      id: 1,
      nama: 'John Doe',
      alamat: 'Jl. Merdeka No. 123, Jakarta',
      noHp: '08123456789',
      email: 'john.doe@email.com',
      status: 'active'
    },
    {
      id: 2,
      nama: 'Jane Smith',
      alamat: 'Jl. Sudirman No. 456, Jakarta',
      noHp: '08234567890',
      email: 'jane.smith@email.com',
      status: 'active'
    },
    {
      id: 3,
      nama: 'Mike Johnson',
      alamat: 'Jl. Thamrin No. 789, Jakarta',
      noHp: '08345678901',
      email: 'mike.johnson@email.com',
      status: 'inactive'
    }
  ]);

  const [formData, setFormData] = useState({
    nama: '',
    alamat: '',
    noHp: '',
    email: '',
    status: 'active'
  });

  // Filter data berdasarkan search
  const filteredPhotographers = photographers.filter(photographer =>
    photographer.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    photographer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    photographer.noHp.includes(searchTerm)
  );

  const handleBack = () => {
    window.history.back();
  };

  const handleAddPhotographer = () => {
    setFormData({
      nama: '',
      alamat: '',
      noHp: '',
      email: '',
      status: 'active'
    });
    setShowAddModal(true);
  };

  const handleEditPhotographer = (photographer) => {
    setEditingPhotographer(photographer);
    setFormData({
      nama: photographer.nama,
      alamat: photographer.alamat,
      noHp: photographer.noHp,
      email: photographer.email,
      status: photographer.status
    });
    setShowEditModal(true);
  };

  const handleDeletePhotographer = (photographer) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus fotografer ${photographer.nama}?`)) {
      setPhotographers(photographers.filter(p => p.id !== photographer.id));
      alert(`Fotografer ${photographer.nama} berhasil dihapus!`);
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      // Implement actual logout logic here
      window.location.href = '/login';
    }
  };

  const handleSubmit = () => {
    // Validasi form
    if (!formData.nama || !formData.alamat || !formData.noHp || !formData.email) {
      alert('Semua field harus diisi!');
      return;
    }

    if (editingPhotographer) {
      // Update fotografer
      setPhotographers(photographers.map(p =>
        p.id === editingPhotographer.id
          ? { ...p, ...formData }
          : p
      ));
      alert(`Data fotografer ${formData.nama} berhasil diupdate!`);
      setShowEditModal(false);
    } else {
      // Tambah fotografer baru
      const newPhotographer = {
        id: Date.now(),
        ...formData
      };
      setPhotographers([...photographers, newPhotographer]);
      alert(`Fotografer ${formData.nama} berhasil ditambahkan!`);
      setShowAddModal(false);
    }

    setEditingPhotographer(null);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingPhotographer(null);
    setFormData({
      nama: '',
      alamat: '',
      noHp: '',
      email: '',
      status: 'active'
    });
  };

  const getStatusBadge = (status) => {
    return status === 'active' ? (
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
        Aktif
      </span>
    ) : (
      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
        Nonaktif
      </span>
    );
  };

  const FormModal = ({ title, isVisible, onClose }) => {
    if (!isVisible) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">{title}</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan nama fotografer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <textarea
                value={formData.alamat}
                onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Masukkan alamat lengkap"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No HP</label>
              <input
                type="tel"
                value={formData.noHp}
                onChange={(e) => setFormData({...formData, noHp: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan nomor HP"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                {editingPhotographer ? 'Simpan' : 'Tambah'}
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Head title="Kelola Fotografer" />

      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <Sidebar
          currentRoute="fotografer"
          onLogout={handleLogout}
        />

        {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back
            </button>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">Kelola Data Fotografer</h1>

          {/* Search and Add Button */}
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-80">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari fotografer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleAddPhotographer}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Tambah Data Fotografer
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-16">No</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nama</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Alamat</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">No Hp</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPhotographers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? 'Tidak ada fotografer yang ditemukan' : 'Belum ada data fotografer'}
                  </td>
                </tr>
              ) : (
                filteredPhotographers.map((photographer, index) => (
                  <tr key={photographer.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{photographer.nama}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{photographer.alamat}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{photographer.noHp}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{photographer.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditPhotographer(photographer)}
                          className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium hover:bg-yellow-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePhotographer(photographer)}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-medium hover:bg-red-200 transition-colors"
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

        {/* Table Footer */}
        {filteredPhotographers.length > 0 && (
          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <div>
              Menampilkan {filteredPhotographers.length} dari {photographers.length} fotografer
            </div>
          </div>
        )}
        </div>

        {/* Modals */}
        <FormModal
          title="Tambah Fotografer Baru"
          isVisible={showAddModal}
          onClose={closeModal}
        />

        <FormModal
          title="Edit Fotografer"
          isVisible={showEditModal}
          onClose={closeModal}
        />
      </div>
    </>
  );
};

export default KelolaFotografer;
