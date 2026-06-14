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
  userApiKey: string;
  setUserApiKey: (val: string) => void;
  showApiKeyBanner: boolean;
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
  handleSaveApiKey: () => void;
  handleGenerateSoap: () => void;
  handleSaveDraft: () => void;
  handleSignAndLock: () => void;
  onBookSessionClick: () => void;
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
  userApiKey,
  setUserApiKey,
  showApiKeyBanner,
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
  handleSaveApiKey,
  handleGenerateSoap,
  handleSaveDraft,
  handleSignAndLock,
  onBookSessionClick
}: NotesViewProps) {
  const filteredClientsForNotes = clients.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchClientQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl animate-fadeUp space-y-4">
      {/* API KEY BANNER IF ABSENT */}
      {showApiKeyBanner && (
        <div className="bg-amber-light border border-amber/25 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber/10 flex items-center justify-center text-amber flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber">Direct AI Generation Mode</h4>
              <p className="text-[11px] text-stone-600 font-light mt-0.5">Add your Anthropic sk-ant-... API key to generate premium Claude SOAP notes, or use our smart simulator.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              className="flex-1 sm:w-48 px-3 py-1.5 bg-white border border-amber/30 rounded-lg text-xs outline-none focus:border-amber"
              type="password"
              placeholder="sk-ant-..."
              value={userApiKey}
              onChange={(e) => setUserApiKey(e.target.value)}
            />
            <button 
              onClick={handleSaveApiKey}
              className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-850 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer whitespace-nowrap"
            >
              Save Key
            </button>
          </div>
        </div>
      )}

      {/* TWO PANEL NOTES LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: CLIENT LIST SELECTOR */}
        <div className="lg:col-span-3 bg-white border border-stone-200/70 rounded-xl overflow-hidden shadow-sm flex flex-col max-h-[750px]">
          <div className="p-4 border-b border-stone-150 space-y-3">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Clinical Client List</h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                className="w-full pl-8 pr-3 py-1.8 bg-stone-100 border border-stone-200 rounded-lg text-xs text-ink outline-none focus:bg-white focus:border-stone-400 transition-all"
                type="text"
                placeholder="Search clients..."
                value={searchClientQuery}
                onChange={(e) => setSearchClientQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto divide-y divide-stone-100 flex-1 max-h-[500px] lg:max-h-[600px]">
            {filteredClientsForNotes.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400 font-light">
                No clinical clients found.
              </div>
            ) : (
              filteredClientsForNotes.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedClientForNotes(c)}
                  className={`p-3.5 flex flex-col gap-0.5 cursor-pointer transition-all duration-150
                    ${selectedClientForNotes?.id === c.id ? "bg-sage-light/75 border-l-3 border-sage" : "hover:bg-stone-50"}`}
                >
                  <span className="text-xs font-semibold text-ink">{c.firstName} {c.lastName}</span>
                  <span className="text-[10px] text-stone-400">View notes history & logs</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN NOTES AND SOAP EDITOR */}
        <div className="lg:col-span-9 space-y-5">
          {/* PATIENT HEADER & ACTION COMMAND BAR */}
          <div className="bg-white border border-stone-200/70 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div>
              <h2 className="font-serif text-2xl font-normal text-ink">
                {selectedClientForNotes
                  ? `${selectedClientForNotes.firstName} ${selectedClientForNotes.lastName}`
                  : "Select client from side list"}
              </h2>
              <p className="text-[11px] text-stone-400 mt-1">
                {selectedSessionForNotes
                  ? `Selected Session: ${new Date(selectedSessionForNotes.scheduledAt).toLocaleDateString()} @ ${new Date(
                      selectedSessionForNotes.scheduledAt
                    ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : "Choose an active clinical session to load records"}
              </p>
            </div>

            {selectedClientForNotes && clientSessions.length > 0 && (
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-stone-500 font-medium whitespace-nowrap">Session:</span>
                <select
                  className="px-3 py-1.8 bg-stone-50 border border-stone-200 rounded-lg text-xs text-ink outline-none focus:border-stone-400"
                  value={selectedSessionForNotes?.id || ""}
                  onChange={(e) => {
                    const sess = clientSessions.find((s) => s.id === e.target.value);
                    if (sess) setSelectedSessionForNotes(sess);
                  }}
                >
                  {clientSessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {new Date(s.scheduledAt).toLocaleDateString()} ({s.sessionType.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {generatedSoap && (
              <div className="flex gap-2">
                <button
                  className="px-3 py-1.8 border border-stone-200 hover:border-ink rounded-lg text-xs font-semibold text-stone-700 hover:text-ink transition shadow-sm cursor-pointer disabled:opacity-50"
                  disabled={generatedSoap.status === "signed"}
                  onClick={handleSaveDraft}
                >
                  Save Draft
                </button>
                <button
                  className="px-3.5 py-1.8 bg-sage hover:bg-sage/95 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-70"
                  disabled={generatedSoap.status === "signed"}
                  onClick={handleSignAndLock}
                >
                  {generatedSoap.status === "signed" ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Signed & Locked</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Sign & Lock</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {selectedSessionForNotes ? (
            <>
              {/* RAW NOTES SECTION */}
              <div className="bg-white border border-stone-200/70 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="px-5 py-3.5 bg-stone-50 border-b border-stone-150 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-stone-400" />
                  <span className="text-xs font-semibold text-stone-600">Therapist Session Shorthand & Transcript</span>
                </div>
                <textarea
                  className="w-full min-h-[140px] p-5 border-none outline-none font-sans text-xs text-ink leading-relaxed resize-y bg-white placeholder-stone-400"
                  placeholder="Type shorthand session logs, shorthand transcripts, or active clinical impressions here... (e.g. 'Client expresses deep worry regarding work responsibilities. Applied breathing interventions. Symptoms reduced, alliance strong.')"
                  value={rawNotesContent}
                  onChange={(e) => setRawNotesContent(e.target.value)}
                  disabled={generatedSoap?.status === "signed"}
                ></textarea>
                <div className="px-5 py-3 border-t border-stone-150 bg-stone-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <span className="text-[11px] text-stone-400 font-light">
                    AI processes shorthand notes to structure formal HIPAA templates.
                  </span>
                  <button
                    onClick={handleGenerateSoap}
                    disabled={isGenerating || generatedSoap?.status === "signed"}
                    className="w-full sm:w-auto px-5 py-2 bg-ink hover:bg-sage text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isGenerating ? "Processing Clinical AI Note..." : "Generate SOAP Note"}</span>
                  </button>
                </div>
              </div>

              {/* SOAP NOTE RENDER FIELDS */}
              <div className="bg-white border border-stone-200/70 rounded-xl overflow-hidden shadow-sm flex flex-col">
                {/* SOAP NOTE CARD HEADER */}
                <div className={`px-5 py-3.5 border-b flex items-center justify-between
                  ${generatedSoap?.status === "signed" ? "bg-sage-light/35 border-sage/10" : "bg-stone-50 border-stone-150"}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isGenerating ? "bg-sage animate-ping" : generatedSoap ? "bg-sage" : "bg-stone-400"}`}></span>
                    <span className={`text-xs font-bold uppercase tracking-wider
                      ${generatedSoap?.status === "signed" ? "text-sage" : "text-stone-600"}`}>
                      {generatedSoap
                        ? `SOAP Note Status: ${generatedSoap.status.toUpperCase()} (${generatedSoap.generationModel})`
                        : "SOAP Note Fields Layout"}
                    </span>
                  </div>
                  {generatedSoap?.status === "signed" && (
                    <div className="flex items-center gap-1.5 text-xs text-sage font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Signed & Sealed</span>
                    </div>
                  )}
                </div>

                {/* SOAP NOTE CARDS GRID */}
                {generatedSoap ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-150">
                    {/* SUBJECTIVE */}
                    <div className="p-5 flex flex-col gap-2.5 border-b border-stone-150">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-sage-light text-sage font-bold text-xs flex items-center justify-center">S</span>
                        <span className="text-xs font-semibold text-ink uppercase tracking-wide">Subjective</span>
                      </div>
                      <textarea
                        className="w-full min-h-[120px] bg-transparent border-none outline-none font-sans text-xs text-stone-700 leading-relaxed resize-none"
                        value={soapSubjective}
                        onChange={(e) => setSoapSubjective(e.target.value)}
                        disabled={generatedSoap.status === "signed"}
                      />
                    </div>

                    {/* OBJECTIVE */}
                    <div className="p-5 flex flex-col gap-2.5 border-b border-stone-150">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-sage-light text-sage font-bold text-xs flex items-center justify-center">O</span>
                        <span className="text-xs font-semibold text-ink uppercase tracking-wide">Objective</span>
                      </div>
                      <textarea
                        className="w-full min-h-[120px] bg-transparent border-none outline-none font-sans text-xs text-stone-700 leading-relaxed resize-none"
                        value={soapObjective}
                        onChange={(e) => setSoapObjective(e.target.value)}
                        disabled={generatedSoap.status === "signed"}
                      />
                    </div>

                    {/* ASSESSMENT */}
                    <div className="p-5 flex flex-col gap-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-sage-light text-sage font-bold text-xs flex items-center justify-center">A</span>
                        <span className="text-xs font-semibold text-ink uppercase tracking-wide">Assessment</span>
                      </div>
                      <textarea
                        className="w-full min-h-[120px] bg-transparent border-none outline-none font-sans text-xs text-stone-700 leading-relaxed resize-none"
                        value={soapAssessment}
                        onChange={(e) => setSoapAssessment(e.target.value)}
                        disabled={generatedSoap.status === "signed"}
                      />
                    </div>

                    {/* PLAN */}
                    <div className="p-5 flex flex-col gap-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-sage-light text-sage font-bold text-xs flex items-center justify-center">P</span>
                        <span className="text-xs font-semibold text-ink uppercase tracking-wide">Plan</span>
                      </div>
                      <textarea
                        className="w-full min-h-[120px] bg-transparent border-none outline-none font-sans text-xs text-stone-700 leading-relaxed resize-none"
                        value={soapPlan}
                        onChange={(e) => setSoapPlan(e.target.value)}
                        disabled={generatedSoap.status === "signed"}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-stone-400 text-xs font-light space-y-2">
                    <p>Type raw therapist session shorthand notes above and click "Generate SOAP Note".</p>
                    <p className="text-[10px] text-stone-300">The structured clinically-structured SOAP format will render here.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white border border-stone-200/70 p-12 rounded-xl text-center shadow-sm space-y-3">
              <h3 className="font-serif text-xl font-normal text-stone-600">No active session selected</h3>
              <p className="text-xs text-stone-400 font-light max-w-sm mx-auto">Please select a patient from the sidebar and schedule or choose an appointment to write notes.</p>
              <button 
                onClick={onBookSessionClick}
                className="px-4 py-2 bg-sage hover:bg-sage/95 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition inline-flex items-center gap-1.5"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Book Session</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
