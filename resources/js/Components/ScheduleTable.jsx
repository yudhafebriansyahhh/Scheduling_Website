import React from "react";

export default function ScheduleTable({ schedules = [] }) {
  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-4 transition-colors duration-300">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
        Daftar Jadwal
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">
                Tanggal
              </th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">
                Event
              </th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">
                Fotografer
              </th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">
                Editor
              </th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {schedules.length > 0 ? (
              schedules.map((schedule) => (
                <tr
                  key={schedule.id}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-4 py-2 text-gray-800 dark:text-gray-200">
                    {schedule.tanggal}
                  </td>
                  <td className="px-4 py-2 text-gray-800 dark:text-gray-200">
                    {schedule.namaEvent}
                  </td>
                  <td className="px-4 py-2 text-gray-800 dark:text-gray-200">
                    {schedule.fotografer?.nama || "-"}
                  </td>
                  <td className="px-4 py-2 text-gray-800 dark:text-gray-200">
                    {schedule.editor?.nama || "-"}
                  </td>
                  <td className="px-4 py-2 capitalize text-gray-800 dark:text-gray-200">
                    {schedule.status || "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-2 text-center text-gray-500 dark:text-gray-400"
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
