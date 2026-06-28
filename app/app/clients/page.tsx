"use client"

import { useAppData } from "@/app/app/_components/app-data-provider"
import { ClientsView } from "@/app/app/_components/clients-view"

export default function ClientsPage() {
  const { clientsHook, sessionsHook, soapNote } = useAppData()

  return (
    <div className="flex-1 overflow-y-auto pt-14 pb-6 px-4 sm:p-6 md:p-8">
      <ClientsView
        clients={clientsHook.clients}
        sessions={sessionsHook.sessions}
        onAddClientClick={() => clientsHook.setIsAddClientOpen(true)}
        onOpenHistoryModal={(client) => soapNote.openHistoryModal(client)}
        isLoading={clientsHook.isLoading}
      />
    </div>
  )
}
