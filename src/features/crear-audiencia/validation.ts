import type { AudienceData, FieldErrors, Participant, ParticipantDraft, ParticipantErrors } from './types'

export function isEndTimeAfterStart(start: string, end: string): boolean {
  if (!start || !end) return true
  return end > start
}

export function normalizeDocument(value: string): string {
  return value.replace(/\D/g, '')
}

export function isDuplicateDni(
  dni: string,
  participants: Participant[],
  editingId?: string,
): boolean {
  const normalized = normalizeDocument(dni)
  if (!normalized) return false
  return participants.some(
    (participant) =>
      participant.id !== editingId && normalizeDocument(participant.dni) === normalized,
  )
}

export function validateStep(step: number, data: AudienceData): FieldErrors {
  const errors: FieldErrors = {}
  if (step === 1) {
    if (!data.nombre.trim()) errors.nombre = 'Ingresá un nombre para identificar la audiencia.'
    if (!data.organismo) errors.organismo = 'Seleccioná el organismo o juzgado.'
    if (!data.tipo) errors.tipo = 'Seleccioná el tipo de audiencia.'
    if (!data.titulo.trim()) errors.titulo = 'Ingresá el título de la audiencia.'
    if (!data.caratula.trim()) errors.caratula = 'Ingresá la carátula de la causa.'
    if (!data.numeroCausa.trim()) errors.numeroCausa = 'Ingresá el número de causa.'
  }
  if (step === 2) {
    if (!data.fecha) errors.fecha = 'Seleccioná la fecha de la audiencia.'
    if (!data.horaInicio) errors.horaInicio = 'Ingresá la hora de inicio.'
    if (!data.horaFin) errors.horaFin = 'Ingresá la hora de finalización.'
    if (
      data.horaInicio &&
      data.horaFin &&
      !isEndTimeAfterStart(data.horaInicio, data.horaFin)
    ) {
      errors.horaFin = 'La hora de finalización debe ser posterior a la hora de inicio.'
    }
    if (data.modalidad !== 'virtual' && !data.sala.trim()) {
      errors.sala = 'Ingresá la sala o ubicación para la modalidad seleccionada.'
    }
  }
  if (step === 3 && data.participantes.length === 0) {
    errors.participantes = 'Agregá al menos un participante para continuar.'
  }
  if (step === 4 && !data.confirmado) {
    errors.confirmado = 'Debés confirmar que los datos son correctos antes de crear la audiencia.'
  }
  return errors
}

export function validateParticipant(
  draft: ParticipantDraft,
  participants: Participant[],
  editingId?: string,
): ParticipantErrors {
  const errors: ParticipantErrors = {}
  if (!draft.nombre.trim()) errors.nombre = 'Ingresá el nombre y apellido.'
  if (!draft.rol) errors.rol = 'Seleccioná un rol.'
  if (!draft.caracter) errors.caracter = 'Seleccioná el carácter.'
  if (!draft.email.trim()) {
    errors.email = 'Ingresá el correo electrónico.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) {
    errors.email = 'Ingresá un correo electrónico válido.'
  }
  const dni = normalizeDocument(draft.dni)
  if (!dni) {
    errors.dni = 'Ingresá el DNI.'
  } else if (dni.length < 7 || dni.length > 8) {
    errors.dni = 'El DNI debe tener 7 u 8 dígitos.'
  } else if (isDuplicateDni(dni, participants, editingId)) {
    errors.dni = 'Ya existe un participante con este DNI.'
  }
  const cuit = normalizeDocument(draft.cuit)
  if (!cuit) {
    errors.cuit = 'Ingresá el CUIT.'
  } else if (cuit.length !== 11) {
    errors.cuit = 'El CUIT debe tener 11 dígitos.'
  }
  return errors
}
