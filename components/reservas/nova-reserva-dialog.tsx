"use client"

import { useState } from "react"
import { useSWRConfig } from "swr"
import { toast } from "sonner"
import { Plus, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUsuarios, useSalas, useEquipamentos, reservasApi } from "@/lib/api"
import { toLocalDateTime } from "@/lib/format"

export function NovaReservaDialog() {
  const { mutate } = useSWRConfig()
  const { data: usuarios } = useUsuarios()
  const { data: salas } = useSalas()
  const { data: equipamentos } = useEquipamentos()

  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tipo, setTipo] = useState<"sala" | "equipamento">("sala")
  const [usuarioId, setUsuarioId] = useState("")
  const [salaId, setSalaId] = useState("")
  const [equipamentoId, setEquipamentoId] = useState("")
  const [inicio, setInicio] = useState("")
  const [fim, setFim] = useState("")

  function reset() {
    setTipo("sala")
    setUsuarioId("")
    setSalaId("")
    setEquipamentoId("")
    setInicio("")
    setFim("")
  }

  function handleOpenChange(o: boolean) {
    setOpen(o)
    if (o) reset()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!usuarioId) return toast.error("Selecione o usuário responsável.")
    if (tipo === "sala" && !salaId) return toast.error("Selecione uma sala.")
    if (tipo === "equipamento" && !equipamentoId) return toast.error("Selecione um equipamento.")
    if (!inicio) return toast.error("Informe a data/hora de início.")
    if (!fim) return toast.error("Informe a data/hora de fim.")
    if (new Date(fim) <= new Date(inicio)) return toast.error("O fim deve ser posterior ao início.")

    setSaving(true)
    try {
      await reservasApi.criar({
        usuarioId: Number(usuarioId),
        salaId: tipo === "sala" ? Number(salaId) : null,
        equipamentoId: tipo === "equipamento" ? Number(equipamentoId) : null,
        dataHoraInicio: toLocalDateTime(inicio),
        dataHoraFim: toLocalDateTime(fim),
      })
      await mutate("/api/sgrr/reservas")
      toast.success("Reserva criada com sucesso.")
      setOpen(false)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="h-4 w-4" />
            Nova reserva
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nova reserva</DialogTitle>
            <DialogDescription>Reserve uma sala ou um equipamento para um usuário.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Usuário responsável</Label>
              <Select value={usuarioId} onValueChange={setUsuarioId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios?.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Recurso</Label>
              <Tabs value={tipo} onValueChange={(v) => setTipo(v as "sala" | "equipamento")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="sala">Sala</TabsTrigger>
                  <TabsTrigger value="equipamento">Equipamento</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {tipo === "sala" ? (
              <div className="grid gap-2">
                <Label>Sala</Label>
                <Select value={salaId} onValueChange={setSalaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma sala" />
                  </SelectTrigger>
                  <SelectContent>
                    {salas?.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.nome} ({s.capacidade} lugares)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid gap-2">
                <Label>Equipamento</Label>
                <Select value={equipamentoId} onValueChange={setEquipamentoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um equipamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipamentos?.map((eq) => (
                      <SelectItem key={eq.id} value={String(eq.id)}>
                        {eq.nome} — {eq.tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="inicio">Início</Label>
                <Input id="inicio" type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fim">Fim</Label>
                <Input id="fim" type="datetime-local" value={fim} onChange={(e) => setFim(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Criar reserva
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
