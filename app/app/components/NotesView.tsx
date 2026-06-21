"use client";

import { useState } from "react";
import {
  Search,
  Sparkles,
  Calendar as CalendarIcon,
  Copy,
  FileDown,
  Printer,
  ChevronRight,
  Users,
  PenLine,
  StickyNote,
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  Lock,
  MoreHorizontal,
  Check,
} from "lucide-react";
import { Client } from "../hooks/useClients";
import { Session } from "../hooks/useSessions";
import { SoapNote } from "../hooks/useSoapNote";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

interface NotesViewProps {
  clients: Client[];
  selectedClientForNotes: Client | null;
  setSelectedClientForNotes: (c: Client | null) => void;
  clientSessions: Session[];
  selectedSessionForNotes: Session | null;
  setSelectedSessionForNotes: (s: Session | null) => void;
  rawNotesContent: string;
  setRawNotesContent: (val: string) => void;
  generatedSoap: SoapNote | null;
  isGenerating: boolean;
  searchClientQuery: string;
  setSearchClientQuery: (val: string) => void;
  soapSubjective: string;
  setSoapSubjective: (val: string) => void;
  soapObjective: string;
  setSoapObjective: (val: string) => void;
  soapAssessment: string;
  setSoapAssessment: (val: string) => void;
  soapPlan: string;
  setSoapPlan: (val: string) => void;
  soapUnifiedContent: string;
  setSoapUnifiedContent: (val: string) => void;
  handleGenerateSoap: () => void;
  handleSaveDraft: () => void;
  handleSignAndLock: () => void;
  onBookSessionClick: () => void;
  showToast?: (msg: string, type?: "ok" | "err") => void;
  isLoadingNote?: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const PALETTES = [
  { bg: "#EDE9FE", text: "#6D28D9" },
  { bg: "#D1FAE5", text: "#065F46" },
  { bg: "#FEE2E2", text: "#991B1B" },
  { bg: "#DBEAFE", text: "#1E40AF" },
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#FCE7F3", text: "#9D174D" },
  { bg: "#E0F2FE", text: "#0C4A6E" },
];
function pal(first: string, last: string) {
  return PALETTES[((first.charCodeAt(0) || 0) + (last.charCodeAt(0) || 0)) % PALETTES.length];
}
function Avatar({ client, size = 32 }: { client: Client; size?: number }) {
  const p = pal(client.firstName, client.lastName);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: p.bg, color: p.text,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.34, fontWeight: 800, letterSpacing: "0.03em",
    }}>
      {`${client.firstName[0] || ""}${client.lastName[0] || ""}`.toUpperCase()}
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
      {[200, 280].map((h, i) => (
        <div key={i} style={{ border: "1px solid #EEECE8", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "13px 20px", background: "#FAFAF8", borderBottom: "1px solid #EEECE8" }}>
            <div style={{ height: 12, background: "#E8E5E0", borderRadius: 6, width: "30%", animation: "pulse 1.5s ease-in-out infinite" }} />
          </div>
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 10, minHeight: h }}>
            {[100, 82, 65].map((w, j) => (
              <div key={j} style={{ height: 11, background: "#F5F3F0", borderRadius: 5, width: `${w}%`, animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const NOTE_TYPES = [
  { id: "shorthand", label: "Session Notes", icon: <Check style={{ width: 12, height: 12 }} /> },
  { id: "soap", label: "SOAP", icon: <FileText style={{ width: 12, height: 12 }} /> },
] as const;
type NoteTypeId = typeof NOTE_TYPES[number]["id"];

// ── Note status types ─────────────────────────────────────────────────────────
type NoteStatus = "unsaved" | "draft" | "signed";

// ── Main ──────────────────────────────────────────────────────────────────────
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
  soapUnifiedContent,
  setSoapUnifiedContent,
  handleGenerateSoap,
  handleSaveDraft,
  handleSignAndLock,
  onBookSessionClick,
  showToast,
  isLoadingNote = false,
}: NotesViewProps) {
  const [noteType, setNoteType] = useState<NoteTypeId>("soap");
  const [isSaving, setIsSaving] = useState(false);

  // Derive status from the selected session's soap note
  const noteStatus: NoteStatus = (() => {
    if (!selectedSessionForNotes?.soapNote) return "unsaved";
    if (selectedSessionForNotes.soapNote.status === "signed") return "signed";
    return "draft";
  })();

  const filtered = clients.filter((c) =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchClientQuery.toLowerCase())
  );

  const copyNote = () => {
    const d = document.createElement("div");
    d.innerHTML = soapUnifiedContent;
    navigator.clipboard.writeText(d.textContent || "");
    showToast?.("Copied to clipboard", "ok");
  };

  const downloadTxt = () => {
    const d = document.createElement("div");
    d.innerHTML = soapUnifiedContent;
    const name = selectedClientForNotes
      ? `${selectedClientForNotes.firstName}_${selectedClientForNotes.lastName}` : "note";
    const date = selectedSessionForNotes
      ? new Date(selectedSessionForNotes.scheduledAt).toISOString().split("T")[0] : "date";
    const blob = new Blob([d.textContent || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `SOAP_${name}_${date}.txt`; a.click();
    URL.revokeObjectURL(url);
    showToast?.("Downloaded", "ok");
  };

  const onSave = async () => {
    setIsSaving(true);
    await handleSaveDraft();
    setIsSaving(false);
  };

  const onGenerate = () => {
    handleGenerateSoap();
    setNoteType("soap");
  };

  const isSigned = noteStatus === "signed";

  // ── Status badge config ─────────────────────────────────────────────────────
  const statusConfig = {
    unsaved: { label: "Unsaved", color: "#9B9590", bg: "#F5F3F0", icon: <Clock style={{ width: 10, height: 10 }} /> },
    draft:   { label: "Draft",   color: "#92400E", bg: "#FEF3C7", icon: <FileText style={{ width: 10, height: 10 }} /> },
    signed:  { label: "Signed",  color: "#065F46", bg: "#D1FAE5", icon: <Lock style={{ width: 10, height: 10 }} /> },
  }[noteStatus];

  return (
    <div className="flex h-full print:block" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#fff" }}>

      {/* ── LEFT: Patient list ─────────────────────────────────────────────── */}
      <div className="flex flex-col shrink-0 print:hidden" style={{ width: 232, borderRight: "1px solid #EEECE8", background: "#FAFAF8" }}>
        <div style={{ padding: "16px 12px 10px", borderBottom: "1px solid #EEECE8", flexShrink: 0 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#B8B3AD", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 9px" }}>Patients</p>
          <div style={{ position: "relative" }}>
            <Search style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, color: "#B8B3AD" }} />
            <input
              type="text" placeholder="Search…" value={searchClientQuery}
              onChange={(e) => setSearchClientQuery(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", paddingLeft: 28, paddingRight: 10, paddingTop: 7, paddingBottom: 7, background: "#F0EEE9", border: "1px solid transparent", borderRadius: 8, fontSize: 12, color: "#1A1A18", outline: "none", fontFamily: "inherit" }}
              onFocus={(e) => (e.target.style.borderColor = "#C5B8A8")}
              onBlur={(e) => (e.target.style.borderColor = "transparent")}
            />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "6px" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "32px 14px", textAlign: "center" }}>
              <Users style={{ width: 24, height: 24, color: "#D0CBC4", margin: "0 auto 7px" }} />
              <p style={{ fontSize: 11.5, color: "#B8B3AD", fontWeight: 500, margin: 0 }}>
                {clients.length === 0 ? "No patients yet" : "No match"}
              </p>
            </div>
          ) : filtered.map((c) => {
            const sel = selectedClientForNotes?.id === c.id;
            return (
              <button key={c.id} onClick={() => setSelectedClientForNotes(c)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "8px 8px", borderRadius: 9, border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit", marginBottom: 2, background: sel ? "#fff" : "transparent", boxShadow: sel ? "0 1px 4px rgba(0,0,0,0.07)" : "none" }}
                onMouseEnter={(e) => { if (!sel) (e.currentTarget as HTMLElement).style.background = "#F0EEE9"; }}
                onMouseLeave={(e) => { if (!sel) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <Avatar client={c} size={31} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: sel ? 700 : 600, color: sel ? "#1A1A18" : "#3C3B38", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.firstName} {c.lastName}
                  </p>
                  <p style={{ fontSize: 10.5, color: "#9B9590", margin: "1px 0 0" }}>{c.email || "No email"}</p>
                </div>
                {sel && <ChevronRight style={{ width: 12, height: 12, color: "#C5B8A8", flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT: Editor + action panel ──────────────────────────────────── */}
      <div className="flex flex-col flex-1 print:block" style={{ minWidth: 0, overflow: "hidden" }}>

        {!selectedClientForNotes ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: "#F5F3F0", border: "1px solid #EEECE8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PenLine style={{ width: 21, height: 21, color: "#C5B8A8" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: "#6B6762", margin: "0 0 4px" }}>Select a patient</p>
              <p style={{ fontSize: 12, color: "#B8B3AD", margin: 0 }}>Choose from the list on the left to start writing notes.</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Note type pills + patient sub-header ─────────────────────── */}
            <div className="print:hidden" style={{ flexShrink: 0, borderBottom: "1px solid #EEECE8" }}>

              {/* Patient + session strip */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 24px", background: "#FAFAF8", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar client={selectedClientForNotes} size={26} />
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#1A1A18" }}>
                    {selectedClientForNotes.firstName} {selectedClientForNotes.lastName}
                  </span>
                  <span style={{ fontSize: 10.5, color: "#B8B3AD" }}>
                    DOB: {new Date(selectedClientForNotes.dateOfBirth).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </div>
                {clientSessions.length > 0 && (
                  <>
                    <div style={{ width: 1, height: 14, background: "#EEECE8" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 4, overflowX: "auto" }}>
                      {clientSessions.map((s) => {
                        const isSel = selectedSessionForNotes?.id === s.id;
                        const hasNote = s.soapNote != null;
                        return (
                          <button key={s.id} onClick={() => setSelectedSessionForNotes(s)}
                            style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", border: isSel ? "1px solid #1A1A18" : "1px solid #E2DED9", borderRadius: 6, background: isSel ? "#1A1A18" : "#fff", color: isSel ? "#fff" : "#6B6762", fontSize: 11.5, fontWeight: isSel ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit", transition: "all 0.12s" }}
                            onMouseEnter={(e) => { if (!isSel) { (e.currentTarget as HTMLElement).style.borderColor = "#9B9590"; (e.currentTarget as HTMLElement).style.color = "#1A1A18"; } }}
                            onMouseLeave={(e) => { if (!isSel) { (e.currentTarget as HTMLElement).style.borderColor = "#E2DED9"; (e.currentTarget as HTMLElement).style.color = "#6B6762"; } }}
                          >
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: isSel ? "rgba(255,255,255,0.6)" : hasNote ? "#2D6A4F" : "#D0CBC4", flexShrink: 0 }} />
                            {new Date(s.scheduledAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </button>
                        );
                      })}
                      <button onClick={onBookSessionClick}
                        style={{ padding: "4px 9px", border: "1px dashed #D0CBC4", borderRadius: 6, background: "transparent", color: "#9B9590", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#1A1A18"; (e.currentTarget as HTMLElement).style.borderColor = "#9B9590"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#9B9590"; (e.currentTarget as HTMLElement).style.borderColor = "#D0CBC4"; }}
                      >
                        <CalendarIcon style={{ width: 10, height: 10 }} /> New
                      </button>
                    </div>
                  </>
                )}
                {clientSessions.length === 0 && (
                  <button onClick={onBookSessionClick}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 12px", background: "#2D6A4F", color: "#fff", border: "none", borderRadius: 7, fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    <CalendarIcon style={{ width: 11, height: 11 }} /> Book Session
                  </button>
                )}
              </div>
            </div>

            {/* ── Body: editor + right panel ────────────────────────────── */}
            {!selectedSessionForNotes ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: "#F5F3F0", border: "1px solid #EEECE8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CalendarIcon style={{ width: 18, height: 18, color: "#C5B8A8" }} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#6B6762", margin: "0 0 4px" }}>
                    {clientSessions.length === 0 ? "No sessions yet" : "Pick a session"}
                  </p>
                  <p style={{ fontSize: 11.5, color: "#B8B3AD", margin: 0 }}>
                    {clientSessions.length === 0 ? "Book a session to start writing notes." : "Select a session pill above to load the editor."}
                  </p>
                </div>
              </div>
            ) : isLoadingNote ? (
              <Skeleton />
            ) : (
              /* Two-column: editor | action panel */
              <div className="flex flex-1" style={{ overflow: "hidden" }}>

                {/* ── Editor ──────────────────────────────────────────── */}
                <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
                  <div style={{ maxWidth: 720, display: "flex", flexDirection: "column" }}>

                    {/* Tabs row styled like browser/card folders */}
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, paddingLeft: 12, position: "relative", zIndex: 10 }}>
                      {NOTE_TYPES.map((t) => {
                        const active = noteType === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => setNoteType(t.id)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "8px 18px",
                              border: "1px solid #E2DED9",
                              borderBottom: active ? "1px solid #FFF" : "1px solid #E2DED9",
                              borderTopLeftRadius: 8,
                              borderTopRightRadius: 8,
                              background: active ? "#FFF" : "#F8F7F4",
                              color: active ? "#1A1A18" : "#7A7570",
                              cursor: "pointer",
                              fontSize: "12.5px",
                              fontWeight: active ? 700 : 500,
                              fontFamily: "inherit",
                              whiteSpace: "nowrap",
                              position: "relative",
                              zIndex: active ? 12 : 9,
                              marginBottom: "-1px",
                              transition: "all 0.1s ease",
                            }}
                            onMouseEnter={(e) => {
                              if (!active) {
                                e.currentTarget.style.background = "#F0EEE9";
                                e.currentTarget.style.color = "#1A1A18";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!active) {
                                e.currentTarget.style.background = "#F8F7F4";
                                e.currentTarget.style.color = "#7A7570";
                              }
                            }}
                          >
                            {t.icon}
                            <span>{t.label}</span>
                            {t.id === "soap" && generatedSoap && (
                              <span style={{ width: 5, height: 5, borderRadius: "50%", background: active ? "#86EFAC" : "#2D6A4F", display: "inline-block" }} />
                            )}
                          </button>
                        );
                      })}
                      <button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "8px 14px",
                          border: "1px dashed #D0CBC4",
                          borderBottom: "1px solid #E2DED9",
                          borderTopLeftRadius: 8,
                          borderTopRightRadius: 8,
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: 500,
                          color: "#9B9590",
                          fontFamily: "inherit",
                          position: "relative",
                          zIndex: 9,
                          marginBottom: "-1px",
                          transition: "all 0.12s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#9B9590"; e.currentTarget.style.color = "#3C3B38"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#D0CBC4"; e.currentTarget.style.color = "#9B9590"; }}
                      >
                        <Plus style={{ width: 12, height: 12 }} />
                        <span>Add note</span>
                      </button>
                    </div>

                    {/* Editor Box Container */}
                    <div style={{
                      border: "1px solid #E2DED9",
                      borderRadius: 8,
                      background: "#FFF",
                      padding: "24px 32px",
                      minHeight: 400,
                      boxShadow: "0 1.5px 4px rgba(0,0,0,0.02)",
                      position: "relative",
                      zIndex: 8,
                    }}>
                      {/* SOAP tab */}
                      {noteType === "soap" && (
                        generatedSoap ? (
                          <div style={{ animation: "fadeUp 0.2s ease both" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, paddingBottom: 16, borderBottom: "1px solid #F0EEE9" }}>
                              <div>
                                <h3 style={{ fontSize: 22, fontWeight: 400, color: "#1A1A18", margin: "0 0 3px", fontFamily: "'Instrument Serif', Georgia, serif" }}>SOAP Note</h3>
                                <p style={{ fontSize: 11, color: "#B8B3AD", margin: 0 }}>AI generated · editable</p>
                              </div>
                              <span style={{ ...statusBadge(statusConfig), fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 6 }}>
                                {statusConfig.label}
                              </span>
                            </div>
                            <SimpleEditor content={soapUnifiedContent} onChange={setSoapUnifiedContent} editable={!isSigned} placeholder="SOAP notes…" />
                          </div>
                        ) : (
                          <div style={{ padding: "80px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 13, background: "#F5F3F0", border: "1px solid #EEECE8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Sparkles style={{ width: 21, height: 21, color: "#C5B8A8" }} />
                            </div>
                            <div>
                              <p style={{ fontSize: 14, fontWeight: 600, color: "#6B6762", margin: "0 0 4px" }}>No SOAP note yet</p>
                              <p style={{ fontSize: 12, color: "#B8B3AD", margin: "0 0 20px" }}>Write your session notes, then generate.</p>
                              <button onClick={() => setNoteType("shorthand")}
                                style={{ padding: "8px 18px", background: "#1A1A18", color: "#fff", border: "none", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                              >
                                Go to Session Notes →
                              </button>
                            </div>
                          </div>
                        )
                      )}

                      {/* Session Notes tab */}
                      {noteType === "shorthand" && (
                        <div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid #F0EEE9" }}>
                            <h3 style={{ fontSize: 22, fontWeight: 400, color: "#1A1A18", margin: 0, fontFamily: "'Instrument Serif', Georgia, serif" }}>Session Notes</h3>
                            <button
                              onClick={() => showToast?.("Audio transcription ready — paste your raw draft below.", "ok")}
                              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: "#9B9590", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = "#2D6A4F")}
                              onMouseLeave={(e) => (e.currentTarget.style.color = "#9B9590")}
                            >
                              <Sparkles style={{ width: 12, height: 12, color: "#2D6A4F" }} />
                              Transcribe Audio
                            </button>
                          </div>
                          <div style={{ minHeight: 280 }}>
                            <SimpleEditor
                              content={rawNotesContent}
                              onChange={setRawNotesContent}
                              editable={true}
                              placeholder="Paste session notes or transcript here… (e.g. 'Client reports increased anxiety. Used somatic breathing. Strong alliance.')"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── RIGHT: Action Panel ──────────────────────────── */}
                <div
                  className="print:hidden"
                  style={{
                    width: 256,
                    flexShrink: 0,
                    borderLeft: "1px solid #EEECE8",
                    background: "#FAFAF8",
                    overflowY: "auto",
                    padding: "20px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  {/* ── Note Status ─────────────────────────────────── */}
                  <div style={panelCard}>
                    <p style={panelLabel}>Status</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <span style={{ ...statusBadge(statusConfig), fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 7, display: "flex", alignItems: "center", gap: 5 }}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    </div>
                    {/* Status progress bar */}
                    <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                      {(["unsaved", "draft", "signed"] as NoteStatus[]).map((s, i) => (
                        <div key={s} style={{ flex: 1, height: 3, borderRadius: 4, background: noteStatus === "signed" ? "#2D6A4F" : i <= (noteStatus === "draft" ? 1 : 0) ? "#1A1A18" : "#EEECE8", transition: "background 0.3s" }} />
                      ))}
                    </div>
                    {/* Actions */}
                    {!isSigned && generatedSoap && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <button
                          onClick={onSave}
                          disabled={isSaving}
                          style={{ width: "100%", padding: "8px 0", background: "#1A1A18", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: isSaving ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "background 0.12s" }}
                          onMouseEnter={(e) => { if (!isSaving) (e.currentTarget.style.background = "#3C3B38"); }}
                          onMouseLeave={(e) => { if (!isSaving) (e.currentTarget.style.background = "#1A1A18"); }}
                        >
                          {isSaving ? "Saving…" : noteStatus === "draft" ? "Save Changes" : "Save Draft"}
                        </button>
                        <button
                          onClick={handleSignAndLock}
                          style={{ width: "100%", padding: "8px 0", background: "transparent", color: "#2D6A4F", border: "1.5px solid #B7D5C4", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.12s" }}
                          onMouseEnter={(e) => { (e.currentTarget.style.background = "#EAF3ED"); }}
                          onMouseLeave={(e) => { (e.currentTarget.style.background = "transparent"); }}
                        >
                          <Lock style={{ width: 11, height: 11 }} />
                          Sign & Lock
                        </button>
                      </div>
                    )}
                    {isSigned && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#065F46", background: "#D1FAE5", borderRadius: 7, padding: "7px 10px" }}>
                        <CheckCircle2 style={{ width: 12, height: 12, flexShrink: 0 }} />
                        Note signed and locked
                      </div>
                    )}
                  </div>

                  {/* ── Export ──────────────────────────────────────── */}
                  <div style={panelCard}>
                    <p style={panelLabel}>Export</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {[
                        { icon: <Copy style={{ width: 13, height: 13 }} />, label: "Copy text", fn: copyNote, disabled: !generatedSoap },
                        { icon: <FileDown style={{ width: 13, height: 13 }} />, label: "Download .txt", fn: downloadTxt, disabled: !generatedSoap },
                        { icon: <Printer style={{ width: 13, height: 13 }} />, label: "Print / PDF", fn: () => window.print(), disabled: !generatedSoap },
                      ].map((btn, i) => (
                        <button
                          key={i}
                          onClick={btn.fn}
                          disabled={btn.disabled}
                          style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", border: "1px solid #EEECE8", borderRadius: 8, background: "#fff", color: btn.disabled ? "#C5B8A8" : "#3C3B38", cursor: btn.disabled ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 500, fontFamily: "inherit", transition: "all 0.12s", textAlign: "left" }}
                          onMouseEnter={(e) => { if (!btn.disabled) { (e.currentTarget.style.background = "#F5F3F0"); (e.currentTarget.style.borderColor = "#D0CBC4"); } }}
                          onMouseLeave={(e) => { if (!btn.disabled) { (e.currentTarget.style.background = "#fff"); (e.currentTarget.style.borderColor = "#EEECE8"); } }}
                        >
                          <span style={{ color: btn.disabled ? "#D0CBC4" : "#9B9590" }}>{btn.icon}</span>
                          {btn.label}
                        </button>
                      ))}
                    </div>
                    {!generatedSoap && (
                      <p style={{ fontSize: 10.5, color: "#C5B8A8", margin: "8px 0 0", lineHeight: 1.5 }}>
                        Generate a SOAP note first to enable export.
                      </p>
                    )}
                  </div>

                  {/* ── AI Generate ─────────────────────────────────── */}
                  <div style={panelCard}>
                    <p style={panelLabel}>AI Generate</p>
                    <p style={{ fontSize: 11.5, color: "#9B9590", margin: "0 0 12px", lineHeight: 1.6 }}>
                      Write session notes, then let AI structure them into a SOAP report.
                    </p>
                    <button
                      onClick={onGenerate}
                      disabled={isGenerating || isSigned}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                        padding: "9px 0",
                        background: isGenerating || isSigned ? "#F0EEE9" : "#1A1A18",
                        color: isGenerating || isSigned ? "#9B9590" : "#fff",
                        border: "none", borderRadius: 8,
                        fontSize: 12, fontWeight: 700,
                        cursor: isGenerating || isSigned ? "not-allowed" : "pointer",
                        fontFamily: "inherit", transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => { if (!isGenerating && !isSigned) (e.currentTarget.style.background = "#3C3B38"); }}
                      onMouseLeave={(e) => { if (!isGenerating && !isSigned) (e.currentTarget.style.background = "#1A1A18"); }}
                    >
                      <Sparkles style={{ width: 13, height: 13, color: isGenerating ? "#C5B8A8" : "#86EFAC", animation: isGenerating ? "spin 1s linear infinite" : undefined }} />
                      {isGenerating ? "Generating…" : isSigned ? "Note Locked" : generatedSoap ? "Regenerate" : "Generate SOAP"}
                    </button>
                    {generatedSoap && !isSigned && (
                      <p style={{ fontSize: 10.5, color: "#C5B8A8", margin: "8px 0 0", textAlign: "center" }}>
                        Regenerating will overwrite the current note.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Print */}
      <div id="soap-print-report" className="hidden print:block" style={{ fontFamily: "serif", maxWidth: 780, margin: "0 auto", padding: 48, background: "#fff" }}>
        <div style={{ borderBottom: "2px solid #D0CBC4", paddingBottom: 16, marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 400, margin: 0 }}>Clinical Progress Record</h1>
          <p style={{ fontSize: 10, color: "#6B6762", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.1em" }}>TherapyDesk</p>
        </div>
        <div dangerouslySetInnerHTML={{ __html: soapUnifiedContent }} />
      </div>
    </div>
  );
}

// ── Shared micro-styles ───────────────────────────────────────────────────────
const panelCard: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #EEECE8",
  borderRadius: 12,
  padding: "14px 14px",
};

const panelLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "#B8B3AD",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  margin: "0 0 10px",
};

function statusBadge(cfg: { color: string; bg: string }) {
  return { color: cfg.color, background: cfg.bg } as React.CSSProperties;
}
