import { useState, useCallback, useMemo } from "react";

export interface Session {
  id: string;
  clientId: string;
  therapistId: string;
  sessionType: string;
  modality: string;
  status: string;
  scheduledAt: string;
  durationMinutes: number;
  cptCode: string | null;
  clientName: string;
  soapNote?: {
    id: string;
    status: string;
  } | null;
}

export function getLocalDateStr(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useSessions(
  showToast: (msg: string, type?: "ok" | "err") => void,
  fetchRecentNotes: () => void
) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [newApptClient, setNewApptClient] = useState("");
  const [newApptDate, setNewApptDate] = useState("");
  const [newApptTime, setNewApptTime] = useState("10:00");
  const [newApptDuration, setNewApptDuration] = useState("50 min");
  const [newApptType, setNewApptType] = useState("CBT");
  const [isBooking, setIsBooking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedCalDate, setSelectedCalDate] = useState<Date>(new Date());

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const sessionsRes = await fetch("/api/sessions");
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setSessions(sessionsData);
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleBookApptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApptClient || !newApptDate) {
      showToast("Please select a client and date", "err");
      return;
    }

    const timePart = newApptTime || "10:00";
    const localDateTime = new Date(`${newApptDate}T${timePart}:00`);
    if (localDateTime < new Date()) {
      showToast("Appointment date and time cannot be in the past", "err");
      return;
    }

    if (isBooking) return;
    setIsBooking(true);

    try {
      const timePart = newApptTime || "10:00";
      const localDateTime = new Date(`${newApptDate}T${timePart}:00`);
      const scheduledAt = localDateTime.toISOString();
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: newApptClient,
          scheduledAt,
          durationMinutes: parseInt(newApptDuration.split(" ")[0]),
          sessionType: newApptType.toLowerCase(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        showToast(errData.error || "Failed to book session", "err");
        return;
      }

      showToast("Appointment booked successfully!", "ok");
      setNewApptClient("");
      fetchSessions();
      fetchRecentNotes();
    } catch (err) {
      showToast("Failed to book appointment", "err");
    } finally {
      setIsBooking(false);
    }
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const daysInMonthData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    return { firstDay, totalDays };
  }, [currentMonth]);

  const selectedDateStr = getLocalDateStr(selectedCalDate);
  const daySessions = useMemo(() => {
    return sessions.filter((s) => getLocalDateStr(s.scheduledAt) === selectedDateStr);
  }, [sessions, selectedDateStr]);

  const todayStr = getLocalDateStr(new Date());
  const todaySessions = useMemo(() => {
    return sessions.filter((s) => getLocalDateStr(s.scheduledAt) === todayStr);
  }, [sessions, todayStr]);

  const weekSessionsCount = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(d.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    
    return sessions.filter((s) => {
      const date = new Date(s.scheduledAt);
      return date >= weekStart && date <= weekEnd;
    }).length;
  }, [sessions]);

  const weekSessionsHours = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(d.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    
    const weekSess = sessions.filter((s) => {
      const date = new Date(s.scheduledAt);
      return date >= weekStart && date <= weekEnd;
    });

    const totalMinutes = weekSess.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
    return Math.round((totalMinutes / 60) * 10) / 10;
  }, [sessions]);

  return {
    sessions,
    setSessions,
    fetchSessions,
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
    handleBookApptSubmit,
    currentMonth,
    selectedCalDate,
    setSelectedCalDate,
    prevMonth,
    nextMonth,
    daysInMonthData,
    daySessions,
    todaySessions,
    weekSessionsCount,
    weekSessionsHours,
    isBooking,
    isLoading,
  };
}
