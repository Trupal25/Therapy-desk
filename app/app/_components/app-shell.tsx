"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAppData } from "@/app/app/_components/app-data-provider"
import { AppSidebar } from "@/app/app/_components/app-sidebar"
import { CommandPalette } from "@/app/app/_components/command-palette"
import { AddClientDialog, EditClientDialog, HistoryDialog } from "@/app/app/_components/dialogs"
import { SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { clientsHook, soapNote, recentSoapNotes } = useAppData()
  const { open } = useSidebar()
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [onboardingChecked, setOnboardingChecked] = useState(false)

  const isOnboarding = pathname === "/app/onboarding"

  useEffect(() => {
    if (isOnboarding) {
      setOnboardingChecked(true)
      return
    }
    async function check() {
      try {
        const res = await fetch("/api/onboarding")
        if (res.ok) {
          const data = await res.json()
          if (data.needsOnboarding) {
            router.replace("/app/onboarding")
            return
          }
        }
      } catch {
        // proceed to app
      }
      setOnboardingChecked(true)
    }
    check()
  }, [isOnboarding, router])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setIsCommandOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  if (isOnboarding) {
    return <>{children}</>
  }

  if (!onboardingChecked) {
    return (
      <div className="flex h-svh w-full items-center justify-center bg-mist">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 rounded-xl bg-muted animate-pulse" />
          <div className="h-3 w-32 rounded bg-muted animate-pulse" />
        </div>
      </div>
    )
  }

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
        {!open && <SidebarTrigger className="absolute top-2 left-2 z-10" />}
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

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        clients={clientsHook.clients}
        onNewClient={() => clientsHook.setIsAddClientOpen(true)}
      />
    </>
  )
}
