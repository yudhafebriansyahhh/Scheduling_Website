import React, { useState } from 'react';

const AddScheduleModal = ({ show, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    tanggal: '',
    jamMulai: '',
    jamSelesai: '',
    namaEvent: '',
    idFotografer: '',
    idEditor: '',
    lapangan: '',
    status: 'pending',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // lempar data ke parent
    onClose(); // tutup modal setelah submit
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Tambah Schedule</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm">Tanggal</label>
            <input
              type="date"
              name="tanggal"
              value={formData.tanggal}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Jam Mulai</label>
              <input
                type="time"
                name="jamMulai"
                value={formData.jamMulai}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm">Jam Selesai</label>
              <input
                type="time"
                name="jamSelesai"
                value={formData.jamSelesai}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm">Nama Event</label>
            <input
              type="text"
              name="namaEvent"
              value={formData.namaEvent}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm">Fotografer (User ID)</label>
            <input
              type="number"
              name="idFotografer"
              value={formData.idFotografer}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm">Editor (User ID)</label>
            <input
              type="number"
              name="idEditor"
              value={formData.idEditor}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm">Lapangan</label>
            <input
              type="text"
              name="lapangan"
              value={formData.lapangan}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">Dalam Proses</option>
              <option value="completed">Selesai</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddScheduleModal;
