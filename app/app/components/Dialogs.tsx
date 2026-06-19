import { Calendar as CalendarIcon, Lock, Unlock, X } from "lucide-react";
import { Client } from "../hooks/useClients";

interface AddClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newClientName: string;
  setNewClientName: (val: string) => void;
  newClientAge: string;
  setNewClientAge: (val: string) => void;
  newClientType: string;
  setNewClientType: (val: string) => void;
  newClientNotes: string;
  setNewClientNotes: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving?: boolean;
}

export function AddClientDialog({
  isOpen,
  onClose,
  newClientName,
  setNewClientName,
  newClientAge,
  setNewClientAge,
  newClientType,
  setNewClientType,
  newClientNotes,
  setNewClientNotes,
  onSubmit,
  isSaving = false
}: AddClientDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-stone-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 w-full max-w-[420px] shadow-2xl transition-all duration-300 transform translate-y-0 scale-100 animate-fu space-y-4 font-sans">
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-150">
          <h3 className="font-serif text-xl font-normal text-zinc-900">Register Patient Profile</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-950 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">Full Name</label>
            <input
              className="w-full px-3.5 py-2 bg-transparent border border-zinc-200 rounded-lg text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm transition disabled:opacity-50 disabled:pointer-events-none"
              type="text"
              placeholder="e.g. Riya Shah"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              required
              disabled={isSaving}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700">Age</label>
              <input
                className="w-full px-3.5 py-2 bg-transparent border border-zinc-200 rounded-lg text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm transition disabled:opacity-50 disabled:pointer-events-none"
                type="number"
                placeholder="28"
                value={newClientAge}
                onChange={(e) => setNewClientAge(e.target.value)}
                required
                disabled={isSaving}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700">Clinical Focus Type</label>
              <select
                className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                value={newClientType}
                onChange={(e) => setNewClientType(e.target.value)}
                disabled={isSaving}
              >
                <option>CBT</option>
                <option>Anxiety</option>
                <option>Trauma</option>
                <option>Depression</option>
                <option>General</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">Clinical Notes (optional)</label>
            <input
              className="w-full px-3.5 py-2 bg-transparent border border-zinc-200 rounded-lg text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm transition disabled:opacity-50 disabled:pointer-events-none"
              type="text"
              placeholder="Referral notes, conditions, special observations..."
              value={newClientNotes}
              onChange={(e) => setNewClientNotes(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              className="flex-1 py-2 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50 text-xs font-semibold rounded-lg text-zinc-700 hover:text-zinc-950 transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              type="button"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-semibold rounded-lg shadow transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none" 
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Create Patient File"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editClientName: string;
  setEditClientName: (val: string) => void;
  editClientAge: string;
  setEditClientAge: (val: string) => void;
  editClientType: string;
  setEditClientType: (val: string) => void;
  editClientNotes: string;
  setEditClientNotes: (val: string) => void;
  editClientError: string;
  onSubmit: (e: React.FormEvent) => void;
  isSaving?: boolean;
}

export function EditClientDialog({
  isOpen,
  onClose,
  editClientName,
  setEditClientName,
  editClientAge,
  setEditClientAge,
  editClientType,
  setEditClientType,
  editClientNotes,
  setEditClientNotes,
  editClientError,
  onSubmit,
  isSaving = false
}: EditClientDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-stone-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300 font-sans">
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 w-full max-w-[420px] shadow-2xl transition-all duration-300 transform translate-y-0 scale-100 animate-fu space-y-4">
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-150">
          <h3 className="font-serif text-xl font-normal text-zinc-900">Update Client Details</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-950 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">Full Name</label>
            <input
              className="w-full px-3.5 py-2 bg-transparent border border-zinc-200 rounded-lg text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm transition disabled:opacity-50 disabled:pointer-events-none"
              type="text"
              placeholder="e.g. Riya Shah"
              value={editClientName}
              onChange={(e) => setEditClientName(e.target.value)}
              required
              disabled={isSaving}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700">Age</label>
              <input
                className="w-full px-3.5 py-2 bg-transparent border border-zinc-200 rounded-lg text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm transition disabled:opacity-50 disabled:pointer-events-none"
                type="number"
                placeholder="28"
                value={editClientAge}
                onChange={(e) => setEditClientAge(e.target.value)}
                required
                disabled={isSaving}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700">Focus Type</label>
              <select
                className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                value={editClientType}
                onChange={(e) => setEditClientType(e.target.value)}
                disabled={isSaving}
              >
                <option>CBT</option>
                <option>Anxiety</option>
                <option>Trauma</option>
                <option>Depression</option>
                <option>General</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">Clinical Observations (optional)</label>
            <input
              className="w-full px-3.5 py-2 bg-transparent border border-zinc-200 rounded-lg text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm transition disabled:opacity-50 disabled:pointer-events-none"
              type="text"
              placeholder="Referral notes, conditions, special observations..."
              value={editClientNotes}
              onChange={(e) => setEditClientNotes(e.target.value)}
              disabled={isSaving}
            />
          </div>

          {editClientError && <div className="text-xs text-red font-medium">{editClientError}</div>}

          <div className="flex gap-3 pt-2">
            <button
              className="flex-1 py-2 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50 text-xs font-semibold rounded-lg text-zinc-700 hover:text-zinc-950 transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              type="button"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-semibold rounded-lg shadow transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none" 
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface HistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  historyClient: Client | null;
  historyList: any[];
  loadingHistory: boolean;
}

export function HistoryDialog({
  isOpen,
  onClose,
  historyClient,
  historyList,
  loadingHistory
}: HistoryDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-stone-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300 font-sans">
      <div className="bg-white border border-stone-200 rounded-2xl p-6 w-full max-w-[620px] shadow-2xl transition-all duration-300 transform flex flex-col max-h-[85vh] translate-y-0 scale-100 animate-fu space-y-4">
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-150 flex-shrink-0">
          <div>
            <h3 className="font-serif text-xl font-normal text-ink">Clinical SOAP Note History</h3>
            <p className="text-[11px] text-stone-400 font-light mt-1">
              Patient Scope: {historyClient ? `${historyClient.firstName} ${historyClient.lastName}` : ""}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 hover:text-ink transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-4.5 flex-1 pr-1.5 scrollbar-thin">
          {loadingHistory ? (
            <div className="py-12 text-center text-stone-400 text-xs font-light animate-pulse">
              Decrypting clinical session files...
            </div>
          ) : historyList.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs font-light">
              No session note histories found in active vault.
            </div>
          ) : (
            historyList.map((item: any) => (
              <div
                key={item.sessionId}
                className="border border-stone-200/80 rounded-2xl p-5 bg-stone-50/35 hover:bg-stone-50/60 hover:border-stone-300 transition-all duration-300 relative space-y-3"
              >
                <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
                  <span className="text-xs font-bold text-sage flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-sage" />
                    <span>{new Date(item.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </span>
                  <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1
                    ${item.soapNote?.status === "signed" ? "bg-sage-light text-sage border border-sage/10" : "bg-amber-light text-amber border border-amber/10"}`}>
                    {item.soapNote?.status === "signed" ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                    <span>{item.soapNote?.status || "no note"}</span>
                  </span>
                </div>

                {item.soapNote ? (
                  <div className="space-y-4 text-xs text-stone-600 leading-relaxed font-light">
                    <div className="space-y-1">
                      <span className="font-bold text-sage uppercase text-[9px] tracking-widest block">Subjective (S)</span>
                      <p className="text-stone-700 leading-relaxed bg-white border border-stone-150 p-3 rounded-xl shadow-inner-sm">{item.soapNote.subjective}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-sage uppercase text-[9px] tracking-widest block">Objective (O)</span>
                      <p className="text-stone-700 leading-relaxed bg-white border border-stone-150 p-3 rounded-xl shadow-inner-sm">{item.soapNote.objective}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-sage uppercase text-[9px] tracking-widest block">Assessment (A)</span>
                      <p className="text-stone-700 leading-relaxed bg-white border border-stone-150 p-3 rounded-xl shadow-inner-sm">{item.soapNote.assessment}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-sage uppercase text-[9px] tracking-widest block">Plan (P)</span>
                      <p className="text-stone-700 leading-relaxed bg-white border border-stone-150 p-3 rounded-xl shadow-inner-sm">{item.soapNote.plan}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic">No formal SOAP notes compiled for this session appointment.</p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-stone-150 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-950 hover:bg-stone-850 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
          >
            Close Archive
          </button>
        </div>
      </div>
    </div>
  );
}
