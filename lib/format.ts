export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Converte um valor de <input type="datetime-local"> para ISO LocalDateTime
// que o Spring Boot espera (ex.: "2026-06-16T14:30:00")
export function toLocalDateTime(value: string): string {
  if (!value) return ""
  return value.length === 16 ? `${value}:00` : value
}
