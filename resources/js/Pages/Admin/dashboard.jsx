import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';

// Import all components
import Sidebar from '../../Components/Sidebar';
import StatsCards from '../../Components/StatsCards';
import Calendar from '../../Components/Calendar';
import ScheduleTable from '../../Components/ScheduleTable';
import ScheduleSidebar from '../../Components/ScheduleSidebar';

const Dashboard = ({ stats, events = [], schedules = [] }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sample events for calendar
  const sampleEvents = events.length > 0 ? events : [
    { id: 1, date: '2025-09-05', title: 'Training Session' },
    { id: 2, date: '2025-09-09', title: 'Match Day' },
    { id: 3, date: '2025-09-13', title: 'Photo Session' },
    { id: 4, date: '2025-09-14', title: 'Video Editing' },
    { id: 5, date: '2025-09-16', title: 'Team Meeting' },
    { id: 6, date: '2025-09-18', title: 'Practice Match' },
    { id: 7, date: '2025-09-20', title: 'Equipment Check' },
    { id: 8, date: '2025-09-25', title: 'Final Match' },
    { id: 9, date: '2025-09-27', title: 'Awards Ceremony' },
    { id: 10, date: '2025-09-30', title: 'Season Wrap' }
  ];

  // Filter schedules based on selected date
  useEffect(() => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const filtered = schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.date).toISOString().split('T')[0];
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
    alert(`Edit jadwal: ${schedule.namaTim}`);
    // Here you would typically open an edit modal with pre-filled data
  };

  const handleDeleteSchedule = (scheduleId) => {
    alert(`Jadwal dengan ID ${scheduleId} akan dihapus`);
    // Here you would typically make an API call to delete the schedule
  };

  const handleScheduleClick = (schedule) => {
    alert(`Melihat detail jadwal: ${schedule.team}`);
    // Here you could open a detailed view or modal
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      // Implement actual logout logic here
      window.location.href = '/login';
    }
  };

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
            <StatsCards stats={stats} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Calendar and Schedule Table */}
            <div className="xl:col-span-3 space-y-6">
              {/* Calendar */}
              <Calendar
                events={sampleEvents}
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
                {sampleEvents.length}
              </div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>

            <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
              <div className="text-2xl font-bold text-green-600">
                {schedules.length || '8'}
              </div>
              <div className="text-sm text-gray-600">Active Schedules</div>
            </div>

            <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
              <div className="text-2xl font-bold text-purple-600">
                {filteredSchedules.length}
              </div>
              <div className="text-sm text-gray-600">Today's Schedule</div>
            </div>

            <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
              <div className="text-2xl font-bold text-orange-600">
                {new Date().getHours() < 12 ? 'Pagi' : new Date().getHours() < 17 ? 'Siang' : 'Malam'}
              </div>
              <div className="text-sm text-gray-600">Waktu Sekarang</div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 py-6 border-t border-gray-200">
            <div className="text-center text-gray-500 text-sm">
              <p>&copy; 2025 Dashboard Admin. All rights reserved.</p>
              <p className="mt-1">
                Built with React, Inertia.js, and Tailwind CSS
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
