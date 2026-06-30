import { Loader2 } from "lucide-react"

export function LoadingState({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({ message }: { message?: string }) {
  return (
    <div className="m-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-10 text-center text-sm text-destructive">
      {message ?? "Não foi possível carregar os dados. Verifique se o backend está em execução na porta 8081."}
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
      <p className="text-pretty text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
