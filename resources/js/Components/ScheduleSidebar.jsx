import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, ChevronRight, Eye } from 'lucide-react';

const ScheduleSidebar = ({ selectedDate, schedules = [], onScheduleClick }) => {
  const [expandedSchedule, setExpandedSchedule] = useState(null);

  // Sample schedule data
  const sampleSchedules = [
    {
      id: 1,
      time: '16:00 - 18:00',
      team: 'SG FC',
      location: 'Lapangan 1',
      fotografer: 'John Doe',
      editor: 'Jane Smith',
      status: 'active',
      description: 'Pertandingan persahabatan antara SG FC vs Team Alpha'
    },
    {
      id: 2,
      time: '18:30 - 20:30',
      team: 'Team Alpha',
      location: 'Lapangan 2',
      fotografer: 'Mike Johnson',
      editor: 'Sarah Wilson',
      status: 'pending',
      description: 'Training session untuk persiapan turnamen'
    },
    {
      id: 3,
      time: '20:00 - 22:00',
      team: 'FC United',
      location: 'Lapangan 1',
      fotografer: 'David Brown',
      editor: 'Emily Davis',
      status: 'completed',
      description: 'Sesi latihan rutin mingguan'
    }
  ];

  const data = schedules.length > 0 ? schedules : sampleSchedules;

  const formatDate = (date) => {
    if (!date) return 'Pilih Tanggal';

    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    return new Intl.DateTimeFormat('id-ID', options).format(date);
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
    if (onScheduleClick) {
      onScheduleClick(schedule);
    } else {
      setExpandedSchedule(expandedSchedule === schedule.id ? null : schedule.id);
    }
  };

  const getTotalDuration = () => {
    return data.length * 2; // Assuming each schedule is 2 hours
  };

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 h-fit">
      {/* Header */}
      <div className="flex items-center mb-4">
        <Calendar size={24} className="mr-2" />
        <h3 className="text-lg font-semibold">Jadwal Hari Ini</h3>
      </div>

      {/* Selected Date */}
      <div className="text-center mb-6 p-4 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
        <div className="text-sm opacity-90 mb-1">Tanggal Terpilih</div>
        <div className="text-lg font-bold">{formatDate(selectedDate)}</div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center backdrop-blur-sm">
          <div className="text-2xl font-bold">{data.length}</div>
          <div className="text-sm opacity-90">Total Jadwal</div>
        </div>
        <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center backdrop-blur-sm">
          <div className="text-2xl font-bold">{getTotalDuration()}h</div>
          <div className="text-sm opacity-90">Total Durasi</div>
        </div>
      </div>

      {/* Schedule List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {data.length === 0 ? (
          <div className="text-center py-8 opacity-75">
            <Calendar size={48} className="mx-auto mb-3 opacity-50" />
            <p>Tidak ada jadwal</p>
            <p className="text-sm opacity-75">untuk hari ini</p>
          </div>
        ) : (
          data.map((schedule) => (
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
                    <div className="font-semibold text-sm">{schedule.time}</div>
                    <div className="text-xs opacity-90">{schedule.team}</div>
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
              <div className="flex items-center text-sm opacity-90 mb-2">
                <MapPin size={14} className="mr-2" />
                {schedule.location}
              </div>

              {/* Expanded Details */}
              {expandedSchedule === schedule.id && (
                <div className="mt-3 pt-3 border-t border-white border-opacity-30 space-y-2 animate-fadeIn">
                  <div className="flex items-center text-sm">
                    <Users size={14} className="mr-2" />
                    <span className="opacity-90">Fotografer: </span>
                    <span className="font-medium ml-1">{schedule.fotografer}</span>
                  </div>

                  <div className="flex items-center text-sm">
                    <Users size={14} className="mr-2" />
                    <span className="opacity-90">Editor: </span>
                    <span className="font-medium ml-1">{schedule.editor}</span>
                  </div>

                  <div className="flex items-center text-sm">
                    <Clock size={14} className="mr-2" />
                    <span className="opacity-90">Status: </span>
                    <span className="font-medium ml-1">{getStatusText(schedule.status)}</span>
                  </div>

                  {schedule.description && (
                    <div className="text-sm opacity-90 mt-2 p-2 bg-white bg-opacity-10 rounded">
                      {schedule.description}
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`Melihat detail lengkap untuk ${schedule.team}`);
                    }}
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

      {/* Quick Actions */}
      {data.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white border-opacity-30">
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md py-2 px-3 text-sm font-medium transition-all duration-200">
              Ekspor PDF
            </button>
            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md py-2 px-3 text-sm font-medium transition-all duration-200">
              Bagikan
            </button>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 text-xs opacity-75 text-center">
        Terakhir diperbarui: {new Date().toLocaleTimeString('id-ID')}
      </div>
    </div>
  );
};

export default ScheduleSidebar;
