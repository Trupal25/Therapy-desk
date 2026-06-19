import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Clock, Calendar as CalIcon } from "lucide-react";
import { Session, getLocalDateStr } from "../hooks/useSessions";
import { Client } from "../hooks/useClients";

interface ScheduleViewProps {
  sessions: Session[];
  clients: Client[];
  currentMonth: Date;
  selectedCalDate: Date;
  setSelectedCalDate: (date: Date) => void;
  prevMonth: () => void;
  nextMonth: () => void;
  daysInMonthData: { firstDay: number; totalDays: number };
  daySessions: Session[];
  newApptClient: string;
  setNewApptClient: (val: string) => void;
  newApptDate: string;
  setNewApptDate: (val: string) => void;
  newApptTime: string;
  setNewApptTime: (val: string) => void;
  newApptDuration: string;
  setNewApptDuration: (val: string) => void;
  newApptType: string;
  setNewApptType: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isBooking?: boolean;
  isLoading?: boolean;
}

export function ScheduleView({
  sessions,
  clients,
  currentMonth,
  selectedCalDate,
  setSelectedCalDate,
  prevMonth,
  nextMonth,
  daysInMonthData,
  daySessions,
  newApptClient,
  setNewApptClient,
  newApptDate,
  setNewApptDate,
  newApptTime,
  setNewApptTime,
  newApptDuration,
  setNewApptDuration,
  newApptType,
  setNewApptType,
  onSubmit,
  isBooking = false,
  isLoading = false
}: ScheduleViewProps) {
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  const renderAgendaSkeleton = () => {
    return Array.from({ length: 2 }).map((_, i) => (
      <div key={`agenda-skeleton-${i}`} className="py-3.5 animate-pulse first:pt-0 last:pb-0 border-b border-stone-100 last:border-0">
        <div className="h-2 bg-zinc-200 rounded w-1/4"></div>
        <div className="h-3.5 bg-zinc-200 rounded w-2/3 mt-2"></div>
        <div className="h-2 bg-zinc-150 rounded w-1/2 mt-1.5"></div>
      </div>
    ));
  };

  // Timezone-safe start of week calculator (local date timezone-offset alignment)
  const getStartOfWeek = (d: Date) => {
    const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const day = date.getDay();
    const diff = date.getDate() - day; // day is 0 for Sunday
    return new Date(date.setDate(diff));
  };

  // Generate 7 days of the selected week in local timezone
  const weekDates = useMemo(() => {
    const start = getStartOfWeek(selectedCalDate);
    return Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(start);
      d.setDate(start.getDate() + idx);
      return d;
    });
  }, [selectedCalDate]);

  // Format week range text for Week View header
  const getWeekRangeStr = (selectedDate: Date) => {
    const start = getStartOfWeek(selectedDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const startMonth = start.toLocaleString("default", { month: "short" });
    const endMonth = end.toLocaleString("default", { month: "short" });
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();

    if (startYear !== endYear) {
      return `${startMonth} ${start.getDate()}, ${startYear} – ${endMonth} ${end.getDate()}, ${endYear}`;
    }
    if (startMonth !== endMonth) {
      return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${startYear}`;
    }
    return `${startMonth} ${start.getDate()} – ${end.getDate()}, ${startYear}`;
  };

  // Navigates by week in Week View
  const navigateWeek = (weeks: number) => {
    const newDate = new Date(selectedCalDate);
    newDate.setDate(selectedCalDate.getDate() + weeks * 7);
    setSelectedCalDate(newDate);
    setNewApptDate(newDate.toISOString().split("T")[0]);
  };

  // Resets calendar view to today
  const handleTodayClick = () => {
    const today = new Date();
    setSelectedCalDate(today);
    setNewApptDate(today.toISOString().split("T")[0]);
    // Also reset current month focus if in month view
    const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (currentMonth.getMonth() !== today.getMonth() || currentMonth.getFullYear() !== today.getFullYear()) {
      // We navigate via prevMonth / nextMonth if possible, but resetting local reference works seamlessly
      setSelectedCalDate(today);
    }
  };

  const formattedHeaderLabel = useMemo(() => {
    if (viewMode === "month") {
      return currentMonth.toLocaleString("default", { month: "long", year: "numeric" });
    } else {
      return getWeekRangeStr(selectedCalDate);
    }
  }, [viewMode, currentMonth, selectedCalDate]);

  const renderMonthView = () => {
    const { firstDay, totalDays } = daysInMonthData;
    const cells = [];
    const todayStr = getLocalDateStr(new Date());
    const selectedStr = getLocalDateStr(selectedCalDate);

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // 1. Weekday headers
    const headerRow = weekDays.map((wd) => (
      <div
        key={`wd-${wd}`}
        className="text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest py-3 border-r border-b border-zinc-200/80 bg-zinc-50/50"
      >
        {wd}
      </div>
    ));

    // 2. Padding days
    for (let i = 0; i < firstDay; i++) {
      cells.push(
        <div
          key={`pad-${i}`}
          className="border-r border-b border-zinc-200/80 bg-zinc-50/5 min-h-[95px] md:min-h-[110px]"
        />
      );
    }

    // 3. Month days
    for (let day = 1; day <= totalDays; day++) {
      const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateStr = getLocalDateStr(checkDate);
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === selectedStr;

      const daySessionsList = sessions.filter((s) => getLocalDateStr(s.scheduledAt) === dateStr);
      
      cells.push(
        <div
          key={`day-${day}`}
          className={`border-r border-b border-zinc-200/80 bg-white min-h-[95px] md:min-h-[110px] p-2 flex flex-col justify-between hover:bg-zinc-50/40 transition-all duration-150 select-none cursor-pointer group relative
            ${isSelected ? "bg-zinc-50/45 ring-1 ring-inset ring-zinc-950/20" : ""}`}
          onClick={() => {
            setSelectedCalDate(checkDate);
            setNewApptDate(dateStr);
          }}
        >
          {/* Day number */}
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-bold opacity-0 group-hover:opacity-60 transition text-zinc-400">
              {daySessionsList.length > 0 ? `${daySessionsList.length} appt` : ""}
            </span>
            <span
              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold transition
                ${isToday ? "bg-zinc-950 text-white font-bold" : ""}
                ${isSelected && !isToday ? "bg-zinc-200 text-zinc-900 border border-zinc-300 font-bold" : "text-zinc-650 group-hover:text-zinc-950"}`}
            >
              {day}
            </span>
          </div>

          {/* Session pills inside the cell */}
          <div className="mt-2.5 space-y-1 flex-1 flex flex-col justify-end overflow-hidden">
            {daySessionsList.slice(0, 2).map((sess) => {
              let colorClasses = "bg-zinc-50 text-zinc-700 border-zinc-200";
              const type = sess.sessionType.toLowerCase();
              if (type.includes("cbt")) {
                colorClasses = "bg-indigo-50 text-indigo-700 border-indigo-200/40";
              } else if (type.includes("anxiety")) {
                colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200/40";
              } else if (type.includes("trauma")) {
                colorClasses = "bg-rose-50 text-rose-700 border-rose-200/40";
              } else if (type.includes("depression")) {
                colorClasses = "bg-sky-50 text-sky-700 border-sky-200/40";
              } else if (type.includes("general")) {
                colorClasses = "bg-stone-50 text-stone-700 border-stone-200/40";
              }
              
              const timeStr = new Date(sess.scheduledAt).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              }).replace(" AM", "a").replace(" PM", "p");

              return (
                <div
                  key={sess.id}
                  className={`text-[9.5px] font-medium px-1.5 py-0.5 rounded border truncate flex items-center justify-between ${colorClasses}`}
                  title={`${sess.clientName} (${sess.sessionType.toUpperCase()})`}
                >
                  <span className="truncate">{timeStr} {sess.clientName.split(" ")[0]}</span>
                </div>
              );
            })}
            {daySessionsList.length > 2 && (
              <div className="text-[8.5px] font-bold text-zinc-400 pl-1">
                + {daySessionsList.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className={`grid grid-cols-7 border-t border-l border-zinc-200/80 rounded-2xl overflow-hidden bg-white shadow-sm ${isLoading ? "animate-pulse pointer-events-none opacity-60" : ""}`}>
        {headerRow}
        {cells}
      </div>
    );
  };

  const renderWeekView = () => {
    const todayStr = getLocalDateStr(new Date());
    const selectedStr = getLocalDateStr(selectedCalDate);
    
    return (
      <div className={`grid grid-cols-1 md:grid-cols-7 border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm divide-y md:divide-y-0 md:divide-x divide-zinc-200 ${isLoading ? "animate-pulse pointer-events-none opacity-60" : ""}`}>
        {weekDates.map((dayDate) => {
          const dateStr = getLocalDateStr(dayDate);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedStr;
          
          const daySessionsList = sessions.filter((s) => getLocalDateStr(s.scheduledAt) === dateStr);
          
          const sortedSessions = [...daySessionsList].sort(
            (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
          );
          
          const weekdayLabel = dayDate.toLocaleDateString(undefined, { weekday: "short" });
          const dayNumLabel = dayDate.getDate();
          
          return (
            <div
              key={dateStr}
              className={`flex flex-col min-h-[350px] transition duration-200 group
                ${isSelected ? "bg-zinc-50/35" : "bg-white hover:bg-zinc-50/15"}`}
              onClick={() => {
                setSelectedCalDate(dayDate);
                setNewApptDate(dateStr);
              }}
            >
              {/* Day Header */}
              <div className="p-3 border-b border-zinc-150 flex flex-col items-center justify-center space-y-1 bg-zinc-50/50 cursor-pointer select-none">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  {weekdayLabel}
                </span>
                <span
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition
                    ${isToday ? "bg-zinc-950 text-white shadow-sm" : ""}
                    ${isSelected && !isToday ? "bg-zinc-200 text-zinc-900" : "text-zinc-700 group-hover:text-zinc-950"}`}
                >
                  {dayNumLabel}
                </span>
              </div>
              
              {/* Day Sessions List */}
              <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[350px] scrollbar-none cursor-pointer">
                {sortedSessions.length === 0 ? (
                  <div className="h-full flex items-center justify-center py-10 text-center">
                    <span className="text-[10px] text-zinc-400 font-light italic">No sessions</span>
                  </div>
                ) : (
                  sortedSessions.map((sess) => {
                    const timeStr = new Date(sess.scheduledAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    
                    // Modality focus color-coding
                    let accentColor = "border-zinc-400 text-zinc-700 bg-zinc-50/60";
                    const focusType = sess.sessionType.toLowerCase();
                    if (focusType.includes("cbt")) {
                      accentColor = "border-l-indigo-500 bg-indigo-50/30 text-indigo-950";
                    } else if (focusType.includes("anxiety")) {
                      accentColor = "border-l-emerald-500 bg-emerald-50/30 text-emerald-950";
                    } else if (focusType.includes("trauma")) {
                      accentColor = "border-l-rose-500 bg-rose-50/30 text-rose-950";
                    } else if (focusType.includes("depression")) {
                      accentColor = "border-l-sky-500 bg-sky-50/30 text-sky-950";
                    } else if (focusType.includes("general")) {
                      accentColor = "border-l-stone-500 bg-stone-50/40 text-stone-950";
                    }
                    
                    return (
                      <div
                        key={sess.id}
                        className={`p-2.5 rounded-lg border-l-3 border border-zinc-200/80 shadow-sm transition hover:shadow duration-200 flex flex-col space-y-1 text-left ${accentColor}`}
                      >
                        <span className="text-[9px] font-bold tracking-tight opacity-75">
                          {timeStr}
                        </span>
                        <span className="text-xs font-bold truncate">
                          {sess.clientName}
                        </span>
                        <div className="flex items-center justify-between text-[8px] font-semibold opacity-60 uppercase pt-0.5 border-t border-zinc-200/20">
                          <span>{sess.sessionType}</span>
                          <span>{sess.modality.replace("_", " ")}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-6xl animate-fadeUp space-y-6">
      
      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-normal text-ink">Practice Calendar</h2>
          <p className="text-xs text-stone-400 font-light mt-0.5">Manage daily sessions, select calendar blocks, and schedule new patient appointments.</p>
        </div>

        {/* Month/Week Switcher Tab */}
        <div className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200/50 self-start sm:self-auto shadow-sm">
          <button
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition duration-200 cursor-pointer ${viewMode === "month" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-950"}`}
            type="button"
            onClick={() => setViewMode("month")}
          >
            Month
          </button>
          <button
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition duration-200 cursor-pointer ${viewMode === "week" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-950"}`}
            type="button"
            onClick={() => setViewMode("week")}
          >
            Week
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar layout sheet */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-stone-200/70 rounded-2xl overflow-hidden shadow-sm hover:border-stone-300 transition duration-300 p-5 space-y-4">
            
            {/* Calendar header nav */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-100 bg-transparent">
              <h3 className="font-serif text-lg text-ink font-normal">{formattedHeaderLabel}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTodayClick}
                  className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-700 hover:bg-zinc-50 font-semibold text-xs transition cursor-pointer shadow-sm"
                >
                  Today
                </button>
                <button 
                  onClick={() => {
                    if (viewMode === "month") prevMonth();
                    else navigateWeek(-1);
                  }}
                  className="p-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-650 hover:border-zinc-950 hover:text-zinc-950 transition cursor-pointer shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    if (viewMode === "month") nextMonth();
                    else navigateWeek(1);
                  }}
                  className="p-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-650 hover:border-zinc-950 hover:text-zinc-950 transition cursor-pointer shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Render selected view mode */}
            {viewMode === "month" ? renderMonthView() : renderWeekView()}
          </div>
        </div>

        {/* Form and list column */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Appointments agenda list for selected date */}
          <div className="bg-white border border-stone-200/70 rounded-2xl shadow-sm overflow-hidden hover:border-stone-300 transition duration-300">
            <div className="px-5 py-4 border-b border-stone-150 bg-stone-50/30">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                Booked: {selectedCalDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </h4>
            </div>
            
            <div className="p-4 divide-y divide-stone-100 max-h-[300px] overflow-y-auto scrollbar-thin">
              {isLoading ? (
                renderAgendaSkeleton()
              ) : daySessions.length === 0 ? (
                <div className="py-8 text-center text-stone-400 text-xs font-light">
                  No appointments booked on this date.
                </div>
              ) : (
                daySessions.map((s) => (
                  <div key={s.id} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-sage uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(s.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      <span>•</span>
                      <span>{s.durationMinutes} mins</span>
                    </div>
                    <h4 className="text-xs font-bold text-ink mt-1.5">{s.clientName}</h4>
                    <p className="text-[10px] text-stone-400 font-light mt-0.5">
                      Session Focus: {s.sessionType.toUpperCase()} ({s.modality})
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Session booking form */}
          <div className="bg-white border border-stone-200/70 rounded-2xl p-5 shadow-sm space-y-4 hover:border-stone-300 transition duration-300 font-sans">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <CalIcon className="w-4 h-4 text-zinc-500" />
              <span>Schedule New Session</span>
            </h4>
            
            <form className="space-y-4" onSubmit={onSubmit}>
              {/* Select Client */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700">Patient Client File</label>
                <select
                  className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  value={newApptClient}
                  onChange={(e) => setNewApptClient(e.target.value)}
                  required
                  disabled={isBooking}
                >
                  <option value="">Choose patient profile...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date / Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-700">Select Date</label>
                  <input
                    className="w-full px-3.5 py-2 bg-transparent border border-zinc-200 rounded-lg text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm transition disabled:opacity-50 disabled:pointer-events-none"
                    type="date"
                    value={newApptDate}
                    onChange={(e) => setNewApptDate(e.target.value)}
                    required
                    disabled={isBooking}
                    min={getLocalDateStr(new Date())}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-700">Select Time</label>
                  <input
                    className="w-full px-3.5 py-2 bg-transparent border border-zinc-200 rounded-lg text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm transition disabled:opacity-50 disabled:pointer-events-none"
                    type="time"
                    value={newApptTime}
                    onChange={(e) => setNewApptTime(e.target.value)}
                    required
                    disabled={isBooking}
                  />
                </div>
              </div>

              {/* Duration / Focus */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-700">Duration Block</label>
                  <select
                    className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    value={newApptDuration}
                    onChange={(e) => setNewApptDuration(e.target.value)}
                    disabled={isBooking}
                  >
                    <option>50 min</option>
                    <option>30 min</option>
                    <option>80 min</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-700">Primary Modality</label>
                  <select
                    className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    value={newApptType}
                    onChange={(e) => setNewApptType(e.target.value)}
                    disabled={isBooking}
                  >
                    <option>CBT</option>
                    <option>Anxiety</option>
                    <option>Trauma</option>
                    <option>Depression</option>
                    <option>General</option>
                  </select>
                </div>
              </div>

              <button 
                className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white font-semibold text-xs rounded-lg shadow transition cursor-pointer mt-2 disabled:opacity-50 disabled:pointer-events-none" 
                type="submit"
                disabled={isBooking}
              >
                {isBooking ? "Booking..." : "Book Active Appointment"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
