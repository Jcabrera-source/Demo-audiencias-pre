export type Modalidad = 'virtual' | 'presencial' | 'mixta'
export type EstadoValidacion = 'Validado' | 'Pendiente' | 'Observado'

export interface AudienceData {
  nombre: string
  organismo: string
  tipo: string
  titulo: string
  caratula: string
  numeroCausa: string
  descripcion: string
  fecha: string
  horaInicio: string
  horaFin: string
  modalidad: Modalidad
  sala: string
  teamsHabilitado: boolean
  teamsGrabar: boolean
  teamsSalaEspera: boolean
  participantes: Participant[]
  confirmado: boolean
}

export interface Participant {
  id: string
  nombre: string
  rol: string
  caracter: string
  email: string
  dni: string
  cuit: string
  genero: string
  estado: EstadoValidacion
}

export type ParticipantDraft = Omit<Participant, 'id' | 'estado'>
export type FieldErrors = Partial<Record<keyof AudienceData, string>>
export type ParticipantErrors = Partial<Record<keyof ParticipantDraft, string>>
