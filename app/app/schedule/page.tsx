"use client"

import { useAppData } from "@/app/app/_components/app-data-provider"
import { ScheduleView } from "@/app/app/_components/schedule-view"

export default function SchedulePage() {
  const { sessionsHook, clientsHook } = useAppData()

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      <ScheduleView
        sessions={sessionsHook.sessions}
        clients={clientsHook.clients}
        currentMonth={sessionsHook.currentMonth}
        selectedCalDate={sessionsHook.selectedCalDate}
        setSelectedCalDate={sessionsHook.setSelectedCalDate}
        prevMonth={sessionsHook.prevMonth}
        nextMonth={sessionsHook.nextMonth}
        daysInMonthData={sessionsHook.daysInMonthData}
        daySessions={sessionsHook.daySessions}
        newApptClient={sessionsHook.newApptClient}
        setNewApptClient={sessionsHook.setNewApptClient}
        newApptDate={sessionsHook.newApptDate}
        setNewApptDate={sessionsHook.setNewApptDate}
        newApptTime={sessionsHook.newApptTime}
        setNewApptTime={sessionsHook.setNewApptTime}
        newApptDuration={sessionsHook.newApptDuration}
        setNewApptDuration={sessionsHook.setNewApptDuration}
        newApptType={sessionsHook.newApptType}
        setNewApptType={sessionsHook.setNewApptType}
        onSubmit={sessionsHook.handleBookApptSubmit}
        isBooking={sessionsHook.isBooking}
        isLoading={sessionsHook.isLoading}
      />
    </div>
  )
}
