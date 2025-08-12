import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
  CalendarDays
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  setHours,
  setMinutes,
  isToday,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { fr } from 'date-fns/locale';

interface ModernDatePickerProps {
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  showTimeSelect?: boolean;
  selectsStart?: boolean;
  selectsEnd?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  minDate?: Date | null;
  maxDate?: Date | null;
  className?: string;
}

const ModernDatePicker: React.FC<ModernDatePickerProps> = ({
  selected,
  onChange,
  placeholder = "Sélectionner une date",
  showTimeSelect = false,
  selectsStart = false,
  selectsEnd = false,
  startDate,
  endDate,
  minDate,
  maxDate,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selected || new Date());
  const [selectedTime, setSelectedTime] = useState({
    hours: selected ? selected.getHours() : 9,
    minutes: selected ? selected.getMinutes() : 0
  });
  const [view, setView] = useState<'calendar' | 'time'>('calendar');

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fermer le picker en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Générer les jours du calendrier
  const generateCalendarDays = () => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });

    return eachDayOfInterval({ start, end });
  };

  const handleDateSelect = (date: Date) => {
    let newDate = date;

    if (showTimeSelect) {
      newDate = setHours(setMinutes(date, selectedTime.minutes), selectedTime.hours);
    }

    onChange(newDate);

    if (!showTimeSelect) {
      setIsOpen(false);
    } else {
      setView('time');
    }
  };

  const handleTimeConfirm = () => {
    if (selected) {
      const newDate = setHours(setMinutes(selected, selectedTime.minutes), selectedTime.hours);
      onChange(newDate);
    }
    setIsOpen(false);
  };

  const isDateInRange = (date: Date) => {
    if (!selectsStart && !selectsEnd) return false;
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    if (selectsEnd && startDate && date < startDate) return true;
    return false;
  };

  const formatDisplayValue = () => {
    if (!selected) return '';

    if (showTimeSelect) {
      return format(selected, 'dd/MM/yyyy HH:mm', { locale: fr });
    }

    return format(selected, 'dd/MM/yyyy', { locale: fr });
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Field */}
      <div
        className="relative group cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <input
          ref={inputRef}
          type="text"
          value={formatDisplayValue()}
          placeholder={placeholder}
          readOnly
          className="w-full pl-3 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 cursor-pointer group-hover:border-blue-300 dark:group-hover:border-blue-600 text-xm"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          {selected ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors pointer-events-auto"
            >
              <X className="w-3 h-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
            </button>
          ) : (
            <CalendarDays className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
          )}
        </div>
      </div>

      {/* Dropdown Calendar */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl backdrop-blur-sm overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">

          {view === 'calendar' && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-1.5 hover:bg-white/50 dark:hover:bg-slate-700 rounded-md transition-colors"
                >
                  <ChevronLeft className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                </button>

                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">
                  {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                </h3>

                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-1.5 hover:bg-white/50 dark:hover:bg-slate-700 rounded-md transition-colors"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                </button>
              </div>

              {/* Week Days */}
              <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-600">
                {weekDays.map((day) => (
                  <div key={day} className="py-1.5 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 p-1.5 gap-0.5">
                {calendarDays.map((date, index) => {
                  const isCurrentMonth = isSameMonth(date, currentMonth);
                  const isSelected = selected && isSameDay(date, selected);
                  const isInRange = isDateInRange(date);
                  const isDisabled = isDateDisabled(date);
                  const isTodayDate = isToday(date);

                  return (
                    <button
                      key={index}
                      onClick={() => !isDisabled && handleDateSelect(date)}
                      disabled={isDisabled}
                      className={`
                        relative h-8 w-8 rounded-md text-xs font-medium transition-all duration-200 transform hover:scale-105
                        ${!isCurrentMonth
                          ? 'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                          : isSelected
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                            : isInRange
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : isTodayDate
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        }
                        ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      {format(date, 'd')}
                      {isTodayDate && !isSelected && (
                        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Time Button */}
              {showTimeSelect && (
                <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
                  <button
                    onClick={() => setView('time')}
                    className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-md hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-md shadow-purple-500/25 text-xs"
                  >
                    <Clock className="w-3 h-3" />
                    Choisir l'heure
                  </button>
                </div>
              )}
            </>
          )}

          {view === 'time' && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setView('calendar')}
                  className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 text-xs"
                >
                  <ChevronLeft className="w-3 h-3" />
                  Retour au calendrier
                </button>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Choisir l'heure
                </h3>
              </div>

              <div className="flex items-center justify-center gap-3 mb-4">
                {/* Hours */}
                <div className="text-center">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    Heures
                  </label>
                  <div className="flex flex-col items-center gap-1.5">
                    <button
                      onClick={() => setSelectedTime(prev => ({ ...prev, hours: Math.min(23, prev.hours + 1) }))}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                    >
                      <ChevronRight className="w-3 h-3 rotate-[-90deg]" />
                    </button>
                    <div className="w-12 h-10 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-md flex items-center justify-center text-lg font-bold text-slate-800 dark:text-slate-200">
                      {selectedTime.hours.toString().padStart(2, '0')}
                    </div>
                    <button
                      onClick={() => setSelectedTime(prev => ({ ...prev, hours: Math.max(0, prev.hours - 1) }))}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                    >
                      <ChevronRight className="w-3 h-3 rotate-90" />
                    </button>
                  </div>
                </div>

                <span className="text-lg font-bold text-slate-400 dark:text-slate-500 mt-6">:</span>

                {/* Minutes */}
                <div className="text-center">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    Minutes
                  </label>
                  <div className="flex flex-col items-center gap-1.5">
                    <button
                      onClick={() => setSelectedTime(prev => ({ ...prev, minutes: Math.min(59, prev.minutes + 15) }))}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                    >
                      <ChevronRight className="w-3 h-3 rotate-[-90deg]" />
                    </button>
                    <div className="w-12 h-10 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-md flex items-center justify-center text-lg font-bold text-slate-800 dark:text-slate-200">
                      {selectedTime.minutes.toString().padStart(2, '0')}
                    </div>
                    <button
                      onClick={() => setSelectedTime(prev => ({ ...prev, minutes: Math.max(0, prev.minutes - 15) }))}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                    >
                      <ChevronRight className="w-3 h-3 rotate-90" />
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleTimeConfirm}
                className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md shadow-green-500/25 font-medium text-xs"
              >
                Confirmer l'heure
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModernDatePicker;
