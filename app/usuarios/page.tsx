"use client"

import { useEffect, useState } from "react"
import { useSWRConfig } from "swr"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Loader2, Shield, User } from "lucide-react"
import { AppShell, PageHeader } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { useUsuarios, usuariosApi } from "@/lib/api"
import type { Usuario, PerfilUsuario } from "@/lib/types"

export default function UsuariosPage() {
  const { data: usuarios, isLoading, error } = useUsuarios()
  const { mutate } = useSWRConfig()
  const [editing, setEditing] = useState<Usuario | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [excluir, setExcluir] = useState<Usuario | null>(null)

  function openNew() {
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(u: Usuario) {
    setEditing(u)
    setFormOpen(true)
  }

  async function handleExcluir() {
    if (!excluir) return
    try {
      await usuariosApi.deletar(excluir.id)
      await mutate("/api/sgrr/usuarios")
      toast.success("Usuário excluído.")
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Usuários"
        description="Gerencie os usuários do sistema e seus perfis de acesso."
        action={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" />
            Novo usuário
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
            ) : !usuarios || usuarios.length === 0 ? (
              <EmptyState message="Nenhum usuário cadastrado." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.nome}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        {u.perfil === "ADMINISTRADOR" ? (
                          <Badge variant="secondary" className="gap-1 text-primary">
                            <Shield className="h-3 w-3" />
                            Administrador
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-muted-foreground">
                            <User className="h-3 w-3" />
                            Usuário
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(u)} aria-label="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setExcluir(u)} aria-label="Excluir">
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

      <UsuarioFormDialog open={formOpen} onOpenChange={setFormOpen} usuario={editing} />

      <ConfirmDialog
        open={!!excluir}
        onOpenChange={(o) => !o && setExcluir(null)}
        title="Excluir usuário"
        description={`Deseja excluir o usuário "${excluir?.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        destructive
        onConfirm={handleExcluir}
      />
    </AppShell>
  )
}

function UsuarioFormDialog({
  open,
  onOpenChange,
  usuario,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  usuario: Usuario | null
}) {
  const { mutate } = useSWRConfig()
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [perfil, setPerfil] = useState<PerfilUsuario>("USUARIO")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setNome(usuario?.nome ?? "")
      setEmail(usuario?.email ?? "")
      setSenha("")
      setPerfil(usuario?.perfil ?? "USUARIO")
    }
  }, [open, usuario])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return toast.error("Informe o nome.")
    if (!email.trim()) return toast.error("Informe o e-mail.")
    if (!senha.trim()) return toast.error("Informe a senha.")

    setSaving(true)
    try {
      const payload = { nome: nome.trim(), email: email.trim(), senha, perfil }
      if (usuario) {
        await usuariosApi.atualizar(usuario.id, payload)
        toast.success("Usuário atualizado.")
      } else {
        await usuariosApi.criar(payload)
        toast.success("Usuário criado.")
      }
      await mutate("/api/sgrr/usuarios")
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
            <DialogTitle>{usuario ? "Editar usuário" : "Novo usuário"}</DialogTitle>
            <DialogDescription>Preencha os dados do usuário.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Maria Silva" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maria@empresa.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder={usuario ? "Defina uma nova senha" : "••••••••"}
              />
            </div>
            <div className="grid gap-2">
              <Label>Perfil</Label>
              <Select value={perfil} onValueChange={(v) => setPerfil(v as PerfilUsuario)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USUARIO">Usuário</SelectItem>
                  <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {usuario ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
