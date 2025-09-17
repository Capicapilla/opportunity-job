import { useState, useEffect, createContext, useContext } from 'react'
import { useNavigate, Routes, Route, Navigate, Link } from 'react-router-dom'
import { apiFetch } from './lib/api'
import './App.css'

// AuthContext
const AuthContext = createContext()
const ToastContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const userData = await apiFetch('/users/me')
        setUser(userData)
      } catch (err) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const login = async (email, password) => {
    const response = await apiFetch('/sessions', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setUser(response.user)
    return response
  }

  const logout = async () => {
    try {
      await apiFetch('/sessions/logout', { method: 'POST' })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  function showToast(message, type = 'info', timeoutMs = 3000) {
    const id = Math.random().toString(36).slice(2)
    setToasts(list => [...list, { id, message, type }])
    setTimeout(() => {
      setToasts(list => list.filter(t => t.id !== id))
    }, timeoutMs)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', top: 16, right: 16, display: 'grid', gap: 8, zIndex: 1000 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.type === 'success' ? '#10b981' : t.type === 'error' ? '#ef4444' : '#374151',
            color: 'white', padding: '12px 14px', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

//error 
//error 
//error 
//error 
//error 
//error 
//error 

function Navbar() { 
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <nav style={{
      background: '#2563eb',
      color: 'white',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Opportunity Job</h1>
        <Link to="/jobs" style={{ color: 'white', textDecoration: 'none' }}>Ofertas</Link>
        {user?.role === 'worker' && (
          <Link to="/applications" style={{ color: 'white', textDecoration: 'none' }}>Mis postulaciones</Link>
        )}
        {user?.role === 'employer' && (
          <Link to="/jobs/new" style={{ color: 'white', textDecoration: 'none' }}>Crear Oferta</Link>
        )}
        <Link to="/me" style={{ color: 'white', textDecoration: 'none' }}>Mi Perfil</Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span>Hola, {user.name}</span>
        <span style={{ 
          background: user.role === 'employer' ? '#10b981' : '#f59e0b',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          fontSize: '0.875rem'
        }}>
          {user.role === 'employer' ? 'Empresario' : 'Trabajador'}
        </span>
        <button 
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: '1px solid white',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            cursor: 'pointer'
          }}
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showToast } = useToast()
  const [email, setEmail] = useState('empresa1@test.com')
  const [password, setPassword] = useState('123456')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      showToast('Bienvenido/a', 'success')
      navigate('/jobs')
    } catch (err) {
      showToast(err.message, 'error')
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#1f2937' }}>
          Iniciar Sesión
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem',
                fontSize: '1rem'
              }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem',
                fontSize: '1rem'
              }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '0.25rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        {error && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.25rem',
            color: '#dc2626'
          }}>
            {error}
          </div>
        )}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#f3f4f6',
          borderRadius: '0.25rem',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <strong>Usuarios de prueba:</strong><br/>
          Empresario: empresa1@test.com / 123456<br/>
          Trabajador: worker1@test.com / 123456
        </div>
      </div>
    </div>
  )
}

function JobsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [applyingId, setApplyingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [company, setCompany] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const { showToast } = useToast()

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const data = await apiFetch('/jobs')
        if (mounted) setJobs(data)
      } catch (err) {
        if (mounted) setError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const handleApply = async (jobId) => {
    try {
      setApplyingId(jobId)
      await apiFetch(`/jobs/${jobId}/apply`, { method: 'POST' })
      showToast('¡Postulación enviada!', 'success')
      // Actaulizar lista de trabajos tras inscribirse
      const data = await apiFetch('/jobs')
      setJobs(data)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setApplyingId(null)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '1.5rem' }}>Cargando ofertas...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ color: '#dc2626', fontSize: '1.125rem' }}>Error: {error}</div>
      </div>
    )
  }

  const filtered = jobs.filter(job => {
    const matchesText = query.trim() === '' ||
      job.title?.toLowerCase().includes(query.toLowerCase()) ||
      job.descriptionMarkdown?.toLowerCase().includes(query.toLowerCase())
    const matchesCompany = company.trim() === '' ||
      (job.employer?.name || '').toLowerCase().includes(company.toLowerCase())
    const matchesDate = !dateFrom || new Date(job.date) >= new Date(dateFrom)
    return matchesText && matchesCompany && matchesDate
  })

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
          Ofertas de Trabajo
        </h1>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          Encuentra trabajos de 2-8 horas con mínimo 2 horas de antelación
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 200px', gap: '0.75rem', marginTop: '1rem' }}>
          <input placeholder="Buscar por título o descripción" value={query} onChange={e => setQuery(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: 6 }} />
          <input placeholder="Filtrar por empresa" value={company} onChange={e => setCompany(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: 6 }} />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: 6 }} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: '#f9fafb',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '1.125rem', color: '#6b7280' }}>
            No hay ofertas disponibles en este momento
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {filtered.map(job => (
            <div key={job._id} style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'box-shadow 0.2s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '600', 
                    color: '#1f2937',
                    margin: '0 0 0.5rem 0'
                  }}>
                    {job.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <span style={{
                      background: '#dbeafe',
                      color: '#1e40af',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem'
                    }}>
                      {job.employer?.name}
                    </span>
                    <span style={{
                      background: '#fef3c7',
                      color: '#92400e',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem'
                    }}>
                      {job.durationHours}h
                    </span>
                    <span style={{
                      background: '#f3f4f6',
                      color: '#374151',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem'
                    }}>
                      {job.applicants?.length || 0}/{job.maxApplicants} postulantes
                    </span>
                  </div>
                  <p style={{ 
                    color: '#6b7280', 
                    margin: '0 0 1rem 0',
                    lineHeight: '1.5'
                  }}>
                    <strong>Fecha:</strong> {new Date(job.date).toLocaleString('es-ES')}
                  </p>
                  <div style={{
                    background: '#f9fafb',
                    padding: '0.75rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem',
                    color: '#374151'
                  }}>
                    <div dangerouslySetInnerHTML={{ __html: job.descriptionMarkdown }} />
                  </div>
                </div>
                {user?.role === 'worker' && (() => {
                  const applicants = job.applicants || []
                  const currentUserId = user.id
                  const isApplied = applicants.some(a => (typeof a === 'string' ? a : a?._id) === currentUserId)
                  const isFull = (applicants.length || 0) >= (job.maxApplicants || 0)
                  const isLoading = applyingId === job._id
                  const disabled = isApplied || isFull || isLoading
                  const label = isApplied ? 'Ya postulado' : isFull ? 'Sin cupo' : (isLoading ? 'Postulando...' : 'Postularme')
                  if (disabled) {
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', marginLeft: '1rem' }}>
                        <span
                          aria-disabled
                          title={isApplied ? 'Ya estás inscrito' : 'La oferta alcanzó el máximo de candidatos'}
                          style={{
                            background: '#9ca3af',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'default',
                            userSelect: 'none'
                          }}
                        >
                          {label}
                        </span>
                        <small style={{ color: '#6b7280' }}>
                          {isApplied ? 'Ya estás postulado' : 'Ya no puedes inscribirte'}
                        </small>
                      </div>
                    )
                  }
                  return (
                    <button
                      onClick={() => handleApply(job._id)}
                      title={isApplied ? 'Ya estás inscrito' : isFull ? 'La oferta alcanzó el máximo de candidatos' : 'Postularme'}
                      style={{
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        marginLeft: '1rem'
                      }}
                    >
                      {label}
                    </button>
                  )
                })()}
                {user?.role === 'employer' && job.employer?._id === user.id && (
                  <Link to={`/jobs/${job._id}/applicants`} style={{ marginLeft: '1rem', color: '#2563eb' }}>
                    Ver candidatos
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MePage() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await apiFetch('/users/me/history')
        setHistory(data.history || [])
      } catch (err) {
        console.error('Error loading history:', err)
      } finally {
        setLoading(false)
      }
    }
    loadHistory()
  }, [])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '1.5rem' }}>Cargando historial...</div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '2rem' }}>
        Mi Perfil
      </h1>
      
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          Información Personal
        </h2>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <div><strong>Nombre:</strong> {user?.name}</div>
          <div><strong>Email:</strong> {user?.email}</div>
          <div><strong>Rol:</strong> 
            <span style={{
              background: user?.role === 'employer' ? '#10b981' : '#f59e0b',
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
              marginLeft: '0.5rem'
            }}>
              {user?.role === 'employer' ? 'Empresario' : 'Trabajador'}
            </span>
          </div>
        </div>
      </div>

      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          Historial de Trabajos
        </h2>
        {history.length === 0 ? (
          <div style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
            No tienes trabajos completados aún
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {history.map((job, index) => (
              <div key={index} style={{
                background: '#f9fafb',
                padding: '1rem',
                borderRadius: '0.25rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>
                  {job.title}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {user?.role === 'employer' ? 'Trabajadores:' : 'Empresa:'} {job.employer?.name || job.applicants?.map(a => a.name).join(', ')}
                  <br />
                  Duración: {job.durationHours}h
                  <br />
                  Completado: {new Date(job.completedAt).toLocaleString('es-ES')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MyApplicationsPage() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { showToast } = useToast()

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const data = await apiFetch('/users/me/applications')
        if (mounted) setApps(data.applications || [])
      } catch (err) {
        showToast(err.message, 'error')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [showToast])

  if (user?.role !== 'worker') return <Navigate to="/jobs" replace />
  if (loading) return <div style={{ padding: '2rem' }}>Cargando...</div>

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ marginTop: 0 }}>Mis postulaciones</h2>
      {apps.length === 0 ? (
        <div style={{ color: '#6b7280' }}>No tienes postulaciones.</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {apps.map(job => (
            <div key={job._id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{job.title}</div>
                  <div style={{ color: '#6b7280', fontSize: 14 }}>
                    Empresa: {job.employer?.name} · {job.durationHours}h · {new Date(job.date).toLocaleString('es-ES')}
                  </div>
                </div>
                <div>
                  <span style={{
                    background: job.status === 'completed' ? '#10b981' : '#f59e0b',
                    color: '#fff', padding: '4px 8px', borderRadius: 6, fontSize: 12
                  }}>{job.status === 'completed' ? 'Completado' : 'Pendiente'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ApplicantsPage() {
  const [applicants, setApplicants] = useState([])
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { showToast } = useToast()

  const jobId = window.location.pathname.split('/')[2]

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await apiFetch(`/jobs/${jobId}/applicants`)
        if (mounted) {
          setApplicants(res.applicants || [])
          setJob({ _id: jobId })
        }
      } catch (err) {
        showToast(err.message, 'error')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [jobId, showToast])

  if (user?.role !== 'employer') return <Navigate to="/jobs" replace />
  if (loading) return <div style={{ padding: '2rem' }}>Cargando...</div>

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ marginTop: 0 }}>Candidatos</h2>
      {applicants.length === 0 ? (
        <div style={{ color: '#6b7280' }}>No hay candidatos para esta oferta aún.</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {applicants.map(a => (
            <div key={a._id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', padding: 16 }}>
              <div style={{ fontWeight: 600 }}>{a.name}</div>
              <div style={{ color: '#6b7280', fontSize: 14 }}>{a.email}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CreateJobPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    descriptionMarkdown: '',
    date: '',
    durationHours: 4,
    maxApplicants: 10,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && user.role !== 'employer') {
      navigate('/jobs')
    }
  }, [user, navigate])

  function toISO(datetimeLocal) {
    // datetime-local genera string sin zona; conviértelo a ISO manteniendo hora local
    const dt = new Date(datetimeLocal)
    return dt.toISOString()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // validación simple en cliente
      const jobDate = new Date(form.date)
      const nowPlus2h = new Date(Date.now() + 2 * 60 * 60 * 1000)
      if (isNaN(jobDate.getTime()) || jobDate < nowPlus2h) {
        throw new Error('La fecha debe tener al menos 2 horas de antelación')
      }
      if (form.durationHours < 1 || form.durationHours > 12) {
        throw new Error('La duración debe estar entre 1 y 12 horas')
      }
      if (form.maxApplicants < 1 || form.maxApplicants > 10) {
        throw new Error('El máximo de postulantes debe estar entre 1 y 10')
      }

      await apiFetch('/jobs', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          date: toISO(form.date),
          durationHours: Number(form.durationHours),
          maxApplicants: Number(form.maxApplicants),
        }),
      })
      navigate('/jobs')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'employer') {
    return null
  }

  return (
    <div style={{ maxWidth: '720px', margin: '24px auto', background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <h2 style={{ marginTop: 0, fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>Crear Oferta</h2>
      <form onSubmit={handleSubmit}>
        {/* Título */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>Título</label>
          <input 
            value={form.title} 
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
              fontSize: '1rem'
            }}
          />
        </div>

        {/* Descripción Markdown */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>Descripción (Markdown)</label>
          <textarea 
            rows={5} 
            value={form.descriptionMarkdown} 
            onChange={e => setForm(f => ({ ...f, descriptionMarkdown: e.target.value }))} 
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
              fontSize: '1rem',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Fecha */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>Fecha y hora</label>
          <input 
            type="datetime-local" 
            value={form.date} 
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))} 
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
              fontSize: '1rem'
            }}
          />
        </div>

        {/* Duración */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>Duración (horas)</label>
          <input 
            type="number" 
            min={1} 
            max={12} 
            value={form.durationHours} 
            onChange={e => setForm(f => ({ ...f, durationHours: e.target.value }))} 
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
              fontSize: '1rem'
            }}
          />
        </div>

        {/* Máximo de gente que puede inscribirse */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>Máximo de postulantes</label>
          <input 
            type="number" 
            min={1} 
            max={10} 
            value={form.maxApplicants} 
            onChange={e => setForm(f => ({ ...f, maxApplicants: e.target.value }))} 
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
              fontSize: '1rem'
            }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            background: loading ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.25rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {loading ? 'Creando...' : 'Crear Oferta'}
        </button>
      </form>

      {error && (
        <div style={{
          marginTop: '12px',
          padding: '0.75rem',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.25rem',
          color: '#dc2626'
        }}>
          {error}
        </div>
      )}
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Cargando...</div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return children
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
          <Navbar />
    <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/jobs" element={
            <ProtectedRoute>
              <JobsPage />
            </ProtectedRoute>
          } />
          <Route path="/jobs/new" element={
            <ProtectedRoute>
              <CreateJobPage />
            </ProtectedRoute>
          } />
          <Route path="/jobs/:id/applicants" element={
            <ProtectedRoute>
              <ApplicantsPage />
            </ProtectedRoute>
          } />
          <Route path="/applications" element={
            <ProtectedRoute>
              <MyApplicationsPage />
            </ProtectedRoute>
          } />
          <Route path="/me" element={
            <ProtectedRoute>
              <MePage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/jobs" replace />} />
    </Routes>
        </div>
      </AuthProvider>
    </ToastProvider>
  )
}