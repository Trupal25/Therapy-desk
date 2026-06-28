"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus, Calendar, Clock, Users, FileText, ChevronRight, Sparkles, Lock, Search,
  Activity, ArrowRight
} from "lucide-react"
import { Session } from "@/app/app/_hooks/useSessions"
import { Client } from "@/app/app/_hooks/useClients"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// ------------------------------------------------------------------

interface DashboardViewProps {
  user: { fullName?: string } | null
  clients: Client[]
  sessions: Session[]
  recentSoapNotes: any[]
  todaySessions: Session[]
  weekSessionsHours: number
  isLoadingClients?: boolean
  isLoadingSessions?: boolean
  onNewClientClick: () => void
  onViewCalendarClick: () => void
  onSelectSessionForNotes: (session: Session, client: Client) => void
  onOpenPatientHistory?: (client: Client) => void
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

function getFirstName(fullName?: string) {
  if (!fullName) return "Doctor"
  return fullName.split(" ")[0]
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function KpiCard({
  label, value, sub, icon: Icon, suffix, loading
}: {
  label: string; value: number; sub: string; icon: any; suffix?: string; loading: boolean
}) {
  return (
    <Card className={cn("border-border", loading && "animate-pulse")}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">{label}</p>
        </div>
        <p className="text-lg sm:text-xl font-bold leading-tight">
          {value}
          {suffix && <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-0.5">{suffix}</span>}
        </p>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>
      </CardContent>
    </Card>
  )
}

// ------------------------------------------------------------------

export function DashboardView({
  user, clients, sessions, recentSoapNotes, todaySessions, weekSessionsHours,
  onNewClientClick, onViewCalendarClick, onSelectSessionForNotes,
  isLoadingClients = false, isLoadingSessions = false,
}: DashboardViewProps) {
  const router = useRouter()
  const searchRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut: / or Cmd+K focuses search input
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "/") {
        if (document.activeElement !== searchRef.current) {
          e.preventDefault()
          searchRef.current?.focus()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const [dashboardSearch, setDashboardSearch] = useState("")

  if (!user) return null

  const loading = isLoadingClients || isLoadingSessions

  const notesStats = useMemo(() => {
    const total = sessions.length
    const sealed = sessions.filter((s) => s.soapNote?.status === "signed").length
    const pending = sessions.filter((s) => s.soapNote && s.soapNote.status !== "signed").length
    return { total, sealed, pending }
  }, [sessions])

  const upcomingSessions = useMemo(() => {
    const now = new Date()
    return sessions
      .filter((s) => new Date(s.scheduledAt) >= now && s.status === "scheduled")
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .slice(0, 5)
  }, [sessions])

  // Weekly progress metrics
  const weekStats = useMemo(() => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const start = new Date(now)
    start.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    start.setHours(0, 0, 0, 0)
    const weekList = sessions.filter((s) => new Date(s.scheduledAt) >= start)
    return {
      total: weekList.length,
      completed: weekList.filter((s) => s.status === "completed").length,
    }
  }, [sessions])

  const avatarColors = [
    "bg-blue-100 text-blue-700","bg-emerald-100 text-emerald-700","bg-violet-100 text-violet-700",
    "bg-amber-100 text-amber-700","bg-rose-100 text-rose-700","bg-cyan-100 text-cyan-700",
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal mt-1">
            {getGreeting()}, {getFirstName(user.fullName)}
          </h1>
          {!loading && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {todaySessions.length === 0
                ? "No sessions scheduled today."
                : todaySessions.length + " session" + (todaySessions.length > 1 ? "s" : "") + " today" + (
                    notesStats.pending > 0 ? " · " + notesStats.pending + " note" + (notesStats.pending > 1 ? "s" : "") + " pending" : "")}
            </p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button onClick={onNewClientClick} size="sm" className="flex-1 sm:flex-none"><Plus className="mr-1.5 h-4 w-4" />Add Patient</Button>
          <Button onClick={onViewCalendarClick} variant="outline" size="sm" className="flex-1 sm:flex-none"><Calendar className="mr-1.5 h-4 w-4" />Calendar</Button>
        </div>
      </div>

      {/* Quick Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={searchRef}
          type="text"
          placeholder="Quick search patients..."
          value={dashboardSearch}
          onChange={(e) => setDashboardSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-12 rounded-xl border border-input bg-background text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <kbd className="hidden sm:inline-flex items-center rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">/</kbd>
        </div>
        {dashboardSearch.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-sm z-20 max-h-72 overflow-y-auto">
            {clients
              .filter((c) => (c.firstName + " " + c.lastName).toLowerCase().includes(dashboardSearch.toLowerCase()))
              .slice(0, 8)
              .map((c) => (
                <Link
                  href={"/app/patients/" + c.id}
                  key={c.id}
                  onClick={() => setDashboardSearch("")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors text-sm"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">{c.firstName[0]}{c.lastName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.referralSource || "Self-referred"}</p>
                  </div>
                </Link>
              ))}
            {clients.filter((c) => (c.firstName + " " + c.lastName).toLowerCase().includes(dashboardSearch.toLowerCase())).length === 0 && (
              <p className="px-3 py-4 text-xs text-muted-foreground text-center">No patients found</p>
            )}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <KpiCard label="Today" value={todaySessions.length} sub="sessions" icon={Clock} loading={loading} />
        <KpiCard label="Patients" value={clients.length} sub="active" icon={Users} loading={loading} />
        <KpiCard label="Signed" value={notesStats.sealed} sub="SOAP notes" icon={Lock} loading={loading} />
        <KpiCard label="Week hours" value={weekSessionsHours} sub="hours booked" icon={Calendar} suffix="h" loading={loading} />
        <Card className="border-border hidden xl:flex items-center px-4 py-2">
          <div className="w-full">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">This Week</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: (weekStats.total === 0 ? 0 : (weekStats.completed / weekStats.total) * 100) + "%" }}
                  />
                </div>
              </div>
              <span className="text-xs font-bold text-muted-foreground shrink-0">
                {weekStats.completed}/{weekStats.total}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold font-serif">Today's Schedule</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onViewCalendarClick}>View all <ChevronRight className="ml-1 h-3 w-3" /></Button>
        </div>
        <div className="divide-y">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-1.5"><div className="h-3 bg-muted rounded w-1/3" /><div className="h-2 bg-muted rounded w-1/4" /></div>
                <div className="h-6 w-16 bg-muted rounded" />
              </div>
            ))
          ) : todaySessions.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="font-medium">No appointments today</p>
              <Button variant="link" size="sm" onClick={onViewCalendarClick}>Open Calendar</Button>
            </div>
          ) : (
            todaySessions.map((s) => {
              const client = clients.find((c) => c.id === s.clientId)
              const time = formatTime(s.scheduledAt)
              const initials = s.clientName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
              const palette = avatarColors[s.clientName.charCodeAt(0) % avatarColors.length]
              return (
                <div key={s.id} className="p-3 sm:p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
                   <Avatar className="h-8 w-8 shrink-0">
                     <AvatarFallback className={cn("text-xs font-bold", palette)}>{initials}</AvatarFallback>
                   </Avatar>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-medium truncate">{s.clientName}</p>
                     <p className="text-xs text-muted-foreground truncate">{time} · {s.durationMinutes} min · {s.sessionType}</p>
                   </div>
                   <Link href={"/app/patients/" + s.clientId} className="text-xs text-muted-foreground hover:text-foreground shrink-0 hidden sm:block">
                     <span className="flex items-center gap-1"><ArrowRight className="h-3 w-3" />Profile</span>
                   </Link>
                   <Button size="sm" variant={s.soapNote ? "secondary" : "default"} onClick={() => client && onSelectSessionForNotes(s, client)} disabled={!client} className="shrink-0">
                     <FileText className="mr-1 h-3 w-3" />
                     <span className="hidden xs:inline">{s.soapNote ? "View Note" : "Write Note"}</span>
                     <span className="xs:hidden">{s.soapNote ? "View" : "Write"}</span>
                   </Button>
                 </div>
              )
            })
          )}
        </div>
      </Card>

      {/* Upcoming + Recent Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold font-serif">Upcoming</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onViewCalendarClick}>View all <ChevronRight className="ml-1 h-3 w-3" /></Button>
          </div>
          <div className="divide-y">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 flex items-center gap-3 animate-pulse">
                  <div className="h-7 w-7 rounded-full bg-muted" />
                  <div className="flex-1 space-y-1"><div className="h-3 bg-muted rounded w-1/3" /><div className="h-2 bg-muted rounded w-1/4" /></div>
                </div>
              ))
            ) : upcomingSessions.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No upcoming sessions</div>
            ) : (
              upcomingSessions.map((s) => {
                const d = new Date(s.scheduledAt)
                const initials = s.clientName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
                const palette = avatarColors[s.clientName.charCodeAt(0) % avatarColors.length]
                return (
                  <Link href={"/app/patients/" + s.clientId} key={s.id} className="block p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className={cn("text-[10px] font-bold", palette)}>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.clientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">{s.sessionType}</Badge>
                  </Link>
                )
              })
            )}
          </div>
        </Card>

        <Card>
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold font-serif">Recent Notes</h2>
            </div>
            {notesStats.pending > 0 && <Badge variant="secondary" className="shrink-0">{notesStats.pending} pending</Badge>}
          </div>
          <div className="divide-y">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 flex items-center gap-3 animate-pulse">
                  <div className="h-7 w-7 rounded-full bg-muted" />
                  <div className="flex-1 space-y-1"><div className="h-3 bg-muted rounded w-1/3" /><div className="h-2 bg-muted rounded w-1/4" /></div>
                </div>
              ))
            ) : recentSoapNotes.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No SOAP records yet</div>
            ) : (
              recentSoapNotes.slice(0, 6).map((n: Record<string, any>) => {
                const client = clients.find((c) => (c.firstName + " " + c.lastName) === n.clientName)
                const session = sessions.find((s) => s.id === n.sessionId)
                const isSigned = n.status === "signed"
                const initials = String(n.clientName || "").split(" ").map((ch: string) => ch[0]).join("").substring(0, 2).toUpperCase() || "?"
                const palette = avatarColors[(n.clientName?.charCodeAt(0) || 0) % avatarColors.length]
                return (
                  <div
                    key={n.sessionId}
                    onClick={() => client && session && onSelectSessionForNotes(session, client)}
                    className="p-3 flex items-center gap-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className={cn("text-[10px] font-bold", palette)}>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{n.clientName}</p>
                      <p className="text-xs text-muted-foreground">{new Date(n.scheduledAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>
                    </div>
                    <Badge variant={isSigned ? "default" : "secondary"} className="shrink-0">{n.status}</Badge>
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
