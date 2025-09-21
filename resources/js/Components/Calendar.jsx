import React, { useState, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { Clock, MapPin, Users, Eye, X } from 'lucide-react';

export default function Calendar({ events = [], schedules = [], onEventClick, onDateSelect }) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState(null);

  // Fungsi untuk mendapatkan warna status
  const getStatusColor = (status) => ({
    'in_progress': '#10b981', // green-500
    'pending': '#f59e0b',     // yellow-500
    'completed': '#3b82f6',   // blue-500
    'cancelled': '#ef4444'    // red-500
  }[status] || '#6b7280'); // gray-500

  const getStatusText = (status) => ({
    'in_progress': 'Sedang Berlangsung',
    'pending': 'Menunggu',
    'completed': 'Selesai',
    'cancelled': 'Dibatalkan'
  }[status] || 'Unknown');

  // Konversi schedules menjadi format FullCalendar events
  const formattedEvents = useMemo(() => {
    const scheduleEvents = schedules.map(schedule => ({
      id: schedule.id,
      title: schedule.namaEvent || schedule.team || 'Event',
      start: schedule.tanggal,
      // Jika ada waktu spesifik, gabungkan dengan tanggal
      ...(schedule.jamMulai && {
        start: `${schedule.tanggal}T${schedule.jamMulai}`,
        end: `${schedule.tanggal}T${schedule.jamSelesai || schedule.jamMulai}`,
      }),
      backgroundColor: getStatusColor(schedule.status),
      borderColor: getStatusColor(schedule.status),
      textColor: 'white',
      extendedProps: {
        team: schedule.namaEvent || schedule.team,
        fotografer: schedule.fotografer,
        editor: schedule.editor,
        lapangan: schedule.lapangan,
        status: schedule.status,
        waktu: schedule.waktu || `${schedule.jamMulai} - ${schedule.jamSelesai}`,
        catatan: schedule.catatan || 'Tidak ada deskripsi tambahan',
        type: 'schedule'
      }
    }));

    // Konversi events yang sudah ada
    const existingEvents = events.map(event => ({
      ...event,
      backgroundColor: event.backgroundColor || "#3b82f6",
      borderColor: event.borderColor || "#2563eb",
      textColor: event.textColor || "white",
      extendedProps: {
        ...event.extendedProps,
        type: 'event'
      }
    }));

    return [...scheduleEvents, ...existingEvents];
  }, [schedules, events]);

  // Group schedules by date untuk popup detail
  const schedulesByDate = useMemo(() => {
    const grouped = {};
    schedules.forEach(schedule => {
      const dateKey = new Date(schedule.tanggal).toISOString().split('T')[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push({
        id: schedule.id,
        time: schedule.waktu || `${schedule.jamMulai} - ${schedule.jamSelesai}`,
        team: schedule.namaEvent || schedule.team,
        fotografer: schedule.fotografer,
        editor: schedule.editor,
        lapangan: schedule.lapangan,
        status: schedule.status,
        description: schedule.catatan || 'Tidak ada deskripsi tambahan'
      });
    });
    return grouped;
  }, [schedules]);

  const handleEventClick = (info) => {
    info.jsEvent.preventDefault();

    // Jika ada callback onEventClick, jalankan
    if (onEventClick) {
      onEventClick(info.event.id);
    }

    // Tampilkan popup detail jika event dari schedule
    if (info.event.extendedProps.type === 'schedule') {
      const eventDate = new Date(info.event.start);
      const dateStr = eventDate.toISOString().split('T')[0];
      const activities = schedulesByDate[dateStr] || [];

      setPopupData({
        date: eventDate,
        activities,
        selectedActivity: info.event.extendedProps
      });
      setShowPopup(true);
    }
  };

  const handleDateClick = (info) => {
    if (onDateSelect) {
      onDateSelect(info.date);
    }

    // Cek apakah tanggal memiliki schedule
    const dateStr = info.dateStr;
    const activities = schedulesByDate[dateStr];

    if (activities && activities.length > 0) {
      setPopupData({ date: info.date, activities });
      setShowPopup(true);
    }
  };

  const formatDate = (date) =>
    new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <h2 className="text-xl font-bold text-gray-700 dark:text-gray-100 mb-4 flex items-center">
        📅 Kalender Jadwal
      </h2>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        buttonText={{
          today: "Hari Ini",
          month: "Bulan",
          week: "Minggu",
          day: "Hari",
          list: "Daftar",
        }}
        events={formattedEvents}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        height="600px"
        eventClassNames="rounded-md shadow cursor-pointer hover:opacity-90 transition"
        dayMaxEvents={3}
        dayHeaderClassNames={() =>
          "text-gray-700 dark:text-white font-medium"
        }
        dayCellClassNames={() => "text-gray-800 dark:text-white"}
        slotLabelClassNames={() => "text-gray-700 dark:text-white"}
        locale="id" // Set locale ke Indonesia
        firstDay={1} // Mulai dari Senin
      />

      {/* Popup Detail */}
      {showPopup && popupData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto popup-content">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detail Jadwal
              </h3>
              <button
                onClick={() => setShowPopup(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {formatDate(popupData.date)}
                </h4>
              </div>

              <div className="space-y-4">
                {popupData.activities.map((activity, index) => (
                  <div
                    key={activity.id || index}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {activity.team}
                      </h5>
                      <span className={`px-2 py-1 text-xs text-white rounded-full ${
                        getStatusColor(activity.status).replace('#', 'bg-') || 'bg-gray-500'
                      }`}>
                        {getStatusText(activity.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center space-x-2">
                        <Clock size={16} />
                        <span>{activity.time}</span>
                      </div>

                      {activity.lapangan && (
                        <div className="flex items-center space-x-2">
                          <MapPin size={16} />
                          <span>{activity.lapangan}</span>
                        </div>
                      )}

                      {activity.fotografer && (
                        <div className="flex items-center space-x-2">
                          <Users size={16} />
                          <span>Fotografer: {activity.fotografer}</span>
                        </div>
                      )}

                      {activity.editor && (
                        <div className="flex items-center space-x-2">
                          <Eye size={16} />
                          <span>Editor: {activity.editor}</span>
                        </div>
                      )}
                    </div>

                    {activity.description && (
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-300">
                        {activity.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
