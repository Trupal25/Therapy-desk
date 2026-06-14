import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";
import { Session } from "../hooks/useSessions";
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
  onSubmit
}: ScheduleViewProps) {
  const formattedMonthYear = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });
  
  const renderCalendarDays = () => {
    const { firstDay, totalDays } = daysInMonthData;
    const cells = [];

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const headerRow = weekDays.map((wd) => (
      <div key={`wd-${wd}`} className="text-center text-xs font-semibold text-stone-500 uppercase tracking-wider py-2 font-sans">
        {wd}
      </div>
    ));

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`pad-${i}`} className="aspect-square flex items-center justify-center text-stone-300"></div>);
    }

    const today = new Date();
    for (let day = 1; day <= totalDays; day++) {
      const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isToday =
        today.getDate() === day &&
        today.getMonth() === currentMonth.getMonth() &&
        today.getFullYear() === currentMonth.getFullYear();

      const isSelected =
        selectedCalDate &&
        selectedCalDate.getDate() === day &&
        selectedCalDate.getMonth() === currentMonth.getMonth() &&
        selectedCalDate.getFullYear() === currentMonth.getFullYear();

      const dateStr = checkDate.toISOString().split("T")[0];
      const hasSessions = sessions.some((s) => s.scheduledAt.startsWith(dateStr));

      cells.push(
        <div
          key={`day-${day}`}
          className={`aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer text-sm transition-all duration-200 relative gap-1
            ${isToday ? "bg-sage-light text-sage font-bold ring-1 ring-sage-mid" : "text-ink-soft hover:bg-stone-100"} 
            ${isSelected ? "bg-sage text-white font-bold hover:bg-sage shadow-md" : ""}`}
          onClick={() => {
            setSelectedCalDate(checkDate);
            setNewApptDate(dateStr);
          }}
        >
          <span>{day}</span>
          {hasSessions && (
            <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${isSelected ? "bg-white" : "bg-sage"}`}></span>
          )}
        </div>
      );
    }

    return (
      <>
        {headerRow}
        {cells}
      </>
    );
  };

  return (
    <div className="max-w-6xl animate-fadeUp space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CALENDAR COLUMN */}
        <div className="lg:col-span-8 bg-white border border-stone-200/70 rounded-xl overflow-hidden shadow-sm">
          {/* CALENDAR NAVBAR */}
          <div className="px-5 py-4 border-b border-stone-150 flex items-center justify-between">
            <h3 className="font-serif text-lg text-ink font-normal">{formattedMonthYear}</h3>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={prevMonth}
                className="p-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-600 hover:border-ink hover:text-ink transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={nextMonth}
                className="p-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-600 hover:border-ink hover:text-ink transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CALENDAR CALCULATION GRID */}
          <div className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {renderCalendarDays()}
            </div>
          </div>
        </div>

        {/* APPOINTMENTS AND BOOKING COLUMN */}
        <div className="lg:col-span-4 space-y-6">
          {/* APPOINTMENTS LIST */}
          <div className="bg-white border border-stone-200/70 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-150 bg-stone-50">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                Appointments: {selectedCalDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </h4>
            </div>
            <div className="p-4 divide-y divide-stone-100 max-h-[280px] overflow-y-auto">
              {daySessions.length === 0 ? (
                <div className="py-6 text-center text-stone-400 text-xs font-light">
                  No appointments booked on this date.
                </div>
              ) : (
                daySessions.map((s) => (
                  <div key={s.id} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-[11px] font-bold text-sage flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(s.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      <span>•</span>
                      <span>{s.durationMinutes} mins</span>
                    </p>
                    <h4 className="text-xs font-semibold text-ink mt-1">{s.clientName}</h4>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      Type: {s.sessionType.toUpperCase()} ({s.modality})
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* APPOINTMENT BOOKING FORM */}
          <div className="bg-white border border-stone-200/70 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-sage" />
              <span>Book Appointment Session</span>
            </h4>
            
            <form className="space-y-3.5" onSubmit={onSubmit}>
              {/* CLIENT SELECT */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-stone-600">Select Client</label>
                <select
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-ink outline-none focus:border-sage focus:bg-white"
                  value={newApptClient}
                  onChange={(e) => setNewApptClient(e.target.value)}
                  required
                >
                  <option value="">Choose patient...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* DATE AND TIME */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-600">Date</label>
                  <input
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-ink outline-none focus:border-sage focus:bg-white"
                    type="date"
                    value={newApptDate}
                    onChange={(e) => setNewApptDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-600">Time</label>
                  <input
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-ink outline-none focus:border-sage focus:bg-white"
                    type="time"
                    value={newApptTime}
                    onChange={(e) => setNewApptTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* DURATION AND TYPE */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-600">Duration</label>
                  <select
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-ink outline-none focus:border-sage focus:bg-white"
                    value={newApptDuration}
                    onChange={(e) => setNewApptDuration(e.target.value)}
                  >
                    <option>50 min</option>
                    <option>30 min</option>
                    <option>80 min</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-600">Focus Type</label>
                  <select
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-ink outline-none focus:border-sage focus:bg-white"
                    value={newApptType}
                    onChange={(e) => setNewApptType(e.target.value)}
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
                className="w-full py-2.5 bg-ink hover:bg-sage text-white font-medium text-xs rounded-lg shadow-sm hover:shadow transition cursor-pointer mt-2" 
                type="submit"
              >
                Book Session Appointment
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
