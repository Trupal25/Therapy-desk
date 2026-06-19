"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Clock,
  Sparkles,
  Calendar as CalendarIcon,
  Copy,
  FileDown,
  Printer,
  ChevronRight,
  ChevronLeft,
  X,
  Users,
  FileText,
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

function getClientAvatarStyle(firstName: string, lastName: string) {
  const charCode = (firstName.charCodeAt(0) || 0) + (lastName.charCodeAt(0) || 0);
  const palettes = [
    { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
    { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
    { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
    { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
    { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
    { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-200" },
    { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200" },
  ];
  return palettes[charCode % palettes.length];
}

// ── Breadcrumb component ────────────────────────────────────────────────────
function Breadcrumb({
  client,
  session,
  onReset,
  onResetSession,
  onOpenClientDrawer,
}: {
  client: Client | null;
  session: Session | null;
  onReset: () => void;
  onResetSession: () => void;
  onOpenClientDrawer: () => void;
}) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-zinc-400 select-none">
      <button
        onClick={onReset}
        className="flex items-center gap-1 hover:text-zinc-700 transition font-medium cursor-pointer"
      >
        <FileText className="w-3.5 h-3.5" />
        Notes
      </button>
      {client && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
          <button
            onClick={onOpenClientDrawer}
            className="font-semibold text-zinc-700 hover:text-zinc-900 hover:underline underline-offset-2 transition cursor-pointer"
          >
            {client.firstName} {client.lastName}
          </button>
        </>
      )}
      {session && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
          <button
            onClick={onResetSession}
            className="text-zinc-500 hover:text-zinc-700 transition cursor-pointer font-medium"
          >
            {new Date(session.scheduledAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </button>
        </>
      )}
    </nav>
  );
}

// ── Client Drawer ───────────────────────────────────────────────────────────
function ClientDrawer({
  clients,
  selectedClient,
  searchQuery,
  setSearchQuery,
  onSelect,
  onClose,
}: {
  clients: Client[];
  selectedClient: Client | null;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  onSelect: (c: Client) => void;
  onClose: () => void;
}) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const filtered = clients.filter((c) =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-40" onClick={onClose} />
      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 left-0 h-full w-72 bg-white border-r border-zinc-200 z-50 flex flex-col shadow-2xl animate-slideInLeft print:hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Select Patient</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">{clients.length} active patients</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-zinc-50">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              autoFocus
              className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-800 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-400 transition-all duration-150"
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400">No patients found.</div>
          ) : (
            filtered.map((c) => {
              const avatar = getClientAvatarStyle(c.firstName, c.lastName);
              const initials = `${c.firstName[0] || ""}${c.lastName[0] || ""}`.toUpperCase();
              const isSelected = selectedClient?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => onSelect(c)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-zinc-900 text-white"
                      : "hover:bg-zinc-50 text-zinc-700"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border ${
                      isSelected
                        ? "bg-white/20 text-white border-white/20"
                        : `${avatar.bg} ${avatar.text} ${avatar.border}`
                    }`}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${isSelected ? "text-white" : "text-zinc-800"}`}>
                      {c.firstName} {c.lastName}
                    </p>
                    <p className={`text-[9px] truncate mt-0.5 ${isSelected ? "text-white/60" : "text-zinc-400"}`}>
                      {c.email || "No email on file"}
                    </p>
                  </div>
                  {isSelected && <ChevronRight className="w-3.5 h-3.5 text-white/60 ml-auto shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

// ── Notes skeleton ──────────────────────────────────────────────────────────
function NotesSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 bg-zinc-50/50 border-b border-zinc-100 flex items-center justify-between">
          <div className="h-4 bg-zinc-200 rounded w-1/3" />
          <div className="h-3 bg-zinc-100 rounded w-20" />
        </div>
        <div className="p-5 space-y-3 min-h-[168px]">
          <div className="h-3 bg-zinc-100 rounded w-full" />
          <div className="h-3 bg-zinc-100 rounded w-5/6" />
          <div className="h-3 bg-zinc-100 rounded w-2/3" />
        </div>
      </div>
      <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 bg-zinc-50/50 border-b border-zinc-100">
          <div className="h-3 bg-zinc-200 rounded w-1/4" />
        </div>
        <div className="p-5 space-y-3 min-h-[200px]">
          <div className="h-3 bg-zinc-100 rounded w-full" />
          <div className="h-3 bg-zinc-100 rounded w-11/12" />
          <div className="h-3 bg-zinc-100 rounded w-5/6" />
        </div>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
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
  soapSubjective,
  setSoapSubjective,
  soapObjective,
  setSoapObjective,
  soapAssessment,
  setSoapAssessment,
  soapPlan,
  setSoapPlan,
  soapUnifiedContent,
  setSoapUnifiedContent,
  handleGenerateSoap,
  handleSaveDraft,
  onBookSessionClick,
  showToast,
  isLoadingNote = false,
}: NotesViewProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(!selectedClientForNotes);

  // Auto-open drawer if no client selected
  useEffect(() => {
    if (!selectedClientForNotes) {
      setIsDrawerOpen(true);
    }
  }, [selectedClientForNotes]);

  const handleCopyNote = () => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = soapUnifiedContent;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    navigator.clipboard.writeText(text);
    if (showToast) showToast("SOAP note text copied to clipboard!", "ok");
  };

  const handleDownloadTxt = () => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = soapUnifiedContent;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    const clientName = selectedClientForNotes
      ? `${selectedClientForNotes.firstName}_${selectedClientForNotes.lastName}`
      : "client";
    const dateStr = selectedSessionForNotes
      ? new Date(selectedSessionForNotes.scheduledAt).toISOString().split("T")[0]
      : "note";
    const fileName = `SOAP_Note_${clientName}_${dateStr}.txt`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    if (showToast) showToast("Downloaded SOAP note text file!", "ok");
  };

  const handlePrintNote = () => window.print();

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl animate-fadeUp">
      {/* ── Breadcrumb bar ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 print:hidden">
        <Breadcrumb
          client={selectedClientForNotes}
          session={selectedSessionForNotes}
          onReset={() => {
            setSelectedClientForNotes(null);
            setSelectedSessionForNotes(null);
          }}
          onResetSession={() => setSelectedSessionForNotes(null)}
          onOpenClientDrawer={() => setIsDrawerOpen(true)}
        />

        {/* Change patient button */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:border-zinc-400 rounded-lg transition-all duration-150 cursor-pointer shadow-sm print:hidden"
        >
          <Users className="w-3.5 h-3.5" />
          {selectedClientForNotes ? "Change Patient" : "Select Patient"}
        </button>
      </div>

      {/* ── Client drawer ───────────────────────────────────────────────── */}
      {isDrawerOpen && (
        <ClientDrawer
          clients={clients}
          selectedClient={selectedClientForNotes}
          searchQuery={searchClientQuery}
          setSearchQuery={setSearchClientQuery}
          onSelect={(c) => {
            setSelectedClientForNotes(c);
            setIsDrawerOpen(false);
          }}
          onClose={() => {
            if (selectedClientForNotes) setIsDrawerOpen(false);
          }}
        />
      )}

      {/* ── Main content area ───────────────────────────────────────────── */}
      {!selectedClientForNotes ? (
        /* Empty state when no client selected */
        <div className="bg-white border border-zinc-100 rounded-2xl py-24 text-center shadow-sm">
          <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 text-zinc-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-zinc-700">Select a patient</h3>
          <p className="text-xs text-zinc-400 font-light mt-1 max-w-xs mx-auto">
            Choose a patient from your list to start writing session notes.
          </p>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="mt-5 px-5 py-2.5 bg-zinc-900 text-white text-xs font-semibold rounded-xl shadow cursor-pointer hover:bg-zinc-800 transition inline-flex items-center gap-2"
          >
            <Users className="w-3.5 h-3.5" />
            Browse Patients
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* ── Patient header + session tab strip ────────────────────── */}
          <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm print:hidden">
            {/* Patient info row */}
            <div className="px-5 py-4 border-b border-zinc-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const avatar = getClientAvatarStyle(
                    selectedClientForNotes.firstName,
                    selectedClientForNotes.lastName
                  );
                  const initials = `${selectedClientForNotes.firstName[0] || ""}${selectedClientForNotes.lastName[0] || ""}`.toUpperCase();
                  return (
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold border ${avatar.bg} ${avatar.text} ${avatar.border}`}
                    >
                      {initials}
                    </div>
                  );
                })()}
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">
                    {selectedClientForNotes.firstName} {selectedClientForNotes.lastName}
                    {selectedClientForNotes.pronouns && (
                      <span className="ml-2 text-[9px] font-medium text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {selectedClientForNotes.pronouns}
                      </span>
                    )}
                  </h2>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    DOB:{" "}
                    {new Date(selectedClientForNotes.dateOfBirth).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {clientSessions.length === 0 && (
                <button
                  onClick={onBookSessionClick}
                  className="px-3 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer hover:bg-zinc-800 transition shadow-sm"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  Book Session
                </button>
              )}
            </div>

            {/* Session tab strip */}
            {clientSessions.length > 0 && (
              <div className="px-5 py-3 bg-zinc-50/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest shrink-0 mr-1">
                  Sessions
                </span>
                {clientSessions.map((s) => {
                  const isSelected = selectedSessionForNotes?.id === s.id;
                  const hasNote = s.soapNote !== null && s.soapNote !== undefined;
                  const date = new Date(s.scheduledAt);
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSessionForNotes(s)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold shrink-0 transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                          : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900"
                      }`}
                    >
                      <span>
                        {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? "bg-emerald-400" : hasNote ? "bg-emerald-500" : "bg-zinc-300"
                        }`}
                      />
                    </button>
                  );
                })}
                <button
                  onClick={onBookSessionClick}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-zinc-300 text-[10px] font-semibold text-zinc-400 hover:text-zinc-600 hover:border-zinc-400 transition shrink-0 cursor-pointer ml-1"
                >
                  <CalendarIcon className="w-3 h-3" />
                  New
                </button>
              </div>
            )}
          </div>

          {/* ── Note editor area ──────────────────────────────────────── */}
          {!selectedSessionForNotes ? (
            <div className="bg-white border border-zinc-100 rounded-2xl py-20 text-center shadow-sm print:hidden">
              <div className="w-10 h-10 bg-zinc-50 text-zinc-300 rounded-xl flex items-center justify-center mx-auto mb-3 border border-zinc-100">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium text-zinc-600">
                {clientSessions.length === 0 ? "No sessions yet" : "Pick a session to start"}
              </h3>
              <p className="text-xs text-zinc-400 font-light mt-1">
                {clientSessions.length === 0
                  ? "Book a session to begin writing clinical notes."
                  : "Select a session tab above to load the note editor."}
              </p>
            </div>
          ) : isLoadingNote ? (
            <NotesSkeleton />
          ) : (
            <>
              {/* Transcript / shorthand input */}
              <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm print:hidden">
                <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/30">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-xs font-semibold text-zinc-700">Session shorthand notes</span>
                  </div>
                  <button
                    onClick={() =>
                      showToast?.(
                        "Audio transcription ready — paste your raw draft or transcript below.",
                        "ok"
                      )
                    }
                    className="text-[10px] text-zinc-400 font-medium hover:text-emerald-600 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    Transcribe Audio
                  </button>
                </div>
                <div className="bg-white min-h-[160px]">
                  <SimpleEditor
                    content={rawNotesContent}
                    onChange={setRawNotesContent}
                    editable={true}
                    placeholder="Paste session notes or transcript here… (e.g. 'Client reports increased anxiety about work. Strong alliance. Used somatic breathing exercise.')"
                  />
                </div>
                <div className="px-5 py-4 border-t border-zinc-100 bg-zinc-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <span className="text-[11px] text-zinc-400 font-light leading-relaxed">
                    AI will structure your shorthand notes into a clinical SOAP format.
                  </span>
                  <button
                    onClick={handleGenerateSoap}
                    disabled={isGenerating}
                    className="w-full sm:w-auto px-5 py-2.5 bg-zinc-900 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl shadow transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles
                      className={`w-3.5 h-3.5 text-emerald-400 ${
                        isGenerating ? "animate-spin" : "animate-pulse"
                      }`}
                    />
                    {isGenerating ? "Processing…" : "Generate SOAP Note"}
                  </button>
                </div>
              </div>

              {/* SOAP output */}
              <div className="print:block">
                {generatedSoap ? (
                  <div className="animate-fadeUp">
                    <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm focus-within:border-zinc-300 transition-all duration-200 print:border-none print:shadow-none">
                      <div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/30 flex items-center justify-between flex-wrap gap-2 print:hidden">
                        <div>
                          <span className="text-xs font-semibold text-zinc-800">Unified SOAP Report</span>
                          <span className="text-[10px] text-zinc-400 block mt-0.5 font-light">
                            Structured via markdown headings · editable
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Export tools */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={handleCopyNote}
                              title="Copy text"
                              className="p-1.5 bg-white border border-zinc-200 hover:border-zinc-400 rounded-lg text-zinc-500 hover:text-zinc-800 transition cursor-pointer shadow-sm"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={handleDownloadTxt}
                              title="Download .txt"
                              className="p-1.5 bg-white border border-zinc-200 hover:border-zinc-400 rounded-lg text-zinc-500 hover:text-zinc-800 transition cursor-pointer shadow-sm"
                            >
                              <FileDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={handlePrintNote}
                              title="Print / Export PDF"
                              className="p-1.5 bg-white border border-zinc-200 hover:border-zinc-400 rounded-lg text-zinc-500 hover:text-zinc-800 transition cursor-pointer shadow-sm"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={handleSaveDraft}
                            className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-700 text-white text-[11px] font-bold rounded-lg shadow transition cursor-pointer"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                      <SimpleEditor
                        content={soapUnifiedContent}
                        onChange={setSoapUnifiedContent}
                        editable={true}
                        placeholder="SOAP notes report…"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-zinc-100 rounded-2xl py-16 text-center shadow-sm print:hidden">
                    <div className="w-10 h-10 bg-zinc-50 text-zinc-300 rounded-xl flex items-center justify-center mx-auto mb-3 border border-zinc-100">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium text-zinc-500">No SOAP note yet</p>
                    <p className="text-xs text-zinc-400 font-light mt-1">
                      Write shorthand notes above and click Generate.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Print-only letterhead ─────────────────────────────────────────── */}
      <div id="soap-print-report" className="hidden print:block font-sans max-w-3xl mx-auto p-8 space-y-6 text-zinc-900 bg-white">
        <div className="border-b-2 border-zinc-300 pb-4 flex justify-between items-end">
          <div>
            <h1 className="font-serif text-3xl font-normal tracking-tight text-zinc-950">
              Clinical Progress Record
            </h1>
            <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-semibold">
              TherapyDesk Practice Record
            </p>
          </div>
          <div className="text-right text-[10px] text-zinc-500 space-y-0.5">
            <p className="font-bold text-zinc-800">
              Printed: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 text-xs bg-zinc-50/50 p-4 rounded-xl border border-zinc-200">
          <div>
            <p className="text-zinc-500 font-bold uppercase tracking-wider text-[8px]">Patient Details</p>
            <p className="font-bold text-zinc-900 text-sm mt-0.5">
              {selectedClientForNotes?.firstName} {selectedClientForNotes?.lastName}
            </p>
            <p className="mt-1 text-zinc-600">
              DOB:{" "}
              {selectedClientForNotes &&
                new Date(selectedClientForNotes.dateOfBirth).toLocaleDateString()}
            </p>
            {selectedClientForNotes?.gender && (
              <p className="text-zinc-600">
                Treatment Focus: {selectedClientForNotes.gender}
              </p>
            )}
          </div>
          <div>
            <p className="text-zinc-500 font-bold uppercase tracking-wider text-[8px]">Session Context</p>
            <p className="font-bold text-zinc-900 text-sm mt-0.5">
              {selectedSessionForNotes?.sessionType.toUpperCase()}
            </p>
            <p className="mt-1 text-zinc-600">
              Date:{" "}
              {selectedSessionForNotes &&
                new Date(selectedSessionForNotes.scheduledAt).toLocaleDateString()}
            </p>
            <p className="text-zinc-600">
              Status: {selectedSessionForNotes?.status.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="space-y-4 pt-2">
          <h3 className="font-serif text-xl border-b border-zinc-200 pb-1.5 text-zinc-950 font-normal">
            SOAP Clinical Progress Report
          </h3>
          <div
            className="text-sm leading-relaxed text-zinc-850 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: soapUnifiedContent }}
          />
        </div>
        <div className="pt-12 border-t border-zinc-200 flex justify-between items-end text-xs">
          <div>
            <p className="font-bold text-zinc-900">Practice Clinician Signature</p>
            <p className="text-zinc-500 mt-4">____________________________________</p>
            <p className="text-zinc-400 text-[10px] mt-1">Therapist Signature &amp; Date</p>
          </div>
        </div>
      </div>
    </div>
  );
}
