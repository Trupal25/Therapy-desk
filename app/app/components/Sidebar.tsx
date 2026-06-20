"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Calendar as CalendarIcon,
  Users,
  LogOut,
  PlusCircle,
  ChevronRight,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  Lock,
  FileEdit,
  Notebook,
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

const AVATAR_PALETTES = [
  { bg: "#EDE9FE", text: "#6D28D9" },
  { bg: "#D1FAE5", text: "#065F46" },
  { bg: "#FEE2E2", text: "#991B1B" },
  { bg: "#DBEAFE", text: "#1E40AF" },
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#FCE7F3", text: "#9D174D" },
  { bg: "#E0F2FE", text: "#0C4A6E" },
];

function getAvatarPalette(name: string) {
  const code = name.charCodeAt(0) || 65;
  return AVATAR_PALETTES[code % AVATAR_PALETTES.length];
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
    ? user.fullName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    : "DR";

  const menuItems = [
    { id: "dashboard" as const, label: "Overview", icon: LayoutDashboard },
    { id: "notes" as const, label: "Notes", icon: FileText },
    { id: "schedule" as const, label: "Calendar", icon: CalendarIcon },
    { id: "clients" as const, label: "Patients", icon: Users },
  ];

  const recentNotes = recentSoapNotes.slice(0, 5);

  const SidebarBody = () => (
    <div className="h-full flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Logo row */}
      <div
        className={`flex items-center border-b shrink-0 ${isCollapsed ? "flex-col gap-3 p-3 justify-center" : "justify-between p-4"}`}
        style={{ borderColor: "#EEECE8" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <svg className="shrink-0" style={{ width: 22, height: 22 }} viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10V2z" fill="#8B1E3F" />
            <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10V2z" fill="#C0392B" opacity="0.85" />
          </svg>
          {!isCollapsed && (
            <span style={{ fontSize: 13.5, fontWeight: 800, color: "#1A1A18", letterSpacing: "-0.01em" }}>
              TherapyDesk<sup style={{ fontSize: 8, fontWeight: 400, color: "#9B9590", marginLeft: 2 }}>™</sup>
            </span>
          )}
        </div>
        <button
          className="hidden md:flex items-center justify-center rounded-md transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand" : "Collapse"}
          style={{ padding: 5, background: "none", border: "none", cursor: "pointer", color: "#B8B3AD" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#3C3B38")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#B8B3AD")}
        >
          {isCollapsed ? <PanelLeft style={{ width: 15, height: 15 }} /> : <PanelLeftClose style={{ width: 15, height: 15 }} />}
        </button>
        <button
          className="md:hidden flex items-center"
          onClick={() => setIsMobileOpen(false)}
          style={{ padding: 5, background: "none", border: "none", cursor: "pointer", color: "#9B9590" }}
        >
          <X style={{ width: 16, height: 16 }} />
        </button>
      </div>

      {/* Nav body */}
      <div
        className="flex-1 overflow-y-auto flex flex-col gap-0.5"
        style={{ padding: isCollapsed ? "12px 8px" : "12px 10px" }}
      >

        {/* New Patient */}
        <button
          onClick={onNewClientClick}
          title="New Patient"
          className="w-full flex items-center rounded-xl transition-all shrink-0"
          style={{
            justifyContent: isCollapsed ? "center" : "flex-start",
            gap: 8,
            padding: isCollapsed ? "9px" : "9px 10px",
            marginBottom: 6,
            background: "none",
            border: "1px dashed #E8C5C8",
            color: "#8B1E3F",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#FDF2F4";
            (e.currentTarget as HTMLElement).style.borderColor = "#C0392B";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "none";
            (e.currentTarget as HTMLElement).style.borderColor = "#E8C5C8";
          }}
        >
          <PlusCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
          {!isCollapsed && <span>New Patient</span>}
        </button>

        {/* Nav items */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsMobileOpen(false); }}
              className="w-full flex items-center rounded-xl transition-all"
              title={item.label}
              style={{
                justifyContent: isCollapsed ? "center" : "space-between",
                gap: 9,
                padding: isCollapsed ? "9px" : "9px 10px",
                border: "none",
                background: isActive ? "#F0EEE9" : "transparent",
                color: isActive ? "#1A1A18" : "#6B6762",
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "#F5F3F0";
                  (e.currentTarget as HTMLElement).style.color = "#1A1A18";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#6B6762";
                }
              }}
            >
              <div className="flex items-center min-w-0" style={{ gap: 9 }}>
                <Icon style={{ width: 16, height: 16, flexShrink: 0, color: isActive ? "#8B1E3F" : "currentColor" }} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>
              {!isCollapsed && isActive && (
                <ChevronRight style={{ width: 13, height: 13, color: "#C5B8A8", flexShrink: 0 }} />
              )}
            </button>
          );
        })}

        {/* Recent Notes section */}
        {!isCollapsed && (
          <div style={{ marginTop: 20 }}>
            <div className="flex items-center justify-between" style={{ padding: "0 10px", marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#B8B3AD", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Recent Notes
              </span>
              {recentNotes.length > 0 && (
                <button
                  onClick={() => setActiveTab("notes")}
                  style={{ fontSize: 10, color: "#9B9590", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 500, padding: 0 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#1A1A18")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#9B9590")}
                >
                  See all →
                </button>
              )}
            </div>

            {recentNotes.length === 0 ? (
              <div
                className="flex items-center gap-3 rounded-xl"
                style={{ margin: "0 4px", padding: "13px 12px", border: "1px dashed #EEECE8" }}
              >
                <div
                  className="flex items-center justify-center rounded-lg shrink-0"
                  style={{ width: 30, height: 30, background: "#F5F3F0" }}
                >
                  <Notebook style={{ width: 14, height: 14, color: "#C5B8A8" }} />
                </div>
                <div>
                  <p style={{ fontSize: 11.5, fontWeight: 600, color: "#9B9590", margin: 0, lineHeight: 1.3 }}>
                    No notes yet
                  </p>
                  <p style={{ fontSize: 10.5, color: "#C5B8A8", margin: "2px 0 0", lineHeight: 1.4 }}>
                    Written notes will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {recentNotes.map((note: any) => {
                  const isSigned = note.status === "signed";
                  const pal = getAvatarPalette(note.clientName || "A");
                  const noteInitials = (note.clientName || "?")
                    .split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
                  return (
                    <button
                      key={note.sessionId}
                      onClick={() => {
                        if (onSelectRecentNote) onSelectRecentNote(note.sessionId, note.clientName);
                        setActiveTab("notes");
                        setIsMobileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl transition-colors text-left"
                      style={{ padding: "8px 10px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F3F0")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div
                        className="flex items-center justify-center rounded-lg shrink-0"
                        style={{ width: 28, height: 28, background: pal.bg, color: pal.text, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.03em" }}
                      >
                        {noteInitials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate" style={{ fontSize: 12, fontWeight: 600, color: "#3C3B38", margin: 0, lineHeight: 1.3 }}>
                          {note.clientName}
                        </p>
                        <p style={{ fontSize: 10.5, color: "#B8B3AD", margin: "2px 0 0" }}>
                          {new Date(note.scheduledAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      {isSigned
                        ? <Lock style={{ width: 11, height: 11, color: "#A78BFA", flexShrink: 0 }} />
                        : <FileEdit style={{ width: 11, height: 11, color: "#F59E0B", flexShrink: 0 }} />
                      }
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className={`flex items-center shrink-0 border-t ${isCollapsed ? "justify-center p-2" : "justify-between px-3 py-2.5"}`}
        style={{ borderColor: "#EEECE8", background: "#F5F3F0" }}
      >
        <div className="flex items-center min-w-0" style={{ gap: 9 }}>
          <div
            className="flex items-center justify-center rounded-full shrink-0"
            style={{ width: 32, height: 32, background: "#E2DED9", border: "1.5px solid #D0CBC4", color: "#3C3B38", fontWeight: 700, fontSize: 11 }}
          >
            {initials}
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate" style={{ fontSize: 12, fontWeight: 700, color: "#1A1A18", margin: 0, lineHeight: 1.2 }}>
                {user.fullName || "Therapist"}
              </p>
              <p className="truncate" style={{ fontSize: 10.5, color: "#9B9590", margin: "2px 0 0" }}>
                {profSpec || "General Practice"}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={onSignOut}
          title="Sign out"
          className="flex items-center justify-center rounded-md shrink-0 transition-colors"
          style={{ padding: 6, background: "none", border: "none", cursor: "pointer", color: "#C5B8A8" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#C0392B")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#C5B8A8")}
        >
          <LogOut style={{ width: 15, height: 15 }} />
        </button>
      </div>
    </div>
  );

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <>
      {/* ── Mobile top bar (hidden on md+) ─────────────────────────────── */}
      <header
        className="md:hidden flex items-center justify-between sticky top-0 z-30"
        style={{
          padding: "12px 16px",
          background: "#FAFAF8",
          borderBottom: "1px solid #EEECE8",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <div className="flex items-center" style={{ gap: 7 }}>
          <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10V2z" fill="#8B1E3F" />
            <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10V2z" fill="#C0392B" opacity="0.85" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#1A1A18" }}>
            TherapyDesk<sup style={{ fontSize: 7, fontWeight: 400, color: "#9B9590" }}>™</sup>
          </span>
        </div>
        <button
          onClick={() => setIsMobileOpen(true)}
          style={{ padding: 6, background: "none", border: "none", cursor: "pointer", color: "#6B6762" }}
        >
          <Menu style={{ width: 20, height: 20 }} />
        </button>
      </header>

      {/* ── Mobile drawer ───────────────────────────────────────────────── */}
      {isMobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(2px)" }}
            onClick={() => setIsMobileOpen(false)}
          />
          <aside
            className="md:hidden fixed top-0 bottom-0 left-0 z-50 flex flex-col animate-slideInLeft"
            style={{ width: 224, background: "#FAFAF8", borderRight: "1px solid #EEECE8" }}
          >
            <SidebarBody />
          </aside>
        </>
      )}

      {/* ── Desktop sidebar (hidden below md) ──────────────────────────── */}
      <aside
        className="hidden md:flex flex-col shrink-0 relative h-full"
        style={{
          width: isCollapsed ? 60 : 224,
          background: "#FAFAF8",
          borderRight: "1px solid #EEECE8",
          transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
          zIndex: 10,
        }}
      >
        <SidebarBody />
      </aside>
    </>
  );
}
