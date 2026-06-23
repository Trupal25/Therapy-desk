"use client"

import { useState, useRef } from "react"
import {
  Search, Sparkles, Copy, FileDown, Printer, PenLine, FileText,
  CheckCircle2, Clock, Lock, Check, Calendar, MoreHorizontal,
  Upload, Mic, Loader2, Download
} from "lucide-react"
import { Client } from "@/app/app/_hooks/useClients"
import { Session } from "@/app/app/_hooks/useSessions"
import { SoapNote } from "@/app/app/_hooks/useSoapNote"
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const MODALITIES = [
  { value: "general", label: "General" },
  { value: "cbt", label: "CBT" },
  { value: "dbt", label: "DBT" },
  { value: "psychodynamic", label: "Psychodynamic" },
  { value: "brief", label: "Brief / Solution-Focused" },
  { value: "trauma", label: "Trauma-Focused" },
]

const MODALITY_FIELDS: Record<string, Array<{ key: string; label: string; placeholder: string }>> = {
  cbt: [
    { key: "automaticThoughts", label: "Automatic Thoughts", placeholder: "What automatic thoughts were identified during session..." },
    { key: "cognitiveDistortions", label: "Cognitive Distortions", placeholder: "Catastrophizing, black-and-white thinking, mind-reading..." },
    { key: "behavioralExperiments", label: "Behavioral Experiments", placeholder: "Experiments conducted or planned to test beliefs..." },
    { key: "homework", label: "Homework / Action Items", placeholder: "Thought records, exposure exercises, activity scheduling..." },
  ],
  dbt: [
    { key: "emotionalRegulation", label: "Emotion Regulation", placeholder: "Skills used: opposite action, check the facts, PLEASE..." },
    { key: "distressTolerance", label: "Distress Tolerance", placeholder: "TIPP, ACCEPTS, self-soothing, radical acceptance..." },
    { key: "interpersonal", label: "Interpersonal Effectiveness", placeholder: "DEAR MAN, GIVE, FAST, boundary setting..." },
    { key: "mindfulness", label: "Mindfulness Observations", placeholder: "Wise mind, observe describe participate, non-judgmental..." },
  ],
  psychodynamic: [
    { key: "transference", label: "Transference Dynamics", placeholder: "How the client relates to therapist, attachment patterns..." },
    { key: "countertransference", label: "Countertransference", placeholder: "Therapist emotional response, resonance, reactions..." },
    { key: "defenseMechanisms", label: "Defense Mechanisms", placeholder: "Projection, denial, intellectualization, splitting..." },
    { key: "unconsciousPatterns", label: "Unconscious Patterns", placeholder: "Recurring themes, unresolved conflicts, repetition compulsions..." },
  ],
  brief: [
    { key: "scalingQuestions", label: "Scaling Questions", placeholder: "On a scale of 1-10, where are you today vs last session..." },
    { key: "exceptions", label: "Exceptions", placeholder: "Times when the problem was not present or was less severe..." },
    { key: "copingQuestions", label: "Coping Questions", placeholder: "How have you managed to cope so far despite the problem..." },
    { key: "goalSetting", label: "Goals / Miracle Question", placeholder: "What would be different if the problem was solved overnight..." },
  ],
  trauma: [
    { key: "triggers", label: "Trigger Identification", placeholder: "Situations, sensations, or thoughts that triggered distress..." },
    { key: "suds", label: "SUDS Levels", placeholder: "Subjective Units of Distress: baseline, peak, end of session..." },
    { key: "windowOfTolerance", label: "Window of Tolerance", placeholder: "Hyper-arousal or hypo-arousal observations, expansion..." },
    { key: "grounding", label: "Grounding / Resourcing", placeholder: "5-4-3-2-1, breathing, bilateral stimulation, safe place..." },
  ],
  general: [
    { key: "sessionNotes", label: "Session Notes", placeholder: "Write your raw clinical notes here..." },
  ],
}

interface NotesViewProps {
  clients: Client[]
  selectedClientForNotes: Client | null
  setSelectedClientForNotes: (c: Client | null) => void
  clientSessions: Session[]
  selectedSessionForNotes: Session | null
  setSelectedSessionForNotes: (s: Session | null) => void
  rawNotesContent: string
  setRawNotesContent: (val: string) => void
  generatedSoap: SoapNote | null
  isGenerating: boolean
  searchClientQuery: string
  setSearchClientQuery: (val: string) => void
  selectedModality: string
  setSelectedModality: (val: string) => void
  soapSubjective: string
  setSoapSubjective: (val: string) => void
  soapObjective: string
  setSoapObjective: (val: string) => void
  soapAssessment: string
  setSoapAssessment: (val: string) => void
  soapPlan: string
  setSoapPlan: (val: string) => void
  soapUnifiedContent: string
  setSoapUnifiedContent: (val: string) => void
  handleGenerateSoap: (overrideText?: string) => void
  handleSaveDraft: () => void
  handleSignAndLock: () => void
  onBookSessionClick: () => void
  showToast?: (msg: string, type?: "ok" | "err") => void
  isLoadingNote?: boolean
}

function formatSessionDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

function formatSessionDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export function NotesView({
  clients,
  selectedClientForNotes,
  setSelectedClientForNotes,
  clientSessions,
  selectedSessionForNotes,
  setSelectedSessionForNotes,
  rawNotesContent,
  setRawNotesContent,
  generatedSoap,
  isGenerating,
  searchClientQuery,
  setSearchClientQuery,
  selectedModality,
  setSelectedModality,
  soapUnifiedContent,
  setSoapUnifiedContent,
  handleGenerateSoap,
  handleSaveDraft,
  handleSignAndLock,
  onBookSessionClick,
  showToast,
  isLoadingNote = false,
}: NotesViewProps) {
  const [noteType, setNoteType] = useState<"shorthand" | "soap">("soap")
  const [isSaving, setIsSaving] = useState(false)
  const scrubberRef = useRef<HTMLDivElement>(null)
  const [structuredFields, setStructuredFields] = useState<Record<string, string>>({})
  const [isUploading, setIsUploading] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const noteStatus: "unsaved" | "draft" | "signed" = (() => {
    if (!selectedSessionForNotes?.soapNote) return "unsaved"
    if (selectedSessionForNotes.soapNote.status === "signed") return "signed"
    return "draft"
  })()

  const isSigned = noteStatus === "signed"

  const onGenerate = () => {
    let textForGeneration = rawNotesContent

    if (selectedModality !== "general") {
      const fields = MODALITY_FIELDS[selectedModality] || []
      const parts: string[] = []
      for (const field of fields) {
        const val = structuredFields[field.key]
        if (val && val.trim()) {
          parts.push(field.label + ": " + val.trim())
        }
      }
      if (parts.length > 0) {
        textForGeneration = parts.join("\n\n")
      }
    }

    if (!textForGeneration.trim()) {
      showToast?.("Please enter session notes before generating", "err")
      return
    }

    if (selectedModality !== "general") {
      setRawNotesContent(textForGeneration)
    }

    handleGenerateSoap(textForGeneration)
    setNoteType("soap")
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedSessionForNotes) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/sessions/" + selectedSessionForNotes.id + "/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        showToast?.(data.error || "Upload failed", "err")
        return
      }

      const data = await res.json()
      setUploadedFileId(data.file.id)
      showToast?.("File uploaded successfully", "ok")

      // Auto-trigger transcription
      setIsTranscribing(true)
      const transcribeRes = await fetch("/api/sessions/" + selectedSessionForNotes.id + "/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: data.file.id }),
      })

      if (transcribeRes.ok) {
        const transcribeData = await transcribeRes.json()
        if (transcribeData.transcription) {
          setRawNotesContent(transcribeData.transcription)
          showToast?.("Transcription complete — review and edit as needed", "ok")
        }
      } else {
        showToast?.("Transcription failed — you can manually enter notes", "err")
      }
    } catch {
      showToast?.("Upload failed — check your connection", "err")
    } finally {
      setIsUploading(false)
      setIsTranscribing(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleBulkExport = async () => {
    if (isExporting) return
    setIsExporting(true)

    try {
      const now = new Date()
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

      const res = await fetch("/api/notes/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate, status: "signed" }),
      })

      if (!res.ok) {
        showToast?.("Failed to export notes", "err")
        return
      }

      const data = await res.json()
      if (data.count === 0) {
        showToast?.("No signed notes found for this month", "err")
        return
      }

      for (const note of data.notes) {
        const blob = new Blob([note.htmlContent], { type: "text/html;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "SOAP_" + note.fileName.replace(".txt", ".html")
        a.click()
        URL.revokeObjectURL(url)
      }

      showToast?.("Exported " + data.count + " signed notes", "ok")
    } catch {
      showToast?.("Export failed", "err")
    } finally {
      setIsExporting(false)
    }
  }

  const onSave = async () => {
    setIsSaving(true)
    await handleSaveDraft()
    setIsSaving(false)
  }

  const copyNote = () => {
    const d = document.createElement("div")
    d.innerHTML = soapUnifiedContent
    navigator.clipboard.writeText(d.textContent || "")
    showToast?.("Copied to clipboard", "ok")
  }

  const downloadTxt = () => {
    const d = document.createElement("div")
    d.innerHTML = soapUnifiedContent
    const name = selectedClientForNotes ? selectedClientForNotes.firstName + "_" + selectedClientForNotes.lastName : "note"
    const date = selectedSessionForNotes ? new Date(selectedSessionForNotes.scheduledAt).toISOString().split("T")[0] : "date"
    const blob = new Blob([d.textContent || ""], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "SOAP_" + name + "_" + date + ".txt"
    a.click()
    URL.revokeObjectURL(url)
    showToast?.("Downloaded SOAP note", "ok")
  }

  const statusBadge = (() => {
    if (noteStatus === "signed") return { label: "Signed", variant: "default" as const, icon: Lock }
    if (noteStatus === "draft") return { label: "Draft", variant: "secondary" as const, icon: FileText }
    return { label: "Unsaved", variant: "outline" as const, icon: Clock }
  })()

  const displayClients = searchClientQuery.trim()
    ? clients.filter((c) => (c.firstName + " " + c.lastName).toLowerCase().includes(searchClientQuery.toLowerCase()))
    : clients

  const sortedSessions = [...clientSessions].sort(
    (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
  )

  // No client selected — picker view
  if (!selectedClientForNotes) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center space-y-5 max-w-md w-full">
          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
            <PenLine className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Select a patient to start</h2>
            <p className="text-sm text-muted-foreground mt-1">Choose a patient below to create or edit SOAP notes.</p>
          </div>
          <div className="relative w-full max-w-xs mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchClientQuery}
              onChange={(e) => setSearchClientQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-input bg-background text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            />
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1 -mx-4 px-4">
            {displayClients.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8">No patients found</p>
            ) : (
              displayClients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedClientForNotes(c)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-muted transition-colors border border-transparent hover:border-border"
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                      {c.firstName[0]}{c.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.referralSource || "Self-referred"}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  // Client selected — full note editor
  return (
    <div className="flex flex-col h-full">
      {/* Header: client + session chips + actions */}
      <div className="border-b px-4 py-2.5 flex flex-col gap-2 shrink-0">
        {/* Row 1: Client + search + status + export menu */}
        <div className="flex items-center gap-2">
          <Select
            value={selectedClientForNotes.id}
            onValueChange={(val) => {
              const client = clients.find((c) => c.id === val)
              if (client) {
                setSearchClientQuery("")
                setSelectedClientForNotes(client)
              }
            }}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {clients
                .filter((c) =>
                  searchClientQuery.trim()
                    ? (c.firstName + " " + c.lastName).toLowerCase().includes(searchClientQuery.toLowerCase())
                    : true
                )
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <div className="flex-1" />

          <Badge variant={statusBadge.variant} className="gap-1">
            <statusBadge.icon className="h-3 w-3" />
            {statusBadge.label}
          </Badge>

          <div className="hidden sm:flex items-center gap-1 w-20">
            {(["unsaved", "draft", "signed"] as const).map((s, i) => (
              <div
                key={s}
                className={cn(
                  "flex-1 h-1 rounded-full transition-colors",
                  noteStatus === "signed"
                    ? "bg-primary"
                    : i <= (noteStatus === "draft" ? 1 : 0)
                      ? "bg-foreground"
                      : "bg-muted"
                )}
              />
            ))}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={!generatedSoap} className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={copyNote} disabled={!generatedSoap}>
                <Copy className="h-3.5 w-3.5 mr-2" /> Copy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadTxt} disabled={!generatedSoap}>
                <FileDown className="h-3.5 w-3.5 mr-2" /> Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()} disabled={!generatedSoap}>
                <Printer className="h-3.5 w-3.5 mr-2" /> Print
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBulkExport} disabled={isExporting}>
                <Download className="h-3.5 w-3.5 mr-2" />
                {isExporting ? "Exporting..." : "Export Month (Signed)"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Row 2: Session date scrubber + action buttons */}
        <div className="flex items-center gap-2">
          {clientSessions.length === 0 ? (
            <div className="flex-1 text-xs text-muted-foreground flex items-center gap-2">
              <span>No sessions for this patient.</span>
              <Button size="sm" variant="outline" onClick={onBookSessionClick}>
                Book Session
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 flex-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
                {sortedSessions.map((s) => {
                  const isActive = selectedSessionForNotes?.id === s.id
                  const hasNote = !!s.soapNote
                  const isSigned = s.soapNote?.status === "signed"
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSessionForNotes(s)}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors border",
                        isActive
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-white text-foreground border-border hover:bg-muted"
                      )}
                    >
                      <Calendar className="h-3 w-3" />
                      <span>{formatSessionDateShort(s.scheduledAt)}</span>
                      <span className="text-[10px] opacity-60">{s.sessionType}</span>
                      {isSigned && (
                        <Lock className="h-2.5 w-2.5 ml-0.5 opacity-70" />
                      )}
                      {hasNote && !isSigned && (
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isTranscribing || isSigned}
                  title="Upload session recording for transcription"
                  className="h-8 w-8 p-0"
                >
                  {isUploading || isTranscribing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
                <Button onClick={onGenerate} disabled={isGenerating || isSigned} size="sm">
                  <Sparkles className={cn("h-3.5 w-3.5 mr-1", isGenerating && "animate-spin")} />
                  {isGenerating ? "..." : isSigned ? "Locked" : generatedSoap ? "Regen" : "Generate"}
                </Button>
                {!isSigned && generatedSoap && (
                  <>
                    <Button onClick={onSave} disabled={isSaving} variant="secondary" size="sm">
                      {isSaving ? "..." : "Save"}
                    </Button>
                    <Button onClick={handleSignAndLock} variant="outline" size="sm">
                      <Lock className="h-3.5 w-3.5 mr-1" />
                      Sign
                    </Button>
                  </>
                )}
                {isSigned && (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 shrink-0">
                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                    Signed
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Row 3: Modality selector */}
        {selectedSessionForNotes && !isSigned && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">
              Modality
            </span>
            <div className="flex items-center gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {MODALITIES.map((m) => (
                <button
                  key={m.value}
                  onClick={() => {
                    setSelectedModality(m.value)
                    setStructuredFields({})
                  }}
                  className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 transition-colors border",
                    selectedModality === m.value
                      ? "bg-sage-light text-sage border-sage/20"
                      : "bg-white text-muted-foreground border-border hover:bg-muted"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Editor area — full width, no right panel */}
      {!selectedSessionForNotes ? (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
          Select a session date above to begin.
        </div>
      ) : isLoadingNote ? (
        <div className="flex-1 p-6 space-y-4 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 border-b">
              <button
                onClick={() => setNoteType("soap")}
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-[1px]",
                  noteType === "soap"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <FileText className="h-4 w-4 inline mr-1.5" />
                SOAP Format
              </button>
              <button
                onClick={() => setNoteType("shorthand")}
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-[1px]",
                  noteType === "shorthand"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Check className="h-4 w-4 inline mr-1.5" />
                Session Notes
              </button>
            </div>

            {/* SOAP tab */}
            {noteType === "soap" && (
              generatedSoap ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">SOAP Record</h3>
                  <Card>
                    <CardContent className="p-4">
                      <SimpleEditor
                        content={soapUnifiedContent}
                        onChange={setSoapUnifiedContent}
                        editable={!isSigned}
                        placeholder="Generate and refine clinical notes..."
                      />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="py-16 text-center space-y-3">
                  <Sparkles className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <p className="font-medium">No SOAP note yet</p>
                  <p className="text-sm text-muted-foreground">Enter session notes first, then generate a structured SOAP note.</p>
                  <Button onClick={() => setNoteType("shorthand")} variant="outline">
                    Go to Session Notes
                  </Button>
                </div>
              )
            )}

            {/* Shorthand tab */}
            {noteType === "shorthand" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Session Notes</h3>
                {selectedModality === "general" ? (
                  <Card>
                    <CardContent className="p-4">
                      <SimpleEditor
                        content={rawNotesContent}
                        onChange={setRawNotesContent}
                        editable={!isSigned}
                        placeholder="Write raw clinical notes here..."
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground font-medium">
                      {MODALITIES.find((m) => m.value === selectedModality)?.label} structured fields — all fields combine when generating SOAP.
                    </p>
                    {(MODALITY_FIELDS[selectedModality] || MODALITY_FIELDS.general).map((field) => (
                      <div key={field.key} className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-muted-foreground">
                          {field.label}
                        </label>
                        <textarea
                          placeholder={field.placeholder}
                          value={structuredFields[field.key] || ""}
                          onChange={(e) =>
                            setStructuredFields((prev) => ({
                              ...prev,
                              [field.key]: e.target.value,
                            }))
                          }
                          disabled={isSigned}
                          rows={3}
                          className="w-full rounded-md border border-input bg-input/20 px-3 py-2 text-sm resize-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 outline-none disabled:opacity-50"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Print template (hidden) */}
      <div id="soap-print-report" className="hidden print:block font-serif max-w-3xl mx-auto p-12 bg-white text-black">
        <div className="border-b-2 pb-4 mb-6">
          <h1 className="text-3xl font-normal">Clinical Progress Record</h1>
          <p className="text-xs text-muted-foreground mt-1">TherapyDesk Certified Clinical SOAP Archive</p>
        </div>
        <div className="print-prose" dangerouslySetInnerHTML={{ __html: soapUnifiedContent }} />
      </div>
    </div>
  )
}
