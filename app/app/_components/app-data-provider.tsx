"use client"

import React, { createContext, useContext, useCallback, useEffect, useState, useMemo } from "react"
import { useUser } from "@clerk/nextjs"
import { useClients } from "@/app/app/_hooks/useClients"
import { useSessions } from "@/app/app/_hooks/useSessions"
import { useSoapNote } from "@/app/app/_hooks/useSoapNote"
import { useSettings } from "@/app/app/_hooks/useSettings"
import { Client } from "@/app/app/_hooks/useClients"
import { Session } from "@/app/app/_hooks/useSessions"
import { toast } from "sonner"

const noopSetUser = () => {}

interface AppDataContextValue {
  user: {
    authenticated: boolean
    fullName: string
    userId: string
    role: string
  } | null
  clerkLoaded: boolean
  apiConnected: boolean
  clientsHook: ReturnType<typeof useClients>
  sessionsHook: ReturnType<typeof useSessions>
  soapNote: ReturnType<typeof useSoapNote>
  settings: ReturnType<typeof useSettings>
  recentSoapNotes: Array<{
    sessionId: string
    clientName: string
    scheduledAt: string
    status: string
    soapNoteId?: string
  }>
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

export function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) {
    throw new Error("useAppData must be used within AppDataProvider")
  }
  return context
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()
  const [apiConnected, setApiConnected] = useState(true)

  const showToast = useCallback((message: string, type?: "ok" | "err") => {
    if (type === "err") {
      toast.error(message)
    } else {
      toast.success(message)
    }
  }, [])

  const fetchRecentNotes = useCallback(() => {}, [])

  const clientsHook = useClients(showToast, fetchRecentNotes)
  const sessionsHook = useSessions(showToast, fetchRecentNotes)
  const settings = useSettings(showToast, noopSetUser as React.Dispatch<React.SetStateAction<any>>)

  const user = clerkUser
    ? {
        authenticated: true,
        fullName: clerkUser.fullName || `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Therapist",
        userId: clerkUser.id,
        role: "therapist",
      }
    : null

  const soapNote = useSoapNote(showToast, fetchRecentNotes, user)

  useEffect(() => {
    if (clerkUser) {
      const loadData = async () => {
        try {
          await Promise.all([
            clientsHook.fetchClients(),
            sessionsHook.fetchSessions(),
          ])
          setApiConnected(true)
        } catch (err) {
          console.error("Data load failed:", err)
          showToast("Backend connection failed. Running in offline mode.", "err")
          setApiConnected(false)
        }
      }
      loadData()
    }
  }, [clerkUser?.id])

  useEffect(() => {
    if (user?.fullName) {
      settings.setProfName(user.fullName)
    }
  }, [user?.fullName])

  useEffect(() => {
    if (soapNote.selectedClientForNotes) {
      const filtered = sessionsHook.sessions.filter(
        (s) => s.clientId === soapNote.selectedClientForNotes!.id
      )
      soapNote.setClientSessions(filtered)

      if (filtered.length > 0) {
        if (
          !soapNote.selectedSessionForNotes ||
          soapNote.selectedSessionForNotes.clientId !== soapNote.selectedClientForNotes!.id
        ) {
          const sorted = [...filtered].sort(
            (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
          )
          soapNote.setSelectedSessionForNotes(sorted[0])
        }
      } else {
        soapNote.setSelectedSessionForNotes(null)
        soapNote.setRawNotesContent("")
        soapNote.setGeneratedSoap(null)
      }
    }
  }, [soapNote.selectedClientForNotes, sessionsHook.sessions, soapNote.selectedSessionForNotes])

  const recentSoapNotes = useMemo(() => {
    const listWithNotes = sessionsHook.sessions
      .filter((s): s is Session & { soapNote: NonNullable<Session["soapNote"]> } => s.soapNote !== null && s.soapNote !== undefined)
      .map((s) => ({
        sessionId: s.id,
        clientName: s.clientName,
        scheduledAt: s.scheduledAt,
        status: s.soapNote.status,
        soapNoteId: s.soapNote.id,
      }))
    listWithNotes.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    return listWithNotes
  }, [sessionsHook.sessions])

  const value = useMemo(
    () => ({
      user,
      clerkLoaded,
      apiConnected,
      clientsHook,
      sessionsHook,
      soapNote,
      settings,
      recentSoapNotes,
    }),
    [user, clerkLoaded, apiConnected, clientsHook, sessionsHook, soapNote, settings, recentSoapNotes]
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}
