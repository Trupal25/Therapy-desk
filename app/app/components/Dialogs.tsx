import { Calendar as CalendarIcon, Lock, Unlock } from "lucide-react";
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
  onSubmit
}: AddClientDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
      <div className="bg-white border border-stone-200 rounded-2xl p-6 w-full max-w-[420px] shadow-2xl transition-all duration-300 transform translate-y-0 scale-100 animate-fu">
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-150 mb-4">
          <h3 className="font-serif text-xl font-normal text-ink">Add New Client Patient</h3>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-ink transition cursor-pointer text-lg font-medium"
          >
            ×
          </button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-stone-600">Full Name</label>
            <input
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-ink outline-none focus:border-sage focus:bg-white"
              type="text"
              placeholder="e.g. Anika Mehta"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-600">Age</label>
              <input
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-ink outline-none focus:border-sage focus:bg-white"
                type="number"
                placeholder="28"
                value={newClientAge}
                onChange={(e) => setNewClientAge(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-600">Focus Type</label>
              <select
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-ink outline-none focus:border-sage focus:bg-white"
                value={newClientType}
                onChange={(e) => setNewClientType(e.target.value)}
              >
                <option>CBT</option>
                <option>Anxiety</option>
                <option>Trauma</option>
                <option>Depression</option>
                <option>General</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-stone-600">Clinical Notes (optional)</label>
            <input
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-ink outline-none focus:border-sage focus:bg-white"
              type="text"
              placeholder="Referral source, special conditions..."
              value={newClientNotes}
              onChange={(e) => setNewClientNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              className="px-4 py-2 border border-stone-200 hover:border-stone-400 text-xs font-semibold rounded-lg text-stone-700 hover:text-ink transition cursor-pointer"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="px-4.5 py-2 bg-sage hover:bg-sage/95 text-white text-xs font-semibold rounded-lg shadow transition cursor-pointer" 
              type="submit"
            >
              Create Client File
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
  onSubmit
}: EditClientDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
      <div className="bg-white border border-stone-200 rounded-2xl p-6 w-full max-w-[420px] shadow-2xl transition-all duration-300 transform translate-y-0 scale-100 animate-fu">
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-150 mb-4">
          <h3 className="font-serif text-xl font-normal text-ink">Edit Client Details</h3>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-ink transition cursor-pointer text-lg font-medium"
          >
            ×
          </button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-stone-600">Full Name</label>
            <input
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-ink outline-none focus:border-sage focus:bg-white"
              type="text"
              placeholder="e.g. Anika Mehta"
              value={editClientName}
              onChange={(e) => setEditClientName(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-600">Age</label>
              <input
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-ink outline-none focus:border-sage focus:bg-white"
                type="number"
                placeholder="28"
                value={editClientAge}
                onChange={(e) => setEditClientAge(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-600">Focus Type</label>
              <select
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-ink outline-none focus:border-sage focus:bg-white"
                value={editClientType}
                onChange={(e) => setEditClientType(e.target.value)}
              >
                <option>CBT</option>
                <option>Anxiety</option>
                <option>Trauma</option>
                <option>Depression</option>
                <option>General</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-stone-600">Notes (optional)</label>
            <input
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-ink outline-none focus:border-sage focus:bg-white"
              type="text"
              placeholder="Referral source, conditions..."
              value={editClientNotes}
              onChange={(e) => setEditClientNotes(e.target.value)}
            />
          </div>

          {editClientError && <div className="text-xs text-red font-medium">{editClientError}</div>}

          <div className="flex gap-2 justify-end pt-2">
            <button
              className="px-4 py-2 border border-stone-200 hover:border-stone-400 text-xs font-semibold rounded-lg text-stone-700 hover:text-ink transition cursor-pointer"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="px-4.5 py-2 bg-sage hover:bg-sage/95 text-white text-xs font-semibold rounded-lg shadow transition cursor-pointer" 
              type="submit"
            >
              Save Details
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
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
      <div className="bg-white border border-stone-200 rounded-2xl p-6 w-full max-w-[620px] shadow-2xl transition-all duration-300 transform flex flex-col max-h-[90vh] translate-y-0 scale-100 animate-fu">
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-150 mb-4 flex-shrink-0">
          <div>
            <h3 className="font-serif text-xl font-normal text-ink">Clinical SOAP Note History</h3>
            <p className="text-[10px] text-stone-400 font-light mt-0.5">
              Patient: {historyClient ? `${historyClient.firstName} ${historyClient.lastName}` : ""}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-ink transition cursor-pointer text-lg font-medium"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto space-y-4 flex-1 pr-1">
          {loadingHistory ? (
            <div className="py-8 text-center text-stone-400 text-xs font-light animate-pulse">Loading clinical archive files...</div>
          ) : historyList.length === 0 ? (
            <div className="py-8 text-center text-stone-400 text-xs font-light">No session note history found in database.</div>
          ) : (
            historyList.map((item: any) => (
              <div
                key={item.sessionId}
                className="border border-stone-200 rounded-xl p-4.5 bg-stone-50/50 hover:bg-stone-50 transition-all duration-200 relative"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-sage flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>{new Date(item.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1
                    ${item.soapNote?.status === "signed" ? "bg-sage-light text-sage border border-sage/10" : "bg-amber-light text-amber border border-amber/10"}`}>
                    {item.soapNote?.status === "signed" ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                    <span>{item.soapNote?.status || "no note"}</span>
                  </span>
                </div>

                {item.soapNote ? (
                  <div className="space-y-2.5 text-xs text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                    <div>
                      <span className="font-bold text-ink uppercase text-[9px] tracking-wide text-sage">Subjective (S)</span>
                      <p className="mt-0.5 text-stone-500 font-light">{item.soapNote.subjective}</p>
                    </div>
                    <div>
                      <span className="font-bold text-ink uppercase text-[9px] tracking-wide text-sage">Objective (O)</span>
                      <p className="mt-0.5 text-stone-500 font-light">{item.soapNote.objective}</p>
                    </div>
                    <div>
                      <span className="font-bold text-ink uppercase text-[9px] tracking-wide text-sage">Assessment (A)</span>
                      <p className="mt-0.5 text-stone-500 font-light">{item.soapNote.assessment}</p>
                    </div>
                    <div>
                      <span className="font-bold text-ink uppercase text-[9px] tracking-wide text-sage">Plan (P)</span>
                      <p className="mt-0.5 text-stone-500 font-light">{item.soapNote.plan}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic">No formal SOAP notes generated for this session.</p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-stone-150 mt-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-850 text-white font-semibold text-xs rounded-lg transition shadow cursor-pointer"
          >
            Close Archive
          </button>
        </div>
      </div>
    </div>
  );
}
