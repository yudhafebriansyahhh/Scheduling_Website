import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import Sidebar from "../../Components/Sidebar";
import StatsCards from "../../Components/StatsCards";
import Calendar from "../../Components/Calendar";
import ScheduleTable from "../../Components/ScheduleTable";
import ScheduleSidebar from "../../Components/ScheduleSidebar";
import ScheduleModal from "../../Components/ScheduleModal"; // ⬅️ import baru

export default function Dashboard({ stats, events, schedules }) {
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Calculate additional stats from schedules data with safe checks
  const todaySchedules = schedules ? schedules.filter(schedule => {
    const today = new Date().toISOString().split('T')[0];
    const scheduleDate = new Date(schedule.tanggal).toISOString().split('T')[0];
    return scheduleDate === today;
  }) : [];

  const activeSchedules = schedules ? schedules.filter(schedule =>
    schedule.status === 'in_progress'
  ) : [];

  const completedSchedules = schedules ? schedules.filter(schedule =>
    schedule.status === 'completed'
  ) : [];

  return (
    <>
      <Head title="Dashboard" />

      <div className="flex bg-gray-100 dark:bg-gray-950 min-h-screen transition-colors duration-300">
        {/* Sidebar permanen di kiri */}
        <div className="w-64">
          <Sidebar />
        </div>

        {/* Konten Dashboard */}
        <div className="flex-1 p-6 space-y-6">
          {/* Statistik */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCards stats={stats} />
          </div>

          {/* Kalender + Sidebar Jadwal */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Calendar
                events={events}
                onEventClick={(eventId) => {
                  const found = schedules.find(
                    (s) => s.id === parseInt(eventId)
                  );
                  setSelectedSchedule(found || null);
                }}
              />
            </div>
            <div>
              <ScheduleSidebar
                schedules={schedules}
                onScheduleClick={(schedule) => setSelectedSchedule(schedule)}
              />
            </div>
          </div>

          {/* Tabel Jadwal */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Jadwal
              </h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                + Tambah
              </button>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 transition-colors duration-300">
              <ScheduleTable schedules={schedules} />
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedSchedule && (
        <ScheduleModal
          schedule={selectedSchedule}
          onClose={() => setSelectedSchedule(null)}
        />
      )}
    </>
  );
}
