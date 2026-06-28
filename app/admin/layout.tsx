"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AdminSidebar } from "./_components/admin-sidebar";
import { Separator } from "@/components/ui/separator";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return (
    <>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <div className="flex-1" />
        </header>
        <div className="flex-1 overflow-auto p-4 sm:p-6">{children}</div>
      </SidebarInset>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </SidebarProvider>
      <Toaster position="bottom-right" richColors />
    </TooltipProvider>
  );
}
