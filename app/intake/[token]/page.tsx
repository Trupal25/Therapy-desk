"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Check, ArrowRight, ArrowLeft, User, Phone, Shield, FileText, Heart } from "lucide-react"
import { toast } from "sonner"

interface IntakeData {
  valid: boolean
  client: {
    firstName: string
    lastName: string
    gender: string
    pronouns: string
    diagnosisCodes: string[]
  }
  practice: {
    name: string
  }
}

export default function IntakeFormPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [intakeData, setIntakeData] = useState<IntakeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState("")

  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [emergencyName, setEmergencyName] = useState("")
  const [emergencyPhone, setEmergencyPhone] = useState("")
  const [emergencyRelation, setEmergencyRelation] = useState("")
  const [insuranceProvider, setInsuranceProvider] = useState("")
  const [insurancePolicy, setInsurancePolicy] = useState("")
  const [presentingConcerns, setPresentingConcerns] = useState("")
  const [treatmentHistory, setTreatmentHistory] = useState("")
  const [currentMedications, setCurrentMedications] = useState("")
  const [consentTreatment, setConsentTreatment] = useState(false)
  const [consentHipaa, setConsentHipaa] = useState(false)
  const [consentTelehealth, setConsentTelehealth] = useState(false)

  useEffect(() => {
    async function loadIntake() {
      try {
        const res = await fetch("/api/intake/" + token)
        if (!res.ok) {
          setError("This intake link is invalid or has expired.")
          setLoading(false)
          return
        }
        const data = await res.json()
        setIntakeData(data)
      } catch {
        setError("Failed to load intake form.")
      } finally {
        setLoading(false)
      }
    }
    loadIntake()
  }, [token])

  async function handleSubmit() {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/intake/" + token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone,
          emergencyContactName: emergencyName,
          emergencyContactPhone: emergencyPhone,
          emergencyContactRelation: emergencyRelation,
          insuranceProvider,
          insurancePolicyNumber: insurancePolicy,
          presentingConcerns,
          treatmentHistory,
          currentMedications,
          consentTreatment,
          consentHipaa,
          consentTelehealth,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to submit form")
        setIsSubmitting(false)
        return
      }

      setIsComplete(true)
      toast.success("Intake form submitted successfully")
    } catch {
      toast.error("Network error. Please try again.")
      setIsSubmitting(false)
    }
  }

  function handleNext() {
    if (step < 4) setStep(step + 1)
    if (step === 4) handleSubmit()
  }

  function handleBack() {
    if (step > 1) setStep(step - 1)
  }

  const steps = [
    { num: 1, label: "Contact", icon: Phone },
    { num: 2, label: "Emergency", icon: User },
    { num: 3, label: "Insurance", icon: Shield },
    { num: 4, label: "Consent", icon: FileText },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 rounded-xl bg-muted animate-pulse" />
          <div className="h-3 w-32 rounded bg-muted animate-pulse" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist p-4">
        <Card className="w-full max-w-md px-6 py-8 text-center">
          <div className="mb-4 size-12 rounded-full bg-red-light flex items-center justify-center mx-auto">
            <span className="text-xl">!</span>
          </div>
          <h1 className="font-serif text-2xl font-normal text-foreground mb-2">Link Invalid</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist p-4">
      <div className="w-full max-w-lg animate-fadeUp">
        <div className="mb-6 text-center">
          <p className="text-xs font-bold text-sage uppercase tracking-wider mb-1">
            {intakeData?.practice.name}
          </p>
          <h1 className="font-serif text-2xl font-normal text-foreground">
            Client Intake Form
          </h1>
          <p className="mt-1 text-sm text-muted-foreground font-medium">
            Welcome{intakeData?.client.firstName ? ", " + intakeData.client.firstName : ""}. Please complete your intake information.
          </p>
        </div>

        <div className="mb-5 flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={
                  step >= s.num
                    ? "flex size-6 items-center justify-center rounded-full bg-sage text-white text-[10px] font-bold"
                    : "flex size-6 items-center justify-center rounded-full border border-stone-mid text-stone text-[10px] font-bold"
                }
              >
                {step > s.num ? <Check className="size-3" /> : s.num}
              </div>
              {i < steps.length - 1 && (
                <div className={step > s.num ? "h-px w-6 bg-sage" : "h-px w-6 bg-stone-mid"} />
              )}
            </div>
          ))}
        </div>

        <Card className="border-border px-6 py-6">
          {isComplete ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-sage-light">
                <Check className="size-6 text-sage" />
              </div>
              <h2 className="font-serif text-xl font-normal text-foreground">Thank you</h2>
              <p className="mt-1 text-sm text-muted-foreground font-medium">
                Your intake information has been submitted. We look forward to meeting with you.
              </p>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-serif text-lg font-normal text-foreground">Contact Information</h2>
                    <p className="text-xs text-muted-foreground font-medium">How can we reach you?</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-muted-foreground">Email Address</label>
                    <Input type="email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-muted-foreground">Phone Number</label>
                    <Input type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-muted-foreground">Presenting Concerns</label>
                    <textarea placeholder="What brings you to therapy? Briefly describe your main concerns..." value={presentingConcerns} onChange={(e) => setPresentingConcerns(e.target.value)} rows={3} className="w-full rounded-md border border-input bg-input/20 px-3 py-2 text-sm resize-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-muted-foreground">Previous Treatment History</label>
                    <textarea placeholder="Have you been in therapy before? Any relevant history..." value={treatmentHistory} onChange={(e) => setTreatmentHistory(e.target.value)} rows={2} className="w-full rounded-md border border-input bg-input/20 px-3 py-2 text-sm resize-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-muted-foreground">Current Medications</label>
                    <Input placeholder="List any current medications" value={currentMedications} onChange={(e) => setCurrentMedications(e.target.value)} />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-serif text-lg font-normal text-foreground">Emergency Contact</h2>
                    <p className="text-xs text-muted-foreground font-medium">Who should we contact in case of emergency?</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-muted-foreground">Contact Name</label>
                    <Input placeholder="Full name" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-muted-foreground">Phone Number</label>
                    <Input type="tel" placeholder="+91 98765 43210" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-muted-foreground">Relationship</label>
                    <Input placeholder="e.g. Spouse, Parent, Sibling" value={emergencyRelation} onChange={(e) => setEmergencyRelation(e.target.value)} />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-serif text-lg font-normal text-foreground">Insurance Information</h2>
                    <p className="text-xs text-muted-foreground font-medium">Optional — for billing purposes.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-muted-foreground">Insurance Provider</label>
                    <Input placeholder="e.g. Star Health, ICICI Lombard" value={insuranceProvider} onChange={(e) => setInsuranceProvider(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-muted-foreground">Policy Number</label>
                    <Input placeholder="Your policy number" value={insurancePolicy} onChange={(e) => setInsurancePolicy(e.target.value)} />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-serif text-lg font-normal text-foreground">Consent Forms</h2>
                    <p className="text-xs text-muted-foreground font-medium">Please review and agree to the following.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setConsentTreatment(!consentTreatment)}
                    className={consentTreatment ? "w-full rounded-lg border-2 border-sage bg-sage-light p-3 text-left" : "w-full rounded-lg border border-stone-mid bg-white p-3 text-left hover:border-stone"}
                  >
                    <div className="flex items-start gap-2">
                      <div className={consentTreatment ? "mt-0.5 flex size-4 items-center justify-center rounded border-2 border-sage bg-sage text-white" : "mt-0.5 flex size-4 items-center justify-center rounded border-2 border-stone-mid bg-white"}>
                        {consentTreatment && <Check className="size-2.5" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Consent for Treatment</p>
                        <p className="mt-0.5 text-xs text-muted-foreground font-medium">I voluntarily consent to receive therapeutic services.</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsentHipaa(!consentHipaa)}
                    className={consentHipaa ? "w-full rounded-lg border-2 border-sage bg-sage-light p-3 text-left" : "w-full rounded-lg border border-stone-mid bg-white p-3 text-left hover:border-stone"}
                  >
                    <div className="flex items-start gap-2">
                      <div className={consentHipaa ? "mt-0.5 flex size-4 items-center justify-center rounded border-2 border-sage bg-sage text-white" : "mt-0.5 flex size-4 items-center justify-center rounded border-2 border-stone-mid bg-white"}>
                        {consentHipaa && <Check className="size-2.5" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">HIPAA Notice of Privacy Practices</p>
                        <p className="mt-0.5 text-xs text-muted-foreground font-medium">I acknowledge receipt of the Notice of Privacy Practices.</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsentTelehealth(!consentTelehealth)}
                    className={consentTelehealth ? "w-full rounded-lg border-2 border-sage bg-sage-light p-3 text-left" : "w-full rounded-lg border border-stone-mid bg-white p-3 text-left hover:border-stone"}
                  >
                    <div className="flex items-start gap-2">
                      <div className={consentTelehealth ? "mt-0.5 flex size-4 items-center justify-center rounded border-2 border-sage bg-sage text-white" : "mt-0.5 flex size-4 items-center justify-center rounded border-2 border-stone-mid bg-white"}>
                        {consentTelehealth && <Check className="size-2.5" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Consent for Telehealth Services</p>
                        <p className="mt-0.5 text-xs text-muted-foreground font-medium">I consent to receive services via telehealth/video.</p>
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </>
          )}
        </Card>

        {!isComplete && (
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
              {step === 4
                ? isSubmitting
                  ? "Submitting..."
                  : "Submit"
                : "Continue"}
              {step < 4 && <ArrowRight className="ml-1 size-3" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
