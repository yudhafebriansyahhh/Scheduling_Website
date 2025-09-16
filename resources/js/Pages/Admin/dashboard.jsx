import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import {
  Calendar,
  Users,
  Edit,
  FileText,
  LogOut,
  Home,
  Camera,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';

const Dashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Sample data
  const stats = [
    { title: 'Jadwal Bulan Ini', value: '12', icon: Calendar, color: 'bg-blue-100 text-blue-600' },
    { title: 'Total Fotografer', value: '6', icon: Users, color: 'bg-purple-100 text-purple-600' },
    { title: 'Total Editor', value: '3', icon: Edit, color: 'bg-green-100 text-green-600' }
  ];

  const scheduleData = [
    { date: '13 September 2025', time: '16.00 - SG FC', location: 'Lapangan 1' },
    { date: '13 September 2025', time: '16.00 - SG FC', location: 'Lapangan 1' },
    { date: '13 September 2025', time: '16.00 - SG FC', location: 'Lapangan 1' },
    { date: '13 September 2025', time: '16.00 - SG FC', location: 'Lapangan 1' },
    { date: '13 September 2025', time: '16.00 - SG FC', location: 'Lapangan 1' }
  ];

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonth.getDate() - i,
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Current month days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = today.getDate() === day &&
                     today.getMonth() === month &&
                     today.getFullYear() === year;
      days.push({
        day,
        isCurrentMonth: true,
        isToday,
        hasEvent: [5, 9, 13, 14, 16, 18, 20, 25, 27, 30].includes(day)
      });
    }

    // Next month days
    const totalCells = 42; // 6 rows × 7 days
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false
      });
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  return (
    <>
      <Head title="Dashboard Admin" />
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">Dashboard Admin</h2>
            <p className="text-sm text-gray-500">Selamat Datang</p>
          </div>

          <nav className="mt-6">
            <div className="px-6">
              <div className="bg-blue-500 text-white rounded-lg p-3 mb-2 flex items-center">
                <Home size={20} className="mr-3" />
                Dashboard
              </div>
              <div className="text-gray-600 p-3 hover:bg-gray-100 rounded-lg cursor-pointer flex items-center">
                <Camera size={20} className="mr-3" />
                Fotografer
              </div>
              <div className="text-gray-600 p-3 hover:bg-gray-100 rounded-lg cursor-pointer flex items-center">
                <Edit size={20} className="mr-3" />
                Editor
              </div>
              <div className="text-gray-600 p-3 hover:bg-gray-100 rounded-lg cursor-pointer flex items-center">
                <FileText size={20} className="mr-3" />
                Laporan
              </div>
            </div>

            <div className="px-6 mt-8 pt-8 border-t">
              <div className="text-red-500 p-3 hover:bg-red-50 rounded-lg cursor-pointer flex items-center">
                <LogOut size={20} className="mr-3" />
                Logout
              </div>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                    <p className="text-gray-600">{stat.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Kalender</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="font-medium">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </span>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Day Headers */}
                {dayNames.map(day => (
                  <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {generateCalendarDays().map((date, index) => (
                  <div
                    key={index}
                    className={`
                      p-2 text-center text-sm cursor-pointer relative
                      ${date.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                      ${date.isToday ? 'bg-blue-500 text-white rounded-lg' : 'hover:bg-gray-100 rounded-lg'}
                    `}
                  >
                    {date.day}
                    {date.hasEvent && !date.isToday && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Schedule Table */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Jadwal</h4>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center text-sm">
                    <Plus size={16} className="mr-2" />
                    Tambah
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">No</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Jam</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Nama Tim</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Fotografer</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Editor</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Lapangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Empty rows for demonstration */}
                      {[1, 2, 3, 4, 5].map(i => (
                        <tr key={i} className="border-b">
                          <td className="py-3 px-4">{i}</td>
                          <td className="py-3 px-4">-</td>
                          <td className="py-3 px-4">-</td>
                          <td className="py-3 px-4">-</td>
                          <td className="py-3 px-4">-</td>
                          <td className="py-3 px-4">-</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Schedule Sidebar */}
            <div className="bg-blue-500 text-white rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Calendar size={24} className="mr-2" />
                <h3 className="text-lg font-semibold">Jadwal</h3>
              </div>

              <div className="text-center mb-6">
                <div className="text-2xl font-bold">13 September 2025</div>
              </div>

              <div className="space-y-4">
                {scheduleData.map((schedule, index) => (
                  <div key={index} className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="font-medium">{schedule.time}</div>
                    <div className="text-sm opacity-90">{schedule.location}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
