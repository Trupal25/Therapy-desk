"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { Client } from "@/app/app/_hooks/useClients"
import { Session } from "@/app/app/_hooks/useSessions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ClientsViewProps {
  clients: Client[]
  sessions: Session[]
  onAddClientClick: () => void
  onOpenHistoryModal: (c: Client) => void
  isLoading?: boolean
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
]

export function ClientsView({
  clients, sessions, onAddClientClick, onOpenHistoryModal, isLoading = false,
}: ClientsViewProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients
    const q = searchQuery.toLowerCase()
    return clients.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.referralSource?.toLowerCase().includes(q)
    )
  }, [clients, searchQuery])

  return (
    <div className="animate-fadeUp space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-normal text-foreground text-balance">Patients</h2>
          <p className="text-sm text-muted-foreground font-medium mt-0.5">
            {isLoading ? "Loading..." : `${filteredClients.length} patient${filteredClients.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button onClick={onAddClientClick} size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Add Patient
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search patients by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={`skeleton-${i}`} className="border-0 animate-pulse">
              <CardContent className="p-4 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-muted rounded w-2/3" />
                    <div className="h-2.5 bg-muted rounded w-1/2" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="space-y-1">
                    <div className="h-2 bg-muted rounded w-12" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 bg-muted rounded w-16" />
                    <div className="h-3 bg-muted rounded w-14" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredClients.length === 0 ? (
          <Card className="col-span-full border-0">
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-bold text-foreground">
                {searchQuery ? "No patients match your search" : "No patients yet"}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-xs leading-relaxed">
                {searchQuery
                  ? "Try a different name or check your spelling."
                  : "Add your first patient to start scheduling sessions and generating SOAP notes."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((c) => {
            const clientSessions = sessions.filter((s) => s.clientId === c.id)
            const clientSessionsCount = clientSessions.length
            const lastSessionDate = clientSessions.length > 0
              ? new Date(Math.max(...clientSessions.map((s) => new Date(s.scheduledAt).getTime())))
              : null
            const palette = AVATAR_COLORS[(c.firstName.charCodeAt(0) + c.lastName.charCodeAt(0)) % AVATAR_COLORS.length]
            return (
              <Link href={`/app/patients/${c.id}`} key={c.id} className="block">
                <Card
                  className="border-0 cursor-pointer transition-colors hover:bg-stone-light h-full"
                >
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={cn("text-xs font-bold", palette)}>
                        {c.firstName[0]}{c.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-foreground truncate">
                        {c.firstName} {c.lastName}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5 font-medium truncate">
                        {new Date(c.dateOfBirth).toLocaleDateString(undefined, {
                          month: "short", day: "numeric", year: "numeric",
                        })} · {c.referralSource || "Self-referred"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium">
                      {clientSessionsCount} session{clientSessionsCount !== 1 ? "s" : ""}
                    </span>
                    {lastSessionDate && (
                      <span>
                        Last {lastSessionDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
