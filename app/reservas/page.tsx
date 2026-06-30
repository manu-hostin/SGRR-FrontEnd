"use client"

import { useState } from "react"
import { useSWRConfig } from "swr"
import { toast } from "sonner"
import { Ban, Trash2, CheckCircle2, XCircle, DoorOpen, Projector } from "lucide-react"
import { AppShell, PageHeader } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LoadingState, ErrorState, EmptyState } from "@/components/states"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { NovaReservaDialog } from "@/components/reservas/nova-reserva-dialog"
import { useReservas, reservasApi } from "@/lib/api"
import { formatDateTime } from "@/lib/format"
import type { Reserva } from "@/lib/types"

export default function ReservasPage() {
  const { data: reservas, isLoading, error } = useReservas()
  const { mutate } = useSWRConfig()
  const [cancelar, setCancelar] = useState<Reserva | null>(null)
  const [excluir, setExcluir] = useState<Reserva | null>(null)

  async function handleCancelar() {
    if (!cancelar) return
    try {
      await reservasApi.cancelar(cancelar.id)
      await mutate("/api/sgrr/reservas")
      toast.success("Reserva cancelada.")
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  async function handleExcluir() {
    if (!excluir) return
    try {
      await reservasApi.deletar(excluir.id)
      await mutate("/api/sgrr/reservas")
      toast.success("Reserva excluída.")
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Reservas"
        description="Gerencie as reservas de salas e equipamentos."
        action={<NovaReservaDialog />}
      />
      <main className="flex-1 overflow-auto p-6">
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={(error as Error).message} />
            ) : !reservas || reservas.length === 0 ? (
              <EmptyState message="Nenhuma reserva cadastrada. Crie a primeira reserva." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recurso</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Fim</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservas.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {r.salaNome ? (
                            <span className="flex items-center gap-1.5 text-sm">
                              <DoorOpen className="h-3.5 w-3.5 text-muted-foreground" />
                              {r.salaNome}
                            </span>
                          ) : null}
                          {r.equipamentoNome ? (
                            <span className="flex items-center gap-1.5 text-sm">
                              <Projector className="h-3.5 w-3.5 text-muted-foreground" />
                              {r.equipamentoNome}
                            </span>
                          ) : null}
                          {!r.salaNome && !r.equipamentoNome ? (
                            <span className="text-sm text-muted-foreground">—</span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{r.usuarioNome}</TableCell>
                      <TableCell className="text-sm">{formatDateTime(r.dataHoraInicio)}</TableCell>
                      <TableCell className="text-sm">{formatDateTime(r.dataHoraFim)}</TableCell>
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {r.status === "CONFIRMADA" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCancelar(r)}
                              aria-label="Cancelar reserva"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          ) : null}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExcluir(r)}
                            aria-label="Excluir reserva"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <ConfirmDialog
        open={!!cancelar}
        onOpenChange={(o) => !o && setCancelar(null)}
        title="Cancelar reserva"
        description="A reserva será marcada como cancelada. Deseja continuar?"
        confirmLabel="Cancelar reserva"
        onConfirm={handleCancelar}
      />
      <ConfirmDialog
        open={!!excluir}
        onOpenChange={(o) => !o && setExcluir(null)}
        title="Excluir reserva"
        description="Esta ação não pode ser desfeita. Deseja excluir permanentemente?"
        confirmLabel="Excluir"
        destructive
        onConfirm={handleExcluir}
      />
    </AppShell>
  )
}
