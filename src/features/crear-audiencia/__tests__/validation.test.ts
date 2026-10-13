import { describe, expect, it } from 'vitest'
import type { Participant } from '../types'
import { isDuplicateDni, isEndTimeAfterStart, validateParticipant } from '../validation'

const participant: Participant = {
  id: 'p-1',
  nombre: 'Ana Pérez',
  rol: 'Parte',
  caracter: 'Titular',
  email: 'ana@example.com',
  dni: '12.345.678',
  cuit: '',
  genero: 'Femenino',
  estado: 'Validado',
}

describe('validación de horarios', () => {
  it('acepta una finalización posterior al inicio', () => {
    expect(isEndTimeAfterStart('09:00', '10:30')).toBe(true)
  })

  it('rechaza horarios iguales o anteriores', () => {
    expect(isEndTimeAfterStart('10:30', '10:30')).toBe(false)
    expect(isEndTimeAfterStart('10:30', '09:00')).toBe(false)
  })
})

describe('validación de DNI duplicado', () => {
  it('normaliza separadores y detecta un DNI ya usado', () => {
    expect(isDuplicateDni('12345678', [participant])).toBe(true)
  })

  it('exceptúa al participante que se está editando', () => {
    expect(isDuplicateDni('12.345.678', [participant], 'p-1')).toBe(false)
  })

  it('expone un mensaje específico en el formulario', () => {
    const errors = validateParticipant(
      {
        nombre: 'Otra persona',
        rol: 'Testigo',
        caracter: 'Convocado/a',
        email: 'otra@example.com',
        dni: '12345678',
        cuit: '',
        genero: '',
      },
      [participant],
    )
    expect(errors.dni).toBe('Ya existe un participante con este DNI.')
  })
})
