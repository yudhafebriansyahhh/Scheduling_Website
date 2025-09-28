import React from 'react';
import { X, Upload, User } from 'lucide-react';

// ScrollContainer Component
const ScrollContainer = ({ children, maxHeight = '400px', className = '', style = {} }) => {
  const defaultStyle = {
    maxHeight,
    scrollbarWidth: 'thin',
    scrollbarColor: '#3b82f6 transparent',
    ...style
  };

  return (
    <div
      className={`overflow-y-auto pr-2 custom-scrollbar ${className}`}
      style={defaultStyle}
    >
      {children}
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
      `}</style>
    </div>
  );
};

const FormModal = ({
  title,
  isVisible,
  onClose,
  formData,
  setFormData,
  handleSubmit,
  editingFotografer,
  editingEditor,
  handleFileChange,
  removePhoto,
  isLoading = false
}) => {
  if (!isVisible) return null;

  // Determine if we're editing
  const isEditing = editingFotografer || editingEditor;

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-md mx-auto relative transition-all duration-200 border border-gray-200 dark:border-slate-700 max-h-[95vh] flex flex-col">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white dark:bg-slate-800 bg-opacity-95 dark:bg-opacity-95 flex items-center justify-center rounded-lg z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
                {isEditing ? "Mengupdate..." : "Menyimpan..."}
              </p>
            </div>
          </div>
        )}

        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-t-lg flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content with ScrollContainer - Scrollable */}
        <ScrollContainer maxHeight="calc(95vh - 160px)" className="p-6 flex-1 bg-white dark:bg-slate-800">
          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* Photo Upload Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Foto Profil
              </label>

              {/* Photo Preview */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden flex-shrink-0 relative border-2 border-gray-200 dark:border-slate-600">
                  {formData.photoPreview ? (
                    <>
                      <img
                        src={formData.photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removePhoto();
                        }}
                        className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors disabled:opacity-50 shadow-sm"
                        disabled={isLoading}
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={24} className="text-gray-400 dark:text-slate-500" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <label
                    htmlFor="photo-upload"
                    className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 transition-all duration-200 ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload size={16} className="mr-2" />
                    {formData.photoPreview ? 'Ganti Foto' : 'Pilih Foto'}
                  </label>
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

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Format: JPG, PNG, GIF. Max: 2MB
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Nama */}
              <div>
                <label htmlFor="nama" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  id="nama"
                  type="text"
                  value={formData.nama || ''}
                  onChange={(e) => handleInputChange('nama', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="Masukkan nama lengkap"
                  autoComplete="off"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="contoh@email.com"
                  autoComplete="off"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* No HP */}
              <div>
                <label htmlFor="no_hp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  No. HP <span className="text-red-500">*</span>
                </label>
                <input
                  id="no_hp"
                  type="tel"
                  value={formData.no_hp || ''}
                  onChange={(e) => handleInputChange('no_hp', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="08123456789"
                  autoComplete="off"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Alamat */}
              <div>
                <label htmlFor="alamat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alamat
                </label>
                <textarea
                  id="alamat"
                  value={formData.alamat || ''}
                  onChange={(e) => handleInputChange('alamat', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none transition-all duration-200"
                  placeholder="Masukkan alamat lengkap"
                  autoComplete="off"
                  disabled={isLoading}
                />
              </div>
            </div>
          </form>
        </ScrollContainer>

        {/* Footer - Fixed */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-b-lg flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-all duration-200 disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !formData.nama?.trim() || !formData.email?.trim() || !formData.no_hp?.trim()}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[90px] flex items-center justify-center shadow-sm"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="font-medium">{isEditing ? "Update..." : "Simpan..."}</span>
              </div>
            ) : (
              <span className="font-medium">{isEditing ? 'Update' : 'Simpan'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormModal;
