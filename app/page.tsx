"use client"

import Link from "next/link"
import { CalendarCheck, DoorOpen, Projector, Users, ArrowRight, CheckCircle2, XCircle } from "lucide-react"
import { AppShell, PageHeader } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoadingState, ErrorState, EmptyState } from "@/components/states"
import { useReservas, useSalas, useEquipamentos, useUsuarios } from "@/lib/api"
import { formatDateTime } from "@/lib/format"

const cards = [
  { key: "reservas", label: "Reservas", icon: CalendarCheck, href: "/reservas" },
  { key: "salas", label: "Salas", icon: DoorOpen, href: "/salas" },
  { key: "equipamentos", label: "Equipamentos", icon: Projector, href: "/equipamentos" },
  { key: "usuarios", label: "Usuários", icon: Users, href: "/usuarios" },
] as const

export default function OverviewPage() {
  const { data: reservas, isLoading, error } = useReservas()
  const { data: salas } = useSalas()
  const { data: equipamentos } = useEquipamentos()
  const { data: usuarios } = useUsuarios()

  const counts: Record<string, number | undefined> = {
    reservas: reservas?.length,
    salas: salas?.length,
    equipamentos: equipamentos?.length,
    usuarios: usuarios?.length,
  }

  const recentes = reservas ? [...reservas].slice(-5).reverse() : []

  return (
    <AppShell>
      <PageHeader title="Visão geral" description="Resumo do Sistema de Gestão de Reservas de Recursos." />
      <main className="flex-1 overflow-auto p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => {
            const Icon = c.icon
            return (
              <Link key={c.key} href={c.href}>
                <Card className="transition-colors hover:border-primary/40">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
                    <Icon className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold text-foreground">{counts[c.key] ?? "—"}</div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Reservas recentes</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              render={
                <Link href="/reservas">
                  Ver todas
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={(error as Error).message} />
            ) : recentes.length === 0 ? (
              <EmptyState message="Nenhuma reserva cadastrada ainda." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recurso</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentes.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm">{r.salaNome ?? r.equipamentoNome ?? "—"}</TableCell>
                      <TableCell className="text-sm">{r.usuarioNome}</TableCell>
                      <TableCell className="text-sm">{formatDateTime(r.dataHoraInicio)}</TableCell>
                      <TableCell>
                        {r.status === "CONFIRMADA" ? (
                          <Badge variant="secondary" className="gap-1 text-primary">
                            <CheckCircle2 className="h-3 w-3" />
                            Confirmada
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-muted-foreground">
                            <XCircle className="h-3 w-3" />
                            Cancelada
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </AppShell>
  )
}
