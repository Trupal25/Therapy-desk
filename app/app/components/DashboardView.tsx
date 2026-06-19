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
  Unlock,
  ArrowRight,
  TrendingUp,
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
  isLoadingClients?: boolean;
  isLoadingSessions?: boolean;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getFirstName(fullName?: string) {
  if (!fullName) return "Doctor";
  return fullName.split(" ")[0];
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
  onSelectSessionForNotes,
  isLoadingClients = false,
  isLoadingSessions = false,
}: DashboardViewProps) {
  if (!user) return null;

  const notesStats = useMemo(() => {
    const total = sessions.length;
    const sealed = sessions.filter((s) => s.soapNote?.status === "signed").length;
    const pending = sessions.filter((s) => s.soapNote && s.soapNote.status !== "signed").length;
    const ratio = total ? Math.round((sealed / total) * 100) : 0;
    return { total, sealed, pending, ratio };
  }, [sessions]);

  const upcomingSessions = useMemo(() => {
    const now = new Date();
    return sessions
      .filter((s) => new Date(s.scheduledAt) >= now && s.status === "scheduled")
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .slice(0, 5);
  }, [sessions]);

  // ── Skeleton helpers ───────────────────────────────────────────────────────
  const KpiSkeleton = () => (
    <div className="bg-white border border-zinc-100 p-5 rounded-2xl flex items-center justify-between animate-pulse">
      <div className="space-y-2 w-2/3">
        <div className="h-2 bg-zinc-100 rounded w-1/2" />
        <div className="h-7 bg-zinc-200 rounded w-10 mt-1" />
        <div className="h-2 bg-zinc-100 rounded w-1/3 mt-1.5" />
      </div>
      <div className="w-10 h-10 rounded-xl bg-zinc-100 flex-shrink-0" />
    </div>
  );

  const RowSkeleton = ({ count = 3 }: { count?: number }) => (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="py-3.5 px-4 flex items-center gap-3 animate-pulse border-b border-zinc-50 last:border-0">
          <div className="w-9 h-9 rounded-xl bg-zinc-100 flex-shrink-0" />
          <div className="flex-grow space-y-2 min-w-0">
            <div className="h-3 bg-zinc-200 rounded w-1/3" />
            <div className="h-2 bg-zinc-100 rounded w-1/2" />
          </div>
          <div className="w-16 h-6 bg-zinc-100 rounded-lg flex-shrink-0" />
        </div>
      ))}
    </>
  );

  // ── KPI data ───────────────────────────────────────────────────────────────
  const kpis = [
    {
      label: "Today",
      value: todaySessions.length,
      sub: "sessions",
      icon: Clock,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-400",
      loading: isLoadingSessions,
    },
    {
      label: "Patients",
      value: clients.length,
      sub: "active",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-400",
      loading: isLoadingClients,
    },
    {
      label: "Sealed",
      value: notesStats.sealed,
      sub: "SOAP notes",
      icon: Lock,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-400",
      loading: isLoadingSessions,
    },
    {
      label: "This week",
      value: weekSessionsHours,
      sub: "hours booked",
      icon: CalendarRange,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-400",
      loading: isLoadingSessions,
    },
  ];

  return (
    <div className="space-y-7 max-w-5xl animate-fadeUp">

      {/* ── Greeting strip ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-400 font-medium mb-0.5">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            {getGreeting()}, {getFirstName(user.fullName)} 👋
          </h1>
          <p className="text-sm text-zinc-400 font-light mt-1 leading-relaxed">
            {isLoadingSessions ? (
              <span className="inline-block h-3 bg-zinc-100 rounded w-48 animate-pulse" />
            ) : todaySessions.length === 0 ? (
              "No sessions scheduled today. A good day for notes."
            ) : (
              <>
                You have{" "}
                <span className="font-semibold text-zinc-700">{todaySessions.length} session{todaySessions.length !== 1 ? "s" : ""}</span>{" "}
                today
                {notesStats.pending > 0 && (
                  <> · <span className="font-semibold text-amber-600">{notesStats.pending} note{notesStats.pending !== 1 ? "s" : ""} pending</span></>
                )}
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2.5 shrink-0">
          <button
            onClick={onNewClientClick}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Patient
          </button>
          <button
            onClick={onViewCalendarClick}
            className="px-4 py-2.5 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all duration-200 cursor-pointer"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-zinc-400" />
            Calendar
          </button>
        </div>
      </div>

      {/* ── KPI strip ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) =>
          kpi.loading ? (
            <KpiSkeleton key={kpi.label} />
          ) : (
            <div
              key={kpi.label}
              className={`bg-white border border-zinc-100 p-4 rounded-2xl flex items-center gap-4 hover:shadow-sm hover:border-zinc-200 transition-all duration-200 border-l-[3px] ${kpi.border}`}
            >
              <div className={`w-9 h-9 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center shrink-0`}>
                <kpi.icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">{kpi.label}</p>
                <p className="text-2xl font-bold text-zinc-900 leading-none mt-0.5">
                  {kpi.value}
                  {kpi.label === "This week" && <span className="text-sm font-normal text-zinc-400 ml-0.5">h</span>}
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5">{kpi.sub}</p>
              </div>
            </div>
          )
        )}
      </div>

      {/* ── Today's schedule — FULL WIDTH PRIMARY FOCUS ─────────────────────── */}
      <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Today's Schedule</h2>
              <p className="text-[10px] text-zinc-400 font-medium">
                {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
              </p>
            </div>
          </div>
          <button
            onClick={onViewCalendarClick}
            className="text-[11px] text-zinc-400 hover:text-zinc-700 font-medium flex items-center gap-1 transition cursor-pointer"
          >
            View all <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-zinc-50">
          {isLoadingSessions || isLoadingClients ? (
            <RowSkeleton count={3} />
          ) : todaySessions.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center mx-auto mb-3">
                <CalendarIcon className="w-5 h-5 text-zinc-300" />
              </div>
              <p className="text-sm font-medium text-zinc-400">No sessions today</p>
              <p className="text-xs text-zinc-300 mt-1">Use the calendar to schedule appointments</p>
              <button
                onClick={onViewCalendarClick}
                className="mt-4 px-4 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-zinc-800 transition inline-flex items-center gap-2"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                Open Calendar
              </button>
            </div>
          ) : (
            todaySessions.map((s) => {
              const clientInitials = s.clientName
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();
              const hasNote = s.soapNote !== null && s.soapNote !== undefined;
              const clientObj = clients.find((c) => c.id === s.clientId);
              const time = new Date(s.scheduledAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={s.id}
                  className="px-5 py-3.5 flex items-center gap-4 hover:bg-zinc-50/60 group transition-colors duration-150"
                >
                  {/* Time column */}
                  <div className="w-14 shrink-0 text-center">
                    <span className="text-[11px] font-bold text-zinc-500 font-mono tabular-nums">
                      {time}
                    </span>
                  </div>

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 flex items-center justify-center font-semibold text-[10px] shrink-0 group-hover:bg-emerald-50 group-hover:border-emerald-200 group-hover:text-emerald-700 transition-colors duration-150">
                    {clientInitials}
                  </div>

                  {/* Name + meta */}
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-semibold text-zinc-800 truncate group-hover:text-zinc-900 transition">
                      {s.clientName}
                    </p>
                    <p className="text-[10px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                      <span className="bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                        {s.sessionType}
                      </span>
                      <span>·</span>
                      <span>{s.durationMinutes} min</span>
                    </p>
                  </div>

                  {/* Status + CTA */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider border ${
                        s.status === "scheduled"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : s.status === "completed"
                          ? "bg-zinc-100 text-zinc-500 border-zinc-200"
                          : "bg-red-50 text-red-600 border-red-100"
                      }`}
                    >
                      {s.status}
                    </span>

                    <button
                      onClick={() => clientObj && onSelectSessionForNotes(s, clientObj)}
                      disabled={!clientObj}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer border ${
                        hasNote
                          ? "bg-violet-50 text-violet-600 border-violet-100 hover:bg-violet-100 hover:border-violet-200"
                          : "bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-700"
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {hasNote ? (
                        <>
                          <FileText className="w-3 h-3" />
                          View Note
                        </>
                      ) : (
                        <>
                          <FileText className="w-3 h-3" />
                          Write Note
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Two-col: Upcoming + Recent Notes ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Upcoming sessions */}
        <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <h2 className="text-sm font-semibold text-zinc-900">Upcoming</h2>
            </div>
            <button
              onClick={onViewCalendarClick}
              className="text-[11px] text-zinc-400 hover:text-zinc-700 font-medium flex items-center gap-1 transition cursor-pointer"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-zinc-50">
            {isLoadingSessions ? (
              <RowSkeleton count={3} />
            ) : upcomingSessions.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-xs text-zinc-400">No upcoming sessions</p>
                <button
                  onClick={onViewCalendarClick}
                  className="mt-3 text-[11px] text-zinc-500 hover:text-zinc-800 font-semibold flex items-center gap-1 mx-auto cursor-pointer transition"
                >
                  Schedule one <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              upcomingSessions.map((s) => {
                const clientInitials = s.clientName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase();
                const date = new Date(s.scheduledAt);
                const isToday =
                  date.toDateString() === new Date().toDateString();
                const dateStr = isToday
                  ? "Today"
                  : date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
                const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                return (
                  <div key={s.id} className="px-5 py-3 flex items-center gap-3 hover:bg-zinc-50/60 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 flex items-center justify-center font-semibold text-[9px] shrink-0">
                      {clientInitials}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-xs font-semibold text-zinc-800 truncate">{s.clientName}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {dateStr} · {timeStr}
                      </p>
                    </div>
                    <span className="text-[9px] font-bold text-zinc-400 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                      {s.sessionType}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent SOAP Notes */}
        <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
              </div>
              <h2 className="text-sm font-semibold text-zinc-900">Recent Notes</h2>
            </div>
            {notesStats.pending > 0 && (
              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {notesStats.pending} pending
              </span>
            )}
          </div>

          <div className="divide-y divide-zinc-50">
            {isLoadingSessions || isLoadingClients ? (
              <RowSkeleton count={3} />
            ) : recentSoapNotes.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-xs text-zinc-400">No SOAP notes yet</p>
                <p className="text-[10px] text-zinc-300 mt-1">Write a note from today's schedule above</p>
              </div>
            ) : (
              recentSoapNotes.slice(0, 6).map((n) => {
                const clientObj = clients.find(
                  (c) => `${c.firstName} ${c.lastName}` === n.clientName
                );
                const sessionObj = sessions.find((s) => s.id === n.sessionId);
                const isSigned = n.status === "signed";

                return (
                  <div
                    key={n.sessionId}
                    onClick={() => clientObj && sessionObj && onSelectSessionForNotes(sessionObj, clientObj)}
                    className="px-5 py-3 flex items-center gap-3 hover:bg-zinc-50/60 cursor-pointer transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 flex items-center justify-center shrink-0">
                      {isSigned ? (
                        <Lock className="w-3 h-3 text-violet-500" />
                      ) : (
                        <Unlock className="w-3 h-3 text-amber-500" />
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-xs font-semibold text-zinc-800 truncate group-hover:text-violet-700 transition">
                        {n.clientName}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {new Date(n.scheduledAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                          isSigned
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}
                      >
                        {n.status}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
