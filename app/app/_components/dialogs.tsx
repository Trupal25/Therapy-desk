"use client"

import { Calendar as CalendarIcon, Lock, Unlock } from "lucide-react"
import { Client } from "@/app/app/_hooks/useClients"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface AddClientDialogProps {
  isOpen: boolean
  onClose: () => void
  newClientName: string
  setNewClientName: (val: string) => void
  newClientAge: string
  setNewClientAge: (val: string) => void
  newClientType: string
  setNewClientType: (val: string) => void
  newClientNotes: string
  setNewClientNotes: (val: string) => void
  onSubmit: (e: React.FormEvent) => void
  isSaving?: boolean
}

export function AddClientDialog({
  isOpen,
  onClose,
  newClientName,
  setNewClientName,
  newClientAge,
  setNewClientAge,
  newClientType,
  setNewClientType,
  newClientNotes,
  setNewClientNotes,
  onSubmit,
  isSaving = false
}: AddClientDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white border border-stone-mid/20 rounded-2xl p-6 w-full max-w-[420px] shadow-2xl transition-all duration-300 transform scale-100 animate-fu space-y-4 font-sans">
        <DialogHeader className="pb-3.5 border-b border-stone-mid/10">
          <DialogTitle className="font-serif text-xl font-normal text-ink">Register Patient Profile</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-zinc-650">Full Name</label>
            <Input
              className="w-full bg-white border border-stone-mid/30 rounded-xl text-xs text-zinc-950 outline-none focus-visible:ring-1 focus-visible:ring-sage shadow-xs"
              type="text"
              placeholder="e.g. Riya Shah"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              required
              disabled={isSaving}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-zinc-650">Age</label>
              <Input
                className="w-full bg-white border border-stone-mid/30 rounded-xl text-xs text-zinc-955 outline-none focus-visible:ring-1 focus-visible:ring-sage shadow-xs"
                type="number"
                placeholder="28"
                value={newClientAge}
                onChange={(e) => setNewClientAge(e.target.value)}
                required
                disabled={isSaving}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-zinc-650">Focus Type</label>
              <Select
                value={newClientType}
                onValueChange={(value) => setNewClientType(value)}
                disabled={isSaving}
              >
                <SelectTrigger className="w-full bg-white border border-stone-mid/30 rounded-xl text-xs text-zinc-950 outline-none focus-visible:ring-1 focus-visible:ring-sage shadow-xs transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none font-semibold">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CBT">CBT</SelectItem>
                  <SelectItem value="Anxiety">Anxiety</SelectItem>
                  <SelectItem value="Trauma">Trauma</SelectItem>
                  <SelectItem value="Depression">Depression</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-zinc-650">Referral Notes (optional)</label>
            <Input
              className="w-full bg-white border border-stone-mid/30 rounded-xl text-xs text-zinc-955 outline-none focus-visible:ring-1 focus-visible:ring-sage shadow-xs"
              type="text"
              placeholder="Conditions, special observations..."
              value={newClientNotes}
              onChange={(e) => setNewClientNotes(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <DialogFooter className="flex gap-3 pt-2">
            <DialogClose asChild>
              <Button
                className="flex-1 py-2 border border-stone-mid/35 hover:bg-stone-light/35 text-xs font-semibold rounded-xl text-stone hover:text-ink transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none bg-transparent"
                type="button"
                disabled={isSaving}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="flex-1 py-2 bg-ink hover:bg-sage text-white text-xs font-bold rounded-xl shadow transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Create Patient File"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface EditClientDialogProps {
  isOpen: boolean
  onClose: () => void
  editClientName: string
  setEditClientName: (val: string) => void
  editClientAge: string
  setEditClientAge: (val: string) => void
  editClientType: string
  setEditClientType: (val: string) => void
  editClientNotes: string
  setEditClientNotes: (val: string) => void
  editClientError: string
  onSubmit: (e: React.FormEvent) => void
  isSaving?: boolean
}

export function EditClientDialog({
  isOpen,
  onClose,
  editClientName,
  setEditClientName,
  editClientAge,
  setEditClientAge,
  editClientType,
  setEditClientType,
  editClientNotes,
  setEditClientNotes,
  editClientError,
  onSubmit,
  isSaving = false
}: EditClientDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white border border-stone-mid/20 rounded-2xl p-6 w-full max-w-[420px] shadow-2xl transition-all duration-300 transform scale-100 animate-fu space-y-4">
        <DialogHeader className="pb-3.5 border-b border-stone-mid/10">
          <DialogTitle className="font-serif text-xl font-normal text-ink">Update Client Details</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-zinc-650">Full Name</label>
            <Input
              className="w-full bg-white border border-stone-mid/30 rounded-xl text-xs text-zinc-955 outline-none focus-visible:ring-1 focus-visible:ring-sage shadow-xs"
              type="text"
              placeholder="e.g. Riya Shah"
              value={editClientName}
              onChange={(e) => setEditClientName(e.target.value)}
              required
              disabled={isSaving}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-zinc-650">Age</label>
              <Input
                className="w-full bg-white border border-stone-mid/30 rounded-xl text-xs text-zinc-955 outline-none focus-visible:ring-1 focus-visible:ring-sage shadow-xs"
                type="number"
                placeholder="28"
                value={editClientAge}
                onChange={(e) => setEditClientAge(e.target.value)}
                required
                disabled={isSaving}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-zinc-650">Focus Type</label>
              <Select
                value={editClientType}
                onValueChange={(value) => setEditClientType(value)}
                disabled={isSaving}
              >
                <SelectTrigger className="w-full bg-white border border-stone-mid/30 rounded-xl text-xs text-zinc-950 outline-none focus-visible:ring-1 focus-visible:ring-sage shadow-xs transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none font-semibold">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CBT">CBT</SelectItem>
                  <SelectItem value="Anxiety">Anxiety</SelectItem>
                  <SelectItem value="Trauma">Trauma</SelectItem>
                  <SelectItem value="Depression">Depression</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-zinc-650">Clinical Observations (optional)</label>
            <Input
              className="w-full bg-white border border-stone-mid/30 rounded-xl text-xs text-zinc-955 outline-none focus-visible:ring-1 focus-visible:ring-sage shadow-xs"
              type="text"
              placeholder="Referral notes, conditions..."
              value={editClientNotes}
              onChange={(e) => setEditClientNotes(e.target.value)}
              disabled={isSaving}
            />
          </div>

          {editClientError && <div className="text-xs text-red font-semibold">{editClientError}</div>}

          <DialogFooter className="flex gap-3 pt-2">
            <DialogClose asChild>
              <Button
                className="flex-1 py-2 border border-stone-mid/35 hover:bg-stone-light/35 text-xs font-semibold rounded-xl text-stone hover:text-ink transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none bg-transparent"
                type="button"
                disabled={isSaving}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="flex-1 py-2 bg-ink hover:bg-sage text-white text-xs font-bold rounded-xl shadow transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Details"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface HistoryDialogProps {
  isOpen: boolean
  onClose: () => void
  historyClient: Client | null
  historyList: any[]
  loadingHistory: boolean
}

export function HistoryDialog({
  isOpen,
  onClose,
  historyClient,
  historyList,
  loadingHistory
}: HistoryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white border border-stone-mid/20 rounded-2xl p-6 w-full max-w-[620px] shadow-2xl transition-all duration-300 transform flex flex-col max-h-[85vh] scale-100 animate-fu space-y-4">
        <DialogHeader className="pb-3.5 border-b border-stone-mid/10 flex-shrink-0">
          <DialogTitle className="font-serif text-xl font-normal text-ink">Clinical SOAP Note History</DialogTitle>
          <DialogDescription className="text-[10px] text-stone mt-1 font-semibold uppercase tracking-wider">
            Patient File: {historyClient ? `${historyClient.firstName} ${historyClient.lastName}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto space-y-4 flex-1 pr-1.5 scrollbar-thin">
          {loadingHistory ? (
            <div className="py-12 text-center text-stone text-xs font-semibold animate-pulse">
              Decrypting clinical session records...
            </div>
          ) : historyList.length === 0 ? (
            <div className="py-12 text-center text-stone text-xs font-semibold">
              No session records found in history.
            </div>
          ) : (
            historyList.map((item: any) => (
              <div
                key={item.sessionId}
                className="border border-stone-mid/20 rounded-2xl p-5 bg-stone-light/15 hover:bg-stone-light/35 transition-all duration-300 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between pb-3 border-b border-stone-mid/10">
                  <span className="text-xs font-bold text-sage flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-sage" />
                    <span>{new Date(item.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </span>
                  <Badge
                    variant="outline"
                    className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1
                      ${item.soapNote?.status === "signed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}
                  >
                    {item.soapNote?.status === "signed" ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                    <span>{item.soapNote?.status || "no note"}</span>
                  </Badge>
                </div>

                {item.soapNote ? (
                  <div className="space-y-3.5 text-xs text-stone leading-relaxed font-semibold">
                    <div className="space-y-1">
                      <span className="font-bold text-sage uppercase text-[8.5px] tracking-widest block">Subjective (S)</span>
                      <p className="text-zinc-800 bg-white border border-stone-mid/25 p-3 rounded-xl shadow-inner font-sans font-medium">{item.soapNote.subjective}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-sage uppercase text-[8.5px] tracking-widest block">Objective (O)</span>
                      <p className="text-zinc-800 bg-white border border-stone-mid/25 p-3 rounded-xl shadow-inner font-sans font-medium">{item.soapNote.objective}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-sage uppercase text-[8.5px] tracking-widest block">Assessment (A)</span>
                      <p className="text-zinc-800 bg-white border border-stone-mid/25 p-3 rounded-xl shadow-inner font-sans font-medium">{item.soapNote.assessment}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-sage uppercase text-[8.5px] tracking-widest block">Plan (P)</span>
                      <p className="text-zinc-800 bg-white border border-stone-mid/25 p-3 rounded-xl shadow-inner font-sans font-medium">{item.soapNote.plan}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-stone italic">No formal SOAP notes compiled for this session appointment.</p>
                )}
              </div>
            ))
          )}
        </div>

        <DialogFooter className="flex justify-end pt-4 border-t border-stone-mid/10 flex-shrink-0">
          <DialogClose asChild>
            <Button
              className="px-5 py-2.5 bg-ink hover:bg-sage text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
            >
              Close Archive
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
