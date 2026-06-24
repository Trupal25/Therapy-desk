"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PatientDetailView } from "@/app/app/_components/patient-detail-view"
import { useAppData } from "@/app/app/_components/app-data-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

interface PatientDetailPageProps {
  params: Promise<{ id: string }>
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { sessionsHook } = useAppData()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatient = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/clients/${id}`)
        if (!res.ok) {
          if (res.status === 404) {
            setError("Patient not found")
          } else {
            const err = await res.json()
            setError(err.error || "Failed to load patient")
          }
          return
        }
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError("Failed to connect to server")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatient()
  }, [id])

  const handleWriteNote = (sessionId: string) => {
    // Navigate to notes with this session pre-selected
    router.push(`/app/notes?sessionId=${sessionId}`)
  }

  const handleBookSession = () => {
    // Navigate to schedule page pre-filling the client
    router.push(`/app/schedule?clientId=${id}`)
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="space-y-6">
          <div className="flex items-start gap-5">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-4" />
          <h2 className="text-lg font-semibold">{error}</h2>
          <p className="text-sm text-muted-foreground mt-1">Could not load patient details.</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      <PatientDetailView
        patient={data.client}
        sessions={data.sessions}
        onWriteNote={handleWriteNote}
        onBookSession={handleBookSession}
      />
    </div>
  )
}
