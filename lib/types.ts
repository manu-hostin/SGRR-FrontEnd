// Tipos espelhando os DTOs do backend Spring Boot (SGRR)

export type PerfilUsuario = "ADMINISTRADOR" | "USUARIO"
export type StatusReserva = "CONFIRMADA" | "CANCELADA"

export interface Usuario {
  id: number
  nome: string
  email: string
  perfil: PerfilUsuario
}

export interface UsuarioRequest {
  nome: string
  email: string
  senha: string
  perfil: PerfilUsuario
}

export interface Sala {
  id: number
  nome: string
  capacidade: number
  localizacao: string
}

export interface SalaRequest {
  nome: string
  capacidade: number
  localizacao: string
}

export interface Equipamento {
  id: number
  nome: string
  tipo: string
  patrimonio: string
}

export interface EquipamentoRequest {
  nome: string
  tipo: string
  patrimonio: string
}

export interface Reserva {
  id: number
  usuarioId: number
  usuarioNome: string
  salaId: number | null
  salaNome: string | null
  equipamentoId: number | null
  equipamentoNome: string | null
  dataHoraInicio: string
  dataHoraFim: string
  status: StatusReserva
}

export interface ReservaRequest {
  usuarioId: number
  salaId: number | null
  equipamentoId: number | null
  dataHoraInicio: string
  dataHoraFim: string
}
