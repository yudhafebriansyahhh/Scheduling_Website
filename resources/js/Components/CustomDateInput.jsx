import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const CustomDateInput = ({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  required = false,
  disabled = false,
  className = "",
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayDate, setDisplayDate] = useState(new Date());
  const containerRef = useRef(null);

  // Format date untuk display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';

    // Parse date dengan timezone lokal
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    if (compact) {
      // Format compact: "04 Sep 2025"
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }

    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();
    let selectedDate = null;

    if (value) {
      const [year, month, day] = value.split('-').map(Number);
      selectedDate = new Date(year, month - 1, day);
    }

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        isSelected
      });
    }

    return days;
  };

  const handleDateSelect = (date) => {
    // Format tanggal dengan benar (tanpa timezone issues)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    onChange(formattedDate);
    setIsOpen(false);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(displayDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setDisplayDate(newDate);
  };

  const navigateToToday = () => {
    const today = new Date();
    setDisplayDate(today);
    handleDateSelect(today);
  };

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set initial display date based on value
  useEffect(() => {
    if (value) {
      const [year, month, day] = value.split('-').map(Number);
      setDisplayDate(new Date(year, month - 1, day));
    }
  }, [value]);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Field */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
          bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          cursor-pointer flex items-center justify-between
          ${compact ? 'text-sm' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 dark:hover:border-gray-500'}
        `}
      >
        <span className={value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <Calendar size={compact ? 16 : 20} className="text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2" />
      </div>

      {/* Required indicator */}
      {required && !value && (
        <div className="text-red-500 dark:text-red-400 text-sm mt-1">
          Field ini wajib diisi
        </div>
      )}

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 p-4 min-w-[320px]">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
            </button>

            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {monthNames[displayDate.getMonth()]} {displayDate.getFullYear()}
            </div>

            <button
              type="button"
              onClick={() => navigateMonth(1)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((dayObj, index) => (
              <button
                key={index}
                type="button"
                onClick={() => dayObj.isCurrentMonth && handleDateSelect(dayObj.date)}
                className={`
                  p-2 text-sm rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors
                  ${!dayObj.isCurrentMonth ? 'text-gray-300 dark:text-gray-600 cursor-default' : 'text-gray-900 dark:text-gray-100'}
                  ${dayObj.isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                  ${dayObj.isToday && !dayObj.isSelected ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-medium' : ''}
                  ${!dayObj.isCurrentMonth ? 'hover:bg-transparent' : ''}
                `}
                disabled={!dayObj.isCurrentMonth}
              >
                {dayObj.day}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={navigateToToday}
              className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDateInput;
