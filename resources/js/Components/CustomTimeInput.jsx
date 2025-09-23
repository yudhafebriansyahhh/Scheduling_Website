import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';

const CustomTimeInput = ({
  value,
  onChange,
  placeholder = "Pilih waktu",
  required = false,
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState('07');
  const [minutes, setMinutes] = useState('00');
  const containerRef = useRef(null);
  const hoursInputRef = useRef(null);
  const minutesInputRef = useRef(null);

  // Parse value ketika component mount atau value berubah
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setHours(h.padStart(2, '0'));
      setMinutes(m.padStart(2, '0'));
    }
  }, [value]);

  // Generate hours array (00-23)
  const generateHours = () => {
    const hoursArray = [];
    for (let i = 0; i < 24; i++) {
      hoursArray.push(i.toString().padStart(2, '0'));
    }
    return hoursArray;
  };

  // Generate minutes array (00-59)
  const generateMinutes = () => {
    const minutesArray = [];
    for (let i = 0; i < 60; i++) {
      minutesArray.push(i.toString().padStart(2, '0'));
    }
    return minutesArray;
  };

  // Format time untuk display
  const formatDisplayTime = (timeString) => {
    if (!timeString) return '';
    const [h, m] = timeString.split(':');
    return `${h}:${m}`;
  };

  const handleTimeSelect = () => {
    const timeString = `${hours}:${minutes}`;
    onChange(timeString);
    setIsOpen(false);
  };

  // Handle keyboard navigation - simplified
  const handleHoursKeyDown = (e) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      // Format jam dulu
      let value = e.target.value || '00';
      if (parseInt(value) > 23) value = '23';
      const paddedValue = value.padStart(2, '0');
      setHours(paddedValue);
      // Pindah ke minutes
      minutesInputRef.current?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const timeString = `${hours}:${minutes}`;
      onChange(timeString);
      setIsOpen(false);
    }
  };

  const handleMinutesKeyDown = (e) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      // Format minutes dulu
      let value = e.target.value || '00';
      if (parseInt(value) > 59) value = '59';
      const paddedValue = value.padStart(2, '0');
      setMinutes(paddedValue);
      // Update parent dan tutup popup
      const timeString = `${hours}:${paddedValue}`;
      onChange(timeString);
      setIsOpen(false);
      // Biarkan Tab lanjut ke field berikutnya (jangan preventDefault)
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const timeString = `${hours}:${minutes}`;
      onChange(timeString);
      setIsOpen(false);
    }
  };

  const incrementHour = () => {
    const newHour = (parseInt(hours) + 1) % 24;
    setHours(newHour.toString().padStart(2, '0'));
  };

  const decrementHour = () => {
    const newHour = parseInt(hours) - 1 < 0 ? 23 : parseInt(hours) - 1;
    setHours(newHour.toString().padStart(2, '0'));
  };

  const incrementMinute = () => {
    const minutesArray = generateMinutes();
    const currentIndex = minutesArray.indexOf(minutes);
    const nextIndex = (currentIndex + 1) % minutesArray.length;
    setMinutes(minutesArray[nextIndex]);
  };

  const decrementMinute = () => {
    const minutesArray = generateMinutes();
    const currentIndex = minutesArray.indexOf(minutes);
    const prevIndex = currentIndex - 1 < 0 ? minutesArray.length - 1 : currentIndex - 1;
    setMinutes(minutesArray[prevIndex]);
  };

  // Preset waktu umum
  const timePresets = [
    { label: 'Pagi', time: '08:00' },
    { label: 'Siang', time: '12:00' },
    { label: 'Sore', time: '15:00' },
    { label: 'Malam', time: '19:00' }
  ];

  const handlePresetSelect = (time) => {
    onChange(time);
    const [h, m] = time.split(':');
    setHours(h);
    setMinutes(m);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Field */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
          bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          cursor-pointer flex items-center justify-between
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 dark:hover:border-gray-500'}
        `}
      >
        <span className={value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}>
          {value ? formatDisplayTime(value) : placeholder}
        </span>
        <Clock size={20} className="text-gray-400 dark:text-gray-500" />
      </div>

      {/* Required indicator */}
      {required && !value && (
        <div className="text-red-500 dark:text-red-400 text-sm mt-1">
          Field ini wajib diisi
        </div>
      )}

      {/* Time Picker Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 p-4 min-w-[280px]">
          {/* Time Display */}
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {hours}:{minutes}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Jam:Menit</div>
          </div>

          {/* Time Selectors */}
          <div className="flex justify-center items-center space-x-4 mb-4">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={incrementHour}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <ChevronUp size={20} className="text-gray-600 dark:text-gray-400" />
              </button>

              <input
                ref={hoursInputRef}
                type="text"
                value={hours}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length > 2) value = value.slice(0, 2);
                  if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 23)) {
                    setHours(value);
                  }
                }}
                onFocus={(e) => e.target.select()}
                onKeyDown={handleHoursKeyDown}
                onBlur={(e) => {
                  let value = e.target.value || '00';
                  if (parseInt(value) > 23) value = '23';
                  setHours(value.padStart(2, '0'));
                }}
                className="w-16 h-12 text-center text-xl font-semibold bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength="2"
              />

              <button
                type="button"
                onClick={decrementHour}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">:</div>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={incrementMinute}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <ChevronUp size={20} className="text-gray-600 dark:text-gray-400" />
              </button>

              <input
                ref={minutesInputRef}
                type="text"
                value={minutes}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length > 2) value = value.slice(0, 2);
                  if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                    setMinutes(value);
                  }
                }}
                onFocus={(e) => e.target.select()}
                onKeyDown={handleMinutesKeyDown}
                onBlur={(e) => {
                  let value = e.target.value || '00';
                  if (parseInt(value) > 59) value = '59';
                  setMinutes(value.padStart(2, '0'));
                }}
                className="w-16 h-12 text-center text-xl font-semibold bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength="2"
              />

              <button
                type="button"
                onClick={decrementMinute}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mb-3">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Waktu Umum:</div>
            <div className="grid grid-cols-2 gap-2">
              {timePresets.map((preset) => (
                <button
                  key={preset.time}
                  type="button"
                  onClick={() => handlePresetSelect(preset.time)}
                  className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors text-gray-700 dark:text-gray-300"
                >
                  {preset.label}
                  <br />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{preset.time}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={handleTimeSelect}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded transition-colors text-sm font-medium"
            >
              Pilih
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTimeInput;
