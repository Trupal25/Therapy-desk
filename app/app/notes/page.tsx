"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppData } from "@/app/app/_components/app-data-provider"
import { NotesView } from "@/app/app/_components/notes-view"

export default function NotesPage() {
  const router = useRouter()
  const { soapNote, clientsHook, sessionsHook } = useAppData()

  // Handle deep-link from patient detail: /app/notes?sessionId=xxx
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get("sessionId")
    if (!sessionId) return

    // Clean the URL so bookmarking doesn't keep the param
    router.replace("/app/notes")

    const session = sessionsHook.sessions.find((s) => s.id === sessionId)
    if (!session) return

    const client = clientsHook.clients.find((c) => c.id === session.clientId)
    if (!client) return

    soapNote.setSelectedClientForNotes(client)
    soapNote.setSelectedSessionForNotes(session)
  }, [sessionsHook.sessions, clientsHook.clients])

  return (
    <div className="h-full">
      <NotesView
        clients={clientsHook.clients}
        selectedClientForNotes={soapNote.selectedClientForNotes}
        setSelectedClientForNotes={soapNote.setSelectedClientForNotes}
        clientSessions={soapNote.clientSessions}
        selectedSessionForNotes={soapNote.selectedSessionForNotes}
        setSelectedSessionForNotes={soapNote.setSelectedSessionForNotes}
        rawNotesContent={soapNote.rawNotesContent}
        setRawNotesContent={soapNote.setRawNotesContent}
        generatedSoap={soapNote.generatedSoap}
        isGenerating={soapNote.isGenerating}
        searchClientQuery={soapNote.searchClientQuery}
        setSearchClientQuery={soapNote.setSearchClientQuery}
        selectedModality={soapNote.selectedModality}
        setSelectedModality={soapNote.setSelectedModality}
        soapSubjective={soapNote.soapSubjective}
        setSoapSubjective={soapNote.setSoapSubjective}
        soapObjective={soapNote.soapObjective}
        setSoapObjective={soapNote.setSoapObjective}
        soapAssessment={soapNote.soapAssessment}
        setSoapAssessment={soapNote.setSoapAssessment}
        soapPlan={soapNote.soapPlan}
        setSoapPlan={soapNote.setSoapPlan}
        soapUnifiedContent={soapNote.soapUnifiedContent}
        setSoapUnifiedContent={soapNote.setSoapUnifiedContent}
        handleGenerateSoap={soapNote.handleGenerateSoap}
        handleSaveDraft={soapNote.handleSaveDraft}
        handleSignAndLock={soapNote.handleSignAndLock}
        onBookSessionClick={() => router.push("/app/schedule")}
        isLoadingNote={soapNote.isLoadingNote}
      />
    </div>
  )
}
