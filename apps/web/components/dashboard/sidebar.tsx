'use client'
import * as React from 'react'

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@workspace/ui/components/sidebar'
import { Globe, Home } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SidebarUser } from './sidebar-user'
import { authClient } from '@workspace/auth/client'

export const sidebarData = [
  {
    title: 'Home',
    url: '/dashboard',
    icon: <Home />
  }
]

export const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const pathname = usePathname()
  const {
    data: session
  } = authClient.useSession()

  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/">
              <SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-1.5!">
                <Globe />
                <span className="text-base font-semibold">Acme inc.</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarData.map(x => (
                <SidebarMenuItem key={x.title}>
                  <Link href={x.url}>
                    <SidebarMenuButton tooltip={x.title} className={pathname === x.url && 'bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground' || ''}>
                      {x.icon && x.icon}
                      <span>{x.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser user={session?.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
