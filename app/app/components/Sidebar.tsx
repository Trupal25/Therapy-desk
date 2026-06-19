import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Calendar as CalendarIcon,
  Users,
  Settings as SettingsIcon,
  LogOut,
  PlusCircle,
  Search,
  ChevronRight,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  Lock,
  Unlock,
  Clock,
} from "lucide-react";

interface SidebarProps {
  user: { fullName?: string } | null;
  profSpec: string;
  activeTab: "dashboard" | "notes" | "schedule" | "clients" | "settings";
  setActiveTab: (tab: "dashboard" | "notes" | "schedule" | "clients" | "settings") => void;
  apiConnected: boolean;
  onSignOut: () => void;
  clients?: any[];
  recentSoapNotes?: any[];
  selectedClientForNotes?: any | null;
  onNewClientClick?: () => void;
  onSelectClient?: (client: any) => void;
  onSelectRecentNote?: (sessionId: string, clientName: string) => void;
}

export function Sidebar({
  user,
  profSpec,
  activeTab,
  setActiveTab,
  apiConnected,
  onSignOut,
  clients = [],
  recentSoapNotes = [],
  selectedClientForNotes = null,
  onNewClientClick,
  onSelectClient,
  onSelectRecentNote,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!user) return null;

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "DR";

  const menuItems = [
    { id: "dashboard" as const, label: "Overview", icon: LayoutDashboard },
    { id: "notes" as const, label: "Notes", icon: FileText },
    { id: "schedule" as const, label: "Calendar", icon: CalendarIcon },
    { id: "clients" as const, label: "Patients", icon: Users },
  ];

  // Last 3 recent notes for the sidebar shortcut list
  const recentNotes = recentSoapNotes.slice(0, 4);

  const renderSidebarContent = () => (
    <div className="h-full flex flex-col justify-between font-sans">

      {/* ── Upper Content ─────────────────────────────────────────────────── */}
      <div className="flex-grow flex flex-col min-h-0">

        {/* Logo + collapse toggle */}
        <div
          className={`p-4 flex items-center justify-between border-b border-zinc-200/50 ${
            isCollapsed ? "flex-col gap-3" : ""
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <svg className="w-5.5 h-5.5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10V2z" fill="#8B1E3F" />
              <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10V2z" fill="#C0392B" opacity="0.85" />
            </svg>
            {!isCollapsed && (
              <span className="font-bold text-zinc-900 tracking-tight text-[14px] leading-none flex items-center">
                TherapyDesk
                <span className="text-[9px] align-super font-normal text-zinc-400 ml-0.5">TM</span>
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition duration-200 cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <PanelLeft className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition duration-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable nav area */}
        <div className="flex-grow py-4 overflow-y-auto scrollbar-none space-y-4 px-2">

          {/* New Patient CTA */}
          <div>
            <button
              onClick={onNewClientClick}
              className={`flex items-center text-left text-[#8B1E3F] hover:bg-red-50/50 rounded-lg text-[13px] font-semibold transition duration-200 cursor-pointer w-full ${
                isCollapsed ? "justify-center p-2" : "gap-2.5 px-3 py-2"
              }`}
              title="New Patient"
            >
              <PlusCircle className="w-4.5 h-4.5 flex-shrink-0 text-[#8B1E3F]" />
              {!isCollapsed && <span>New Patient</span>}
            </button>
          </div>

          <hr className="border-t border-zinc-200/50 my-1 mx-2" />

          {/* Main navigation */}
          <div className="space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <div key={item.id} className="relative flex items-center w-full">
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 w-[3px] h-5 bg-[#8B1E3F] rounded-r-md z-20" />
                  )}
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileOpen(false);
                    }}
                    className={`w-full flex items-center rounded-lg text-[13px] transition-all duration-200 cursor-pointer relative group border border-transparent mx-1
                      ${isCollapsed ? "justify-center p-2.5" : "justify-between px-3 py-2"}
                      ${
                        isActive
                          ? "bg-[#eef0f3] text-zinc-900 font-semibold shadow-sm"
                          : "hover:bg-zinc-100/50 text-zinc-500 hover:text-zinc-900"
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4.5 h-4.5 flex-shrink-0 transition duration-200 ${
                          isActive ? "text-[#8B1E3F]" : "text-zinc-400 group-hover:text-zinc-600"
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!isCollapsed && isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Contextual sub-nav: when in Notes with a client selected */}
          {activeTab === "notes" && selectedClientForNotes && !isCollapsed && (
            <div className="mx-2">
              <div className="bg-zinc-50/80 border border-zinc-200/60 rounded-lg px-3 py-2.5 space-y-1">
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-2">
                  Active Patient
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center text-[8px] font-bold shrink-0">
                    {`${selectedClientForNotes.firstName?.[0] || ""}${selectedClientForNotes.lastName?.[0] || ""}`.toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-zinc-800 truncate">
                    {selectedClientForNotes.firstName} {selectedClientForNotes.lastName}
                  </span>
                </div>
              </div>
            </div>
          )}

          <hr className="border-t border-zinc-200/50 my-1 mx-2" />

          {/* Recent Notes list */}
          {!isCollapsed && (
            <div className="space-y-0.5">
              <h4 className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-2">
                Recent Notes
              </h4>
              {recentNotes.length === 0 ? (
                <p className="px-3 text-[11px] text-zinc-400 font-light">No notes yet.</p>
              ) : (
                recentNotes.map((note: any) => {
                  const isSigned = note.status === "signed";
                  return (
                    <button
                      key={note.sessionId}
                      onClick={() => {
                        if (onSelectRecentNote) {
                          onSelectRecentNote(note.sessionId, note.clientName);
                        }
                        setActiveTab("notes");
                        setIsMobileOpen(false);
                      }}
                      className="w-full flex items-center rounded-lg text-[12px] font-medium text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100/50 transition duration-200 cursor-pointer mx-1 gap-2.5 px-3 py-1.5"
                      title={note.clientName}
                    >
                      {isSigned ? (
                        <Lock className="w-3.5 h-3.5 flex-shrink-0 text-violet-400" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                      )}
                      <span className="truncate text-left flex-1">{note.clientName}</span>
                      <span className="text-[9px] text-zinc-400 shrink-0 font-medium tabular-nums">
                        {new Date(note.scheduledAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* Collapsed: just a Notes icon shortcut */}
          {isCollapsed && recentNotes.length > 0 && (
            <div className="space-y-1 flex flex-col items-center">
              <Clock className="w-4 h-4 text-zinc-300" />
            </div>
          )}

        </div>
      </div>

      {/* ── Footer Profile ─────────────────────────────────────────────────── */}
      <div className="p-3 border-t border-zinc-200/50 bg-[#f4f4f6]/60 flex flex-col gap-2">
        <div
          className={`flex items-center justify-between rounded-lg p-1 transition-all duration-200 group relative ${
            isCollapsed ? "flex-col gap-2.5 items-center" : ""
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-zinc-200 border border-zinc-300 text-zinc-700 font-semibold flex items-center justify-center text-[11px] flex-shrink-0 shadow-inner">
              {initials}
            </div>
            {!isCollapsed && (
              <div className="text-left min-w-0">
                <h4 className="text-[12px] font-bold text-zinc-800 truncate leading-tight">
                  {user.fullName || "Therapist"}
                </h4>
                <p className="text-[10px] text-zinc-400 truncate font-medium mt-0.5">
                  {profSpec || "General Practice"}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={onSignOut}
            className={`p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition duration-200 cursor-pointer border border-transparent hover:border-red-100 flex items-center justify-center ${
              isCollapsed ? "mx-auto w-8 h-8" : ""
            }`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top nav */}
      <header className="md:hidden flex items-center justify-between p-3.5 bg-[#f9f9fb] border-b border-zinc-200/60 sticky top-0 z-30 w-full font-sans">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10V2z" fill="#8B1E3F" />
            <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10V2z" fill="#C0392B" opacity="0.85" />
          </svg>
          <span className="font-bold text-zinc-900 tracking-tight text-[13px]">
            TherapyDesk
            <span className="text-[8px] align-super font-normal text-zinc-400">™</span>
          </span>
        </div>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition duration-200"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="fixed top-0 bottom-0 left-0 w-64 bg-[#f9f9fb] border-r border-zinc-200 z-50 animate-fadeRight md:hidden flex flex-col">
            {renderSidebarContent()}
          </aside>
        </>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 border-r border-zinc-200/60 bg-[#f9f9fb] relative z-10 transition-all duration-300 ease-in-out select-none min-h-screen ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {renderSidebarContent()}
      </aside>
    </>
  );
}
