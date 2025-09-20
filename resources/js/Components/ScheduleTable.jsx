import React from "react";

export default function ScheduleTable({ schedules = [] }) {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Daftar Jadwal</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Tanggal</th>
              <th className="px-4 py-2 text-left">Event</th>
              <th className="px-4 py-2 text-left">Fotografer</th>
              <th className="px-4 py-2 text-left">Editor</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length > 0 ? (
              schedules.map((schedule) => (
                <tr key={schedule.id} className="border-t">
                  <td className="px-4 py-2">{schedule.tanggal}</td>
                  <td className="px-4 py-2">{schedule.namaEvent}</td>
                  <td className="px-4 py-2">
                    {schedule.fotografer?.nama || "-"}
                  </td>
                  <td className="px-4 py-2">{schedule.editor?.nama || "-"}</td>
                  <td className="px-4 py-2 capitalize">
                    {schedule.status || "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-2 text-center text-gray-500"
                >
                  Tidak ada jadwal.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
