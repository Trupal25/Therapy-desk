"use client"

import { useAppData } from "@/app/app/_components/app-data-provider"
import { AppSidebar } from "@/app/app/_components/app-sidebar"
import { AddClientDialog, EditClientDialog, HistoryDialog } from "@/app/app/_components/dialogs"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { clientsHook, soapNote, recentSoapNotes } = useAppData()

  return (
    <>
      <AppSidebar
        recentSoapNotes={recentSoapNotes}
        onSelectRecentNote={(sessionId, clientName) => {
          soapNote.setSelectedClientForNotes(
            clientsHook.clients.find(
              (c) => `${c.firstName} ${c.lastName}` === clientName
            ) || null
          )
          router.push("/app/notes")
        }}
      />
      <SidebarInset className="relative">
        <SidebarTrigger className="absolute top-2 left-2 z-10" />
        {children}
      </SidebarInset>

      <AddClientDialog
        isOpen={clientsHook.isAddClientOpen}
        onClose={() => clientsHook.setIsAddClientOpen(false)}
        newClientName={clientsHook.newClientName}
        setNewClientName={clientsHook.setNewClientName}
        newClientAge={clientsHook.newClientAge}
        setNewClientAge={clientsHook.setNewClientAge}
        newClientType={clientsHook.newClientType}
        setNewClientType={clientsHook.setNewClientType}
        newClientNotes={clientsHook.newClientNotes}
        setNewClientNotes={clientsHook.setNewClientNotes}
        onSubmit={clientsHook.handleAddClientSubmit}
        isSaving={clientsHook.isSaving}
      />

      <EditClientDialog
        isOpen={clientsHook.isEditClientOpen}
        onClose={() => clientsHook.setIsEditClientOpen(false)}
        editClientName={clientsHook.editClientName}
        setEditClientName={clientsHook.setEditClientName}
        editClientAge={clientsHook.editClientAge}
        setEditClientAge={clientsHook.setEditClientAge}
        editClientType={clientsHook.editClientType}
        setEditClientType={clientsHook.setEditClientType}
        editClientNotes={clientsHook.editClientNotes}
        setEditClientNotes={clientsHook.setEditClientNotes}
        editClientError={clientsHook.editClientError}
        onSubmit={clientsHook.handleEditClientSubmit}
        isSaving={clientsHook.isSaving}
      />

      <HistoryDialog
        isOpen={soapNote.isHistoryOpen}
        onClose={() => soapNote.setIsHistoryOpen(false)}
        historyClient={soapNote.historyClient}
        historyList={soapNote.historyList}
        loadingHistory={soapNote.loadingHistory}
      />
    </>
  )
}
