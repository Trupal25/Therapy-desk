"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, Clock, Search, Bell, Loader2 } from "lucide-react"
import { Session, getLocalDateStr } from "@/app/app/_hooks/useSessions"
import { Client } from "@/app/app/_hooks/useClients"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ScheduleViewProps {
  sessions: Session[]
  clients: Client[]
  currentMonth: Date
  selectedCalDate: Date
  setSelectedCalDate: (date: Date) => void
  prevMonth: () => void
  nextMonth: () => void
  daysInMonthData: { firstDay: number; totalDays: number }
  daySessions: Session[]
  newApptClient: string
  setNewApptClient: (val: string) => void
  newApptDate: string
  setNewApptDate: (val: string) => void
  newApptTime: string
  setNewApptTime: (val: string) => void
  newApptDuration: string
  setNewApptDuration: (val: string) => void
  newApptType: string
  setNewApptType: (val: string) => void
  onSubmit: (e: React.FormEvent) => void
  isBooking?: boolean
  isLoading?: boolean
}

const SESSION_TAGS = [
  { label: "CBT", color: "bg-indigo-100 text-indigo-700" },
  { label: "Anxiety", color: "bg-emerald-100 text-emerald-700" },
  { label: "Trauma", color: "bg-rose-100 text-rose-700" },
  { label: "Depression", color: "bg-sky-100 text-sky-700" },
  { label: "General", color: "bg-amber-100 text-amber-700" },
]

const DOT_COLORS = [
  "bg-indigo-500", "bg-emerald-500", "bg-rose-500", "bg-sky-500", "bg-amber-500",
]

function getSessionTag(type: string) {
  const t = type.toLowerCase()
  const tag = SESSION_TAGS.find((s) => t.includes(s.label.toLowerCase())) || SESSION_TAGS[4]
  return tag
}

export function ScheduleView({
  sessions, clients, currentMonth, selectedCalDate, setSelectedCalDate,
  prevMonth, nextMonth, daysInMonthData, daySessions,
  newApptClient, setNewApptClient, newApptDate, setNewApptDate,
  newApptTime, setNewApptTime, newApptDuration, setNewApptDuration,
  newApptType, setNewApptType, onSubmit, isBooking = false, isLoading = false,
}: ScheduleViewProps) {
  const [viewMode, setViewMode] = useState<"month" | "week">("month")
  const [scheduleSearchQuery, setScheduleSearchQuery] = useState("")
  const [sendingReminder, setSendingReminder] = useState<string | null>(null)

  const sendReminder = async (sessionId: string) => {
    setSendingReminder(sessionId)
    try {
      const res = await fetch("/api/sessions/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
      if (res.ok) {
        toast.success("Reminder sent")
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to send reminder")
      }
    } catch {
      toast.error("Failed to send reminder")
    } finally {
      setSendingReminder(null)
    }
  }

  const getStartOfWeek = (d: Date) => {
    const date = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const day = date.getDay()
    const diff = date.getDate() - day
    return new Date(date.setDate(diff))
  }

  const weekDates = useMemo(() => {
    const start = getStartOfWeek(selectedCalDate)
    return Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(start)
      d.setDate(start.getDate() + idx)
      return d
    })
  }, [selectedCalDate])

  const getWeekRangeStr = (selectedDate: Date) => {
    const start = getStartOfWeek(selectedDate)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    const startMonth = start.toLocaleString("default", { month: "short" })
    const endMonth = end.toLocaleString("default", { month: "short" })
    const startYear = start.getFullYear()
    const endYear = end.getFullYear()
    if (startYear !== endYear) return `${startMonth} ${start.getDate()}, ${startYear} – ${endMonth} ${end.getDate()}, ${endYear}`
    if (startMonth !== endMonth) return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${startYear}`
    return `${startMonth} ${start.getDate()} – ${end.getDate()}, ${startYear}`
  }

  const navigateWeek = (weeks: number) => {
    const newDate = new Date(selectedCalDate)
    newDate.setDate(selectedCalDate.getDate() + weeks * 7)
    setSelectedCalDate(newDate)
    setNewApptDate(newDate.toISOString().split("T")[0])
  }

  const handleTodayClick = () => {
    const today = new Date()
    setSelectedCalDate(today)
    setNewApptDate(today.toISOString().split("T")[0])
  }

  const formattedHeaderLabel = useMemo(() => {
    if (viewMode === "month") {
      return currentMonth.toLocaleString("default", { month: "long", year: "numeric" })
    }
    return getWeekRangeStr(selectedCalDate)
  }, [viewMode, currentMonth, selectedCalDate])

  const selectedDaySessionsList = useMemo(() => {
    const dateStr = getLocalDateStr(selectedCalDate)
    return [...sessions]
      .filter((s) => getLocalDateStr(s.scheduledAt) === dateStr)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
  }, [sessions, selectedCalDate])

  // ── Desktop month grid ──
  const renderDesktopMonthGrid = () => {
    const { firstDay, totalDays } = daysInMonthData
    const todayStr = getLocalDateStr(new Date())
    const selectedStr = getLocalDateStr(selectedCalDate)
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const cells: React.ReactNode[] = []
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`pad-${i}`} className="border-r border-b border-border bg-muted/20 min-h-[90px]" />)
    }
    for (let day = 1; day <= totalDays; day++) {
      const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const dateStr = getLocalDateStr(checkDate)
      const isToday = dateStr === todayStr
      const isSelected = dateStr === selectedStr
      const dayList = sessions.filter((s) => getLocalDateStr(s.scheduledAt) === dateStr)

      cells.push(
        <div
          key={`day-${day}`}
          className={cn(
            "border-r border-b border-border bg-white min-h-[90px] p-2 flex flex-col justify-between hover:bg-muted/50 transition-colors cursor-pointer group",
            isSelected && "bg-primary/5 ring-[1.5px] ring-inset ring-primary/30"
          )}
          onClick={() => { setSelectedCalDate(checkDate); setNewApptDate(dateStr) }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-semibold opacity-0 group-hover:opacity-60 transition text-muted-foreground">
              {dayList.length > 0 ? `${dayList.length} appt` : ""}
            </span>
            <span className={cn(
              "flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold transition",
              isToday && "bg-foreground text-background font-bold",
              isSelected && !isToday && "bg-muted-foreground/20 text-foreground font-bold",
              !isSelected && !isToday && "text-muted-foreground hover:text-foreground"
            )}>{day}</span>
          </div>
          <div className="mt-2 space-y-1 flex-1 flex flex-col justify-end overflow-hidden">
            {dayList.slice(0, 2).map((sess) => {
              const tag = getSessionTag(sess.sessionType)
              const timeStr = new Date(sess.scheduledAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(" AM", "a").replace(" PM", "p")
              return (
                <div key={sess.id} className={cn("text-[9.5px] font-bold px-1.5 py-0.5 rounded border truncate", tag.color)}>
                  <span className="truncate">{timeStr} {sess.clientName.split(" ")[0]}</span>
                </div>
              )
            })}
            {dayList.length > 2 && <div className="text-[8.5px] font-semibold text-muted-foreground pl-1.5">+ {dayList.length - 2} more</div>}
          </div>
        </div>
      )
    }

    return (
      <div className={cn("grid grid-cols-7 border-t border-l border-border rounded-xl overflow-hidden bg-white", isLoading && "animate-pulse pointer-events-none opacity-60")}>
        {weekDays.map((wd) => (
          <div key={wd} className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider py-2.5 border-r border-b border-border bg-muted/30">{wd}</div>
        ))}
        {cells}
      </div>
    )
  }

  // ── Mobile compact month grid (Google Calendar style) ──
  const renderMobileMonthGrid = () => {
    const { firstDay, totalDays } = daysInMonthData
    const todayStr = getLocalDateStr(new Date())
    const selectedStr = getLocalDateStr(selectedCalDate)
    const weekDays = ["S", "M", "T", "W", "T", "F", "S"]

    const cells: React.ReactNode[] = []
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`pad-${i}`} className="border-r border-b border-border/50 h-14" />)
    }
    for (let day = 1; day <= totalDays; day++) {
      const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const dateStr = getLocalDateStr(checkDate)
      const isToday = dateStr === todayStr
      const isSelected = dateStr === selectedStr
      const dayList = sessions.filter((s) => getLocalDateStr(s.scheduledAt) === dateStr)
      const dotCount = Math.min(dayList.length, 3)

      cells.push(
        <div
          key={`day-${day}`}
          className={cn(
            "border-r border-b border-border/50 h-14 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors active:bg-muted/60",
            isSelected && "bg-primary/8"
          )}
          onClick={() => { setSelectedCalDate(checkDate); setNewApptDate(dateStr) }}
        >
          <span className={cn(
            "flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-all",
            isToday && "bg-foreground text-background",
            isSelected && !isToday && "bg-primary/15 text-primary ring-1 ring-primary/30",
            !isSelected && !isToday && "text-foreground"
          )}>{day}</span>
          {dotCount > 0 && (
            <div className="flex gap-[3px]">
              {Array.from({ length: dotCount }).map((_, i) => (
                <span key={i} className={cn("w-1 h-1 rounded-full", DOT_COLORS[i % DOT_COLORS.length])} />
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className={cn("grid grid-cols-7 border border-border/50 rounded-xl overflow-hidden bg-white", isLoading && "animate-pulse pointer-events-none opacity-60")}>
        {weekDays.map((wd, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-muted-foreground uppercase py-2 border-b border-border/50 bg-muted/20">{wd}</div>
        ))}
        {cells}
      </div>
    )
  }

  // ── Mobile selected day session list ──
  const renderMobileDaySessions = () => {
    const dayName = selectedCalDate.toLocaleDateString(undefined, { weekday: "long" })
    const dateLabel = selectedCalDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-wider">{dayName}</p>
            <p className="text-sm font-medium text-foreground">{dateLabel}</p>
          </div>
          {selectedDaySessionsList.length > 0 && (
            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {selectedDaySessionsList.length} session{selectedDaySessionsList.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {selectedDaySessionsList.length === 0 ? (
          <div className="py-8 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground font-medium">No sessions this day</p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDaySessionsList.map((s) => {
              const timeStr = new Date(s.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              const tag = getSessionTag(s.sessionType)
              return (
                <div key={s.id} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-white active:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center shrink-0 pt-0.5">
                    <span className="text-xs font-bold text-foreground">{timeStr}</span>
                    <span className="text-[10px] text-muted-foreground">{s.durationMinutes}m</span>
                  </div>
                  <div className="flex-1 min-w-0 border-l border-border/60 pl-3">
                    <p className="text-sm font-semibold text-foreground truncate">{s.clientName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", tag.color)}>{s.sessionType}</span>
                      <span className="text-[10px] text-muted-foreground capitalize">{s.modality.replace("_", " ")}</span>
                    </div>
                  </div>
                  {s.status === "scheduled" && (
                    <Button
                      variant="ghost" size="sm"
                      className="h-7 px-2 text-[10px] shrink-0"
                      onClick={() => sendReminder(s.id)}
                      disabled={sendingReminder !== null}
                    >
                      {sendingReminder === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bell className="h-3 w-3" />}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ── Desktop week view ──
  const renderWeekView = () => {
    const todayStr = getLocalDateStr(new Date())
    const selectedStr = getLocalDateStr(selectedCalDate)

    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-7 border border-border rounded-xl overflow-hidden bg-white divide-y md:divide-y-0 md:divide-x divide-border", isLoading && "animate-pulse pointer-events-none opacity-60")}>
        {weekDates.map((dayDate) => {
          const dateStr = getLocalDateStr(dayDate)
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedStr
          const dayList = sessions.filter((s) => getLocalDateStr(s.scheduledAt) === dateStr).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
          const weekdayLabel = dayDate.toLocaleDateString(undefined, { weekday: "short" })

          return (
            <div
              key={dateStr}
              className={cn("flex flex-col min-h-[340px] transition-colors cursor-pointer", isSelected ? "bg-primary/5" : "bg-white hover:bg-muted/30")}
              onClick={() => { setSelectedCalDate(dayDate); setNewApptDate(dateStr) }}
            >
              <div className="p-3 border-b border-border flex flex-col items-center justify-center space-y-1 bg-muted/20">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{weekdayLabel}</span>
                <span className={cn("flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition", isToday && "bg-foreground text-background", isSelected && !isToday && "bg-muted-foreground/20 text-foreground", !isSelected && !isToday && "text-muted-foreground")}>{dayDate.getDate()}</span>
              </div>
              <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[340px]">
                {dayList.length === 0 ? (
                  <div className="h-full flex items-center justify-center py-10"><span className="text-[9.5px] text-muted-foreground italic">No sessions</span></div>
                ) : (
                  dayList.map((sess) => {
                    const timeStr = new Date(sess.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    const tag = getSessionTag(sess.sessionType)
                    return (
                      <div key={sess.id} className="p-2.5 rounded-lg border border-border bg-card transition hover:bg-muted/30 flex flex-col space-y-1 text-left">
                        <span className="text-[9px] font-bold tracking-tight text-muted-foreground">{timeStr}</span>
                        <span className="text-xs font-bold truncate">{sess.clientName}</span>
                        <div className="flex items-center justify-between gap-1.5 text-[8px] font-semibold text-muted-foreground uppercase pt-0.5 border-t border-border">
                          <span className={cn("px-1 py-0.5 rounded", tag.color)}>{sess.sessionType}</span>
                          <span>{sess.modality.replace("_", " ")}</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // ── Mobile week view (day-by-day list) ──
  const renderMobileWeekView = () => {
    const todayStr = getLocalDateStr(new Date())

    return (
      <div className={cn("space-y-3", isLoading && "animate-pulse pointer-events-none opacity-60")}>
        {weekDates.map((dayDate) => {
          const dateStr = getLocalDateStr(dayDate)
          const isToday = dateStr === todayStr
          const dayList = sessions.filter((s) => getLocalDateStr(s.scheduledAt) === dateStr).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
          const weekdayLabel = dayDate.toLocaleDateString(undefined, { weekday: "short" })

          return (
            <div key={dateStr} className="rounded-xl border border-border bg-white overflow-hidden">
              <div className={cn("flex items-center gap-3 px-4 py-2.5 border-b border-border/60", isToday ? "bg-primary/5" : "bg-muted/20")}>
                <span className="text-[10px] font-bold text-muted-foreground uppercase w-8">{weekdayLabel}</span>
                <span className={cn("flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold", isToday && "bg-foreground text-background", !isToday && "text-foreground")}>{dayDate.getDate()}</span>
                {dayList.length > 0 && (
                  <span className="ml-auto text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{dayList.length}</span>
                )}
              </div>
              <div className="divide-y divide-border/50">
                {dayList.length === 0 ? (
                  <div className="px-4 py-4 text-[11px] text-muted-foreground italic">No sessions</div>
                ) : (
                  dayList.map((sess) => {
                    const timeStr = new Date(sess.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    const tag = getSessionTag(sess.sessionType)
                    return (
                      <div key={sess.id} className="flex items-center gap-3 px-4 py-2.5 active:bg-muted/50 transition-colors">
                        <span className="text-[11px] font-bold text-foreground shrink-0 w-14">{timeStr}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{sess.clientName}</p>
                          <span className={cn("text-[9px] font-bold px-1 py-0.5 rounded inline-block mt-0.5", tag.color)}>{sess.sessionType}</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="animate-fadeUp space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-normal text-foreground text-balance">Calendar</h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">Manage sessions and schedule appointments.</p>
        </div>
        <div className="flex bg-muted/60 p-0.5 rounded-lg border border-border self-start sm:self-auto">
          <button
            className={cn("px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer", viewMode === "month" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            type="button" onClick={() => setViewMode("month")}
          >Month</button>
          <button
            className={cn("px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer", viewMode === "week" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            type="button" onClick={() => setViewMode("week")}
          >Week</button>
        </div>
      </div>

      {/* Calendar card */}
      <Card className="border-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border-b border-stone-mid">
          <h3 className="font-serif text-lg sm:text-xl text-foreground">{formattedHeaderLabel}</h3>
          <div className="flex items-center gap-2">
            <Button onClick={handleTodayClick} variant="outline" size="sm">Today</Button>
            <Button onClick={() => viewMode === "month" ? prevMonth() : navigateWeek(-1)} variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
            <Button onClick={() => viewMode === "month" ? nextMonth() : navigateWeek(1)} variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
        <CardContent className="p-2 sm:p-4">
          {/* Desktop grids */}
          <div className="hidden sm:block">
            {viewMode === "month" ? renderDesktopMonthGrid() : renderWeekView()}
          </div>
          {/* Mobile grids */}
          <div className="sm:hidden space-y-3">
            {viewMode === "month" ? renderMobileMonthGrid() : renderMobileWeekView()}
          </div>
        </CardContent>
      </Card>

      {/* Mobile: selected day sessions (below calendar, like Google Calendar) */}
      <div className="sm:hidden">
        <Card className="border-0">
          <CardContent className="p-4">
            {renderMobileDaySessions()}
          </CardContent>
        </Card>
      </div>

      {/* Desktop: sidebar with bookings + booking form */}
      <div className="hidden sm:grid sm:grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8" />
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-0">
            <div className="px-4 pb-3 mb-3 border-b border-stone-mid">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Bookings — {selectedCalDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </h4>
            </div>
            <div className="px-4 max-h-[300px] overflow-y-auto">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="py-3.5 animate-pulse">
                    <div className="h-2.5 bg-muted rounded w-1/4" />
                    <div className="h-3.5 bg-muted rounded w-2/3 mt-2" />
                    <div className="h-2 bg-muted rounded w-1/2 mt-1.5" />
                  </div>
                ))
              ) : daySessions.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground font-medium">No appointments scheduled.</div>
              ) : (
                daySessions.map((s) => (
                  <div key={s.id} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-primary uppercase tracking-wider">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>{new Date(s.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      <span>·</span>
                      <span>{s.durationMinutes} mins</span>
                      {s.status === "scheduled" && (
                        <Button variant="ghost" size="sm" className="ml-auto h-6 px-2 text-[10px]" onClick={() => sendReminder(s.id)} disabled={sendingReminder !== null}>
                          {sendingReminder === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bell className="h-3 w-3" />}
                          <span className="ml-1">Remind</span>
                        </Button>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-foreground mt-1.5">{s.clientName}</h4>
                    <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{s.sessionType} ({s.modality.replace("_", " ")})</p>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="border-0">
            <div className="px-4 space-y-4">
              <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider">Schedule Appointment</h4>
              <form className="space-y-3" onSubmit={onSubmit}>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-muted-foreground">Patient</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <input type="text" placeholder="Search patients..." value={scheduleSearchQuery} onChange={(e) => setScheduleSearchQuery(e.target.value)} className="w-full h-8 pl-8 pr-2 rounded-md border border-input bg-background text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/30" />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-0.5 mt-1 rounded-md border border-border">
                    {clients.filter((c) => scheduleSearchQuery.trim() ? `${c.firstName} ${c.lastName}`.toLowerCase().includes(scheduleSearchQuery.toLowerCase()) : true).map((c) => (
                      <button key={c.id} type="button" onClick={() => { setNewApptClient(c.id); setScheduleSearchQuery(`${c.firstName} ${c.lastName}`) }} className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-muted ${newApptClient === c.id ? "bg-primary/10 text-primary font-semibold" : "text-foreground"}`}>
                        {c.firstName} {c.lastName}
                      </button>
                    ))}
                    {clients.filter((c) => scheduleSearchQuery.trim() ? `${c.firstName} ${c.lastName}`.toLowerCase().includes(scheduleSearchQuery.toLowerCase()) : true).length === 0 && (
                      <p className="px-3 py-4 text-xs text-muted-foreground text-center">No patients found</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-muted-foreground">Date</label>
                    <Input type="date" value={newApptDate} onChange={(e) => setNewApptDate(e.target.value)} required disabled={isBooking} min={getLocalDateStr(new Date())} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-muted-foreground">Time</label>
                    <Input type="time" value={newApptTime} onChange={(e) => setNewApptTime(e.target.value)} required disabled={isBooking} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-muted-foreground">Duration</label>
                    <Select value={newApptDuration} onValueChange={setNewApptDuration} disabled={isBooking}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50 min">50 min</SelectItem>
                        <SelectItem value="30 min">30 min</SelectItem>
                        <SelectItem value="80 min">80 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-muted-foreground">Modality</label>
                    <Select value={newApptType} onValueChange={setNewApptType} disabled={isBooking}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CBT">CBT</SelectItem>
                        <SelectItem value="Anxiety">Anxiety</SelectItem>
                        <SelectItem value="Trauma">Trauma</SelectItem>
                        <SelectItem value="Depression">Depression</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" disabled={isBooking} className="w-full">{isBooking ? "Booking..." : "Book Session"}</Button>
              </form>
            </div>
          </Card>
        </div>
      </div>

      {/* Mobile: booking form */}
      <div className="sm:hidden">
        <Card className="border-0">
          <CardContent className="p-4 space-y-4">
            <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider">Schedule Appointment</h4>
            <form className="space-y-3" onSubmit={onSubmit}>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-muted-foreground">Patient</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <input type="text" placeholder="Search patients..." value={scheduleSearchQuery} onChange={(e) => setScheduleSearchQuery(e.target.value)} className="w-full h-8 pl-8 pr-2 rounded-md border border-input bg-background text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/30" />
                </div>
                <div className="max-h-40 overflow-y-auto space-y-0.5 mt-1 rounded-md border border-border">
                  {clients.filter((c) => scheduleSearchQuery.trim() ? `${c.firstName} ${c.lastName}`.toLowerCase().includes(scheduleSearchQuery.toLowerCase()) : true).map((c) => (
                    <button key={c.id} type="button" onClick={() => { setNewApptClient(c.id); setScheduleSearchQuery(`${c.firstName} ${c.lastName}`) }} className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-muted ${newApptClient === c.id ? "bg-primary/10 text-primary font-semibold" : "text-foreground"}`}>
                      {c.firstName} {c.lastName}
                    </button>
                  ))}
                  {clients.filter((c) => scheduleSearchQuery.trim() ? `${c.firstName} ${c.lastName}`.toLowerCase().includes(scheduleSearchQuery.toLowerCase()) : true).length === 0 && (
                    <p className="px-3 py-4 text-xs text-muted-foreground text-center">No patients found</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-muted-foreground">Date</label>
                  <Input type="date" value={newApptDate} onChange={(e) => setNewApptDate(e.target.value)} required disabled={isBooking} min={getLocalDateStr(new Date())} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-muted-foreground">Time</label>
                  <Input type="time" value={newApptTime} onChange={(e) => setNewApptTime(e.target.value)} required disabled={isBooking} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-muted-foreground">Duration</label>
                  <Select value={newApptDuration} onValueChange={setNewApptDuration} disabled={isBooking}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50 min">50 min</SelectItem>
                      <SelectItem value="30 min">30 min</SelectItem>
                      <SelectItem value="80 min">80 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-muted-foreground">Modality</label>
                  <Select value={newApptType} onValueChange={setNewApptType} disabled={isBooking}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CBT">CBT</SelectItem>
                      <SelectItem value="Anxiety">Anxiety</SelectItem>
                      <SelectItem value="Trauma">Trauma</SelectItem>
                      <SelectItem value="Depression">Depression</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" disabled={isBooking} className="w-full">{isBooking ? "Booking..." : "Book Session"}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
