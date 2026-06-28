"use client"

import { useAppData } from "@/app/app/_components/app-data-provider"
import { SettingsView } from "@/app/app/_components/settings-view"

export default function SettingsPage() {
  const { settings } = useAppData()

  return (
    <div className="flex-1 overflow-y-auto pt-14 pb-6 px-4 sm:p-6 md:p-8">
      <SettingsView
        profName={settings.profName}
        setProfName={settings.setProfName}
        profSpec={settings.profSpec}
        setProfSpec={settings.setProfSpec}
        profileError={settings.profileError}
        pwCur={settings.pwCur}
        setPwCur={settings.setPwCur}
        pwNew={settings.pwNew}
        setPwNew={settings.setPwNew}
        pwNew2={settings.pwNew2}
        setPwNew2={settings.setPwNew2}
        pwError={settings.pwError}
        onSaveProfile={settings.handleSaveProfile}
        onUpdatePassword={settings.handleUpdatePassword}
        isSavingProfile={settings.isSavingProfile}
        isUpdatingPassword={settings.isUpdatingPassword}
      />
    </div>
  )
}
