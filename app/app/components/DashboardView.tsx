import { useMemo } from "react";
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  FileText, 
  CalendarRange, 
  ChevronRight, 
  Sparkles, 
  Lock, 
  Unlock
} from "lucide-react";
import { Session } from "../hooks/useSessions";
import { Client } from "../hooks/useClients";

interface DashboardViewProps {
  user: { fullName?: string } | null;
  clients: Client[];
  sessions: Session[];
  recentSoapNotes: any[];
  todaySessions: Session[];
  weekSessionsHours: number;
  onNewClientClick: () => void;
  onViewCalendarClick: () => void;
  onSelectSessionForNotes: (session: Session, client: Client) => void;
}

export function DashboardView({
  user,
  clients,
  sessions,
  recentSoapNotes,
  todaySessions,
  weekSessionsHours,
  onNewClientClick,
  onViewCalendarClick,
  onSelectSessionForNotes
}: DashboardViewProps) {
  if (!user) return null;

  // Calculate notes signing ratio
  const notesStats = useMemo(() => {
    const total = sessions.length;
    const sealed = sessions.filter(s => s.soapNote?.status === 'signed').length;
    const ratio = total ? Math.round((sealed / total) * 100) : 0;
    return { total, sealed, ratio };
  }, [sessions]);

  return (
    <div className="space-y-6 max-w-6xl animate-fadeUp">
      {/* Welcome Banner */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-3xl p-6 md:p-8 text-zinc-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-white">
            Welcome, {user.fullName || "Therapist"}
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm font-light leading-relaxed max-w-xl">
            You have <strong className="text-zinc-200 font-semibold">{todaySessions.length} sessions</strong> today
            {notesStats.sealed > 0 && (
              <> · <strong className="text-zinc-200 font-semibold">{notesStats.sealed}</strong> notes sealed</>
            )}
          </p>
        </div>
        <div className="flex gap-3 z-10 w-full md:w-auto">
          <button 
            onClick={onNewClientClick}
            className="flex-1 md:flex-initial px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 transition-all duration-200 cursor-pointer border border-emerald-500/30"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Add Patient</span>
          </button>
          <button 
            onClick={onViewCalendarClick}
            className="flex-1 md:flex-initial px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow transition-all duration-200 cursor-pointer"
          >
            <CalendarIcon className="w-4 h-4 text-emerald-500" />
            <span>View Calendar</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-zinc-200/80 p-5 rounded-2xl flex items-center justify-between hover:shadow-md hover:border-zinc-300 transition duration-300">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Today</span>
            <h3 className="text-3xl font-serif text-zinc-900 leading-none font-semibold">{todaySessions.length}</h3>
            <span className="text-[10px] text-zinc-500 font-medium block pt-0.5">sessions</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-inner">
            <Clock className="w-4.5 h-4.5" />
          </div>
        </div>
        
        <div className="bg-white border border-zinc-200/80 p-5 rounded-2xl flex items-center justify-between hover:shadow-md hover:border-zinc-300 transition duration-300">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Patients</span>
            <h3 className="text-3xl font-serif text-zinc-900 leading-none font-semibold">{clients.length}</h3>
            <span className="text-[10px] text-zinc-500 font-medium block pt-0.5">active</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50/50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-inner">
            <Users className="w-4.5 h-4.5" />
          </div>
        </div>
        
        <div className="bg-white border border-zinc-200/80 p-5 rounded-2xl flex items-center justify-between hover:shadow-md hover:border-zinc-300 transition duration-300">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Sealed</span>
            <h3 className="text-3xl font-serif text-zinc-900 leading-none font-semibold">{notesStats.sealed}</h3>
            <span className="text-[10px] text-zinc-500 font-medium block pt-0.5">SOAP notes</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shadow-inner">
            <FileText className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200/80 p-5 rounded-2xl flex items-center justify-between hover:shadow-md hover:border-zinc-300 transition duration-300">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">This Week</span>
            <h3 className="text-3xl font-serif text-zinc-900 leading-none font-semibold">{weekSessionsHours}<span className="text-sm font-sans font-normal text-zinc-500 ml-0.5">h</span></h3>
            <span className="text-[10px] text-zinc-500 font-medium block pt-0.5">booked</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-inner">
            <CalendarRange className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Schedule + SOAP Notes — Full Width */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Today's Schedule */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm hover:border-zinc-300 transition duration-300">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/30">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Today's Schedule</h3>
            </div>
            <span className="px-2.5 py-1 bg-zinc-100 border border-zinc-200 rounded-lg text-[9px] text-zinc-500 font-bold uppercase tracking-wider font-mono">
              {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
          
          <div className="p-4 divide-y divide-zinc-100 max-h-[400px] overflow-y-auto">
            {todaySessions.length === 0 ? (
              <div className="py-16 text-center text-zinc-400 text-xs font-light">
                No sessions scheduled for today.
              </div>
            ) : (
              todaySessions.map((s) => {
                const clientInitials = s.clientName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      const clientObj = clients.find((c) => c.id === s.clientId);
                      if (clientObj) {
                        onSelectSessionForNotes(s, clientObj);
                      }
                    }}
                    className="py-3 first:pt-0 last:pb-0 flex items-center gap-3.5 cursor-pointer hover:bg-zinc-50/50 px-3 rounded-xl transition group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-50 border border-zinc-200 text-zinc-650 flex items-center justify-center font-bold text-xs shadow-inner group-hover:from-emerald-50 group-hover:to-emerald-100/50 group-hover:text-emerald-600 group-hover:border-emerald-200 transition duration-200">
                      {clientInitials}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="text-xs font-bold text-zinc-800 truncate group-hover:text-emerald-600 transition">
                        {s.clientName}
                      </h4>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-semibold text-zinc-700 font-mono">
                          {new Date(s.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span>•</span>
                        <span className="bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider font-mono">
                          {s.sessionType}
                        </span>
                        <span>•</span>
                        <span>{s.durationMinutes} mins</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 text-[8px] font-bold rounded-full uppercase tracking-wider border
                        ${s.status === "scheduled" 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : s.status === "completed"
                          ? "bg-zinc-100 text-zinc-600 border-zinc-200"
                          : "bg-red-50 text-red-655 border-red-100"}`}>
                        {s.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent SOAP Notes */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm hover:border-zinc-300 transition duration-300">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/30">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" />
              <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Recent SOAP Notes</h3>
            </div>
            <Sparkles className="w-4.5 h-4.5 text-amber-500" />
          </div>
          
          <div className="p-4 divide-y divide-zinc-100 max-h-[400px] overflow-y-auto">
            {recentSoapNotes.length === 0 ? (
              <div className="py-16 text-center text-zinc-400 text-xs font-light">
                No SOAP notes yet.
              </div>
            ) : (
              recentSoapNotes.map((n) => (
                <div
                  key={n.sessionId}
                  onClick={() => {
                    const clientObj = clients.find((c) => `${c.firstName} ${c.lastName}` === n.clientName);
                    const sessionObj = sessions.find((s) => s.id === n.sessionId);
                    if (clientObj && sessionObj) {
                      onSelectSessionForNotes(sessionObj, clientObj);
                    }
                  }}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between cursor-pointer hover:bg-zinc-50/50 px-3 rounded-xl transition group"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-zinc-800 truncate group-hover:text-purple-600 transition">
                      {n.clientName}
                    </h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5 font-light">
                      {new Date(n.scheduledAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 text-[8px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1 border
                      ${n.status === "signed" 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                        : "bg-amber-50 text-amber-600 border-amber-100"}`}>
                      {n.status === "signed" ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                      <span>{n.status}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
