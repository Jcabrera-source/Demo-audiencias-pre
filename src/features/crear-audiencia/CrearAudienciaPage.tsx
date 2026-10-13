import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Edit3,
  FileCheck2,
  Gavel,
  House,
  LoaderCircle,
  Mail,
  Plus,
  Scale,
  Trash2,
  UserRound,
  UsersRound,
  Video,
  X,
} from 'lucide-react'
import {
  type FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import audiencePortalLogo from '../../assets/escudopj.png'
import type {
  AudienceData,
  FieldErrors,
  Participant,
  ParticipantDraft,
  ParticipantErrors,
} from './types'
import { validateParticipant, validateStep } from './validation'
import './styles.css'

const STORAGE_KEY = 'pjc-audiencia-borrador-v1'

const emptyParticipant: ParticipantDraft = {
  nombre: '',
  rol: '',
  caracter: '',
  email: '',
  dni: '',
  cuit: '',
  genero: '',
}

const initialData: AudienceData = {
  nombre: '',
  organismo: '',
  tipo: '',
  titulo: '',
  caratula: '',
  numeroCausa: '',
  descripcion: '',
  fecha: '',
  horaInicio: '',
  horaFin: '',
  modalidad: 'presencial',
  sala: '',
  teamsHabilitado: false,
  teamsGrabar: false,
  teamsSalaEspera: true,
  participantes: [],
  confirmado: false,
}

const steps = [
  { number: 1, label: 'Datos de la audiencia', short: 'Datos', icon: Gavel },
  { number: 2, label: 'Fecha y modalidad', short: 'Fecha', icon: CalendarDays },
  { number: 3, label: 'Participantes', short: 'Personas', icon: UsersRound },
  { number: 4, label: 'Revisión y creación', short: 'Revisión', icon: FileCheck2 },
]

type Notice = { type: 'success' | 'error' | 'info'; text: string } | null

export function CrearAudienciaPage() {
  const [data, setData] = useState<AudienceData>(initialData)
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Participant | null>(null)
  const [notice, setNotice] = useState<Notice>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdCode, setCreatedCode] = useState('')
  const mainHeadingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // El almacenamiento puede no estar disponible; el formulario sigue en memoria.
    }
  }, [])

  useEffect(() => {
    mainHeadingRef.current?.focus()
  }, [step])

  const update = <K extends keyof AudienceData>(field: K, value: AudienceData[K]) => {
    setData((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const focusFirstError = (nextErrors: FieldErrors) => {
    requestAnimationFrame(() => {
      const field = Object.keys(nextErrors)[0]
      if (!field) return
      const target = document.querySelector<HTMLElement>(`[name="${field}"], [data-field="${field}"]`)
      target?.focus()
    })
  }

  const goToStep = (nextStep: number) => {
    setStep(nextStep)
    setErrors({})
    setNotice(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const next = () => {
    const nextErrors = validateStep(step, data)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      focusFirstError(nextErrors)
      return
    }
    goToStep(Math.min(4, step + 1))
  }

  const openNewParticipant = () => {
    setEditingParticipant(null)
    setDrawerOpen(true)
  }

  const openEditParticipant = (participant: Participant) => {
    setEditingParticipant(participant)
    setDrawerOpen(true)
  }

  const saveParticipant = (participant: Participant) => {
    setData((current) => ({
      ...current,
      participantes: editingParticipant
        ? current.participantes.map((item) => (item.id === participant.id ? participant : item))
        : [...current.participantes, participant],
    }))
    setErrors({})
    setDrawerOpen(false)
    setEditingParticipant(null)
    setNotice({
      type: 'success',
      text: editingParticipant ? 'Participante actualizado.' : 'Participante agregado.',
    })
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    setData((current) => ({
      ...current,
      participantes: current.participantes.filter((item) => item.id !== pendingDelete.id),
    }))
    setPendingDelete(null)
    setNotice({ type: 'success', text: 'Participante eliminado.' })
  }

  const createAudience = async () => {
    const finalErrors = validateStep(4, data)
    setErrors(finalErrors)
    if (Object.keys(finalErrors).length) {
      focusFirstError(finalErrors)
      return
    }
    if (isSubmitting) return
    setIsSubmitting(true)
    setNotice({ type: 'info', text: 'Creando la audiencia…' })
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 1000))
      const causeDigits = data.numeroCausa.replace(/\D/g, '').slice(-4).padStart(4, '0')
      const year = data.fecha.slice(0, 4) || new Date().getFullYear().toString()
      const code = `AUD-${year}-${causeDigits}`
      setCreatedCode(code)
      setNotice({ type: 'success', text: `Audiencia creada correctamente. Código: ${code}.` })
    } catch {
      setNotice({ type: 'error', text: 'No se pudo crear la audiencia. Los datos continúan disponibles.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const startNewAudience = () => {
    setData({ ...initialData, participantes: [] })
    setStep(1)
    setErrors({})
    setDrawerOpen(false)
    setEditingParticipant(null)
    setPendingDelete(null)
    setNotice(null)
    setIsSubmitting(false)
    setCreatedCode('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="crear-audiencia-page">
      <Header />
      <main className="page-wrap">
        <section className="hero" aria-labelledby="page-title">
          <div className="hero-copy">
            <span className="eyebrow"><Scale size={16} /> Gestión de audiencias</span>
            <h1 id="page-title">Crear nueva audiencia</h1>
            <p>Completá la información requerida para registrar y programar una audiencia judicial.</p>
          </div>
          <div className="hero-mark" aria-hidden="true">
            <CalendarDays size={31} />
          </div>
        </section>

        <Stepper current={step} />

        {notice && (
          <div className={`notice notice-${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
            {notice.type === 'success' ? <CheckCircle2 /> : notice.type === 'error' ? <AlertCircle /> : <LoaderCircle />}
            <span>{notice.text}</span>
            <button type="button" className="icon-button notice-close" onClick={() => setNotice(null)} aria-label="Cerrar aviso">
              <X size={18} />
            </button>
          </div>
        )}

        <section className="form-card" aria-labelledby="step-heading">
          <div className="card-heading">
            <div className="step-kicker">Paso {step} de 4</div>
            <h2 id="step-heading" tabIndex={-1} ref={mainHeadingRef}>{steps[step - 1].label}</h2>
            <p>{stepDescriptions[step - 1]}</p>
          </div>

          {Object.keys(errors).length > 0 && step !== 3 && (
            <div className="error-summary" role="alert" tabIndex={-1}>
              <AlertCircle size={20} />
              <div>
                <strong>Revisá los campos indicados</strong>
                <p>Hay información pendiente o incorrecta antes de continuar.</p>
              </div>
            </div>
          )}

          {step === 1 && <GeneralStep data={data} errors={errors} update={update} />}
          {step === 2 && <ScheduleStep data={data} errors={errors} update={update} />}
          {step === 3 && (
            <ParticipantsStep
              participants={data.participantes}
              error={errors.participantes}
              onAdd={openNewParticipant}
              onEdit={openEditParticipant}
              onDelete={setPendingDelete}
            />
          )}
          {step === 4 && (
            <ReviewStep
              data={data}
              errors={errors}
              update={update}
              edit={goToStep}
              createdCode={createdCode}
              onStartNew={startNewAudience}
            />
          )}

          {!createdCode && (
            <div className="form-actions">
              <div className="action-group">
                {step > 1 && (
                  <button type="button" className="button button-secondary" onClick={() => goToStep(step - 1)}>
                    <ArrowLeft size={18} /> Anterior
                  </button>
                )}
                {step < 4 ? (
                  <button type="button" className="button button-primary" onClick={next}>
                    Continuar <ArrowRight size={18} />
                  </button>
                ) : (
                  <button type="button" className="button button-primary" onClick={createAudience} disabled={isSubmitting}>
                    {isSubmitting ? <LoaderCircle className="spin" size={18} /> : <Check size={18} />}
                    {isSubmitting ? 'Creando…' : 'Crear audiencia'}
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
      {drawerOpen && (
        <ParticipantDrawer
          participants={data.participantes}
          participant={editingParticipant}
          onClose={() => { setDrawerOpen(false); setEditingParticipant(null) }}
          onSave={saveParticipant}
        />
      )}
      {pendingDelete && (
        <ConfirmDialog participant={pendingDelete} onCancel={() => setPendingDelete(null)} onConfirm={confirmDelete} />
      )}
    </div>
  )
}

const stepDescriptions = [
  'Identificá la audiencia y vinculala con su causa y trámite.',
  'Definí cuándo, dónde y de qué manera se realizará.',
  'Incorporá las personas que participarán de la audiencia.',
  'Verificá toda la información antes de confirmar la creación.',
]

function Header() {
  return (
    <header className="ca-site-header">
      <div className="ca-header-inner">
        <div className="ca-brand">
          <div className="ca-brand-logo">
            <img src={audiencePortalLogo} alt="Provincia de Corrientes - Poder Judicial" />
          </div>
        </div>
      </div>
    </header>
  )
}

function Stepper({ current }: { current: number }) {
  return (
    <nav className="stepper" aria-label="Progreso del formulario">
      <ol>
        {steps.map(({ number, label, short, icon: Icon }) => (
          <li key={number} className={number < current ? 'complete' : number === current ? 'active' : ''} aria-current={number === current ? 'step' : undefined}>
            <div className="step-circle">{number < current ? <Check size={18} /> : <Icon size={18} />}</div>
            <div className="step-text"><span>{short}</span><strong>{label}</strong></div>
          </li>
        ))}
      </ol>
    </nav>
  )
}

type UpdateFn = <K extends keyof AudienceData>(field: K, value: AudienceData[K]) => void

function GeneralStep({ data, errors, update }: { data: AudienceData; errors: FieldErrors; update: UpdateFn }) {
  return (
    <div className="form-grid">
      <TextField name="nombre" label="Nombre" value={data.nombre} error={errors.nombre} required placeholder="Ej.: Audiencia preliminar Gómez" onChange={(value) => update('nombre', value)} />
      <SelectField name="organismo" label="Organismo o juzgado" value={data.organismo} error={errors.organismo} required onChange={(value) => update('organismo', value)} options={['Juzgado Civil y Comercial N.º 1', 'Juzgado de Familia N.º 2', 'Tribunal Oral Penal N.º 1', 'Cámara de Apelaciones']} />
      <SelectField name="tipo" label="Tipo de audiencia" value={data.tipo} error={errors.tipo} required onChange={(value) => update('tipo', value)} options={['Preliminar', 'Conciliación', 'Debate oral', 'Medidas cautelares', 'Testimonial']} />
      <TextField name="titulo" label="Título" value={data.titulo} error={errors.titulo} required placeholder="Título visible en la agenda" onChange={(value) => update('titulo', value)} />
      <TextField name="caratula" label="Carátula" value={data.caratula} error={errors.caratula} required placeholder="Apellido c/ Apellido s/ materia" onChange={(value) => update('caratula', value)} />
      <TextField name="numeroCausa" label="Número de causa" value={data.numeroCausa} error={errors.numeroCausa} required placeholder="Ej.: 12345/2026" onChange={(value) => update('numeroCausa', value)} />
      <div className="field field-wide">
        <label htmlFor="descripcion">Descripción u observaciones <span className="optional">(opcional)</span></label>
        <textarea id="descripcion" name="descripcion" rows={4} value={data.descripcion} onChange={(event) => update('descripcion', event.target.value)} placeholder="Agregá indicaciones relevantes para la organización de la audiencia." />
        <span className="field-hint">{data.descripcion.length}/1000 caracteres</span>
      </div>
    </div>
  )
}

function ScheduleStep({ data, errors, update }: { data: AudienceData; errors: FieldErrors; update: UpdateFn }) {
  return (
    <div className="form-grid">
      <TextField name="fecha" type="date" label="Fecha" value={data.fecha} error={errors.fecha} required onChange={(value) => update('fecha', value)} />
      <TextField name="horaInicio" type="time" label="Hora de inicio" value={data.horaInicio} error={errors.horaInicio} required onChange={(value) => update('horaInicio', value)} />
      <TextField name="horaFin" type="time" label="Hora de finalización" value={data.horaFin} error={errors.horaFin} required onChange={(value) => update('horaFin', value)} />
      <fieldset className="field field-wide">
        <legend>Modalidad <span className="required-mark">*</span></legend>
        <div className="choice-cards">
          {[
            { value: 'presencial', label: 'Presencial', description: 'En una sala o sede judicial', icon: Building2 },
            { value: 'virtual', label: 'Virtual', description: 'Mediante Microsoft Teams', icon: Video },
            { value: 'mixta', label: 'Mixta', description: 'Participación presencial y remota', icon: UsersRound },
          ].map(({ value, label, description, icon: Icon }) => (
            <label key={value} className={`choice-card ${data.modalidad === value ? 'selected' : ''}`}>
              <input type="radio" name="modalidad" value={value} checked={data.modalidad === value} onChange={() => update('modalidad', value as AudienceData['modalidad'])} />
              <Icon size={23} /><span><strong>{label}</strong><small>{description}</small></span>
            </label>
          ))}
        </div>
      </fieldset>
      {data.modalidad !== 'virtual' && (
        <div className="field-wide">
          <TextField name="sala" label="Sala o ubicación" value={data.sala} error={errors.sala} required placeholder="Sala 2, edificio central" onChange={(value) => update('sala', value)} />
        </div>
      )}
      {data.modalidad !== 'presencial' && (
        <fieldset className="teams-panel field-wide">
          <legend><Video size={20} /> Configuración de Microsoft Teams</legend>
          <Checkbox label="Crear reunión de Teams automáticamente" checked={data.teamsHabilitado} onChange={(value) => update('teamsHabilitado', value)} />
          <div className="teams-options">
            <Checkbox label="Habilitar sala de espera" checked={data.teamsSalaEspera} disabled={!data.teamsHabilitado} onChange={(value) => update('teamsSalaEspera', value)} />
            <Checkbox label="Grabar la audiencia" checked={data.teamsGrabar} disabled={!data.teamsHabilitado} onChange={(value) => update('teamsGrabar', value)} />
          </div>
        </fieldset>
      )}
    </div>
  )
}

function ParticipantsStep({ participants, error, onAdd, onEdit, onDelete }: { participants: Participant[]; error?: string; onAdd: () => void; onEdit: (participant: Participant) => void; onDelete: (participant: Participant) => void }) {
  return (
    <div>
      <div className="section-toolbar">
        <div><strong>{participants.length} {participants.length === 1 ? 'participante' : 'participantes'}</strong><span> incorporados a la audiencia</span></div>
        <button type="button" className="button button-primary" onClick={onAdd}><Plus size={18} /> Agregar participante</button>
      </div>
      {error && <p className="field-error participant-error" data-field="participantes" tabIndex={-1}><AlertCircle size={16} />{error}</p>}
      {participants.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><UsersRound size={30} /></div>
          <h3>Todavía no hay participantes</h3>
          <p>Agregá las personas que intervendrán en la audiencia y sus datos de contacto.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nombre y apellido</th><th>Rol / carácter</th><th>Documento</th><th>Contacto</th><th>Género</th><th>Validación</th><th><span className="sr-only">Acciones</span></th></tr></thead>
            <tbody>
              {participants.map((participant) => (
                <tr key={participant.id}>
                  <td data-label="Nombre"><strong>{participant.nombre}</strong></td>
                  <td data-label="Rol / carácter">{participant.rol}<small>{participant.caracter}</small></td>
                  <td data-label="Documento">DNI {participant.dni}<small>{participant.cuit ? `CUIT ${participant.cuit}` : 'Sin CUIT'}</small></td>
                  <td data-label="Contacto"><span className="email-cell"><Mail size={15} />{participant.email}</span></td>
                  <td data-label="Género">{participant.genero || 'No informado'}</td>
                  <td data-label="Validación"><span className={`status-badge status-${participant.estado.toLowerCase()}`}>{participant.estado}</span></td>
                  <td className="row-actions">
                    <button type="button" className="icon-button" onClick={() => onEdit(participant)} aria-label={`Editar a ${participant.nombre}`}><Edit3 size={18} /></button>
                    <button type="button" className="icon-button danger" onClick={() => onDelete(participant)} aria-label={`Eliminar a ${participant.nombre}`}><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ReviewStep({
  data,
  errors,
  update,
  edit,
  createdCode,
  onStartNew,
}: {
  data: AudienceData
  errors: FieldErrors
  update: UpdateFn
  edit: (step: number) => void
  createdCode: string
  onStartNew: () => void
}) {
  if (createdCode) {
    return (
      <div className="success-state" role="status">
        <div className="success-icon"><CheckCircle2 size={44} /></div>
        <h3>La audiencia fue creada</h3>
        <p>El registro se generó correctamente y quedó listo para su gestión.</p>
        <div className="created-code"><span>Código de audiencia</span><strong>{createdCode}</strong></div>
        <button type="button" className="button button-primary" onClick={onStartNew}>
          <House size={18} /> Inicio
        </button>
      </div>
    )
  }
  return (
    <div className="review-layout">
      <ReviewSection title="Datos generales" icon={<Gavel size={20} />} step={1} edit={edit}>
        <ReviewItem label="Nombre" value={data.nombre} /><ReviewItem label="Organismo" value={data.organismo} />
        <ReviewItem label="Tipo" value={data.tipo} /><ReviewItem label="Título" value={data.titulo} />
      </ReviewSection>
      <ReviewSection title="Fecha y modalidad" icon={<CalendarDays size={20} />} step={2} edit={edit}>
        <ReviewItem label="Fecha" value={formatDate(data.fecha)} /><ReviewItem label="Horario" value={`${data.horaInicio} a ${data.horaFin} h`} />
        <ReviewItem label="Modalidad" value={capitalize(data.modalidad)} /><ReviewItem label="Sala / ubicación" value={data.sala || 'No corresponde'} />
      </ReviewSection>
      <ReviewSection title="Causa" icon={<Scale size={20} />} step={1} edit={edit}>
        <ReviewItem label="Carátula" value={data.caratula} /><ReviewItem label="Número de causa" value={data.numeroCausa} />
      </ReviewSection>
      <ReviewSection title={`Participantes (${data.participantes.length})`} icon={<UsersRound size={20} />} step={3} edit={edit}>
        <div className="review-participants">
          {data.participantes.map((participant) => <span key={participant.id}><UserRound size={16} /><strong>{participant.nombre}</strong> · {participant.rol}</span>)}
        </div>
      </ReviewSection>
      <ReviewSection title="Microsoft Teams" icon={<Video size={20} />} step={2} edit={edit}>
        <ReviewItem label="Reunión automática" value={data.teamsHabilitado ? 'Sí' : 'No'} />
        <ReviewItem label="Sala de espera" value={data.teamsHabilitado && data.teamsSalaEspera ? 'Habilitada' : 'No habilitada'} />
        <ReviewItem label="Grabación" value={data.teamsHabilitado && data.teamsGrabar ? 'Habilitada' : 'No habilitada'} />
      </ReviewSection>
      <label className={`confirmation ${errors.confirmado ? 'has-error' : ''}`}>
        <input name="confirmado" type="checkbox" checked={data.confirmado} onChange={(event) => update('confirmado', event.target.checked)} />
        <span><strong>Confirmo que revisé la información</strong><small>Los datos ingresados son correctos y autorizo la creación de la audiencia.</small></span>
      </label>
      {errors.confirmado && <p className="field-error"><AlertCircle size={16} />{errors.confirmado}</p>}
    </div>
  )
}

function ReviewSection({ title, icon, step, edit, children }: { title: string; icon: React.ReactNode; step: number; edit: (step: number) => void; children: React.ReactNode }) {
  return (
    <section className="review-section">
      <div className="review-header"><h3>{icon}{title}</h3><button type="button" onClick={() => edit(step)}><Edit3 size={16} /> Editar</button></div>
      <div className="review-grid">{children}</div>
    </section>
  )
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return <div className="review-item"><span>{label}</span><strong>{value || 'No informado'}</strong></div>
}

function ParticipantDrawer({ participants, participant, onClose, onSave }: { participants: Participant[]; participant: Participant | null; onClose: () => void; onSave: (participant: Participant) => void }) {
  const [draft, setDraft] = useState<ParticipantDraft>(participant ?? emptyParticipant)
  const [errors, setErrors] = useState<ParticipantErrors>({})
  const titleId = useId()
  const panelRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    document.body.classList.add('no-scroll')
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled])'))
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.classList.remove('no-scroll')
      previousFocus?.focus()
    }
  }, [onClose])

  const change = <K extends keyof ParticipantDraft>(field: K, value: ParticipantDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors = validateParticipant(draft, participants, participant?.id)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    onSave({ ...draft, estado: 'Pendiente', id: participant?.id ?? crypto.randomUUID() })
  }

  return (
    <div className="overlay drawer-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={panelRef}>
        <div className="drawer-header">
          <div><span>Participantes</span><h2 id={titleId}>{participant ? 'Editar participante' : 'Agregar participante'}</h2></div>
          <button type="button" className="icon-button" onClick={onClose} ref={closeRef} aria-label="Cerrar panel"><X size={22} /></button>
        </div>
        <form onSubmit={submit} noValidate>
          <div className="drawer-body">
            <TextField name="participantNombre" label="Nombre y apellido" value={draft.nombre} error={errors.nombre} required placeholder="Nombre completo" onChange={(value) => change('nombre', value)} />
            <SelectField name="participantRol" label="Rol" value={draft.rol} error={errors.rol} required onChange={(value) => change('rol', value)} options={['Juez/a', 'Fiscal', 'Defensor/a', 'Abogado/a', 'Parte', 'Testigo', 'Perito/a']} />
            <SelectField name="participantCaracter" label="Carácter" value={draft.caracter} error={errors.caracter} required onChange={(value) => change('caracter', value)} options={['Titular', 'Apoderado/a', 'Patrocinante', 'Convocado/a', 'Interviniente']} />
            <TextField name="participantEmail" type="email" label="Correo electrónico" value={draft.email} error={errors.email} required placeholder="nombre@correo.com" onChange={(value) => change('email', value)} />
            <TextField name="participantDni" inputMode="numeric" label="DNI" value={draft.dni} error={errors.dni} required placeholder="Sin puntos" onChange={(value) => change('dni', value.replace(/\D/g, '').slice(0, 8))} />
            <TextField name="participantCuit" inputMode="numeric" label="CUIT" value={draft.cuit} error={errors.cuit} required placeholder="11 dígitos" onChange={(value) => change('cuit', value.replace(/\D/g, '').slice(0, 11))} />
            <SelectField name="participantGenero" label="Género" value={draft.genero} error={errors.genero} onChange={(value) => change('genero', value)} options={['Femenino', 'Masculino', 'No binario', 'Prefiere no informar']} />
          </div>
          <div className="drawer-actions">
            <button type="button" className="button button-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="button button-primary"><Check size={18} />{participant ? 'Guardar cambios' : 'Agregar participante'}</button>
          </div>
        </form>
      </aside>
    </div>
  )
}

function ConfirmDialog({ participant, onCancel, onConfirm }: { participant: Participant; onCancel: () => void; onConfirm: () => void }) {
  const titleId = useId()
  const confirmRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    confirmRef.current?.focus()
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onCancel() }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [onCancel])
  return (
    <div className="overlay dialog-overlay">
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="dialog-icon"><Trash2 size={24} /></div>
        <h2 id={titleId}>¿Eliminar participante?</h2>
        <p>Vas a quitar a <strong>{participant.nombre}</strong> de esta audiencia. Esta acción no se puede deshacer.</p>
        <div className="dialog-actions">
          <button type="button" className="button button-secondary" onClick={onCancel}>Cancelar</button>
          <button type="button" className="button button-danger" onClick={onConfirm} ref={confirmRef}>Eliminar</button>
        </div>
      </div>
    </div>
  )
}

interface TextFieldProps {
  name: string; label: string; value: string; error?: string; required?: boolean; placeholder?: string
  type?: string; inputMode?: 'numeric' | 'text'; icon?: React.ReactNode; onChange: (value: string) => void
}

function TextField({ name, label, value, error, required, placeholder, type = 'text', inputMode, icon, onChange }: TextFieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>{label}{required && <span className="required-mark" aria-hidden="true">*</span>}</label>
      <div className="input-wrap">{icon}<input id={id} name={name} type={type} inputMode={inputMode} value={value} placeholder={placeholder} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} onChange={(event) => onChange(event.target.value)} /></div>
      {error && <span id={errorId} className="field-error"><AlertCircle size={15} />{error}</span>}
    </div>
  )
}

interface SelectFieldProps {
  name: string; label: string; value: string; error?: string; required?: boolean; options: string[]; onChange: (value: string) => void
}

function SelectField({ name, label, value, error, required, options, onChange }: SelectFieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>{label}{required && <span className="required-mark" aria-hidden="true">*</span>}</label>
      <select id={id} name={name} value={value} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} onChange={(event) => onChange(event.target.value)}>
        <option value="">Seleccionar</option>
        {options.map((option) => <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>)}
      </select>
      {error && <span id={errorId} className="field-error"><AlertCircle size={15} />{error}</span>}
    </div>
  )
}

function Checkbox({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: (value: boolean) => void }) {
  return <label className={`checkbox ${disabled ? 'disabled' : ''}`}><input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} /><span>{label}</span></label>
}

function formatDate(value: string): string {
  if (!value) return 'No informada'
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`))
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
