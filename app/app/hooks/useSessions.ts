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

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedCalDate, setSelectedCalDate] = useState<Date>(new Date());

  const fetchSessions = useCallback(async () => {
    try {
      const sessionsRes = await fetch("/api/sessions");
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setSessions(sessionsData);
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  }, []);

  const handleBookApptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApptClient || !newApptDate) {
      showToast("Please select a client and date", "err");
      return;
    }

    try {
      const scheduledAt = `${newApptDate}T${newApptTime}:00`;
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

  const selectedDateStr = selectedCalDate.toISOString().split("T")[0];
  const daySessions = useMemo(() => {
    return sessions.filter((s) => s.scheduledAt.startsWith(selectedDateStr));
  }, [sessions, selectedDateStr]);

  const todayStr = new Date().toISOString().split("T")[0];
  const todaySessions = useMemo(() => {
    return sessions.filter((s) => s.scheduledAt.startsWith(todayStr));
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
  };
}
