import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, ChevronRight, Eye } from 'lucide-react';

// Reusable ScrollContainer component - sama seperti yang ada di Calendar
const ScrollContainer = ({ children, maxHeight = '400px', className = '', style = {} }) => {
  const defaultStyle = {
    maxHeight,
    scrollbarWidth: 'thin',
    scrollbarColor: '#3b82f6 transparent',
    ...style
  };

  return (
    <div
      className={`overflow-y-auto pr-2 custom-scrollbar ${className}`}
      style={defaultStyle}
    >
      {children}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.4);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.6);
        }
      `}</style>
    </div>
  );
};

export default function ScheduleSidebar({ schedules = [], onScheduleClick }) {
  const [expandedSchedule, setExpandedSchedule] = useState(null);

  // Ambil tanggal hari ini dalam format YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];
  console.log('Today date:', today);

  // Filter jadwal hanya untuk hari ini
  const todaySchedules = schedules.filter((schedule) => {
    console.log(`Comparing schedule.tanggal: "${schedule.tanggal}" with today: "${today}"`);
    return schedule.tanggal === today;
  });

  console.log('Filtered today schedules:', todaySchedules);

  // Gunakan data dari props
  const displaySchedules = todaySchedules;

  const formatDate = () => {
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
      in_progress: 'bg-green-500',
      pending: 'bg-yellow-500',
      completed: 'bg-blue-500',
      cancelled: 'bg-red-500'
    };
    return statusColors[status] || 'bg-gray-500';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      in_progress: 'Sedang Berjalan',
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
    if (!time) return '--:--';
    // Remove seconds if present (HH:MM:SS -> HH:MM)
    return time.split(':').slice(0, 2).join(':');
  };

  const calculateDuration = (jamMulai, jamSelesai) => {
    if (!jamMulai || !jamSelesai) return 0;

    const start = new Date(`2000-01-01 ${jamMulai}`);
    const end = new Date(`2000-01-01 ${jamSelesai}`);

    // Handle cases where end time is next day
    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }

    return Math.round((end - start) / (1000 * 60 * 60));
  };

  const getTotalDuration = () => {
    return displaySchedules.reduce((total, schedule) => {
      return total + calculateDuration(schedule.jamMulai, schedule.jamSelesai);
    }, 0);
  };

  return (
    <div className="bg-gradient-to-bl from-blue-700 to-blue-500 dark:from-gray-800 dark:to-gray-700 text-white rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-colors duration-300 h-[800px] flex flex-col">
      {/* Header */}
      <div className="flex items-center mb-4 flex-shrink-0">
        <Calendar size={24} className="mr-2" />
        <h2 className="text-lg font-semibold">Jadwal Hari Ini</h2>
      </div>

      {/* Selected Date */}
      <div className="text-center mb-6 p-4 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm flex-shrink-0">
        <div className="text-sm opacity-90 mb-1">Tanggal Hari Ini</div>
        <div className="text-lg font-bold">{formatDate()}</div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6 flex-shrink-0">
        <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center backdrop-blur-sm">
          <div className="text-2xl font-bold">{displaySchedules.length}</div>
          <div className="text-sm opacity-90">Total Jadwal</div>
        </div>
        <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center backdrop-blur-sm">
          <div className="text-2xl font-bold">{getTotalDuration()} jam</div>
          <div className="text-sm opacity-90">Total Durasi</div>
        </div>
      </div>

      {/* Schedule List with ScrollContainer - flex-1 untuk mengisi sisa ruang dengan height terbatas */}
      <div className="flex-1 overflow-hidden min-h-0">
        {displaySchedules.length === 0 ? (
          <div className="text-center py-8 opacity-75 flex flex-col items-center justify-center h-full">
            <Calendar size={48} className="mx-auto mb-3 opacity-50" />
            <p>Tidak ada jadwal hari ini.</p>
            <p className="text-sm mt-2 opacity-75">Jadwal akan muncul otomatis sesuai tanggal</p>
          </div>
        ) : (
          <ScrollContainer
            maxHeight="100%"
            className="space-y-3"
            style={{
              maxHeight: '100%',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255, 255, 255, 0.4) rgba(255, 255, 255, 0.1)'
            }}
          >
            {displaySchedules.map((schedule, index) => (
              <div
                key={`${schedule.id}-${index}`}
                className={`
                  bg-white bg-opacity-20 rounded-lg p-4 cursor-pointer transition-all duration-200 backdrop-blur-sm
                  hover:bg-opacity-30 hover:transform hover:scale-[1.02] hover:shadow-lg
                  ${expandedSchedule === schedule.id ? 'bg-opacity-30 shadow-md' : ''}
                `}
                onClick={() => handleScheduleClick(schedule)}
              >
                {/* Main Schedule Info */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start flex-1 min-w-0">
                    <div className={`w-3 h-3 rounded-full mr-3 mt-1 shadow-sm flex-shrink-0 ${getStatusColor(schedule.status)}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">
                        {formatTime(schedule.jamMulai)} - {formatTime(schedule.jamSelesai)}
                      </div>
                      <div className="text-xs opacity-90 font-medium truncate pr-2">{schedule.namaEvent}</div>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`transition-transform duration-200 opacity-80 hover:opacity-100 flex-shrink-0 ${
                      expandedSchedule === schedule.id ? 'rotate-90' : ''
                    }`}
                  />
                </div>

                {/* Location - Perbaiki penggunaan lapangan dari relasi */}
                {(schedule.lapangan || schedule.location) && (
                  <div className="flex items-center text-sm opacity-90 mb-2">
                    <MapPin size={14} className="mr-2 flex-shrink-0" />
                    <span className="truncate">{schedule.lapangan || schedule.location}</span>
                  </div>
                )}

                {/* Quick Status Indicator */}
                {!expandedSchedule || expandedSchedule !== schedule.id ? (
                  <div className="flex items-center justify-between">
                    <div className="text-xs opacity-75">
                      Status: {getStatusText(schedule.status)}
                    </div>
                    <div className="text-xs opacity-60">
                      {calculateDuration(schedule.jamMulai, schedule.jamSelesai)}h
                    </div>
                  </div>
                ) : null}

                {/* Expanded Details */}
                {expandedSchedule === schedule.id && (
                  <div className="mt-3 pt-3 border-t border-white border-opacity-30 space-y-2 animate-in slide-in-from-top-1 duration-200">
                    {schedule.fotografer && schedule.fotografer !== '-' && (
                      <div className="flex items-center text-sm bg-white bg-opacity-10 rounded-md p-2">
                        <Users size={14} className="mr-2 text-blue-200 flex-shrink-0" />
                        <span className="opacity-90">Fotografer: </span>
                        <span className="font-medium ml-1 truncate">{schedule.fotografer}</span>
                      </div>
                    )}

                    {schedule.editor && schedule.editor !== '-' && (
                      <div className="flex items-center text-sm bg-white bg-opacity-10 rounded-md p-2">
                        <Eye size={14} className="mr-2 text-green-200 flex-shrink-0" />
                        <span className="opacity-90">Editor: </span>
                        <span className="font-medium ml-1 truncate">{schedule.editor}</span>
                      </div>
                    )}

                    {schedule.status && (
                      <div className="flex items-center text-sm bg-white bg-opacity-10 rounded-md p-2">
                        <Clock size={14} className="mr-2 text-yellow-200 flex-shrink-0" />
                        <span className="opacity-90">Status: </span>
                        <span className="font-medium ml-1">{getStatusText(schedule.status)}</span>
                      </div>
                    )}

                    {/* Duration Info */}
                    <div className="flex items-center text-sm bg-white bg-opacity-10 rounded-md p-2">
                      <Clock size={14} className="mr-2 text-purple-200 flex-shrink-0" />
                      <span className="opacity-90">Durasi: </span>
                      <span className="font-medium ml-1">
                        {calculateDuration(schedule.jamMulai, schedule.jamSelesai)} jam
                      </span>
                    </div>

                    {/* Description if available */}
                    {schedule.catatan && schedule.catatan !== 'Tidak ada deskripsi tambahan' && (
                      <div className="text-sm bg-white bg-opacity-10 rounded-md p-2">
                        <div className="opacity-90 mb-1">Catatan:</div>
                        <div className="font-medium text-xs leading-relaxed">{schedule.catatan}</div>
                      </div>
                    )}

                    <button
                      onClick={(e) => handleDetailClick(e, schedule)}
                      className="w-full mt-3 bg-white bg-opacity-20 hover:bg-opacity-30 active:bg-opacity-40 rounded-md py-2 px-3 text-sm font-medium transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                    >
                      <Eye size={14} className="mr-2" />
                      Lihat Detail
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Spacer untuk memastikan scroll berjalan lancar */}
            <div className="h-4"></div>
          </ScrollContainer>
        )}
      </div>

      {/* Footer Info - fixed at bottom */}
      <div className="mt-4 pt-4 border-t border-white border-opacity-20 text-xs opacity-75 text-center flex-shrink-0">
        <div>Terakhir diperbarui:</div>
        <div className="font-medium">
          {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
