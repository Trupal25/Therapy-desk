import { Search, Clock, Sparkles, Lock, Unlock, CheckCircle2, Calendar as CalendarIcon } from "lucide-react";
import { Client } from "../hooks/useClients";
import { Session } from "../hooks/useSessions";
import { SoapNote } from "../hooks/useSoapNote";

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
  handleGenerateSoap: () => void;
  handleSaveDraft: () => void;
  handleSignAndLock: () => void;
  onBookSessionClick: () => void;
  showToast?: (msg: string, type?: "ok" | "err") => void;
}

function getClientAvatarStyle(firstName: string, lastName: string) {
  const charCode = (firstName.charCodeAt(0) || 0) + (lastName.charCodeAt(0) || 0);
  const gradients = [
    "from-indigo-500 to-sky-400 text-white",
    "from-emerald-500 to-teal-400 text-white",
    "from-purple-500 to-pink-400 text-white",
    "from-amber-500 to-orange-400 text-white",
    "from-rose-500 to-pink-500 text-white",
    "from-blue-600 to-cyan-400 text-white",
    "from-teal-500 to-emerald-400 text-white",
  ];
  return gradients[charCode % gradients.length];
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
  soapSubjective,
  setSoapSubjective,
  soapObjective,
  setSoapObjective,
  soapAssessment,
  setSoapAssessment,
  soapPlan,
  setSoapPlan,
  handleGenerateSoap,
  handleSaveDraft,
  handleSignAndLock,
  onBookSessionClick,
  showToast
}: NotesViewProps) {
  const filteredClientsForNotes = clients.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchClientQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl animate-fadeUp space-y-6">

      {/* Two-panel details structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left client select lookup */}
        <div className="lg:col-span-3 bg-white/80 backdrop-blur-md border border-stone-200/80 rounded-2xl overflow-hidden shadow-sm flex flex-col max-h-[700px] hover:border-stone-300 hover:shadow-md transition-all duration-300">
          <div className="p-4 border-b border-stone-150 space-y-3 bg-stone-50/40">
            <h3 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Patients</h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                className="w-full pl-9 pr-3 py-2 bg-stone-100/80 border border-stone-200/60 rounded-xl text-xs text-ink placeholder-stone-400 outline-none focus:bg-white focus:border-sage focus:ring-2 focus:ring-sage/10 transition-all duration-200"
                type="text"
                placeholder="Search active patients..."
                value={searchClientQuery}
                onChange={(e) => setSearchClientQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-y-auto p-2 flex-1 max-h-[500px] space-y-1 bg-white/50">
            {filteredClientsForNotes.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400 font-light">
                No clients found.
              </div>
            ) : (
              filteredClientsForNotes.map((c) => {
                const initials = `${c.firstName[0] || ""}${c.lastName[0] || ""}`.toUpperCase();
                const avatarGradient = getClientAvatarStyle(c.firstName, c.lastName);
                const isSelected = selectedClientForNotes?.id === c.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedClientForNotes(c)}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? "bg-sage/8 border-sage/20 shadow-sm border-l-4 border-l-sage scale-[1.01]" 
                        : "bg-transparent border-transparent hover:bg-stone-50/80 hover:border-stone-200/40 hover:scale-[1.005]"}`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${avatarGradient} flex items-center justify-center text-[10px] font-bold tracking-wider shadow-sm shrink-0`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <span className={`text-xs font-semibold truncate ${isSelected ? "text-sage-dark font-bold" : "text-ink"}`}>
                        {c.firstName} {c.lastName}
                      </span>
                      <span className="text-[9px] text-stone-400 font-light truncate mt-0.5">
                        {c.email || "No email address"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right editor container */}
        <div className="lg:col-span-9 space-y-5">
          
          {/* Header patient banner */}
          <div className="bg-white border border-stone-200/70 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-stone-300 transition-all duration-300">
            <div>
              {selectedClientForNotes ? (
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-serif text-2xl font-normal text-ink">
                    {selectedClientForNotes.firstName} {selectedClientForNotes.lastName}
                  </h2>
                  {selectedClientForNotes.pronouns && (
                    <span className="px-2 py-0.5 bg-sage-light/40 text-[9px] text-sage font-semibold rounded-md uppercase tracking-wider">
                      {selectedClientForNotes.pronouns}
                    </span>
                  )}
                  <span className="text-xs text-stone-400 font-light">
                    DOB: {new Date(selectedClientForNotes.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ) : (
                <h2 className="font-serif text-2xl font-normal text-ink">
                  Select a client to begin
                </h2>
              )}
              <p className="text-[11px] text-stone-400 font-light mt-1">
                {selectedSessionForNotes
                  ? `Active Session: ${new Date(selectedSessionForNotes.scheduledAt).toLocaleDateString()} at ${new Date(
                      selectedSessionForNotes.scheduledAt
                    ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : "Select a session to start writing notes."}
              </p>
            </div>

            {generatedSoap && (
              <div className="flex gap-2.5 w-full md:w-auto shrink-0">
                <button
                  className="flex-grow md:flex-grow-0 px-4.5 py-2.5 bg-white border border-stone-200 hover:border-stone-400 active:bg-stone-50 text-xs font-bold text-stone-600 hover:text-ink rounded-xl shadow-sm transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={generatedSoap.status === "signed"}
                  onClick={handleSaveDraft}
                >
                  Save Draft
                </button>
                <button
                  className={`flex-grow md:flex-grow-0 px-4.5 py-2.5 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed
                    ${generatedSoap.status === "signed" 
                      ? "bg-sage hover:bg-sage text-white shadow-none" 
                      : "bg-stone-950 hover:bg-sage hover:scale-[1.01]"}`}
                  disabled={generatedSoap.status === "signed"}
                  onClick={handleSignAndLock}
                >
                  {generatedSoap.status === "signed" ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Legally Locked</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Sign & Seal Note</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Session Timeline Selector */}
          {selectedClientForNotes && clientSessions.length > 0 && (
            <div className="bg-white border border-stone-200/70 rounded-2xl p-5 shadow-sm hover:border-stone-300 transition duration-300 space-y-3">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Session Timeline</span>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin scrollbar-thumb-stone-200">
                {clientSessions.map((s) => {
                  const isSelected = selectedSessionForNotes?.id === s.id;
                  const date = new Date(s.scheduledAt);
                  const hasNote = s.soapNote !== null && s.soapNote !== undefined;
                  const isSigned = s.soapNote?.status === "signed";

                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSessionForNotes(s)}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left min-w-[140px] transition-all duration-250 shrink-0 cursor-pointer
                        ${isSelected 
                          ? "bg-sage text-white border-sage shadow-md scale-[1.02]" 
                          : "bg-stone-50/50 hover:bg-stone-100/50 border-stone-200/60 text-ink hover:scale-[1.01]"}`}
                    >
                      <span className={`text-[9px] font-bold tracking-wider ${isSelected ? "text-white/80" : "text-stone-400"}`}>
                        {s.sessionType.toUpperCase()}
                      </span>
                      <span className="text-xs font-bold mt-1">
                        {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                      <span className={`text-[8.5px] mt-2.5 font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1
                        ${isSelected 
                          ? "bg-white/20 text-white font-semibold" 
                          : isSigned 
                            ? "bg-sage/10 text-sage font-bold" 
                            : hasNote 
                              ? "bg-amber-50 text-amber-600 font-bold" 
                              : "bg-stone-100 text-stone-400"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : isSigned ? "bg-sage" : hasNote ? "bg-amber-500" : "bg-stone-400"}`}></span>
                        {isSigned ? "Signed" : hasNote ? "Draft" : "Empty"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedSessionForNotes ? (
            <>
              {/* Transcript input */}
              <div className="bg-white border border-stone-200/70 rounded-2xl overflow-hidden shadow-sm flex flex-col hover:border-stone-300 transition duration-300">
                <div className="px-5 py-3.5 bg-stone-50/40 border-b border-stone-150 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-stone-400 animate-pulse" />
                    <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Session shorthand notes</span>
                  </div>
                  <button 
                    onClick={() => showToast?.("Audio transcription is ready. Paste your raw draft or transcripts below to structure.", "ok")}
                    className="text-[10px] text-stone-400 font-medium hover:text-sage hover:scale-[1.02] active:scale-98 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-sage" />
                    <span>Transcribe Audio</span>
                  </button>
                </div>
                <textarea
                  className="w-full min-h-[168px] p-6 border-none outline-none font-sans text-xs text-ink leading-6 resize-y bg-white placeholder-stone-400 focus:ring-0"
                  style={{
                    backgroundImage: "linear-gradient(to bottom, #f5f5f4 1px, transparent 1px)",
                    backgroundSize: "100% 1.5rem",
                    lineHeight: "1.5rem",
                  }}
                  placeholder="Paste session notes or transcript here... (e.g. 'Client reports increased anxiety about work. Strong alliance. Used somatic breathing exercise.')"
                  value={rawNotesContent}
                  onChange={(e) => setRawNotesContent(e.target.value)}
                  disabled={generatedSoap?.status === "signed"}
                ></textarea>
                <div className="px-5 py-4.5 border-t border-stone-150 bg-stone-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <span className="text-[11px] text-stone-500 font-light leading-relaxed">
                    AI will structure your shorthand notes into a clinical SOAP format.
                  </span>
                  <button
                    onClick={handleGenerateSoap}
                    disabled={isGenerating || generatedSoap?.status === "signed"}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 hover:from-sage hover:to-emerald-600 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.97]"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-emerald-400 ${isGenerating ? "animate-spin" : "animate-pulse"}`} />
                    <span>{isGenerating ? "Processing Transcript..." : "Generate SOAP Note"}</span>
                  </button>
                </div>
              </div>

              {/* SOAP note output fields grid */}
              <div>
                <div className={`bg-white border border-stone-200/70 rounded-2xl p-5 shadow-sm hover:border-stone-300 transition-all duration-300 flex items-center justify-between
                  ${generatedSoap?.status === "signed" ? "bg-sage-light/20 border-sage/20" : ""}`}>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${isGenerating ? "bg-sage animate-ping" : generatedSoap ? "bg-sage" : "bg-stone-300"}`}></span>
                    <span className={`text-xs font-bold uppercase tracking-wider
                      ${generatedSoap?.status === "signed" ? "text-sage" : "text-stone-700"}`}>
                      {generatedSoap
                        ? `Clinical SOAP report (${(generatedSoap.status || "draft").toUpperCase()})`
                        : "SOAP Report structure"}
                    </span>
                    {generatedSoap?.generationModel && (
                      <span className="px-2.5 py-0.5 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-200/40 rounded-full text-[10px] text-purple-700 font-semibold tracking-wide flex items-center gap-1.5 shadow-sm animate-fadeUp">
                        <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-pink-500 animate-pulse"></span>
                        {generatedSoap.generationModel}
                      </span>
                    )}
                  </div>
                  {generatedSoap?.status === "signed" && (
                    <div className="flex items-center gap-1.5 text-xs text-sage font-bold uppercase tracking-wider bg-sage/10 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-sage" />
                      <span>Legally Sealed</span>
                    </div>
                  )}
                </div>

                {generatedSoap ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    
                    {/* Subjective */}
                    <div className={`bg-white border rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col gap-3 group
                      ${generatedSoap.status === "signed" 
                        ? "border-stone-200 bg-stone-50/20" 
                        : "border-indigo-100 hover:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:border-indigo-400"}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-xl bg-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-indigo-500/10">S</span>
                          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Subjective (S)</span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-light group-focus-within:text-indigo-400 transition-colors duration-200">Patient observations</span>
                      </div>
                      <textarea
                        className="w-full min-h-[148px] bg-transparent border-none outline-none font-sans text-xs text-stone-600 leading-relaxed resize-none font-light focus:ring-0 focus:outline-none"
                        value={soapSubjective}
                        onChange={(e) => setSoapSubjective(e.target.value)}
                        disabled={generatedSoap.status === "signed"}
                        placeholder="Patient's reports of feelings, thoughts, and symptoms..."
                      />
                    </div>

                    {/* Objective */}
                    <div className={`bg-white border rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col gap-3 group
                      ${generatedSoap.status === "signed" 
                        ? "border-stone-200 bg-stone-50/20" 
                        : "border-emerald-100 hover:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-500/10 focus-within:border-emerald-400"}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-emerald-500/10">O</span>
                          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Objective (O)</span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-light group-focus-within:text-emerald-400 transition-colors duration-200">Clinical data</span>
                      </div>
                      <textarea
                        className="w-full min-h-[148px] bg-transparent border-none outline-none font-sans text-xs text-stone-600 leading-relaxed resize-none font-light focus:ring-0 focus:outline-none"
                        value={soapObjective}
                        onChange={(e) => setSoapObjective(e.target.value)}
                        disabled={generatedSoap.status === "signed"}
                        placeholder="Observable signs, measurements, behaviors, and clinical test data..."
                      />
                    </div>

                    {/* Assessment */}
                    <div className={`bg-white border rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col gap-3 group
                      ${generatedSoap.status === "signed" 
                        ? "border-stone-200 bg-stone-50/20" 
                        : "border-amber-100 hover:border-amber-300 focus-within:ring-2 focus-within:ring-amber-500/10 focus-within:border-amber-400"}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-xl bg-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-amber-500/10">A</span>
                          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Assessment (A)</span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-light group-focus-within:text-amber-400 transition-colors duration-200">Therapist synthesis</span>
                      </div>
                      <textarea
                        className="w-full min-h-[148px] bg-transparent border-none outline-none font-sans text-xs text-stone-600 leading-relaxed resize-none font-light focus:ring-0 focus:outline-none"
                        value={soapAssessment}
                        onChange={(e) => setSoapAssessment(e.target.value)}
                        disabled={generatedSoap.status === "signed"}
                        placeholder="Clinical synthesis, prognosis, diagnosis, and progress assessment..."
                      />
                    </div>

                    {/* Plan */}
                    <div className={`bg-white border rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col gap-3 group
                      ${generatedSoap.status === "signed" 
                        ? "border-stone-200 bg-stone-50/20" 
                        : "border-violet-100 hover:border-violet-300 focus-within:ring-2 focus-within:ring-violet-500/10 focus-within:border-violet-400"}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-xl bg-violet-500 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-violet-500/10">P</span>
                          <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">Plan (P)</span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-light group-focus-within:text-violet-400 transition-colors duration-200">Interventions & steps</span>
                      </div>
                      <textarea
                        className="w-full min-h-[148px] bg-transparent border-none outline-none font-sans text-xs text-stone-600 leading-relaxed resize-none font-light focus:ring-0 focus:outline-none"
                        value={soapPlan}
                        onChange={(e) => setSoapPlan(e.target.value)}
                        disabled={generatedSoap.status === "signed"}
                        placeholder="Future treatments, referrals, goals, homework, and next session details..."
                      />
                    </div>

                    {/* Signed & Sealed clinical certification block */}
                    {generatedSoap.status === "signed" && (
                      <div className="col-span-1 md:col-span-2 mt-2 bg-gradient-to-r from-sage/5 to-emerald-50/10 border border-sage/20 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeUp">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-sage/10 text-sage flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-sage" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-ink">Sealed & Finalized</h4>
                            <p className="text-[10px] text-stone-400 font-light mt-0.5">
                              Digitally signed by <span className="font-semibold text-stone-600">{generatedSoap.signedBy || "Therapist"}</span> on {generatedSoap.signedAt ? new Date(generatedSoap.signedAt).toLocaleString() : new Date().toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[9px] font-mono text-stone-300 bg-stone-100/50 px-2.5 py-1 rounded-md tracking-wider select-all block">
                            SHA-256: {generatedSoap.id.substring(0, 16).toUpperCase()}
                          </span>
                          <span className="text-[8px] text-stone-400 font-light block mt-1 uppercase tracking-widest">
                            HIPAA SECURE & LOCK VERIFIED
                          </span>
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="bg-white border border-stone-200/70 rounded-2xl py-16 text-center text-stone-400 text-xs font-light space-y-2.5 mt-4 hover:border-stone-300 transition duration-300">
                    <p className="font-semibold text-stone-500">No SOAP note yet.</p>
                    <p className="text-[10px] text-stone-400 max-w-xs mx-auto">Write session notes above and click Generate.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white border border-stone-200/70 p-16 rounded-2xl text-center shadow-sm space-y-4 hover:border-stone-300 transition duration-300">
              <div className="w-12 h-12 bg-sage-light text-sage rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif text-xl font-normal text-stone-700">No session loaded</h3>
                <p className="text-xs text-stone-400 font-light max-w-sm mx-auto">Select a patient and choose a session to start writing notes.</p>
              </div>
              <button 
                onClick={onBookSessionClick}
                className="px-5 py-2.5 bg-sage hover:bg-sage/95 text-white text-xs font-bold rounded-xl shadow-md transition inline-flex items-center gap-2 cursor-pointer"
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Book Session</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
