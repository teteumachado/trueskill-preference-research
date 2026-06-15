'use client'

import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { sidebarData } from "@/components/dashboard/sidebar"
import { sidebarData as settingsSidebarData } from "./settings/sidebar"
import { usePathname } from "next/navigation"

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="flex shrink-0 items-center gap-2 border-b bg-background px-4 h-(--header-height) rounded-t-xl lg:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mx-2"
      />
      <h1 className="text-base font-medium">{sidebarData.find(item => item.url === pathname)?.title ?? settingsSidebarData.find(item => item.url === pathname)?.title ?? 'Untitled'}</h1>
    </header>
  )
}
