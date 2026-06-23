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

  const sendAllReminders = async () => {
    setSendingReminder("all")
    try {
      const res = await fetch("/api/sessions/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendToAll: true }),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success("Sent " + data.sent + " reminders")
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to send reminders")
      }
    } catch {
      toast.error("Failed to send reminders")
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

  const renderCalendarGrid = () => {
    const { firstDay, totalDays } = daysInMonthData
    const todayStr = getLocalDateStr(new Date())
    const selectedStr = getLocalDateStr(selectedCalDate)
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const cells: React.ReactNode[] = []

    for (let i = 0; i < firstDay; i++) {
      cells.push(
        <div key={`pad-${i}`} className="border-r border-b border-border bg-muted/20 min-h-[90px]" />
      )
    }

    for (let day = 1; day <= totalDays; day++) {
      const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const dateStr = getLocalDateStr(checkDate)
      const isToday = dateStr === todayStr
      const isSelected = dateStr === selectedStr
      const daySessionsList = sessions.filter((s) => getLocalDateStr(s.scheduledAt) === dateStr)

      cells.push(
        <div
          key={`day-${day}`}
          className={cn(
            "border-r border-b border-border bg-white min-h-[90px] p-2 flex flex-col justify-between hover:bg-muted/50 transition-colors cursor-pointer group",
            isSelected && "bg-primary/5 ring-[1.5px] ring-inset ring-primary/30"
          )}
          onClick={() => {
            setSelectedCalDate(checkDate)
            setNewApptDate(dateStr)
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-semibold opacity-0 group-hover:opacity-60 transition text-muted-foreground">
              {daySessionsList.length > 0 ? `${daySessionsList.length} appt` : ""}
            </span>
            <span
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold transition",
                isToday && "bg-foreground text-background font-bold",
                isSelected && !isToday && "bg-muted-foreground/20 text-foreground font-bold",
                !isSelected && !isToday && "text-muted-foreground hover:text-foreground"
              )}
            >
              {day}
            </span>
          </div>
          <div className="mt-2 space-y-1 flex-1 flex flex-col justify-end overflow-hidden">
            {daySessionsList.slice(0, 2).map((sess) => {
              const tag = getSessionTag(sess.sessionType)
              const timeStr = new Date(sess.scheduledAt)
                .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
                .replace(" AM", "a").replace(" PM", "p")
              return (
                <div
                  key={sess.id}
                  className={cn(
                    "text-[9.5px] font-bold px-1.5 py-0.5 rounded border truncate flex items-center justify-between",
                    tag.color
                  )}
                  title={`${sess.clientName} (${sess.sessionType})`}
                >
                  <span className="truncate">{timeStr} {sess.clientName.split(" ")[0]}</span>
                </div>
              )
            })}
            {daySessionsList.length > 2 && (
              <div className="text-[8.5px] font-semibold text-muted-foreground pl-1.5">
                + {daySessionsList.length - 2} more
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className={cn(
        "grid grid-cols-7 border-t border-l border-border rounded-xl overflow-hidden bg-white",
        isLoading && "animate-pulse pointer-events-none opacity-60"
      )}>
        {weekDays.map((wd) => (
          <div key={wd} className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider py-2.5 border-r border-b border-border bg-muted/30">
            {wd}
          </div>
        ))}
        {cells}
      </div>
    )
  }

  const renderWeekView = () => {
    const todayStr = getLocalDateStr(new Date())
    const selectedStr = getLocalDateStr(selectedCalDate)

    return (
      <div className={cn(
        "grid grid-cols-1 md:grid-cols-7 border border-border rounded-xl overflow-hidden bg-white divide-y md:divide-y-0 md:divide-x divide-border",
        isLoading && "animate-pulse pointer-events-none opacity-60"
      )}>
        {weekDates.map((dayDate) => {
          const dateStr = getLocalDateStr(dayDate)
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedStr
          const daySessionsList = sessions.filter((s) => getLocalDateStr(s.scheduledAt) === dateStr)
          const sortedSessions = [...daySessionsList].sort(
            (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
          )
          const weekdayLabel = dayDate.toLocaleDateString(undefined, { weekday: "short" })
          const dayNumLabel = dayDate.getDate()

          return (
            <div
              key={dateStr}
              className={cn(
                "flex flex-col min-h-[340px] transition-colors cursor-pointer",
                isSelected ? "bg-primary/5" : "bg-white hover:bg-muted/30"
              )}
              onClick={() => {
                setSelectedCalDate(dayDate)
                setNewApptDate(dateStr)
              }}
            >
              <div className="p-3 border-b border-border flex flex-col items-center justify-center space-y-1 bg-muted/20">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {weekdayLabel}
                </span>
                <span
                  className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition",
                    isToday && "bg-foreground text-background",
                    isSelected && !isToday && "bg-muted-foreground/20 text-foreground",
                    !isSelected && !isToday && "text-muted-foreground"
                  )}
                >
                  {dayNumLabel}
                </span>
              </div>
              <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[340px]">
                {sortedSessions.length === 0 ? (
                  <div className="h-full flex items-center justify-center py-10 text-center">
                    <span className="text-[9.5px] text-muted-foreground italic">No sessions</span>
                  </div>
                ) : (
                  sortedSessions.map((sess) => {
                    const timeStr = new Date(sess.scheduledAt).toLocaleTimeString([], {
                      hour: "2-digit", minute: "2-digit",
                    })
                    const tag = getSessionTag(sess.sessionType)

                    return (
                      <div
                        key={sess.id}
                        className={cn(
                          "p-2.5 rounded-lg border border-border bg-card transition hover:bg-muted/30 flex flex-col space-y-1 text-left",
                        )}
                      >
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

  return (
    <div className="animate-fadeUp space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-normal text-foreground text-balance">Calendar</h2>
          <p className="text-sm text-muted-foreground font-medium mt-0.5">
            Manage sessions and schedule appointments.
          </p>
        </div>
        <div className="flex bg-muted/60 p-0.5 rounded-lg border border-border self-start sm:self-auto">
          <button
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer",
              viewMode === "month"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            type="button"
            onClick={() => setViewMode("month")}
          >
            Month
          </button>
          <button
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer",
              viewMode === "week"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            type="button"
            onClick={() => setViewMode("week")}
          >
            Week
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-stone-mid">
              <h3 className="font-serif text-xl text-foreground">{formattedHeaderLabel}</h3>
              <div className="flex items-center gap-2">
                <Button onClick={handleTodayClick} variant="outline" size="sm">
                  Today
                </Button>
                <Button
                  onClick={() => { viewMode === "month" ? prevMonth() : navigateWeek(-1) }}
                  variant="outline" size="icon" className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => { viewMode === "month" ? nextMonth() : navigateWeek(1) }}
                  variant="outline" size="icon" className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              {viewMode === "month" ? renderCalendarGrid() : renderWeekView()}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-0">
            <div className="px-4 pb-3 mb-3 border-b border-stone-mid">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Bookings —{" "}
                {selectedCalDate.toLocaleDateString(undefined, {
                  month: "short", day: "numeric", year: "numeric",
                })}
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
                <div className="py-10 text-center text-sm text-muted-foreground font-medium">
                  No appointments scheduled.
                </div>
              ) : (
                daySessions.map((s) => (
                  <div key={s.id} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-primary uppercase tracking-wider">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>
                        {new Date(s.scheduledAt).toLocaleTimeString([], {
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                      <span>·</span>
                      <span>{s.durationMinutes} mins</span>
                      {s.status === "scheduled" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto h-6 px-2 text-[10px]"
                          onClick={() => sendReminder(s.id)}
                          disabled={sendingReminder !== null}
                        >
                          {sendingReminder === s.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Bell className="h-3 w-3" />
                          )}
                          <span className="ml-1">Remind</span>
                        </Button>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-foreground mt-1.5">{s.clientName}</h4>
                    <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                      {s.sessionType} ({s.modality.replace("_", " ")})
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="border-0">
            <div className="px-4 space-y-4">
              <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                Schedule Appointment
              </h4>
              <form className="space-y-3" onSubmit={onSubmit}>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-muted-foreground">Patient</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search patients..."
                      value={scheduleSearchQuery}
                      onChange={(e) => setScheduleSearchQuery(e.target.value)}
                      className="w-full h-8 pl-8 pr-2 rounded-md border border-input bg-background text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-0.5 mt-1 rounded-md border border-border">
                    {clients
                      .filter((c) =>
                        scheduleSearchQuery.trim()
                          ? `${c.firstName} ${c.lastName}`.toLowerCase().includes(scheduleSearchQuery.toLowerCase())
                          : true
                      )
                      .map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setNewApptClient(c.id)
                            setScheduleSearchQuery(`${c.firstName} ${c.lastName}`)
                          }}
                          className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-muted ${
                            newApptClient === c.id ? "bg-primary/10 text-primary font-semibold" : "text-foreground"
                          }`}
                        >
                          {c.firstName} {c.lastName}
                        </button>
                      ))}
                    {clients.filter((c) =>
                      scheduleSearchQuery.trim()
                        ? `${c.firstName} ${c.lastName}`.toLowerCase().includes(scheduleSearchQuery.toLowerCase())
                        : true
                    ).length === 0 && (
                      <p className="px-3 py-4 text-xs text-muted-foreground text-center">No patients found</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-muted-foreground">Date</label>
                    <Input type="date" value={newApptDate} onChange={(e) => setNewApptDate(e.target.value)}
                      required disabled={isBooking} min={getLocalDateStr(new Date())} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-muted-foreground">Time</label>
                    <Input type="time" value={newApptTime} onChange={(e) => setNewApptTime(e.target.value)}
                      required disabled={isBooking} />
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
                <Button type="submit" disabled={isBooking} className="w-full">
                  {isBooking ? "Booking..." : "Book Session"}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
