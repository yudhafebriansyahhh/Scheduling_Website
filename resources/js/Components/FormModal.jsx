import React from 'react';

const FormModal = ({
  title,
  isVisible,
  onClose,
  formData,
  setFormData,
  handleSubmit,
  editingEditor,
  handleFileChange,
  removePhoto,
  isLoading = false
}) => {
  if (!isVisible) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!isLoading) {
      handleSubmit();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">
                {editingEditor ? 'Mengupdate...' : 'Menyimpan...'}
              </p>
            </div>
          </div>
        )}

        <h3 className="text-lg font-semibold mb-4">{title}</h3>

        <form onSubmit={handleFormSubmit}>
          <div className="space-y-4">
            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nama || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan nama editor"
                autoComplete="off"
                required
                disabled={isLoading}
              />
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <textarea
                value={formData.alamat || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, alamat: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Masukkan alamat lengkap"
                autoComplete="off"
                disabled={isLoading}
              />
            </div>

            {/* No HP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No HP <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.no_hp || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, no_hp: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan nomor HP"
                autoComplete="off"
                required
                disabled={isLoading}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan email"
                autoComplete="off"
                required
                disabled={isLoading}
              />
            </div>

            {/* Upload Foto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo Profile</label>

              {formData.photoPreview && (
                <div className="mb-3 relative">
                  <img
                    src={formData.photoPreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removePhoto();
                    }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    e.stopPropagation();
                    handleFileChange(e);
                  }}
                  className="hidden"
                  disabled={isLoading}
                />
                <label
                  htmlFor="photo-upload"
                  className={`cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 transition-colors ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {formData.photoPreview ? 'Ganti Foto' : 'Pilih Foto'}
                </label>
                <span className="text-xs text-gray-500">Max 5MB (JPG, PNG, GIF)</span>
              </div>
            </div>

            {/* Tombol */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editingEditor ? 'Menyimpan...' : 'Menambah...'}
                  </div>
                ) : (
                  editingEditor ? 'Simpan' : 'Tambah'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                Batal
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModal;
