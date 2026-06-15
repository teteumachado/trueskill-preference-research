import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { SettingsSidebar } from "@/components/dashboard/settings/sidebar"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 36)",
          "--header-height": "calc(var(--spacing) * 6)",
          "--sidebar": "var(--background)",
        } as React.CSSProperties
      }
    >
      <SettingsSidebar variant="sidebar" />
      <SidebarInset>
        <div className="p-3">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
