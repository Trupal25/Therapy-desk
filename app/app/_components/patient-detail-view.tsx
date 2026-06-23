"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Calendar, FileText, Lock, PenLine,
  Phone, Mail, MapPin, Sparkles, ChevronRight,
  ClipboardList, Link2, Check
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface SessionDetail {
  id: string
  sessionType: string
  modality: string
  status: string
  scheduledAt: string
  startedAt: string | null
  endedAt: string | null
  durationMinutes: number | null
  cptCode: string | null
  soapNote: {
    id: string
    subjective: string
    objective: string
    assessment: string
    plan: string
    status: string
    signedAt: string | null
    signedBy: string | null
    createdAt: string
  } | null
  rawNote: {
    id: string
    content: string
    createdAt: string
    finalizedAt: string | null
  } | null
}

interface PatientDetail {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  email: string | null
  phone: string | null
  gender: string | null
  pronouns: string | null
  diagnosisCodes: string[]
  referralSource: string | null
  mrn: string | null
  emergencyContact: { name: string; phone: string; relationship: string } | null
  insuranceInfo: { provider: string; policyNumber: string } | null
  isActive: boolean
  createdAt: string
}

interface PatientDetailViewProps {
  patient: PatientDetail
  sessions: SessionDetail[]
  onWriteNote: (sessionId: string) => void
  onBookSession: () => void
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-violet-100 text-violet-700",
]

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0]}${lastName[0]}`.toUpperCase()
}

function getAge(dateOfBirth: string) {
  const birth = new Date(dateOfBirth)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function getSessionStatusColor(status: string) {
  switch (status) {
    case "completed": return "bg-emerald-50 text-emerald-700 border-emerald-200"
    case "scheduled": return "bg-blue-50 text-blue-700 border-blue-200"
    case "cancelled": return "bg-stone-100 text-stone-500 border-stone-200"
    case "no_show": return "bg-red-50 text-red-700 border-red-200"
    default: return "bg-stone-100 text-stone-600 border-stone-200"
  }
}

export function PatientDetailView({ patient, sessions, onWriteNote, onBookSession }: PatientDetailViewProps) {
  const router = useRouter()
  const [intakeUrl, setIntakeUrl] = useState<string | null>(null)
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<"timeline" | "notes">("timeline")

  const palette = AVATAR_COLORS[(patient.firstName.charCodeAt(0) + patient.lastName.charCodeAt(0)) % AVATAR_COLORS.length]
  const initials = getInitials(patient.firstName, patient.lastName)
  const age = getAge(patient.dateOfBirth)

  const totalSessions = sessions.length
  const completedSessions = sessions.filter((s) => s.status === "completed").length
  const signedNotes = sessions.filter((s) => s.soapNote?.status === "signed").length
  const draftNotes = sessions.filter((s) => s.soapNote?.status === "draft").length
  const upcomingSessions = sessions.filter((s) => new Date(s.scheduledAt) >= new Date() && s.status === "scheduled")
  const pastSessions = sessions.filter((s) => new Date(s.scheduledAt) < new Date() || s.status === "completed")

  // Session type breakdown
  const sessionTypeCounts = sessions.reduce((acc, s) => {
    acc[s.sessionType] = (acc[s.sessionType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
  }, [sessions])

  const firstSession = sortedSessions.length > 0 ? sortedSessions[sortedSessions.length - 1] : null
  const lastSession = sortedSessions.length > 0 ? sortedSessions[0] : null

  const nextSession = upcomingSessions.length > 0
    ? [...upcomingSessions].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0]
    : null

  return (
    <div className="animate-fadeUp space-y-6">
      {/* Back navigation */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push("/app/clients")} className="text-muted-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Patients
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column — Profile + Stats + Actions */}
        <div className="lg:col-span-4 space-y-5">
          {/* Profile Card */}
          <Card className="border-0">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14 shrink-0">
                <AvatarFallback className={cn("text-base font-bold", palette)}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-serif text-xl font-normal text-foreground text-balance">
                    {patient.firstName} {patient.lastName}
                  </h1>
                  <Badge variant={patient.isActive ? "default" : "secondary"} className="text-[10px]">
                    {patient.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-muted-foreground">
                  {patient.pronouns && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium">{patient.pronouns}</span>}
                  <span>{age} yrs</span>
                  {patient.gender && <span>· {patient.gender}</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">DOB {formatDate(patient.dateOfBirth)}</p>
              </div>
            </div>
            <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
              {patient.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {patient.email}
                </span>
              )}
              {patient.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {patient.phone}
                </span>
              )}
              {patient.referralSource && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {patient.referralSource}
                </span>
              )}
            </div>
          </Card>

          {/* Stats line */}
          <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground flex-wrap">
            <span className="font-medium text-foreground">{totalSessions} sessions</span>
            <span>·</span>
            <span>{completedSessions} completed</span>
            <span>·</span>
            <span>{signedNotes} signed</span>
            {draftNotes > 0 && (
              <>
                <span>·</span>
                <span className="text-amber-600">{draftNotes} draft</span>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="justify-start h-auto py-2.5 px-3 text-left" onClick={onBookSession}>
              <Calendar className="h-4 w-4 mr-2 text-sage shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Book Session</p>
                <p className="text-[10px] text-muted-foreground font-medium">Schedule appointment</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-2.5 px-3 text-left"
              onClick={() => onWriteNote(nextSession?.id || "")} disabled={!nextSession}>
              <PenLine className="h-4 w-4 mr-2 text-sage shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Start Note</p>
                <p className="text-[10px] text-muted-foreground font-medium">For next session</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-2.5 px-3 text-left"
              onClick={async () => {
                if (intakeUrl) {
                  navigator.clipboard.writeText(intakeUrl)
                  setLinkCopied(true)
                  setTimeout(() => setLinkCopied(false), 2000)
                  return
                }
                setIsGeneratingLink(true)
                try {
                  const res = await fetch("/api/intake", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ clientId: patient.id }),
                  })
                  if (res.ok) {
                    const data = await res.json()
                    setIntakeUrl(data.url)
                    navigator.clipboard.writeText(data.url)
                    setLinkCopied(true)
                    setTimeout(() => setLinkCopied(false), 2000)
                  }
                } catch {
                  // ignore
                } finally {
                  setIsGeneratingLink(false)
                }
              }}
              disabled={isGeneratingLink}
            >
              {linkCopied ? (
                <Check className="h-4 w-4 mr-2 text-sage shrink-0 mt-0.5" />
              ) : (
                <Link2 className="h-4 w-4 mr-2 text-sage shrink-0 mt-0.5" />
              )}
              <div className="text-left">
                <p className="text-sm font-medium">{linkCopied ? "Copied!" : "Intake Link"}</p>
                <p className="text-[10px] text-muted-foreground font-medium">Share with client</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-2.5 px-3 text-left" onClick={() => router.push("/app/clients")}>
              <ClipboardList className="h-4 w-4 mr-2 text-sage shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Directory</p>
                <p className="text-[10px] text-muted-foreground font-medium">Back to patients</p>
              </div>
            </Button>
          </div>

          {/* Session Types */}
          {Object.entries(sessionTypeCounts).length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-muted-foreground mb-2">Session Types</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(sessionTypeCounts).map(([type, count]) => (
                  <Badge key={type} variant="outline" className="text-[10px] gap-1">
                    {type} <span className="text-muted-foreground">{count}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Diagnoses */}
          {patient.diagnosisCodes.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-muted-foreground mb-2">Diagnoses</p>
              <div className="flex flex-wrap gap-1.5">
                {patient.diagnosisCodes.map((code) => (
                  <Badge key={code} variant="secondary" className="text-[10px]">{code}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* First / Last Session */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground">First Session</p>
              <p className="text-sm font-medium mt-0.5">{firstSession ? formatDate(firstSession.scheduledAt) : "n/a"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground">Last Session</p>
              <p className="text-sm font-medium mt-0.5">{lastSession ? formatDate(lastSession.scheduledAt) : "n/a"}</p>
            </div>
          </div>
        </div>

        {/* Right Column — Sessions & Notes */}
        <div className="lg:col-span-8 space-y-5">

          {/* Next Session Banner */}
          {nextSession && (
            <Card className="border-0 bg-sage-light">
              <div className="p-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-sage/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4 text-sage" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Next Session</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(nextSession.scheduledAt)} at {formatTime(nextSession.scheduledAt)} · {nextSession.durationMinutes || 50} min · {nextSession.sessionType}
                    </p>
                  </div>
                </div>
                <Button size="sm" onClick={() => onWriteNote(nextSession.id)}>
                  <PenLine className="h-4 w-4 mr-1.5" />
                  Start Note
                </Button>
              </div>
            </Card>
          )}

          {/* Tabs */}
          <div className="border-b">
            <div className="flex gap-1">
              {(["timeline", "notes"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-[1px] capitalize",
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline Tab */}
          {activeTab === "timeline" && (
            <div className="space-y-4">
              {sortedSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground">No sessions yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Book your first session to get started.</p>
                  <Button onClick={onBookSession} variant="outline" size="sm" className="mt-4">
                    Book Session
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedSessions.map((s) => {
                    const hasSoap = !!s.soapNote
                    const isSigned = s.soapNote?.status === "signed"

                    return (
                      <Card key={s.id} className={cn("border-0", isSigned && "bg-sage-light/40")}>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold">
                                  {formatDate(s.scheduledAt)} · {formatTime(s.scheduledAt)}
                                </p>
                                <Badge variant="outline" className={cn("text-[10px]", getSessionStatusColor(s.status))}>
                                  {s.status}
                                </Badge>
                                {hasSoap && (
                                  <Badge variant={isSigned ? "default" : "secondary"} className="text-[10px]">
                                    {isSigned ? <Lock className="h-2.5 w-2.5 mr-0.5" /> : <FileText className="h-2.5 w-2.5 mr-0.5" />}
                                    {isSigned ? "Signed" : "Draft"}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">{s.sessionType}</span>
                                <span>·</span>
                                <span>{s.durationMinutes || 50} min</span>
                                <span>·</span>
                                <span className="capitalize">{s.modality.replace("_", " ")}</span>
                              </div>

                              {isSigned && s.soapNote && (
                                <div className="mt-3 p-3 bg-white rounded-lg text-xs space-y-1.5">
                                  <p className="text-muted-foreground line-clamp-2">
                                    <span className="font-semibold text-foreground">S:</span> {s.soapNote.subjective.substring(0, 120)}...
                                  </p>
                                  <p className="text-muted-foreground line-clamp-1">
                                    <span className="font-semibold text-foreground">A:</span> {s.soapNote.assessment.substring(0, 120)}...
                                  </p>
                                </div>
                              )}
                            </div>

                            <Button
                              size="sm"
                              variant={hasSoap ? "outline" : "default"}
                              onClick={() => onWriteNote(s.id)}
                              className="shrink-0"
                            >
                              {hasSoap ? (
                                <>{isSigned ? <Lock className="h-3.5 w-3.5 mr-1" /> : <PenLine className="h-3.5 w-3.5 mr-1" />} View</>
                              ) : (
                                <><Sparkles className="h-3.5 w-3.5 mr-1" /> Write Note</>
                              )}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              {sortedSessions.filter((s) => s.soapNote).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground">No notes yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Notes will appear here after you generate them from session records.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedSessions
                    .filter((s) => s.soapNote)
                    .map((s) => {
                      const isSigned = s.soapNote!.status === "signed"
                      return (
                        <Card key={s.id} className="border-0">
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-semibold">{formatDate(s.scheduledAt)}</p>
                                  <Badge variant={isSigned ? "default" : "secondary"} className="text-[10px]">
                                    {isSigned ? <Lock className="h-2.5 w-2.5 mr-0.5" /> : <FileText className="h-2.5 w-2.5 mr-0.5" />}
                                    {s.soapNote!.status}
                                  </Badge>
                                </div>
                                <div className="mt-2 space-y-2">
                                  <div className="text-xs space-y-1">
                                    <p className="line-clamp-2">
                                      <span className="font-semibold text-primary uppercase text-[10px] tracking-wider">Subjective</span>
                                      <span className="text-muted-foreground ml-2">{s.soapNote!.subjective.substring(0, 150)}...</span>
                                    </p>
                                    <p className="line-clamp-2">
                                      <span className="font-semibold text-primary uppercase text-[10px] tracking-wider">Assessment</span>
                                      <span className="text-muted-foreground ml-2">{s.soapNote!.assessment.substring(0, 150)}...</span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
