import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { AppSidebar } from "@/components/dashboard/sidebar"
import { SiteHeader } from "@/components/dashboard/header"
import { AuthGuard } from "@/components/dashboard/auth-guard"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthGuard>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="p-3">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
