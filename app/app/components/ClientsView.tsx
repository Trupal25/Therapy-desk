import { Plus, Users } from "lucide-react";
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
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-normal text-ink">Client Directory</h2>
          <p className="text-xs text-stone-400 font-light mt-0.5">{clients.length} patients</p>
        </div>
        <button 
          onClick={onAddClientClick}
          className="px-5 py-2.5 bg-sage hover:bg-sage/95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-sage/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Patient</span>
        </button>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {clients.length === 0 ? (
          <div className="col-span-full bg-white border border-stone-200/70 p-16 rounded-2xl text-center text-stone-400 text-xs font-light hover:border-stone-300 transition">
            <div className="w-12 h-12 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-center mx-auto mb-4 text-stone-400">
              <Users className="w-6 h-6" />
            </div>
            <p className="font-semibold text-stone-500">No patients yet.</p>
            <p className="text-[10px] text-stone-400 mt-1 max-w-xs mx-auto">Add a patient to start scheduling sessions and writing notes.</p>
          </div>
        ) : (
          clients.map((c) => {
            const clientSessionsCount = sessions.filter((s) => s.clientId === c.id).length;
            return (
              <div 
                key={c.id} 
                onClick={() => onOpenHistoryModal(c)}
                className="bg-white border border-stone-200/70 rounded-2xl p-5 shadow-sm hover:border-sage-mid hover:shadow-lg cursor-pointer transition-all duration-300 flex flex-col justify-between gap-4 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-sage-light text-sage flex items-center justify-center font-bold text-xs uppercase shadow-inner group-hover:bg-sage group-hover:text-white transition duration-200">
                    {c.firstName[0]}{c.lastName[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink group-hover:text-sage transition">{c.firstName} {c.lastName}</h4>
                    <p className="text-[10px] text-stone-400 mt-1 font-light">
                      DOB: {new Date(c.dateOfBirth).toLocaleDateString()} · {c.gender || "General Focus"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3.5 border-t border-stone-100 mt-1 text-[11px] text-stone-500 font-semibold">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-stone-400 font-bold">Total Sessions</span>
                    <span className="font-bold text-ink font-serif text-sm mt-0.5">
                      {clientSessionsCount} sessions
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-stone-400 font-bold">Referral Source</span>
                    <span className="font-semibold text-stone-600 text-xs mt-0.5">{c.referralSource || "Self-referred"}</span>
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
