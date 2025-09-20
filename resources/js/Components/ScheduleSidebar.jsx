import React from "react";

export default function ScheduleSidebar({ schedules, onScheduleClick }) {
  // Ambil tanggal hari ini dalam format YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  // Filter jadwal hanya untuk hari ini
  const todaySchedules = schedules.filter(
    (schedule) => schedule.tanggal === today
  );

  return (
    <div className="bg-blue-500 dark:bg-gray-800 p-4 rounded-lg shadow h-full overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 text-white dark:text-gray-100">
        Jadwal Hari Ini
      </h2>
      {todaySchedules.length > 0 ? (
        <ul className="space-y-3">
          {todaySchedules.map((schedule) => (
            <li
              key={schedule.id}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-600"
              onClick={() => onScheduleClick(schedule)}
            >
              <p className="font-semibold text-gray-900 dark:text-white">
                {schedule.namaEvent}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {schedule.jamMulai} - {schedule.jamSelesai}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-white dark:text-gray-300 text-sm">
          Tidak ada jadwal hari ini.
        </p>
      )}
    </div>
  );
}
