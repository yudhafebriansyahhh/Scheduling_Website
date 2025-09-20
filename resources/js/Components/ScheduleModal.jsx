import React from "react";

export default function ScheduleModal({ schedule, onClose }) {
  if (!schedule) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">{schedule.namaEvent}</h2>
        <p className="mb-2">
          <span className="font-semibold">Tanggal:</span> {schedule.tanggal}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Waktu:</span> {schedule.jamMulai} -{" "}
          {schedule.jamSelesai}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Fotografer:</span>{" "}
          {schedule.fotografer?.nama || "-"}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Editor:</span>{" "}
          {schedule.editor?.nama || "-"}
        </p>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
