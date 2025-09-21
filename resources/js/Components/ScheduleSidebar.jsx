import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, ChevronRight, Eye } from 'lucide-react';

export default function ScheduleSidebar({ schedules = [], onScheduleClick }) {
  const [expandedSchedule, setExpandedSchedule] = useState(null);

  // Ambil tanggal hari ini dalam format YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  // Filter jadwal hanya untuk hari ini
  const todaySchedules = schedules.filter(
    (schedule) => schedule.tanggal === today
  );

  // Gunakan data dari props
  const displaySchedules = todaySchedules;

  const formatDate = (date) => {
    const today = new Date();
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Intl.DateTimeFormat('id-ID', options).format(today);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      active: 'bg-green-500',
      pending: 'bg-yellow-500',
      completed: 'bg-blue-500',
      cancelled: 'bg-red-500'
    };
    return statusColors[status] || 'bg-gray-500';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      active: 'Aktif',
      pending: 'Menunggu',
      completed: 'Selesai',
      cancelled: 'Dibatalkan'
    };
    return statusTexts[status] || 'Unknown';
  };

  const handleScheduleClick = (schedule) => {
    setExpandedSchedule(expandedSchedule === schedule.id ? null : schedule.id);
  };

  const handleDetailClick = (e, schedule) => {
    e.stopPropagation();
    if (onScheduleClick) {
      onScheduleClick(schedule);
    } else {
      alert(`Melihat detail lengkap untuk ${schedule.namaEvent}`);
    }
  };

  const formatTime = (time) => {
    // Remove seconds if present (HH:MM:SS -> HH:MM)
    return time.split(':').slice(0, 2).join(':');
  };

  const calculateDuration = (jamMulai, jamSelesai) => {
    const start = new Date(`2000-01-01 ${jamMulai}`);
    const end = new Date(`2000-01-01 ${jamSelesai}`);
    return Math.round((end - start) / (1000 * 60 * 60));
  };

  const getTotalDuration = () => {
    return displaySchedules.reduce((total, schedule) => {
      return total + calculateDuration(schedule.jamMulai, schedule.jamSelesai);
    }, 0);
  };

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center mb-4">
        <Calendar size={24} className="mr-2" />
        <h2 className="text-lg font-semibold">Jadwal Hari Ini</h2>
      </div>

      {/* Selected Date */}
      <div className="text-center mb-6 p-4 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
        <div className="text-sm opacity-90 mb-1">Tanggal Hari Ini</div>
        <div className="text-lg font-bold">{formatDate()}</div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center backdrop-blur-sm">
          <div className="text-2xl font-bold">{displaySchedules.length}</div>
          <div className="text-sm opacity-90">Total Jadwal</div>
        </div>
        <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center backdrop-blur-sm">
          <div className="text-2xl font-bold">{getTotalDuration()}h</div>
          <div className="text-sm opacity-90">Total Durasi</div>
        </div>
      </div>

      {/* Schedule List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {displaySchedules.length === 0 ? (
          <div className="text-center py-8 opacity-75">
            <Calendar size={48} className="mx-auto mb-3 opacity-50" />
            <p>Tidak ada jadwal hari ini.</p>
          </div>
        ) : (
          displaySchedules.map((schedule) => (
            <div
              key={schedule.id}
              className={`
                bg-white bg-opacity-20 rounded-lg p-4 cursor-pointer transition-all duration-200 backdrop-blur-sm
                hover:bg-opacity-30 hover:transform hover:scale-105
                ${expandedSchedule === schedule.id ? 'bg-opacity-30' : ''}
              `}
              onClick={() => handleScheduleClick(schedule)}
            >
              {/* Main Schedule Info */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(schedule.status)}`}></div>
                  <div>
                    <div className="font-semibold text-sm">
                      {formatTime(schedule.jamMulai)} - {formatTime(schedule.jamSelesai)}
                    </div>
                    <div className="text-xs opacity-90 font-medium">{schedule.namaEvent}</div>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className={`transition-transform duration-200 ${
                    expandedSchedule === schedule.id ? 'rotate-90' : ''
                  }`}
                />
              </div>

              {/* Location */}
              {schedule.location && (
                <div className="flex items-center text-sm opacity-90 mb-2">
                  <MapPin size={14} className="mr-2" />
                  {schedule.location}
                </div>
              )}

              {/* Expanded Details */}
              {expandedSchedule === schedule.id && (
                <div className="mt-3 pt-3 border-t border-white border-opacity-30 space-y-2">
                  {schedule.fotografer && (
                    <div className="flex items-center text-sm">
                      <Users size={14} className="mr-2" />
                      <span className="opacity-90">Fotografer: </span>
                      <span className="font-medium ml-1">{schedule.fotografer}</span>
                    </div>
                  )}

                  {schedule.status && (
                    <div className="flex items-center text-sm">
                      <Clock size={14} className="mr-2" />
                      <span className="opacity-90">Status: </span>
                      <span className="font-medium ml-1">{getStatusText(schedule.status)}</span>
                    </div>
                  )}

                  <button
                    onClick={(e) => handleDetailClick(e, schedule)}
                    className="w-full mt-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md py-2 px-3 text-sm font-medium transition-all duration-200 flex items-center justify-center"
                  >
                    <Eye size={14} className="mr-2" />
                    Lihat Detail
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-xs opacity-75 text-center">
        Terakhir diperbarui: {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}
