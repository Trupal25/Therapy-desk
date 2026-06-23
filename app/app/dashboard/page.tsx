"use client"

import { useRouter } from "next/navigation"
import { useAppData } from "@/app/app/_components/app-data-provider"
import { DashboardView } from "@/app/app/_components/dashboard-view"

export default function DashboardPage() {
  const router = useRouter()
  const { user, clientsHook, sessionsHook, soapNote, recentSoapNotes } = useAppData()

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      <DashboardView
        user={user}
        clients={clientsHook.clients}
        sessions={sessionsHook.sessions}
        recentSoapNotes={recentSoapNotes}
        todaySessions={sessionsHook.todaySessions}
        weekSessionsHours={sessionsHook.weekSessionsHours}
        onNewClientClick={() => clientsHook.setIsAddClientOpen(true)}
        onViewCalendarClick={() => router.push("/app/schedule")}
        onSelectSessionForNotes={(session, client) => {
          soapNote.setSelectedClientForNotes(client)
          router.push("/app/notes")
        }}
        onOpenPatientHistory={(client) => soapNote.openHistoryModal(client)}
        isLoadingClients={clientsHook.isLoading}
        isLoadingSessions={sessionsHook.isLoading}
      />
    </div>
  )
}
