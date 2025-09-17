import React from 'react';

const DetailModal = ({ show, detail, onClose, formatDate }) => {
  if (!show || !detail) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4">
          Detail Pekerjaan - {detail.namaTim}
        </h2>

        <div className="space-y-2">
          <p><strong>Tanggal:</strong> {formatDate(detail.tanggal)}</p>
          <p><strong>Jam:</strong> {detail.jamMulai} - {detail.jamSelesai}</p>
          <p><strong>Fotografer:</strong> {detail.fotografer}</p>
          <p><strong>Editor:</strong> {detail.editor}</p>
          <p><strong>Lapangan:</strong> {detail.lapangan}</p>
          <p><strong>Status:</strong> {detail.status}</p>
          <p><strong>Jam Fotografer:</strong> {detail.jamFotografer} jam</p>
          <p><strong>Jam Editor:</strong> {detail.jamEditor} jam</p>
          <p><strong>Catatan:</strong> {detail.catatan}</p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
