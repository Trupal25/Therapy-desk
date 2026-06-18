import { useState } from "react";
import { 
  LayoutDashboard, 
  FileText, 
  Calendar as CalendarIcon, 
  Users, 
  Settings as SettingsIcon, 
  LogOut,
  PlusCircle,
  Folder,
  Search,
  ChevronRight,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft
} from "lucide-react";

interface SidebarProps {
  user: { fullName?: string } | null;
  profSpec: string;
  activeTab: "dashboard" | "notes" | "schedule" | "clients" | "settings";
  setActiveTab: (tab: "dashboard" | "notes" | "schedule" | "clients" | "settings") => void;
  apiConnected: boolean;
  onSignOut: () => void;
  clients?: any[];
  onNewClientClick?: () => void;
  onSelectClient?: (client: any) => void;
}

export function Sidebar({ 
  user, 
  profSpec, 
  activeTab, 
  setActiveTab, 
  apiConnected, 
  onSignOut,
  clients = [],
  onNewClientClick,
  onSelectClient
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

  // Use dynamic clients from prop, fallback to mock data if empty
  const recentPatients = clients && clients.length > 0
    ? clients.slice(0, 5)
    : [
        { id: "mock1", firstName: "Liam", lastName: "Henderson" },
        { id: "mock2", firstName: "Sophia", lastName: "Martinez" },
        { id: "mock3", firstName: "Oliver", lastName: "Wright" },
        { id: "mock4", firstName: "Emma", lastName: "Harrison" },
        { id: "mock5", firstName: "Noah", lastName: "Sterling" }
      ];

  const menuItems = [
    { id: "dashboard" as const, label: "Overview", icon: LayoutDashboard },
    { id: "notes" as const, label: "Pipeline", icon: FileText, badge: "3" }, // Labeled as 'Pipeline' to match the screenshot style
    { id: "schedule" as const, label: "Calendar", icon: CalendarIcon },
    { id: "clients" as const, label: "Patients", icon: Users },
  ];

  // Helper function to render sidebar content
  const renderSidebarContent = () => (
    <div className="h-full flex flex-col justify-between font-sans">
      {/* Upper Content */}
      <div className="flex-grow flex flex-col min-h-0">
        {/* App Logo & Header */}
        <div className={`p-4 flex items-center justify-between border-b border-zinc-200/50 ${isCollapsed ? "flex-col gap-3" : ""}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Custom SVG logo: Red/Burgundy Split Semicircle emblem matching screenshot style */}
            <svg className="w-5.5 h-5.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          {/* Collapse/Expand Toggle on Desktop */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition duration-200 cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
          
          {/* Close button on Mobile */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition duration-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-grow py-4 overflow-y-auto scrollbar-none space-y-4 px-2">
          
          {/* Action / Quick Buttons */}
          <div className="space-y-1">
            <button 
              onClick={onNewClientClick}
              className={`flex items-center text-left text-[#8B1E3F] hover:bg-red-50/50 rounded-lg text-[13px] font-semibold transition duration-200 cursor-pointer w-full
                ${isCollapsed ? "justify-center p-2" : "gap-2.5 px-3 py-2"}`}
              title="New Patient"
            >
              <PlusCircle className="w-4.5 h-4.5 flex-shrink-0 text-[#8B1E3F]" />
              {!isCollapsed && <span>New Patient</span>}
            </button>

            <button 
              onClick={() => setActiveTab("clients")}
              className={`flex items-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-150/40 rounded-lg text-[13px] font-medium transition duration-200 cursor-pointer w-full
                ${isCollapsed ? "justify-center p-2" : "gap-2.5 px-3 py-1.5"}`}
              title="Patient Directory"
            >
              <Folder className="w-4.5 h-4.5 flex-shrink-0 text-zinc-400" />
              {!isCollapsed && <span>Patient Directory</span>}
            </button>

            <button 
              onClick={() => setActiveTab("notes")}
              className={`flex items-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-150/40 rounded-lg text-[13px] font-medium transition duration-200 cursor-pointer w-full
                ${isCollapsed ? "justify-center p-2" : "gap-2.5 px-3 py-1.5"}`}
              title="Search Patients"
            >
              <Search className="w-4.5 h-4.5 flex-shrink-0 text-zinc-400" />
              {!isCollapsed && <span>Search Patients</span>}
            </button>
          </div>

          <hr className="border-t border-zinc-200/50 my-3 mx-2" />

          {/* Navigation Group */}
          <div className="space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <div key={item.id} className="relative flex items-center w-full">
                  {/* Left edge burgundy vertical indicator bar matching screenshot */}
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
                      ${isActive 
                        ? "bg-[#eef0f3] text-zinc-900 font-semibold shadow-sm" 
                        : "hover:bg-zinc-150/40 text-zinc-500 hover:text-zinc-900"}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4.5 h-4.5 flex-shrink-0 transition duration-200 
                        ${isActive ? "text-[#8B1E3F]" : "text-zinc-400 group-hover:text-zinc-650"}`} 
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    
                    {!isCollapsed && (
                      <>
                        {/* Right side notification/badge indicator or active chevron */}
                        {isActive ? (
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                        ) : item.badge ? (
                          <span className="text-[10px] font-bold w-5 h-5 rounded-full bg-red-50 text-[#8B1E3F] border border-red-100 flex items-center justify-center flex-shrink-0">
                            {item.badge}
                          </span>
                        ) : null}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <hr className="border-t border-zinc-200/50 my-3 mx-2" />

          {/* Recent Patients List Group */}
          <div className="space-y-0.5">
            {!isCollapsed && (
              <h4 className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-2 mt-1">
                Recent Patients
              </h4>
            )}
            {recentPatients.map((patient: any) => {
              const fullName = patient.lastName 
                ? `${patient.firstName} ${patient.lastName}`
                : patient.firstName;
              return (
                <button
                  key={patient.id}
                  onClick={() => {
                    if (onSelectClient) {
                      onSelectClient(patient);
                    } else {
                      setActiveTab("notes");
                    }
                    setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center rounded-lg text-[13px] font-medium text-zinc-500 hover:text-zinc-950 hover:bg-zinc-150/40 transition duration-200 cursor-pointer mx-1
                    ${isCollapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-1.5"}`}
                  title={fullName}
                >
                  <Folder className="w-4.5 h-4.5 flex-shrink-0 text-zinc-400" />
                  {!isCollapsed && <span className="truncate">{fullName}</span>}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Footer Profile Section */}
      <div className="p-3 border-t border-zinc-200/50 bg-[#f4f4f6]/60 flex flex-col gap-2">
        <div className={`flex items-center justify-between rounded-lg p-1 transition-all duration-200 group relative ${isCollapsed ? "flex-col gap-2.5 items-center" : ""}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar Initials with clean styling */}
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
            className={`p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition duration-200 cursor-pointer border border-transparent hover:border-red-100 flex items-center justify-center
              ${isCollapsed ? "mx-auto w-8 h-8" : ""}`}
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
      {/* Mobile Top Navigation Header */}
      <header className="md:hidden flex items-center justify-between p-3.5 bg-[#f9f9fb] border-b border-zinc-200/60 sticky top-0 z-30 w-full font-sans">
        <div className="flex items-center gap-2">
          {/* Logo symbol */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10V2z" fill="#8B1E3F" />
            <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10V2z" fill="#C0392B" opacity="0.85" />
          </svg>
          <span className="font-bold text-zinc-900 tracking-tight text-[13px]">
            TherapyDesk<span className="text-[8px] align-super font-normal text-zinc-400">™</span>
          </span>
        </div>
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition duration-200"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile Drawer Slide-out Sheet (Overlay + Sidebar contents) */}
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Drawer Container */}
          <aside className="fixed top-0 bottom-0 left-0 w-64 bg-[#f9f9fb] border-r border-zinc-200 z-50 animate-fadeRight md:hidden flex flex-col">
            {renderSidebarContent()}
          </aside>
        </>
      )}

      {/* Desktop Main Sidebar (Standard responsive sidebar on md+ screens) */}
      <aside 
        className={`hidden md:flex flex-col flex-shrink-0 border-r border-zinc-200/60 bg-[#f9f9fb] relative z-10 transition-all duration-300 ease-in-out select-none min-h-screen
          ${isCollapsed ? "w-16" : "w-64"}`}
      >
        {renderSidebarContent()}
      </aside>
    </>
  );
}
