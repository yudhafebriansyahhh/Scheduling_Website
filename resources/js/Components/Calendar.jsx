import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Clock, MapPin, Users, Eye, Calendar as CalendarIcon, List, Grid } from 'lucide-react';

// Reusable ScrollContainer component
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
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
};

const Calendar = ({ events = [], schedules = [], onDateSelect, selectedDate, onEventClick }) => {
  console.log('Calendar Props:', { events, schedules });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const [viewMode, setViewMode] = useState('month');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
  const dayNamesLong = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // Helper function to parse time - SIMPLIFIED
  const parseTimeToMinutes = (timeString) => {
    if (!timeString || timeString === 'Tidak ada waktu') return null;

    try {
      const parts = timeString.split(':');
      if (parts.length >= 2) {
        const hour = parseInt(parts[0], 10);
        const minute = parseInt(parts[1], 10);

        if (isNaN(hour) || isNaN(minute)) return null;

        // Return time in minutes since midnight
        return hour * 60 + minute;
      }
    } catch (error) {
      console.warn('Error parsing time:', timeString, error);
    }
    return null;
  };

  // Helper function to format time without seconds
  const formatTime = (timeString) => {
    if (!timeString) return 'Tidak ada waktu';

    try {
      const parts = timeString.split(':');
      if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
      }
    } catch (error) {
      console.warn('Error formatting time:', timeString, error);
    }
    return timeString;
  };

  // Helper function to format time range
  const formatTimeRange = (start, end) => {
    const startFormatted = formatTime(start);
    const endFormatted = formatTime(end);

    if (startFormatted === 'Tidak ada waktu' || endFormatted === 'Tidak ada waktu') {
      return 'Waktu belum ditentukan';
    }

    return `${startFormatted} - ${endFormatted}`;
  };

  // Helper function untuk mendapatkan nama lapangan
  const getLapanganName = (lapangan) => {
    if (lapangan && typeof lapangan === 'object' && lapangan.nama_lapangan) {
      return lapangan.nama_lapangan;
    }
    if (typeof lapangan === 'string') {
      return lapangan;
    }
    return '-';
  };

  // Group schedules by date - IMPROVED with better error handling
  const schedulesByDate = useMemo(() => {
    console.log('=== PROCESSING SCHEDULES ===');
    console.log('Raw schedules:', schedules);

    const grouped = {};

    if (!Array.isArray(schedules)) {
      console.warn('Schedules is not an array:', schedules);
      return grouped;
    }

    schedules.forEach((schedule, index) => {
      try {
        console.log(`Processing schedule ${index + 1}:`, schedule);

        // Validasi tanggal
        if (!schedule.tanggal) {
          console.warn(`Schedule ${index + 1} missing tanggal:`, schedule);
          return;
        }

        // Parse tanggal dengan berbagai format
        let date;
        try {
          date = new Date(schedule.tanggal);
          if (isNaN(date.getTime())) {
            console.warn(`Invalid date in schedule ${index + 1}:`, schedule.tanggal);
            return;
          }
        } catch (dateError) {
          console.warn(`Date parsing error for schedule ${index + 1}:`, dateError);
          return;
        }

        const dateKey = date.toISOString().split('T')[0];
        console.log(`Date key for schedule ${index + 1}:`, dateKey);

        if (!grouped[dateKey]) grouped[dateKey] = [];

        // Format waktu
        let formattedTime = 'Waktu belum ditentukan';
        if (schedule.waktu) {
          formattedTime = formatTime(schedule.waktu);
        } else if (schedule.jamMulai && schedule.jamSelesai) {
          formattedTime = formatTimeRange(schedule.jamMulai, schedule.jamSelesai);
        } else if (schedule.jamMulai) {
          formattedTime = `${formatTime(schedule.jamMulai)} - selesai`;
        }

        // Parse waktu untuk filtering (dengan fallback yang lebih baik)
        const timeStartMinutes = parseTimeToMinutes(schedule.jamMulai);
        const timeEndMinutes = parseTimeToMinutes(schedule.jamSelesai);

        console.log(`Time parsing for schedule ${index + 1}:`, {
          jamMulai: schedule.jamMulai,
          jamSelesai: schedule.jamSelesai,
          timeStartMinutes,
          timeEndMinutes,
          formattedTime
        });

        const processedSchedule = {
          id: schedule.id || `schedule_${index}`,
          time: formattedTime,
          timeStart: schedule.jamMulai || '00:00',
          timeEnd: schedule.jamSelesai || '23:59',
          timeStartMinutes,
          timeEndMinutes,
          team: schedule.namaEvent || schedule.team || `Event ${index + 1}`,
          fotografer: schedule.fotografer?.nama || schedule.fotografer || '-',
          editor: schedule.editor?.nama || schedule.editor || '-',
          lapangan: getLapanganName(schedule.lapangan) || getLapanganName(schedule.location) || '-',
          status: schedule.status || 'pending',
          description: schedule.catatan || 'Tidak ada deskripsi tambahan',
          // Raw data for debugging
          _raw: schedule
        };

        grouped[dateKey].push(processedSchedule);
        console.log(`Added schedule to ${dateKey}:`, processedSchedule);

      } catch (error) {
        console.error(`Error processing schedule ${index + 1}:`, schedule, error);
      }
    });

    console.log('=== FINAL GROUPED SCHEDULES ===');
    console.log(grouped);

    // Log statistik
    const totalDates = Object.keys(grouped).length;
    const totalSchedules = Object.values(grouped).reduce((acc, arr) => acc + arr.length, 0);
    console.log(`Grouped into ${totalDates} dates with ${totalSchedules} total schedules`);

    return grouped;
  }, [schedules]);

  // Generate time slots for week/day view
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 60) { // Every hour instead of 30min for better performance
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

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
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = today.toDateString() === date.toDateString();
      const hasSchedule = schedulesByDate[dateStr] && schedulesByDate[dateStr].length > 0;

      const hasEventFromEvents = events.some(e => {
        try {
          if (!e.date) return false;
          const eventDate = new Date(e.date);
          const eventDateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
          return !isNaN(eventDate.getTime()) && eventDateStr === dateStr;
        } catch (error) {
          console.error('Error checking event date:', e, error);
          return false;
        }
      });

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

  const generateWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(currentDate.getDate() - day);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const today = new Date();
      const isToday = today.toDateString() === date.toDateString();

      weekDays.push({
        date,
        dateStr,
        isToday,
        activities: schedulesByDate[dateStr] || []
      });
    }
    return weekDays;
  };

  const getListEvents = () => {
    console.log('=== GENERATING LIST EVENTS ===');
    const allEvents = [];

    Object.keys(schedulesByDate).forEach(dateStr => {
      const date = new Date(dateStr);
      schedulesByDate[dateStr].forEach(activity => {
        allEvents.push({
          ...activity,
          date,
          dateStr
        });
      });
    });

    const sortedEvents = allEvents.sort((a, b) => new Date(a.dateStr) - new Date(b.dateStr));
    console.log('List events generated:', sortedEvents.length, 'events');
    console.log('Sample events:', sortedEvents.slice(0, 3));

    return sortedEvents;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'month') {
        newDate.setMonth(prev.getMonth() + direction);
      } else if (viewMode === 'week') {
        newDate.setDate(prev.getDate() + (direction * 7));
      } else if (viewMode === 'day') {
        newDate.setDate(prev.getDate() + direction);
      }
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
    'in_progress': 'bg-blue-500',
    'pending': 'bg-yellow-500',
    'completed': 'bg-green-500',
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

  const getViewTitle = () => {
    if (viewMode === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (viewMode === 'week') {
      const weekDays = generateWeekDays();
      const start = weekDays[0].date;
      const end = weekDays[6].date;
      return `${start.getDate()} - ${end.getDate()} ${monthNames[start.getMonth()]} ${start.getFullYear()}`;
    } else if (viewMode === 'day') {
      return formatDate(currentDate);
    } else {
      return 'Daftar Jadwal';
    }
  };

  const getNavigationText = () => {
    if (viewMode === 'month') return 'bulan';
    if (viewMode === 'week') return 'minggu';
    if (viewMode === 'day') return 'hari';
    return '';
  };

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

  // Check if activities match time slot - SIMPLIFIED
  const isActivityInTimeSlot = (activity, slotTimeMinutes) => {
    // If no time info available, show in first few slots
    if (activity.timeStartMinutes === null || activity.timeEndMinutes === null) {
      return slotTimeMinutes >= 0 && slotTimeMinutes < 120; // Show in first 2 hours of day
    }

    // Handle midnight crossing
    if (activity.timeEndMinutes <= activity.timeStartMinutes) {
      return slotTimeMinutes >= activity.timeStartMinutes || slotTimeMinutes < activity.timeEndMinutes;
    }

    // Normal case - activity within same day
    return slotTimeMinutes >= activity.timeStartMinutes && slotTimeMinutes < activity.timeEndMinutes;
  };

  // Render Month View - FIXED HEIGHT
  const renderMonthView = () => (
    <div className="h-[600px] flex flex-col">
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {dayNames.map(day =>
          <div key={day} className="p-2 sm:p-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            {day}
          </div>
        )}
      </div>

      <div className="flex-1 grid grid-cols-7 gap-1 sm:gap-2 h-full">
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
              className={`relative p-1 sm:p-2 text-center text-sm cursor-pointer rounded-lg transition-all duration-200 flex flex-col
                ${dateObj.isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}
                ${dateObj.isToday ? 'bg-blue-500 text-white font-semibold' :
                  isSelected ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-semibold' :
                  isHovered ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}
              `}
            >
              <span className="relative z-10 text-xs sm:text-sm mb-1">{dateObj.day}</span>

              {/* Event indicators */}
              {activityCount > 0 && !dateObj.isToday && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                  {Array.from({ length: Math.min(activityCount, 3) }).map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-blue-500 rounded-full"></div>
                  ))}
                </div>
              )}

              {/* Mini events display */}
              <div className="flex-1 flex flex-col space-y-0.5">
                {activities.slice(0, window.innerWidth < 640 ? 1 : 2).map((activity, i) => (
                  <div
                    key={i}
                    className={`text-xs px-0.5 sm:px-1 py-0.5 rounded text-white truncate ${getStatusColor(activity.status)}`}
                    title={`${activity.team} - ${activity.time}`}
                  >
                    <span className="hidden sm:inline">{activity.team}</span>
                    <span className="sm:hidden">•</span>
                  </div>
                ))}
                {activityCount > (window.innerWidth < 640 ? 1 : 2) && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">+{activityCount - (window.innerWidth < 640 ? 1 : 2)}</div>
                )}
              </div>

              {/* Tooltip */}
              {isHovered && activityCount > 0 && window.innerWidth >= 768 && (
                <div className="absolute z-20 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-lg rounded-lg text-left text-xs p-2 popup-content">
                  <div className="font-semibold mb-1 text-gray-900 dark:text-white">{formatDate(dateObj.date)}</div>
                  {activities.slice(0, 3).map(act => (
                    <div key={act.id} className="mb-2 border-b border-gray-100 dark:border-gray-600 pb-1">
                      <div className="flex items-center space-x-1 text-gray-700 dark:text-gray-300">
                        <Clock size={12} />
                        <span>{act.time}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-700 dark:text-gray-300">
                        <Users size={12} />
                        <span className="truncate">{act.team}</span>
                      </div>
                    </div>
                  ))}
                  {activities.length > 3 && (
                    <div className="text-xs text-gray-500">+{activities.length - 3} lainnya</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render Week View - FIXED HEIGHT
  const renderWeekView = () => {
    const weekDays = generateWeekDays();
    const timeSlots = generateTimeSlots();

    return (
      <div className="h-[600px] flex flex-col w-full overflow-x-auto">
        {/* Header */}
        <div className="min-w-[600px] grid grid-cols-8 gap-px mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
          <div className="bg-gray-100 dark:bg-gray-800 p-2 sm:p-3 flex items-center justify-center text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 h-[60px]">
            Waktu
          </div>
          {weekDays.map((day, idx) => (
            <div key={idx} className={`p-2 sm:p-3 text-center text-xs sm:text-sm font-medium transition-colors flex flex-col items-center justify-center h-[60px]
              ${day.isToday
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }
            `}>
              <div className="text-xs opacity-75 hidden sm:block">{dayNamesLong[day.date.getDay()]}</div>
              <div className="text-xs sm:hidden">{dayNames[day.date.getDay()]}</div>
              <div className="text-base sm:text-lg font-semibold">{day.date.getDate()}</div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-[600px] bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <ScrollContainer maxHeight="100%">
            {timeSlots.map((timeSlot, slotIdx) => {
              const slotTimeMinutes = parseTimeToMinutes(timeSlot);

              return (
                <div key={timeSlot} className="grid grid-cols-8 gap-px border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="p-1 sm:p-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex items-center justify-center h-[50px]">
                    <span className="font-mono">{timeSlot}</span>
                  </div>

                  {weekDays.map((day, dayIdx) => {
                    // Show all activities for this day (simplified filtering)
                    const dayActivities = day.activities.filter(activity =>
                      isActivityInTimeSlot(activity, slotTimeMinutes)
                    );

                    return (
                      <div
                        key={dayIdx}
                        className="p-0.5 sm:p-1 min-h-[50px] border-r border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors relative"
                        onClick={() => handleDateClick({ date: day.date, dateStr: day.dateStr })}
                      >
                        <div className="flex flex-col space-y-0.5">
                          {dayActivities.map((activity, activityIdx) => (
                            <div
                              key={`${activity.id}-${activityIdx}`}
                              className={`text-xs p-1 rounded-md text-white shadow-sm ${getStatusColor(activity.status)} hover:shadow-md transition-shadow cursor-pointer flex-shrink-0`}
                              title={`${activity.team}\n${activity.time}\n${activity.lapangan || ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEventClick && onEventClick(activity.id);
                              }}
                            >
                              <div className="font-medium truncate text-xs leading-tight">{activity.team}</div>
                              {activity.lapangan && activity.lapangan !== '-' && (
                                <div className="text-xs opacity-90 truncate hidden sm:block leading-tight">{activity.lapangan}</div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Show count if more than 3 activities */}
                        {dayActivities.length > 3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                            +{dayActivities.length - 3} lainnya
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </ScrollContainer>
        </div>
      </div>
    );
  };

  // Render Day View - FIXED HEIGHT
  const renderDayView = () => {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayActivities = schedulesByDate[dateStr] || [];
    const timeSlots = generateTimeSlots();

    return (
      <div className="h-[600px] flex flex-col space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-3 sm:p-4 text-center flex-shrink-0">
          <h3 className="text-base sm:text-lg font-semibold">
            {dayNamesLong[currentDate.getDay()]}, {currentDate.getDate()} {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <p className="text-blue-100 text-sm mt-1">
            {dayActivities.length} jadwal hari ini
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <ScrollContainer maxHeight="100%">
            {timeSlots.map(timeSlot => {
              const slotTimeMinutes = parseTimeToMinutes(timeSlot);
              const slotActivities = dayActivities.filter(activity =>
                isActivityInTimeSlot(activity, slotTimeMinutes)
              );

              return (
                <div key={timeSlot} className="flex border-b border-gray-100 dark:border-gray-800 min-h-[60px] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="w-16 sm:w-20 p-2 sm:p-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex items-center justify-center">
                    <span className="font-mono">{timeSlot}</span>
                  </div>

                  <div className="flex-1 p-1 sm:p-2">
                    {slotActivities.length > 0 ? (
                      <div className="space-y-1 sm:space-y-2">
                        {slotActivities.map(activity => (
                          <div
                            key={activity.id}
                            className={`p-2 sm:p-3 rounded-lg text-white cursor-pointer hover:shadow-md transition-all ${getStatusColor(activity.status)}`}
                            onClick={() => onEventClick && onEventClick(activity.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-xs sm:text-sm truncate">{activity.team}</div>
                                <div className="text-xs opacity-90 mt-1">{activity.time}</div>
                                {activity.lapangan && activity.lapangan !== '-' && (
                                  <div className="text-xs opacity-75 mt-1 truncate">📍 {activity.lapangan}</div>
                                )}
                              </div>
                              <div className="text-xs opacity-75 ml-2 hidden sm:block">
                                {getStatusText(activity.status)}
                              </div>
                            </div>

                            {(activity.fotografer !== '-' || activity.editor !== '-') && (
                              <div className="mt-2 pt-2 border-t border-white/20 text-xs opacity-90 hidden sm:block">
                                {activity.fotografer !== '-' && <span>📷 {activity.fotografer}</span>}
                                {activity.fotografer !== '-' && activity.editor !== '-' && <span className="mx-2">•</span>}
                                {activity.editor !== '-' && <span>✂️ {activity.editor}</span>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
                        <span className="text-xs sm:text-sm">Tidak ada jadwal</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </ScrollContainer>
        </div>

        {/* Summary card */}
        {dayActivities.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4 flex-shrink-0">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Ringkasan Hari Ini</h4>
            <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total jadwal:</span>
                <span className="font-medium text-gray-900 dark:text-white ml-2">{dayActivities.length}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Berlangsung:</span>
                <span className="font-medium text-green-600 ml-2">
                  {dayActivities.filter(a => a.status === 'in_progress').length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render List View - FIXED HEIGHT and IMPROVED DATA DISPLAY
  const renderListView = () => {
    const listEvents = getListEvents();

    console.log('=== RENDERING LIST VIEW ===');
    console.log('Total events to display:', listEvents.length);

    return (
      <div className="h-[600px] flex flex-col space-y-4">
        {/* Header info */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 px-1 flex-shrink-0">
          <span>Total jadwal: <strong>{listEvents.length}</strong></span>
          {listEvents.length > 5 && (
            <span className="text-blue-600 dark:text-blue-400">Scroll untuk melihat semua</span>
          )}
        </div>

        {listEvents.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="text-2xl mb-2">📅</div>
              <div>Tidak ada jadwal yang ditemukan</div>
              <div className="text-sm mt-1">Pastikan data sudah dimuat dengan benar</div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <ScrollContainer maxHeight="100%" className="space-y-3">
              {listEvents.map((event, index) => (
                <div
                  key={`${event.dateStr}-${event.id}-${index}`}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600"
                  onClick={() => onEventClick && onEventClick(event.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Status and Date */}
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-3">
                        <span className={`px-2 py-1 text-xs text-white rounded-full ${getStatusColor(event.status)} inline-block w-fit shadow-sm`}>
                          {getStatusText(event.status)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          {formatDate(event.date)}
                        </span>
                      </div>

                      {/* Event Title */}
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 truncate text-base">
                        {event.team}
                      </h3>

                      {/* Event Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-md px-2 py-1">
                          <Clock size={14} className="text-blue-500 flex-shrink-0" />
                          <span className="truncate">{event.time}</span>
                        </div>

                        {event.lapangan !== '-' && (
                          <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-md px-2 py-1">
                            <MapPin size={14} className="text-green-500 flex-shrink-0" />
                            <span className="truncate">{event.lapangan}</span>
                          </div>
                        )}

                        {event.fotografer !== '-' && (
                          <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-md px-2 py-1">
                            <Users size={14} className="text-purple-500 flex-shrink-0" />
                            <span className="truncate">📷 {event.fotografer}</span>
                          </div>
                        )}

                        {event.editor !== '-' && (
                          <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-md px-2 py-1">
                            <Eye size={14} className="text-orange-500 flex-shrink-0" />
                            <span className="truncate">✂️ {event.editor}</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {event.description !== 'Tidak ada deskripsi tambahan' && (
                        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm text-gray-700 dark:text-gray-300 border-l-4 border-blue-400">
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Catatan:</span>
                          <div className="mt-1">{event.description}</div>
                        </div>
                      )}

                      {/* Debug info in development */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="mt-2 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 p-1 rounded">
                          ID: {event.id} | Date: {event.dateStr} | Start: {event.timeStart} | End: {event.timeEnd}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </ScrollContainer>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 relative transition-colors duration-300 h-[800px] flex flex-col">
      {/* Header - Responsive */}
      <div className="flex flex-col space-y-4 mb-6 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-100 flex items-center">
            📅 Kalender Jadwal
          </h3>

          {/* View Mode Buttons - Responsive */}
          <div className="flex items-center justify-center sm:justify-end">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto">
              <button
                onClick={() => setViewMode('month')}
                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  viewMode === 'month'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <CalendarIcon size={14} className="inline mr-1" />
                <span className="hidden sm:inline">Bulan</span>
                <span className="sm:hidden">B</span>
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  viewMode === 'week'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Grid size={14} className="inline mr-1" />
                <span className="hidden sm:inline">Minggu</span>
                <span className="sm:hidden">M</span>
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  viewMode === 'day'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Clock size={14} className="inline mr-1" />
                <span className="hidden sm:inline">Hari</span>
                <span className="sm:hidden">H</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <List size={14} className="inline mr-1" />
                <span className="hidden sm:inline">Daftar</span>
                <span className="sm:hidden">D</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2 sm:space-x-4 justify-center sm:justify-start">
            <button
              onClick={goToToday}
              className="px-3 py-1 text-xs sm:text-sm bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              Hari ini
            </button>
            {viewMode !== 'list' && (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  title={`${getNavigationText()} sebelumnya`}
                >
                  <ChevronLeft size={16} className="text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  title={`${getNavigationText()} selanjutnya`}
                >
                  <ChevronRight size={16} className="text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            )}
          </div>

          {viewMode !== 'list' && (
            <span className="font-medium text-sm sm:text-base text-center text-gray-900 dark:text-white">
              {getViewTitle()}
            </span>
          )}
        </div>
      </div>

      {/* Calendar Content - Fixed height */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'list' && renderListView()}
      </div>

      {/* Popup Detail Modal */}
      {showPopup && popupData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden popup-content flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detail Jadwal
              </h3>
              <button
                onClick={() => setShowPopup(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-hidden">
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                  {formatDate(popupData.date)}
                </h4>
              </div>

              <ScrollContainer maxHeight="60vh" className="space-y-3 sm:space-y-4">
                {popupData.activities.map((activity, index) => (
                  <div
                    key={activity.id || index}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 space-y-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => onEventClick && onEventClick(activity.id)}
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate pr-2">
                        {activity.team}
                      </h5>
                      <span className={`px-2 py-1 text-xs text-white rounded-full ${getStatusColor(activity.status)} whitespace-nowrap`}>
                        {getStatusText(activity.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center space-x-2">
                        <Clock size={14} />
                        <span>{activity.time}</span>
                      </div>

                      {activity.lapangan && activity.lapangan !== '-' && (
                        <div className="flex items-center space-x-2">
                          <MapPin size={14} />
                          <span className="truncate">{activity.lapangan}</span>
                        </div>
                      )}

                      {activity.fotografer && activity.fotografer !== '-' && (
                        <div className="flex items-center space-x-2">
                          <Users size={14} />
                          <span className="truncate">Fotografer: {activity.fotografer}</span>
                        </div>
                      )}

                      {activity.editor && activity.editor !== '-' && (
                        <div className="flex items-center space-x-2">
                          <Eye size={14} />
                          <span className="truncate">Editor: {activity.editor}</span>
                        </div>
                      )}
                    </div>

                    {activity.description && activity.description !== 'Tidak ada deskripsi tambahan' && (
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-300">
                        {activity.description}
                      </div>
                    )}
                  </div>
                ))}
              </ScrollContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
