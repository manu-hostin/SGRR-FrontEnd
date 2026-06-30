"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarCheck, DoorOpen, Projector, Users, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/", label: "Visão geral", icon: LayoutDashboard },
  { href: "/reservas", label: "Reservas", icon: CalendarCheck },
  { href: "/salas", label: "Salas", icon: DoorOpen },
  { href: "/equipamentos", label: "Equipamentos", icon: Projector },
  { href: "/usuarios", label: "Usuários", icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      <nav className="sticky top-0 z-30 flex items-center gap-1 overflow-x-auto border-b border-sidebar-border bg-sidebar px-2 py-2 text-sidebar-foreground lg:hidden">
        {nav.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <CalendarCheck className="h-5 w-5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">SGRR</span>
          <span className="text-xs text-sidebar-foreground/60">Gestão de Reservas</span>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {nav.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
        <div className="border-t border-sidebar-border p-4 text-xs text-sidebar-foreground/50">
          Centro Weg · SGRR
        </div>
      </aside>
    </>
  )
}
