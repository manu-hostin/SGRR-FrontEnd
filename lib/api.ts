"use client"

import useSWR from "swr"
import type {
  Usuario,
  UsuarioRequest,
  Sala,
  SalaRequest,
  Equipamento,
  EquipamentoRequest,
  Reserva,
  ReservaRequest,
} from "@/lib/types"

const BASE = "/api/sgrr"

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json()
    if (typeof data === "string") return data
    if (data?.message) return data.message
    if (data?.errors && Array.isArray(data.errors)) {
      return data.errors.map((e: { defaultMessage?: string }) => e.defaultMessage).join(", ")
    }
    const values = Object.values(data).filter((v) => typeof v === "string")
    if (values.length) return values.join(", ")
  } catch {
    // ignora
  }
  return `Erro ${res.status}`
}

export const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) {
    throw new ApiError(await parseError(res), res.status)
  }
  return res.json()
}

async function mutateRequest<T>(url: string, method: string, body?: unknown): Promise<T | null> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    throw new ApiError(await parseError(res), res.status)
  }
  const text = await res.text()
  return text ? (JSON.parse(text) as T) : null
}

/* ----------------------------- Hooks SWR ----------------------------- */

export function useReservas() {
  return useSWR<Reserva[]>(`${BASE}/reservas`, fetcher)
}
export function useUsuarios() {
  return useSWR<Usuario[]>(`${BASE}/usuarios`, fetcher)
}
export function useSalas() {
  return useSWR<Sala[]>(`${BASE}/salas`, fetcher)
}
export function useEquipamentos() {
  return useSWR<Equipamento[]>(`${BASE}/equipamentos`, fetcher)
}

/* ----------------------------- Reservas ----------------------------- */

export const reservasApi = {
  criar: (data: ReservaRequest) => mutateRequest<Reserva>(`${BASE}/reservas`, "POST", data),
  cancelar: (id: number) => mutateRequest<Reserva>(`${BASE}/reservas/${id}/cancelar`, "PATCH"),
  deletar: (id: number) => mutateRequest<void>(`${BASE}/reservas/${id}`, "DELETE"),
}

/* ----------------------------- Usuários ----------------------------- */

export const usuariosApi = {
  criar: (data: UsuarioRequest) => mutateRequest<Usuario>(`${BASE}/usuarios`, "POST", data),
  atualizar: (id: number, data: UsuarioRequest) => mutateRequest<Usuario>(`${BASE}/usuarios/${id}`, "PUT", data),
  deletar: (id: number) => mutateRequest<void>(`${BASE}/usuarios/${id}`, "DELETE"),
}

/* ----------------------------- Salas ----------------------------- */

export const salasApi = {
  criar: (data: SalaRequest) => mutateRequest<Sala>(`${BASE}/salas`, "POST", data),
  atualizar: (id: number, data: SalaRequest) => mutateRequest<Sala>(`${BASE}/salas/${id}`, "PUT", data),
  deletar: (id: number) => mutateRequest<void>(`${BASE}/salas/${id}`, "DELETE"),
}

/* ----------------------------- Equipamentos ----------------------------- */

export const equipamentosApi = {
  criar: (data: EquipamentoRequest) => mutateRequest<Equipamento>(`${BASE}/equipamentos`, "POST", data),
  atualizar: (id: number, data: EquipamentoRequest) =>
    mutateRequest<Equipamento>(`${BASE}/equipamentos/${id}`, "PUT", data),
  deletar: (id: number) => mutateRequest<void>(`${BASE}/equipamentos/${id}`, "DELETE"),
}

export { ApiError }
