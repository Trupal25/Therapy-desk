"use client"

import { useAppData } from "@/app/app/_components/app-data-provider"
import { NotesView } from "@/app/app/_components/notes-view"

export default function NotesPage() {
  const { soapNote, clientsHook } = useAppData()

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
        onBookSessionClick={() => {}}
        isLoadingNote={soapNote.isLoadingNote}
      />
    </div>
  )
}
