import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';

// Import all components
import Sidebar from '../../Components/Sidebar';
import StatsCards from '../../Components/StatsCards';
import Calendar from '../../Components/Calendar';
import ScheduleTable from '../../Components/ScheduleTable';
import ScheduleSidebar from '../../Components/ScheduleSidebar';

const Dashboard = ({ stats = {}, events = [], schedules = [], debug_info = null }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debug logging
  console.log('🔍 Dashboard - Received props:', { stats, events, schedules, debug_info });
  console.log('🔍 Dashboard - Events length:', events.length);
  console.log('🔍 Dashboard - Schedules length:', schedules.length);
  console.log('🔍 Dashboard - Current date:', new Date().toISOString().split('T')[0]);

  if (debug_info) {
    console.log('🔍 Dashboard - Debug info:', debug_info);
  }

  // Provide default values for stats
  const safeStats = {
    jadwal_bulan_ini: 0,
    total_fotografer: 0,
    total_editor: 0,
    total_schedules: 0,
    active_schedules: 0,
    completed_schedules: 0,
    pending_schedules: 0,
    today_schedules: 0,
    ...stats
  };

  // Filter schedules based on selected date
  useEffect(() => {
    if (selectedDate && schedules) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const filtered = schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.tanggal).toISOString().split('T')[0];
        return scheduleDate === dateStr;
      });
      setFilteredSchedules(filtered);
    }
  }, [selectedDate, schedules]);

  // Handle date selection from calendar
  const handleDateSelect = (date) => {
    setIsLoading(true);
    setSelectedDate(date);

    // Simulate loading delay
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  // Handle schedule actions
  const handleAddSchedule = () => {
    alert('Fitur tambah jadwal akan membuka modal form');
    // Here you would typically open a modal or navigate to a form
  };

  const handleEditSchedule = (schedule) => {
    alert(`Edit jadwal: ${schedule.namaEvent || schedule.namaTim}`);
    // Here you would typically open an edit modal with pre-filled data
  };

  const handleDeleteSchedule = (scheduleId) => {
    alert(`Jadwal dengan ID ${scheduleId} akan dihapus`);
    // Here you would typically make an API call to delete the schedule
  };

  const handleScheduleClick = (schedule) => {
    alert(`Melihat detail jadwal: ${schedule.namaEvent || schedule.team}`);
    // Here you could open a detailed view or modal
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      // Implement actual logout logic here
      window.location.href = '/login';
    }
  };

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
      <Head title="Dashboard Admin" />

      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <Sidebar
          currentRoute="dashboard"
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="text-gray-700">Memuat jadwal...</span>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div>
            <StatsCards stats={safeStats} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Calendar and Schedule Table */}
            <div className="xl:col-span-3 space-y-6">
              {/* Calendar */}
              <Calendar
                events={events}
                schedules={schedules}
                onDateSelect={handleDateSelect}
                selectedDate={selectedDate}
              />

              {/* Schedule Table */}
              <ScheduleTable
                schedules={schedules}
                onAdd={handleAddSchedule}
                onEdit={handleEditSchedule}
                onDelete={handleDeleteSchedule}
              />
            </div>

            {/* Schedule Sidebar */}
            <div className="xl:col-span-1">
              <div className="sticky top-6">
                <ScheduleSidebar
                  selectedDate={selectedDate}
                  schedules={filteredSchedules}
                  onScheduleClick={handleScheduleClick}
                />
              </div>
            </div>
          </div>

          {/* Quick Stats Footer */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
              <div className="text-2xl font-bold text-blue-600">
                {events.length || schedules.length || 0}
              </div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>

            <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
              <div className="text-2xl font-bold text-green-600">
                {activeSchedules.length || 0}
              </div>
              <div className="text-sm text-gray-600">Sedang Berlangsung</div>
            </div>

            <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
              <div className="text-2xl font-bold text-purple-600">
                {todaySchedules.length || 0}
              </div>
              <div className="text-sm text-gray-600">Jadwal Hari Ini</div>
            </div>

            <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
              <div className="text-2xl font-bold text-gray-500">
                {new Date().toLocaleTimeString('id-ID')} WIB
              </div>
              <div className="text-sm text-gray-600">Waktu Sekarang</div>
            </div>
          </div>

          {/* Additional Stats Section */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {completedSchedules.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Jadwal Selesai</div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {schedules ? schedules.filter(s => s.status === 'pending').length : 0}
                  </div>
                  <div className="text-sm text-gray-600">Menunggu</div>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {safeStats.total_schedules || schedules.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Jadwal</div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Summary */}
          {schedules && schedules.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Kegiatan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Jadwal Terbaru</h4>
                  <div className="space-y-2">
                    {schedules.slice(0, 3).map((schedule, index) => (
                      <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">{schedule.namaEvent || 'Event'}</div>
                          <div className="text-xs text-gray-500">
                            {schedule.tanggal ? new Date(schedule.tanggal).toLocaleDateString('id-ID') : 'No date'} • {schedule.waktu || 'No time'}
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs ${
                          schedule.status === 'completed' ? 'bg-green-100 text-green-800' :
                          schedule.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {schedule.status === 'completed' ? 'Selesai' :
                           schedule.status === 'in_progress' ? 'Berlangsung' : 'Menunggu'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Statistik Tim</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Fotografer</span>
                      <span className="font-semibold text-gray-900">{safeStats.total_fotografer}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Editor</span>
                      <span className="font-semibold text-gray-900">{safeStats.total_editor}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Jadwal Bulan Ini</span>
                      <span className="font-semibold text-gray-900">{safeStats.jadwal_bulan_ini}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="mt-12 py-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              Dashboard Admin - Sistem Manajemen Jadwal
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
