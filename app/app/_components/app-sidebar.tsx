"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, Calendar, Users, Settings, LogOut } from "lucide-react"
import { useUser, useClerk } from "@clerk/nextjs"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/app/dashboard" },
  { label: "Notes", icon: FileText, href: "/app/notes" },
  { label: "Calendar", icon: Calendar, href: "/app/schedule" },
  { label: "Patients", icon: Users, href: "/app/clients" },
  { label: "Settings", icon: Settings, href: "/app/settings" },
]

const COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
]

interface AppSidebarProps {
  recentSoapNotes?: Array<{
    sessionId: string
    clientName: string
    scheduledAt: string
    status: string
  }>
  onSelectRecentNote?: (sessionId: string, clientName: string) => void
}

export function AppSidebar({
  recentSoapNotes = [],
  onSelectRecentNote,
}: AppSidebarProps) {
  const pathname = usePathname()
  const { user: clerkUser } = useClerk()
  const { signOut } = useClerk()

  const fullName = clerkUser?.fullName || "Therapist"
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="group-data-[state=collapsed]:flex-col">
            <SidebarMenuButton size="lg" asChild>
              <Link href="/app/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                  TD
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">TherapyDesk</span>
                  <span className="truncate text-xs text-muted-foreground">Practice</span>
                </div>
              </Link>
            </SidebarMenuButton>
            <SidebarTrigger className="-mr-1" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const active = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {recentSoapNotes.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Recent</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {recentSoapNotes.slice(0, 4).map((note) => {
                    const initials = String(note.clientName || "?")
                      .split(" ")
                      .map((s) => s[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()
                    const pal = COLORS[(note.clientName?.charCodeAt(0) || 65) % COLORS.length]

                    return (
                      <SidebarMenuItem key={note.sessionId}>
                        <SidebarMenuButton
                          tooltip={note.clientName}
                          onClick={() => onSelectRecentNote?.(note.sessionId, note.clientName)}
                        >
                          <Avatar className="size-5">
                            <AvatarFallback className={cn("text-[9px] font-bold", pal)}>
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate text-xs">{note.clientName}</span>
                          {note.status === "signed" ? (
                            <span className="ml-auto size-1.5 rounded-full bg-emerald-500 shrink-0" />
                          ) : (
                            <span className="ml-auto size-1.5 rounded-full bg-amber-500 shrink-0" />
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent">
              <Avatar className="size-6">
                <AvatarFallback className="text-xs font-bold bg-muted">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{fullName}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign Out"
              onClick={() => signOut({ redirectUrl: "/sign-in" })}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="size-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
