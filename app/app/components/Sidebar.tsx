import { 
  LayoutDashboard, 
  FileText, 
  Calendar as CalendarIcon, 
  Users, 
  Settings as SettingsIcon, 
  LogOut 
} from "lucide-react";

interface SidebarProps {
  user: { fullName?: string } | null;
  profSpec: string;
  activeTab: "dashboard" | "notes" | "schedule" | "clients" | "settings";
  setActiveTab: (tab: "dashboard" | "notes" | "schedule" | "clients" | "settings") => void;
  apiConnected: boolean;
  onSignOut: () => void;
}

export function Sidebar({ user, profSpec, activeTab, setActiveTab, apiConnected, onSignOut }: SidebarProps) {
  if (!user) return null;
  
  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "DR";

  return (
    <aside className="w-full md:w-64 bg-stone-900 text-stone-300 flex-shrink-0 flex flex-col border-r border-stone-800 shadow-md">
      {/* LOGO AND BRANDING */}
      <div className="p-6 border-b border-stone-850 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-normal text-white tracking-tight">TherapyDesk</h2>
          <p className="text-[10px] text-stone-500 uppercase tracking-widest font-semibold mt-0.5">Solo Practitioner</p>
        </div>
        <div 
          className={`w-2.5 h-2.5 rounded-full ${apiConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} 
          title={apiConnected ? "Database Connected" : "Local Mock Mode"}
        ></div>
      </div>

      {/* PROFILE CHIP */}
      <div className="p-4 mx-4 my-3 bg-stone-850/50 rounded-xl border border-stone-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-sage text-white font-semibold text-xs flex items-center justify-center uppercase shadow-sm">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-semibold text-white truncate">{user.fullName || "Dr. Shah"}</h4>
          <p className="text-[10px] text-stone-500 truncate">{profSpec} Practitioner</p>
        </div>
      </div>

      {/* NAVIGATION LINKS */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer
            ${activeTab === "dashboard" ? "bg-sage text-white shadow-sm font-semibold" : "hover:bg-stone-800 text-stone-400 hover:text-white"}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab("notes")}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer
            ${activeTab === "notes" ? "bg-sage text-white shadow-sm font-semibold" : "hover:bg-stone-800 text-stone-400 hover:text-white"}`}
        >
          <FileText className="w-4 h-4" />
          <span>Session Notes</span>
        </button>
        <button
          onClick={() => setActiveTab("schedule")}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer
            ${activeTab === "schedule" ? "bg-sage text-white shadow-sm font-semibold" : "hover:bg-stone-800 text-stone-400 hover:text-white"}`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Schedule Calendar</span>
        </button>
        <button
          onClick={() => setActiveTab("clients")}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer
            ${activeTab === "clients" ? "bg-sage text-white shadow-sm font-semibold" : "hover:bg-stone-800 text-stone-400 hover:text-white"}`}
        >
          <Users className="w-4 h-4" />
          <span>My Clients</span>
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer
            ${activeTab === "settings" ? "bg-sage text-white shadow-sm font-semibold" : "hover:bg-stone-800 text-stone-400 hover:text-white"}`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </nav>

      {/* BOTTOM METRICS & LOGOUT */}
      <div className="p-4 border-t border-stone-850 space-y-3">
        <div className="flex flex-col gap-1 text-[11px] text-stone-500">
          <div className="flex items-center justify-between">
            <span>Status:</span>
            <span className={`font-semibold ${apiConnected ? "text-sage" : "text-amber"}`}>
              {apiConnected ? "DB Connected" : "Local Mock Mode"}
            </span>
          </div>
        </div>
        <button 
          className="w-full py-2 bg-stone-800 hover:bg-red-800/80 hover:text-white text-stone-400 font-medium text-xs rounded-lg transition-all duration-205 flex items-center justify-center gap-2 cursor-pointer border border-stone-750"
          onClick={onSignOut}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
