'use client'
import * as React from 'react'

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@workspace/ui/components/sidebar'
import { Globe, Home } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const sidebarData = [
  {
    title: 'Home',
    url: '/dashboard',
    icon: <Home />
  }
]

export const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const pathname = usePathname()

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
                    <SidebarMenuButton tooltip={x.title} className={pathname === x.url && 'bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground'}>
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
    </Sidebar>
  )
}
