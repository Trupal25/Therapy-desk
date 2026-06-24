"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, ArrowRight, ArrowLeft, Users, Calendar, FileText, Sparkles } from "lucide-react"
import { toast } from "sonner"

const SPECIALIZATIONS = [
  "General", "CBT", "DBT", "Psychodynamic", "Trauma",
  "Anxiety", "Depression", "Child & Adolescent", "Couples",
  "Family", "ACT", "EMDR", "Somatic", "Gestalt",
]

const DEMO_PREVIEW = {
  clients: 5,
  sessions: 9,
  notes: 2,
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()
  const [step, setStep] = useState(1)
  const [practiceName, setPracticeName] = useState("")
  const [specialization, setSpecialization] = useState("General")
  const [seedDemoData, setSeedDemoData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (clerkLoaded && clerkUser) {
      const name = clerkUser.fullName || "My Practice"
      setPracticeName(name + " Practice")
    }
  }, [clerkLoaded, clerkUser])

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const res = await fetch("/api/onboarding")
        if (res.ok) {
          const data = await res.json()
          if (!data.needsOnboarding) {
            router.replace("/app/dashboard")
          }
        }
      } catch {
        // ignore — let user proceed
      }
    }
    if (clerkLoaded) checkOnboarding()
  }, [clerkLoaded, router])

  async function handleComplete() {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          practiceName,
          specialization,
          seedDemoData,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to complete setup")
        setIsSubmitting(false)
        return
      }

      setIsComplete(true)
      toast.success("Practice set up successfully")
      setTimeout(() => router.replace("/app/dashboard"), 1200)
    } catch {
      toast.error("Network error. Please try again.")
      setIsSubmitting(false)
    }
  }

  function handleBack() {
    if (step > 1) setStep(step - 1)
  }

  function handleNext() {
    if (step === 1 && !practiceName.trim()) {
      toast.error("Please enter your practice name")
      return
    }
    if (step < 3) setStep(step + 1)
    if (step === 2) handleComplete()
  }

  const steps = [
    { num: 1, label: "Practice" },
    { num: 2, label: "Setup" },
    { num: 3, label: "Done" },
  ]

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist p-4">
      <div className="w-full max-w-lg animate-fadeUp">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-sage text-white font-bold text-sm">
            TD
          </div>
          <h1 className="font-serif text-3xl font-normal text-foreground">
            Welcome to TherapyDesk
          </h1>
          <p className="mt-1 text-sm text-muted-foreground font-medium">
            Let&apos;s get your practice set up in under a minute.
          </p>
        </div>

        <div className="mb-6 flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={
                  step >= s.num
                    ? "flex size-6 items-center justify-center rounded-full bg-sage text-white text-[10px] font-bold"
                    : "flex size-6 items-center justify-center rounded-full border border-stone-mid text-stone text-[10px] font-bold"
                }
              >
                {step > s.num ? (
                  <Check className="size-3" />
                ) : (
                  s.num
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={
                    step > s.num
                      ? "h-px w-8 bg-sage"
                      : "h-px w-8 bg-stone-mid"
                  }
                />
              )}
            </div>
          ))}
        </div>

        <Card className="border-border px-6 py-8">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-serif text-xl font-normal text-foreground">
                  Your Practice
                </h2>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  Name your practice and tell us your specialty.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-muted-foreground">
                  Practice Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Mindful Therapy Studio"
                  value={practiceName}
                  onChange={(e) => setPracticeName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-muted-foreground">
                  Primary Specialization
                </label>
                <Select value={specialization} onValueChange={setSpecialization}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALIZATIONS.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-serif text-xl font-normal text-foreground">
                  Get Started Faster
                </h2>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  Seed demo data so you can explore the app right away.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSeedDemoData(!seedDemoData)}
                className={
                  seedDemoData
                    ? "w-full rounded-lg border-2 border-sage bg-sage-light p-4 text-left transition-colors"
                    : "w-full rounded-lg border border-stone-mid bg-white p-4 text-left transition-colors hover:border-stone"
                }
              >
                <div className="flex items-start gap-3">
                  <div
                    className={
                      seedDemoData
                        ? "mt-0.5 flex size-5 items-center justify-center rounded border-2 border-sage bg-sage text-white"
                        : "mt-0.5 flex size-5 items-center justify-center rounded border-2 border-stone-mid bg-white"
                    }
                  >
                    {seedDemoData && <Check className="size-3" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Load sample patients and sessions
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground font-medium">
                      Includes {DEMO_PREVIEW.clients} demo patients with {DEMO_PREVIEW.sessions} sessions
                      and {DEMO_PREVIEW.notes} pre-written notes. You can delete these anytime.
                    </p>
                  </div>
                </div>
              </button>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-stone-mid bg-white p-3 text-center">
                  <Users className="mx-auto mb-1 size-4 text-sage" />
                  <p className="text-lg font-bold text-foreground">{DEMO_PREVIEW.clients}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Patients</p>
                </div>
                <div className="rounded-lg border border-stone-mid bg-white p-3 text-center">
                  <Calendar className="mx-auto mb-1 size-4 text-sage" />
                  <p className="text-lg font-bold text-foreground">{DEMO_PREVIEW.sessions}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Sessions</p>
                </div>
                <div className="rounded-lg border border-stone-mid bg-white p-3 text-center">
                  <FileText className="mx-auto mb-1 size-4 text-sage" />
                  <p className="text-lg font-bold text-foreground">{DEMO_PREVIEW.notes}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">SOAP Notes</p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center py-6 text-center">
              {isComplete ? (
                <>
                  <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-sage-light">
                    <Check className="size-6 text-sage" />
                  </div>
                  <h2 className="font-serif text-xl font-normal text-foreground">
                    You&apos;re all set
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground font-medium">
                    Redirecting to your dashboard...
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-sage-light">
                    <Sparkles className="size-6 text-sage animate-pulse" />
                  </div>
                  <h2 className="font-serif text-xl font-normal text-foreground">
                    Setting up your practice
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground font-medium">
                    {seedDemoData ? "Creating sample patients and sessions..." : "Almost there..."}
                  </p>
                </>
              )}
            </div>
          )}
        </Card>

        {step < 3 && (
          <div className="mt-4 flex items-center justify-between">
            {step > 1 ? (
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="mr-1 size-3" />
                Back
              </Button>
            ) : (
              <div />
            )}
            <Button onClick={handleNext} disabled={isSubmitting}>
              {step === 2
                ? isSubmitting
                  ? "Setting up..."
                  : "Complete Setup"
                : "Continue"}
              {step < 2 && <ArrowRight className="ml-1 size-3" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
