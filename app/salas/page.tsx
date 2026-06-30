"use client"

import { useEffect, useState } from "react"
import { useSWRConfig } from "swr"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Loader2, Users } from "lucide-react"
import { AppShell, PageHeader } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoadingState, ErrorState, EmptyState } from "@/components/states"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useSalas, salasApi } from "@/lib/api"
import type { Sala } from "@/lib/types"

export default function SalasPage() {
  const { data: salas, isLoading, error } = useSalas()
  const { mutate } = useSWRConfig()
  const [editing, setEditing] = useState<Sala | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [excluir, setExcluir] = useState<Sala | null>(null)

  function openNew() {
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(s: Sala) {
    setEditing(s)
    setFormOpen(true)
  }

  async function handleExcluir() {
    if (!excluir) return
    try {
      await salasApi.deletar(excluir.id)
      await mutate("/api/sgrr/salas")
      toast.success("Sala excluída.")
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Salas"
        description="Cadastre e gerencie as salas disponíveis para reserva."
        action={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" />
            Nova sala
          </Button>
        }
      />
      <main className="flex-1 overflow-auto p-6">
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={(error as Error).message} />
            ) : !salas || salas.length === 0 ? (
              <EmptyState message="Nenhuma sala cadastrada." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Capacidade</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salas.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.nome}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          {s.capacidade}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{s.localizacao}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(s)} aria-label="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setExcluir(s)} aria-label="Excluir">
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

      <SalaFormDialog open={formOpen} onOpenChange={setFormOpen} sala={editing} />

      <ConfirmDialog
        open={!!excluir}
        onOpenChange={(o) => !o && setExcluir(null)}
        title="Excluir sala"
        description={`Deseja excluir a sala "${excluir?.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        destructive
        onConfirm={handleExcluir}
      />
    </AppShell>
  )
}

function SalaFormDialog({
  open,
  onOpenChange,
  sala,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  sala: Sala | null
}) {
  const { mutate } = useSWRConfig()
  const [nome, setNome] = useState("")
  const [capacidade, setCapacidade] = useState("")
  const [localizacao, setLocalizacao] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setNome(sala?.nome ?? "")
      setCapacidade(sala ? String(sala.capacidade) : "")
      setLocalizacao(sala?.localizacao ?? "")
    }
  }, [open, sala])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const cap = Number(capacidade)
    if (!nome.trim()) return toast.error("Informe o nome da sala.")
    if (!cap || cap <= 0) return toast.error("A capacidade deve ser maior que zero.")
    if (!localizacao.trim()) return toast.error("Informe a localização.")

    setSaving(true)
    try {
      const payload = { nome: nome.trim(), capacidade: cap, localizacao: localizacao.trim() }
      if (sala) {
        await salasApi.atualizar(sala.id, payload)
        toast.success("Sala atualizada.")
      } else {
        await salasApi.criar(payload)
        toast.success("Sala criada.")
      }
      await mutate("/api/sgrr/salas")
      onOpenChange(false)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{sala ? "Editar sala" : "Nova sala"}</DialogTitle>
            <DialogDescription>Preencha os dados da sala.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Sala de Reunião 1" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacidade">Capacidade</Label>
              <Input
                id="capacidade"
                type="number"
                min={1}
                value={capacidade}
                onChange={(e) => setCapacidade(e.target.value)}
                placeholder="10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="localizacao">Localização</Label>
              <Input
                id="localizacao"
                value={localizacao}
                onChange={(e) => setLocalizacao(e.target.value)}
                placeholder="Bloco A - 2º andar"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {sala ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
