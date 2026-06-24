"use client"

import { usePathname } from "next/navigation"
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
  const pathname = usePathname()
  const isOnboarding = pathname === "/app/onboarding"

  if (isOnboarding) {
    return (
      <TooltipProvider>
        <AppDataProvider>
          {children}
          <Toaster position="bottom-right" richColors />
        </AppDataProvider>
      </TooltipProvider>
    )
  }

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
