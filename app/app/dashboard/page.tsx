"use client"

import { useRouter } from "next/navigation"
import { useAppData } from "@/app/app/_components/app-data-provider"
import { DashboardView } from "@/app/app/_components/dashboard-view"
import { useSidebar } from "@/components/ui/sidebar"

export default function DashboardPage() {
  const router = useRouter()
  const { setOpenMobile } = useSidebar()
  const { user, clientsHook, sessionsHook, soapNote, recentSoapNotes } = useAppData()

  const navigate = (path: string) => {
    setOpenMobile(false)
    router.push(path)
  }

  return (
    <div className="flex-1 overflow-y-auto pt-14 pb-6 px-4 sm:p-6 md:p-8">
      <DashboardView
        user={user}
        clients={clientsHook.clients}
        sessions={sessionsHook.sessions}
        recentSoapNotes={recentSoapNotes}
        todaySessions={sessionsHook.todaySessions}
        weekSessionsHours={sessionsHook.weekSessionsHours}
        onNewClientClick={() => { setOpenMobile(false); clientsHook.setIsAddClientOpen(true) }}
        onViewCalendarClick={() => navigate("/app/schedule")}
        onSelectSessionForNotes={(session, client) => {
          soapNote.setSelectedClientForNotes(client)
          navigate("/app/notes")
        }}
        onOpenPatientHistory={(client) => soapNote.openHistoryModal(client)}
        isLoadingClients={clientsHook.isLoading}
        isLoadingSessions={sessionsHook.isLoading}
      />
    </div>
  )
}
