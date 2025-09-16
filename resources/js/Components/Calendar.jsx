import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Clock, MapPin, Users, Eye } from 'lucide-react';

const Calendar = ({ events = [], onDateSelect, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];

  // Sample activities for demonstration
  const sampleActivities = {
    '2025-09-16': [
      {
        id: 1,
        time: '08:00 - 10:00',
        team: 'FC Barcelona',
        fotografer: 'John Doe',
        editor: 'Jane Smith',
        lapangan: 'Lapangan A',
        status: 'active',
        description: 'Pertandingan persahabatan melawan Real Madrid'
      },
      {
        id: 2,
        time: '14:00 - 16:00',
        team: 'Manchester United',
        fotografer: 'Mike Johnson',
        editor: 'Sarah Wilson',
        lapangan: 'Lapangan B',
        status: 'pending',
        description: 'Sesi latihan rutin mingguan'
      }
    ],
    '2025-09-18': [
      {
        id: 3,
        time: '16:00 - 18:00',
        team: 'Arsenal FC',
        fotografer: 'David Brown',
        editor: 'Emily Davis',
        lapangan: 'Lapangan C',
        status: 'completed',
        description: 'Training session untuk persiapan turnamen'
      }
    ],
    '2025-09-20': [
      {
        id: 4,
        time: '10:00 - 12:00',
        team: 'Chelsea FC',
        fotografer: 'Alex Wilson',
        editor: 'Maria Garcia',
        lapangan: 'Lapangan A',
        status: 'active',
        description: 'Pertandingan final liga'
      },
      {
        id: 5,
        time: '15:00 - 17:00',
        team: 'Liverpool FC',
        fotografer: 'Tom Anderson',
        editor: 'Lisa Brown',
        lapangan: 'Lapangan B',
        status: 'pending',
        description: 'Photo session untuk tim'
      },
      {
        id: 6,
        time: '19:00 - 21:00',
        team: 'Tottenham',
        fotografer: 'Chris Lee',
        editor: 'Anna Smith',
        lapangan: 'Lapangan C',
        status: 'active',
        description: 'Video shooting untuk promosi'
      }
    ]
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

    // Previous month days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i;
      days.push({
        day,
        date: new Date(year, month - 1, day),
        isCurrentMonth: false,
        isToday: false,
        hasEvent: false
      });
    }

    // Current month days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = today.getDate() === day &&
                     today.getMonth() === month &&
                     today.getFullYear() === year;

      const hasEvent = events.some(event => {
        const eventDate = new Date(event.date);
        return eventDate.getDate() === day &&
               eventDate.getMonth() === month &&
               eventDate.getFullYear() === year;
      }) || sampleActivities[dateStr];

      days.push({
        day,
        date,
        dateStr,
        isCurrentMonth: true,
        isToday,
        hasEvent
      });
    }

    // Next month days
    const totalCells = 42; // 6 rows × 7 days
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        day,
        date,
        isCurrentMonth: false,
        isToday: false,
        hasEvent: false
      });
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

  const handleDateClick = (dateObj, event) => {
    if (onDateSelect) {
      onDateSelect(dateObj.date);
    }

    // Show popup if there are activities for this date
    const activities = sampleActivities[dateObj.dateStr];
    if (activities && activities.length > 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      setPopupPosition({
        x: rect.left + scrollLeft + rect.width / 2,
        y: rect.top + scrollTop + rect.height + 5
      });

      setPopupData({
        date: dateObj.date,
        activities: activities
      });
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  };

  const isSelectedDate = (dateObj) => {
    if (!selectedDate || !dateObj.isCurrentMonth) return false;
    return selectedDate.getDate() === dateObj.day &&
           selectedDate.getMonth() === currentDate.getMonth() &&
           selectedDate.getFullYear() === currentDate.getFullYear();
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    if (onDateSelect) {
      onDateSelect(new Date());
    }
    setShowPopup(false);
  };

  const getEventsForDate = (dateObj) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === dateObj.day &&
             eventDate.getMonth() === dateObj.date.getMonth() &&
             eventDate.getFullYear() === dateObj.date.getFullYear();
    });
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

  const formatDate = (date) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Intl.DateTimeFormat('id-ID', options).format(date);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPopup && !event.target.closest('.popup-container')) {
        setShowPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopup]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Kalender</h3>

        <div className="flex items-center space-x-4">
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
          >
            Hari ini
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={20} />
            </button>

            <span className="font-medium min-w-[150px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>

            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {dayNames.map(day => (
          <div key={day} className="p-3 text-center text-xs font-semibold text-gray-500 uppercase">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {generateCalendarDays().map((dateObj, index) => {
          const isSelected = isSelectedDate(dateObj);
          const isHovered = hoveredDate === index;
          const dayEvents = getEventsForDate(dateObj);
          const activities = sampleActivities[dateObj.dateStr];

          return (
            <div
              key={index}
              onMouseEnter={() => setHoveredDate(index)}
              onMouseLeave={() => setHoveredDate(null)}
              onClick={(e) => handleDateClick(dateObj, e)}
              className={`
                relative p-3 text-center text-sm cursor-pointer rounded-lg transition-all duration-200
                ${dateObj.isCurrentMonth
                  ? 'text-gray-900'
                  : 'text-gray-400'
                }
                ${dateObj.isToday
                  ? 'bg-blue-500 text-white font-semibold'
                  : isSelected
                    ? 'bg-blue-100 text-blue-800 font-semibold'
                    : isHovered
                      ? 'bg-gray-100'
                      : 'hover:bg-gray-50'
                }
              `}
            >
              <span className="relative z-10">{dateObj.day}</span>

              {/* Event indicators */}
              {(dateObj.hasEvent || activities) && !dateObj.isToday && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  {activities && activities.length > 3 ? (
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  ) : activities ? (
                    <div className="flex space-x-1">
                      {activities.slice(0, 3).map((_, i) => (
                        <div key={i} className="w-1 h-1 bg-blue-500 rounded-full"></div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}

              {/* Tooltip for events */}
              {isHovered && activities && activities.length > 0 && (
                <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                  {activities.length} kegiatan
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Calendar Legend */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            Hari ini
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
            Ada kegiatan
          </div>
        </div>

        <div className="text-gray-400">
          Klik tanggal untuk melihat kegiatan
        </div>
      </div>

      {/* Activity Popup */}
      {showPopup && popupData && (
        <div
          className="popup-container fixed z-50"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="bg-white rounded-lg shadow-xl border max-w-md w-80 animate-fadeIn">
            {/* Popup Header */}
            <div className="bg-blue-500 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Kegiatan Hari Ini</h4>
                <p className="text-sm opacity-90">{formatDate(popupData.date)}</p>
              </div>
              <button
                onClick={() => setShowPopup(false)}
                className="p-1 hover:bg-blue-600 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Activities List */}
            <div className="max-h-80 overflow-y-auto">
              {popupData.activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className={`p-4 border-gray-100 ${
                    index !== popupData.activities.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(activity.status)}`}></div>
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{activity.team}</div>
                        <div className="text-xs text-gray-500">{getStatusText(activity.status)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Clock size={14} className="mr-2" />
                      {activity.time}
                    </div>

                    <div className="flex items-center text-gray-600">
                      <MapPin size={14} className="mr-2" />
                      {activity.lapangan}
                    </div>

                    <div className="flex items-center text-gray-600">
                      <Users size={14} className="mr-2" />
                      <span>Fotografer: {activity.fotografer}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <Users size={14} className="mr-2" />
                      <span>Editor: {activity.editor}</span>
                    </div>
                  </div>

                  {activity.description && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                      {activity.description}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      alert(`Melihat detail lengkap untuk ${activity.team}`);
                    }}
                    className="w-full mt-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md py-2 px-3 text-sm font-medium transition-all duration-200 flex items-center justify-center"
                  >
                    <Eye size={14} className="mr-2" />
                    Lihat Detail
                  </button>
                </div>
              ))}
            </div>

            {/* Popup Footer */}
            <div className="px-4 py-3 bg-gray-50 rounded-b-lg text-center">
              <p className="text-xs text-gray-500">
                Total {popupData.activities.length} kegiatan
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px) translateX(-50%);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};

export default Calendar;
