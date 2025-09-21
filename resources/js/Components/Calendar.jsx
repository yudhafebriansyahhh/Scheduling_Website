import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Clock, MapPin, Users, Eye } from 'lucide-react';

const Calendar = ({ events = [], schedules = [], onDateSelect, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];

  // Group schedules by date
  const schedulesByDate = useMemo(() => {
    const grouped = {};
    schedules.forEach(schedule => {
      // Normalize date key to YYYY-MM-DD
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

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month filler
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i;
      days.push({ day, date: new Date(year, month - 1, day), isCurrentMonth: false, isToday: false, hasEvent: false });
    }

    // Current month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = today.toDateString() === date.toDateString();
      const hasSchedule = schedulesByDate[dateStr] && schedulesByDate[dateStr].length > 0;

      // Check events as well
      const hasEventFromEvents = events.some(e => new Date(e.date).toISOString().split('T')[0] === dateStr);
      const hasEvent = hasSchedule || hasEventFromEvents;

      days.push({ day, date, dateStr, isCurrentMonth: true, isToday, hasEvent });
    }

    // Next month filler
    const totalCells = 42;
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({ day: i, date: new Date(year, month + 1, i), isCurrentMonth: false, isToday: false, hasEvent: false });
    }

    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
    setShowPopup(false);
  };

  const handleDateClick = (dateObj) => {
    if (onDateSelect) onDateSelect(dateObj.date);

    const activities = schedulesByDate[dateObj.dateStr];
    if (activities && activities.length > 0) {
      setPopupData({ date: dateObj.date, activities });
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  };

  const isSelectedDate = (dateObj) => {
    if (!selectedDate || !dateObj.isCurrentMonth) return false;
    return selectedDate.toDateString() === dateObj.date.toDateString();
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    if (onDateSelect) onDateSelect(today);
    setShowPopup(false);
  };

  const getStatusColor = (status) => ({
    'in_progress': 'bg-green-500',
    'pending': 'bg-yellow-500',
    'completed': 'bg-blue-500',
    'cancelled': 'bg-red-500'
  }[status] || 'bg-gray-500');

  const getStatusText = (status) => ({
    'in_progress': 'Sedang Berlangsung',
    'pending': 'Menunggu',
    'completed': 'Selesai',
    'cancelled': 'Dibatalkan'
  }[status] || 'Unknown');

  const formatDate = (date) =>
    new Intl.DateTimeFormat('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(date);

  // Close popup on click outside or ESC
  useEffect(() => {
    const handleClickOutside = (e) => { if (showPopup && !e.target.closest('.popup-content')) setShowPopup(false); };
    const handleEsc = (e) => { if (e.key === 'Escape') setShowPopup(false); };
    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [showPopup]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Kalender</h3>
        <div className="flex items-center space-x-4">
          <button onClick={goToToday} className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors">Hari ini</button>
          <div className="flex items-center space-x-2">
            <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft size={20} /></button>
            <span className="font-medium min-w-[150px] text-center">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
            <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map(day => <div key={day} className="p-3 text-center text-xs font-semibold text-gray-500 uppercase">{day}</div>)}
        {generateCalendarDays().map((dateObj, idx) => {
          const isSelected = isSelectedDate(dateObj);
          const isHovered = hoveredDate === idx;
          const activities = schedulesByDate[dateObj.dateStr] || [];
          const activityCount = activities.length;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredDate(idx)}
              onMouseLeave={() => setHoveredDate(null)}
              onClick={() => handleDateClick(dateObj)}
              className={`relative p-3 text-center text-sm cursor-pointer rounded-lg transition-all duration-200
                ${dateObj.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                ${dateObj.isToday ? 'bg-blue-500 text-white font-semibold' : isSelected ? 'bg-blue-100 text-blue-800 font-semibold' : isHovered ? 'bg-gray-100' : 'hover:bg-gray-50'}
              `}
            >
              <span className="relative z-10">{dateObj.day}</span>

              {/* Event indicators */}
              {activityCount > 0 && !dateObj.isToday && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {Array.from({ length: Math.min(activityCount, 3) }).map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-blue-500 rounded-full"></div>
                  ))}
                </div>
              )}

              {/* Tooltip */}
              {isHovered && activityCount > 0 && (
                <div className="absolute z-20 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-48 bg-white border border-gray-200 shadow-lg rounded-lg text-left text-xs p-2 popup-content">
                  <div className="font-semibold mb-1">{formatDate(dateObj.date)}</div>
                  {activities.map(act => (
                    <div key={act.id} className="mb-2 border-b border-gray-100 pb-1">
                      <div className="flex items-center space-x-1 text-gray-700"><Clock size={14} /> <span>{act.time}</span></div>
                      <div className="flex items-center space-x-1 text-gray-700"><Users size={14} /> <span>{act.team}</span></div>
                      <div className="flex items-center space-x-1 text-gray-700"><MapPin size={14} /> <span>{act.lapangan || '-'}</span></div>
                      <div className="flex items-center space-x-1 text-gray-700"><Eye size={14} /> <span>{getStatusText(act.status)}</span></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
