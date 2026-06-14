import { Plus } from "lucide-react";
import { Client } from "../hooks/useClients";
import { Session } from "../hooks/useSessions";

interface ClientsViewProps {
  clients: Client[];
  sessions: Session[];
  onAddClientClick: () => void;
  onOpenHistoryModal: (c: Client) => void;
}

export function ClientsView({
  clients,
  sessions,
  onAddClientClick,
  onOpenHistoryModal
}: ClientsViewProps) {
  return (
    <div className="max-w-6xl animate-fadeUp space-y-6">
      {/* CLIENTS TAB HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-normal text-ink">My Client Directory</h2>
          <p className="text-xs text-stone-400 font-light mt-0.5">{clients.length} active therapeutic patients registered</p>
        </div>
        <button 
          onClick={onAddClientClick}
          className="px-4.5 py-2.5 bg-sage hover:bg-sage/95 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Patient</span>
        </button>
      </div>

      {/* CLIENTS GRID LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.length === 0 ? (
          <div className="col-span-full bg-white border border-stone-200/70 p-12 rounded-xl text-center text-stone-400 text-xs font-light">
            No clients registered yet. Add client profiles to start draft notes.
          </div>
        ) : (
          clients.map((c) => {
            const clientSessionsCount = sessions.filter((s) => s.clientId === c.id).length;
            return (
              <div 
                key={c.id} 
                onClick={() => onOpenHistoryModal(c)}
                className="bg-white border border-stone-200/70 rounded-xl p-5 shadow-sm hover:border-sage-mid hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between gap-4 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-sage-light text-sage flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                    {c.firstName[0]}{c.lastName[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-ink group-hover:text-sage transition">{c.firstName} {c.lastName}</h4>
                    <p className="text-[10px] text-stone-400 mt-1">
                      DOB: {new Date(c.dateOfBirth).toLocaleDateString()} · {c.gender || "General"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3.5 border-t border-stone-100 mt-1 text-[11px] text-stone-500">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-stone-400 font-semibold">Total Sessions</span>
                    <span className="font-semibold text-ink font-serif text-sm mt-0.5">
                      {clientSessionsCount} sessions
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-stone-400 font-semibold">Referral</span>
                    <span className="font-semibold text-ink text-xs mt-0.5">{c.referralSource || "Self-referred"}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
