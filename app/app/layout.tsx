"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { AppDataProvider } from "@/app/app/_components/app-data-provider"
import { AppShell } from "@/app/app/_components/app-shell"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <AppDataProvider>
        <SidebarProvider>
          <AppShell>{children}</AppShell>
        </SidebarProvider>
        <Toaster position="bottom-right" richColors />
      </AppDataProvider>
    </TooltipProvider>
  )
}
