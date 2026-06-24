"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Search, LayoutDashboard, FileText, Calendar, Users, Settings, Plus,
  Sparkles, UserPlus
} from "lucide-react"
import { Client } from "@/app/app/_hooks/useClients"

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  clients: Client[]
  onNewClient: () => void
  onQuickGenerate?: () => void
}

export function CommandPalette({
  isOpen, onClose, clients, onNewClient
}: CommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (!isOpen) setQuery("")
  }, [isOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [isOpen, onClose])

  const filteredClients = query.trim()
    ? clients.filter((c) =>
        (c.firstName + " " + c.lastName).toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : clients.slice(0, 6)

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/app/dashboard" },
    { label: "Notes", icon: FileText, path: "/app/notes" },
    { label: "Calendar", icon: Calendar, path: "/app/schedule" },
    { label: "Patients", icon: Users, path: "/app/clients" },
    { label: "Settings", icon: Settings, path: "/app/settings" },
  ]

  const filteredNav = navItems.filter((n) =>
    n.label.toLowerCase().includes(query.toLowerCase())
  )

  const navigate = (path: string) => {
    router.push(path)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 w-full max-w-lg rounded-2xl border border-border bg-white shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search patients, pages, actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {/* Pages */}
          {filteredNav.length > 0 && (
            <div className="mb-2">
              <p className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pages</p>
              {filteredNav.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm hover:bg-muted transition-colors text-left"
                >
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Patients */}
          {filteredClients.length > 0 && (
            <div className="mb-2">
              <p className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Patients</p>
              {filteredClients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate("/app/patients/" + c.id)}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm hover:bg-muted transition-colors text-left"
                >
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-[10px] font-bold text-primary">
                    {c.firstName[0]}{c.lastName[0]}
                  </div>
                  <span className="font-medium">{c.firstName} {c.lastName}</span>
                  {c.referralSource && (
                    <span className="text-xs text-muted-foreground truncate">{c.referralSource}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <p className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Quick Actions</p>
            <button
              onClick={() => { navigate("/app/schedule"); onClose() }}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm hover:bg-muted transition-colors text-left"
            >
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Plus className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="font-medium">Book Session</span>
              <span className="text-xs text-muted-foreground ml-auto">Calendar</span>
            </button>
            <button
              onClick={() => { onNewClient(); onClose() }}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm hover:bg-muted transition-colors text-left"
            >
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <UserPlus className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="font-medium">Add Patient</span>
              <span className="text-xs text-muted-foreground ml-auto">Cmd+N</span>
            </button>
          </div>

          {query.trim() && filteredNav.length === 0 && filteredClients.length === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No results for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
