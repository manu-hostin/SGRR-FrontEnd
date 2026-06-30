"use client"

import { useEffect, useState } from "react"
import { useSWRConfig } from "swr"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { AppShell, PageHeader } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { useEquipamentos, equipamentosApi } from "@/lib/api"
import type { Equipamento } from "@/lib/types"

export default function EquipamentosPage() {
  const { data: equipamentos, isLoading, error } = useEquipamentos()
  const { mutate } = useSWRConfig()
  const [editing, setEditing] = useState<Equipamento | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [excluir, setExcluir] = useState<Equipamento | null>(null)

  function openNew() {
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(eq: Equipamento) {
    setEditing(eq)
    setFormOpen(true)
  }

  async function handleExcluir() {
    if (!excluir) return
    try {
      await equipamentosApi.deletar(excluir.id)
      await mutate("/api/sgrr/equipamentos")
      toast.success("Equipamento excluído.")
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Equipamentos"
        description="Cadastre e gerencie os equipamentos disponíveis para reserva."
        action={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" />
            Novo equipamento
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
            ) : !equipamentos || equipamentos.length === 0 ? (
              <EmptyState message="Nenhum equipamento cadastrado." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Patrimônio</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipamentos.map((eq) => (
                    <TableRow key={eq.id}>
                      <TableCell className="font-medium">{eq.nome}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{eq.tipo}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{eq.patrimonio}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(eq)} aria-label="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setExcluir(eq)} aria-label="Excluir">
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

      <EquipamentoFormDialog open={formOpen} onOpenChange={setFormOpen} equipamento={editing} />

      <ConfirmDialog
        open={!!excluir}
        onOpenChange={(o) => !o && setExcluir(null)}
        title="Excluir equipamento"
        description={`Deseja excluir o equipamento "${excluir?.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        destructive
        onConfirm={handleExcluir}
      />
    </AppShell>
  )
}

function EquipamentoFormDialog({
  open,
  onOpenChange,
  equipamento,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  equipamento: Equipamento | null
}) {
  const { mutate } = useSWRConfig()
  const [nome, setNome] = useState("")
  const [tipo, setTipo] = useState("")
  const [patrimonio, setPatrimonio] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setNome(equipamento?.nome ?? "")
      setTipo(equipamento?.tipo ?? "")
      setPatrimonio(equipamento?.patrimonio ?? "")
    }
  }, [open, equipamento])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return toast.error("Informe o nome do equipamento.")
    if (!tipo.trim()) return toast.error("Informe o tipo.")
    if (!patrimonio.trim()) return toast.error("Informe o número de patrimônio.")

    setSaving(true)
    try {
      const payload = { nome: nome.trim(), tipo: tipo.trim(), patrimonio: patrimonio.trim() }
      if (equipamento) {
        await equipamentosApi.atualizar(equipamento.id, payload)
        toast.success("Equipamento atualizado.")
      } else {
        await equipamentosApi.criar(payload)
        toast.success("Equipamento criado.")
      }
      await mutate("/api/sgrr/equipamentos")
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
            <DialogTitle>{equipamento ? "Editar equipamento" : "Novo equipamento"}</DialogTitle>
            <DialogDescription>Preencha os dados do equipamento.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Projetor Epson" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Input id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} placeholder="Projetor" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="patrimonio">Patrimônio</Label>
              <Input
                id="patrimonio"
                value={patrimonio}
                onChange={(e) => setPatrimonio(e.target.value)}
                placeholder="PAT-00123"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {equipamento ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
