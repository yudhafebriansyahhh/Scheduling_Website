import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { ArrowLeft, Search, Plus } from 'lucide-react';
import Sidebar from '../../Components/Sidebar';
import FormModal from '../../Components/FormModal';

const KelolaEditor = ({ editors: initialEditors }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEditor, setEditingEditor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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

  // Filter pencarian
  const filteredEditors = editors.filter(editor =>
    editor.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    editor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    editor.no_hp.includes(searchTerm)
  );

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

  const handleDeleteEditor = (editor) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus editor ${editor.nama}?`)) {
      setIsLoading(true);
      router.delete(`/editor/${editor.id}`, {
        onSuccess: () => {
          setEditors(editors.filter(p => p.id !== editor.id));
          setIsLoading(false);
        },
        onError: () => {
          setIsLoading(false);
        }
      });
    }
  };

  // 🔥 Perbaikan utama ada disini
  const handleSubmit = () => {
    // Validasi form
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
        },
        onError: (errors) => {
          console.error('Update error:', errors);
          if (errors.email) {
            alert('Error: ' + errors.email[0]);
          } else {
            alert('Terjadi kesalahan saat mengupdate data');
          }
          setIsLoading(false);
        }
      });
    } else {
      // Tambah editor baru
      router.post('/editor', payload, {
        forceFormData: true,
        onSuccess: (page) => {
          // Refresh halaman untuk mendapat data terbaru
          // Atau bisa juga ambil data dari response jika backend mengirimkan data editor baru
          window.location.reload();

          // Alternatif tanpa reload (tapi butuh data dari backend):
          // const newEditor = page.props.newEditor; // Jika backend kirim data editor baru
          // if (newEditor) {
          //   setEditors([...editors, newEditor]);
          // }

          setShowAddModal(false);
          resetForm();
          setIsLoading(false);
        },
        onError: (errors) => {
          console.error('Create error:', errors);
          if (errors.email) {
            alert('Error: ' + errors.email[0]);
          } else if (errors.nama) {
            alert('Error: ' + errors.nama[0]);
          } else {
            alert('Terjadi kesalahan saat menambah data');
          }
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
        alert('Harap pilih file gambar yang valid (JPG, PNG, GIF, dll)');
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

      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar currentRoute="editor" />

        <div className="flex-1 p-6">
          {/* Loading overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-40">
              <div className="bg-white p-4 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Memproses...</p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center mb-4">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isLoading}
              >
                <ArrowLeft size={20} className="mr-2" />
                Back
              </button>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-6">Kelola Data Editor</h1>

            {/* Flash message */}
            {flash?.success && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {flash.success}
              </div>
            )}
            {flash?.error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {flash.error}
              </div>
            )}

            <div className="flex justify-between items-center mb-6">
              <div className="relative w-80">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari Editor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>

              <button
                onClick={handleAddEditor}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                <Plus size={16} className="mr-2" />
                Tambah Data Editor
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-16">No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Photo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nama</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Alamat</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">No HP</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredEditors.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? 'Tidak ada editor yang ditemukan' : 'Belum ada data editor'}
                    </td>
                  </tr>
                ) : (
                  filteredEditors.map((editor, index) => (
                    <tr key={editor.id} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                          {editor.photo ? (
                            <img
                              src={`/storage/${editor.photo}`}
                              alt={editor.nama}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-300">
                              <span className="text-xs text-gray-500">No Photo</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{editor.nama}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{editor.alamat}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{editor.no_hp}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{editor.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditEditor(editor)}
                            className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium hover:bg-yellow-200 transition-colors disabled:opacity-50"
                            disabled={isLoading}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEditor(editor)}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
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

          {filteredEditors.length > 0 && (
            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
              <div>
                Menampilkan {filteredEditors.length} dari {editors.length} editor
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
