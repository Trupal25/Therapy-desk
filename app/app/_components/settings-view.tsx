"use client"

import { User, Key } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SettingsViewProps {
  profName: string
  setProfName: (val: string) => void
  profSpec: string
  setProfSpec: (val: string) => void
  profileError: string
  pwCur: string
  setPwCur: (val: string) => void
  pwNew: string
  setPwNew: (val: string) => void
  pwNew2: string
  setPwNew2: (val: string) => void
  pwError: string
  onSaveProfile: (e: React.FormEvent) => void
  onUpdatePassword: (e: React.FormEvent) => void
  isSavingProfile?: boolean
  isUpdatingPassword?: boolean
}

export function SettingsView({
  profName, setProfName, profSpec, setProfSpec, profileError,
  pwCur, setPwCur, pwNew, setPwNew, pwNew2, setPwNew2, pwError,
  onSaveProfile, onUpdatePassword,
  isSavingProfile = false, isUpdatingPassword = false,
}: SettingsViewProps) {
  return (
    <div className="animate-fadeUp space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-normal text-foreground text-balance">Settings</h2>
        <p className="text-sm text-muted-foreground font-medium mt-0.5">
          Manage your profile and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0">
          <div className="px-4 flex items-center gap-2 pb-3 mb-4 border-b border-stone-mid">
            <User className="h-4 w-4 text-sage" />
            <h3 className="font-semibold text-sm text-foreground">Profile</h3>
          </div>
          <form onSubmit={onSaveProfile} className="px-4 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-muted-foreground">Full Name</label>
              <Input
                type="text"
                placeholder="e.g. Dr. Sunita Rao"
                value={profName}
                onChange={(e) => setProfName(e.target.value)}
                required
                disabled={isSavingProfile}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-muted-foreground">Specialisation</label>
              <Select value={profSpec} onValueChange={setProfSpec} disabled={isSavingProfile}>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialisation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="CBT">CBT</SelectItem>
                  <SelectItem value="Trauma">Trauma</SelectItem>
                  <SelectItem value="Anxiety">Anxiety</SelectItem>
                  <SelectItem value="Depression">Depression</SelectItem>
                  <SelectItem value="Child & Adolescent">Child & Adolescent</SelectItem>
                  <SelectItem value="Couples">Couples</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {profileError && <p className="text-xs font-semibold text-destructive">{profileError}</p>}
            <div className="flex justify-end pt-1">
              <Button type="submit" disabled={isSavingProfile}>
                {isSavingProfile ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="border-0">
          <div className="px-4 flex items-center gap-2 pb-3 mb-4 border-b border-stone-mid">
            <Key className="h-4 w-4 text-sage" />
            <h3 className="font-semibold text-sm text-foreground">Password</h3>
          </div>
          <form onSubmit={onUpdatePassword} className="px-4 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-muted-foreground">Current Password</label>
              <Input type="password" placeholder="Enter current password"
                value={pwCur} onChange={(e) => setPwCur(e.target.value)}
                required disabled={isUpdatingPassword} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-muted-foreground">New Password</label>
              <Input type="password" placeholder="Minimum 6 characters"
                value={pwNew} onChange={(e) => setPwNew(e.target.value)}
                required disabled={isUpdatingPassword} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-muted-foreground">Confirm New Password</label>
              <Input type="password" placeholder="Confirm new password"
                value={pwNew2} onChange={(e) => setPwNew2(e.target.value)}
                required disabled={isUpdatingPassword} />
            </div>
            {pwError && <p className="text-xs font-semibold text-destructive">{pwError}</p>}
            <div className="flex justify-end pt-1">
              <Button type="submit" disabled={isUpdatingPassword}>
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
