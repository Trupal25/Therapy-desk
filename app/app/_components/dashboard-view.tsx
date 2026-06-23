"use client"

import { useMemo, useState } from "react"
import { Plus, Calendar, Clock, Users, FileText, ChevronRight, Sparkles, Lock, Search } from "lucide-react"
import { Session } from "@/app/app/_hooks/useSessions"
import { Client } from "@/app/app/_hooks/useClients"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface DashboardViewProps {
  user: { fullName?: string } | null
  clients: Client[]
  sessions: Session[]
  recentSoapNotes: any[]
  todaySessions: Session[]
  weekSessionsHours: number
  onNewClientClick: () => void
  onViewCalendarClick: () => void
  onSelectSessionForNotes: (session: Session, client: Client) => void
  onOpenPatientHistory?: (client: Client) => void
  isLoadingClients?: boolean
  isLoadingSessions?: boolean
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

const avatarColors = [
  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
]

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
  onOpenPatientHistory,
  isLoadingClients = false,
  isLoadingSessions = false,
}: DashboardViewProps) {
  const [dashboardSearch, setDashboardSearch] = useState("")
  if (!user) return null

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

  const loading = isLoadingClients || isLoadingSessions

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="text-2xl font-bold tracking-tight mt-0.5 font-serif">
            {getGreeting()}, {getFirstName(user.fullName)}
          </h1>
          {!loading && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {todaySessions.length === 0
                ? "No sessions scheduled today."
                : `${todaySessions.length} session${todaySessions.length > 1 ? "s" : ""} today${notesStats.pending > 0 ? ` · ${notesStats.pending} note${notesStats.pending > 1 ? "s" : ""} pending` : ""}`}
            </p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button onClick={onNewClientClick} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Add Patient
          </Button>
          <Button onClick={onViewCalendarClick} variant="outline" size="sm">
            <Calendar className="mr-1.5 h-4 w-4" />
            Calendar
          </Button>
        </div>
      </div>

      {/* Quick Patient Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Quick search patients..."
          value={dashboardSearch}
          onChange={(e) => setDashboardSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        />
        {dashboardSearch.trim() && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
            {clients
              .filter((c) =>
                `${c.firstName} ${c.lastName}`.toLowerCase().includes(dashboardSearch.toLowerCase())
              )
              .slice(0, 8)
              .map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onOpenPatientHistory?.(c)
                    setDashboardSearch("")
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors text-sm"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                      {c.firstName[0]}{c.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.referralSource || "Self-referred"}</p>
                  </div>
                </button>
              ))}
            {clients.filter((c) =>
              `${c.firstName} ${c.lastName}`.toLowerCase().includes(dashboardSearch.toLowerCase())
            ).length === 0 && (
              <p className="px-3 py-4 text-xs text-muted-foreground text-center">No patients found</p>
            )}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today", value: todaySessions.length, sub: "sessions", icon: Clock },
          { label: "Patients", value: clients.length, sub: "active", icon: Users },
          { label: "Signed", value: notesStats.sealed, sub: "SOAP notes", icon: Lock },
          { label: "Week hours", value: weekSessionsHours, sub: "hours booked", icon: Calendar, suffix: "h" },
        ].map((kpi) => (
          <Card key={kpi.label} className={cn(loading && "animate-pulse")}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <kpi.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
                <p className="text-xl font-bold truncate">
                  {kpi.value}
                  {kpi.suffix && <span className="text-sm font-normal text-muted-foreground ml-0.5">{kpi.suffix}</span>}
                </p>
                <p className="text-xs text-muted-foreground">{kpi.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Schedule */}
      <Card>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold font-serif">Today's Schedule</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onViewCalendarClick}>
            View all <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
        <div className="divide-y">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-muted rounded w-1/3" />
                  <div className="h-2 bg-muted rounded w-1/4" />
                </div>
                <div className="h-6 w-16 bg-muted rounded" />
              </div>
            ))
          ) : todaySessions.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="font-medium">No appointments today</p>
              <Button variant="link" size="sm" onClick={onViewCalendarClick}>
                Open Calendar
              </Button>
            </div>
          ) : (
            todaySessions.map((s) => {
              const client = clients.find((c) => c.id === s.clientId)
              const time = new Date(s.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              const initials = s.clientName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
              const palette = avatarColors[s.clientName.charCodeAt(0) % avatarColors.length]

              return (
                <div key={s.id} className="p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={cn("text-xs font-bold", palette)}>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.clientName}</p>
                    <p className="text-xs text-muted-foreground">{time} · {s.durationMinutes} min · {s.sessionType}</p>
                  </div>
                  <Badge variant={s.status === "scheduled" ? "secondary" : "outline"} className="shrink-0">
                    {s.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant={s.soapNote ? "secondary" : "default"}
                    onClick={() => client && onSelectSessionForNotes(s, client)}
                    disabled={!client}
                  >
                    <FileText className="mr-1 h-3 w-3" />
                    {s.soapNote ? "View Note" : "Write Note"}
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
            <Button variant="ghost" size="sm" onClick={onViewCalendarClick}>
              View all <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="divide-y">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 flex items-center gap-3 animate-pulse">
                  <div className="h-7 w-7 rounded-full bg-muted" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-muted rounded w-1/3" />
                    <div className="h-2 bg-muted rounded w-1/4" />
                  </div>
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
                  <div key={s.id} className="p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors">
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
                  </div>
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
            {notesStats.pending > 0 && (
              <Badge variant="secondary" className="shrink-0">{notesStats.pending} pending</Badge>
            )}
          </div>
          <div className="divide-y">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 flex items-center gap-3 animate-pulse">
                  <div className="h-7 w-7 rounded-full bg-muted" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-muted rounded w-1/3" />
                    <div className="h-2 bg-muted rounded w-1/4" />
                  </div>
                </div>
              ))
            ) : recentSoapNotes.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No SOAP records yet</div>
            ) : (
              recentSoapNotes.slice(0, 6).map((n: Record<string, any>) => {
                const client = clients.find((c) => `${c.firstName} ${c.lastName}` === n.clientName)
                const session = sessions.find((s) => s.id === n.sessionId)
                const isSigned = n.status === "signed"
                const initials = String(n.clientName || "").split(" ").map((ch) => ch[0]).join("").substring(0, 2).toUpperCase() || "?"
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
                      <p className="text-xs text-muted-foreground">
                        {new Date(n.scheduledAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <Badge variant={isSigned ? "default" : "secondary"} className="shrink-0">
                      {n.status}
                    </Badge>
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
