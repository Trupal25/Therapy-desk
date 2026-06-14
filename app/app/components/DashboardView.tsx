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
  weekSessionsCount: number;
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
  weekSessionsCount,
  onNewClientClick,
  onViewCalendarClick,
  onSelectSessionForNotes
}: DashboardViewProps) {
  if (!user) return null;

  return (
    <div className="space-y-6 max-w-6xl animate-fadeUp">
      {/* WELCOME BANNER WITH GRADIENT */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-sage/15 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight">Welcome back, {user.fullName || "Doctor"}</h1>
          <p className="text-stone-400 text-xs md:text-sm mt-1.5 font-light">Here is a structured overview of your practice baseline today.</p>
        </div>
        <div className="flex gap-2 z-10">
          <button 
            onClick={onNewClientClick}
            className="px-4 py-2.5 bg-sage hover:bg-sage/90 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Client</span>
          </button>
          <button 
            onClick={onViewCalendarClick}
            className="px-4 py-2.5 bg-stone-800 hover:bg-stone-750 text-white border border-stone-700 rounded-lg text-xs font-semibold flex items-center gap-2 shadow transition-all duration-200 cursor-pointer"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-sage" />
            <span>View Calendar</span>
          </button>
        </div>
      </div>

      {/* KPI STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200/70 p-5 rounded-xl flex items-center justify-between hover:border-sage-mid hover:shadow-md transition-all duration-250">
          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Today's Sessions</span>
            <h3 className="text-3xl font-serif text-ink leading-none">{todaySessions.length}</h3>
            <span className="text-[10px] text-sage font-medium block mt-0.5">scheduled appointments</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sage-light/60 text-sage flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        
        <div className="bg-white border border-stone-200/70 p-5 rounded-xl flex items-center justify-between hover:border-sage-mid hover:shadow-md transition-all duration-250">
          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Active Clients</span>
            <h3 className="text-3xl font-serif text-ink leading-none">{clients.length}</h3>
            <span className="text-[10px] text-sage font-medium block mt-0.5">registered in practice</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sage-light/60 text-sage flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
        
        <div className="bg-white border border-stone-200/70 p-5 rounded-xl flex items-center justify-between hover:border-sage-mid hover:shadow-md transition-all duration-250">
          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Notes generated</span>
            <h3 className="text-3xl font-serif text-ink leading-none">{recentSoapNotes.length}</h3>
            <span className="text-[10px] text-sage font-medium block mt-0.5">AI SOAP records</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sage-light/60 text-sage flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-stone-200/70 p-5 rounded-xl flex items-center justify-between hover:border-sage-mid hover:shadow-md transition-all duration-250">
          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">This Week</span>
            <h3 className="text-3xl font-serif text-ink leading-none">{weekSessionsCount}</h3>
            <span className="text-[10px] text-sage font-medium block mt-0.5">active clinical hours</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sage-light/60 text-sage flex items-center justify-center">
            <CalendarRange className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* DASHBOARD DOUBLE COLUMN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TODAY'S SCHEDULE CARD */}
        <div className="bg-white border border-stone-200/70 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-stone-150 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sage" />
              <h3 className="text-sm font-semibold text-ink">Today's Scheduled Sessions</h3>
            </div>
            <span className="px-2 py-0.5 bg-stone-100 rounded text-[11px] text-stone-500 font-medium">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <div className="p-4 divide-y divide-stone-100">
            {todaySessions.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-xs font-light">
                No clinical sessions scheduled for today.
              </div>
            ) : (
              todaySessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    const clientObj = clients.find((c) => c.id === s.clientId);
                    if (clientObj) {
                      onSelectSessionForNotes(s, clientObj);
                    }
                  }}
                  className="py-3.5 flex items-center gap-3.5 cursor-pointer hover:bg-stone-50/50 px-2 rounded-lg transition-all duration-150"
                >
                  <div className="w-9 h-9 rounded-full bg-sage-light text-sage flex items-center justify-center font-bold text-xs flex-shrink-0 uppercase">
                    {s.clientName.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-ink truncate">{s.clientName}</h4>
                    <p className="text-[10px] text-stone-400 flex items-center gap-1.5 mt-0.5">
                      <span>
                        {new Date(s.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span>•</span>
                      <span>{s.sessionType.toUpperCase()} Session</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider
                      ${s.status === "scheduled" ? "bg-sage-light text-sage" : "bg-stone-100 text-stone-500"}`}>
                      {s.status}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RECENT CLINICAL SOAP NOTES CARD */}
        <div className="bg-white border border-stone-200/70 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-stone-150 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-sage" />
              <h3 className="text-sm font-semibold text-ink">Recent AI Generated SOAP Notes</h3>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-sage animate-pulse" />
          </div>
          <div className="p-4 divide-y divide-stone-100">
            {recentSoapNotes.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-xs font-light">
                No clinical notes generated this month.
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
                  className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-stone-50/50 px-2 rounded-lg transition-all duration-150"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-ink truncate">{n.clientName}</h4>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      Session Date: {new Date(n.scheduledAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1
                      ${n.status === "signed" ? "bg-sage-light text-sage border border-sage/10" : "bg-amber-light text-amber border border-amber/10"}`}>
                      {n.status === "signed" ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                      <span>{n.status}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
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
