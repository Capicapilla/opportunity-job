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
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/jobs">Opportunity Job</Link>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/jobs">Ofertas</Link>
            </li>
            {user?.role === 'worker' && (
              <li className="nav-item">
                <Link className="nav-link" to="/applications">Mis postulaciones</Link>
              </li>
            )}
            {user?.role === 'employer' && (
              <li className="nav-item">
                <Link className="nav-link" to="/jobs/new">Crear Oferta</Link>
              </li>
            )}
            <li className="nav-item">
              <Link className="nav-link" to="/me">Mi Perfil</Link>
            </li>
          </ul>
          
          <div className="d-flex align-items-center gap-3">
            <span className="text-white">Hola, {user.name}</span>
            <span className={`badge ${user.role === 'employer' ? 'bg-success' : 'bg-warning'}`}>
              {user.role === 'employer' ? 'Empresario' : 'Trabajador'}
            </span>
            <button 
              onClick={handleLogout}
              className="btn btn-outline-light btn-sm"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Estados para login
  const [loginEmail, setLoginEmail] = useState('empresa1@test.com')
  const [loginPassword, setLoginPassword] = useState('123456')
  
  // Estados para registro
  const [registerForm, setRegisterForm] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    socialSecurityNumber: '',
    companyName: '',
    companyDescription: '',
    role: 'worker'
  })

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(loginEmail, loginPassword)
      showToast('Bienvenido/a', 'success')
      navigate('/jobs')
    } catch (err) {
      showToast(err.message, 'error')
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    
    // Validaciones
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    
    if (registerForm.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    
    if (registerForm.age < 18 || registerForm.age > 65) {
      setError('La edad debe estar entre 18 y 65 años')
      return
    }
    
    setLoading(true)
    try {
      await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify(registerForm)
      })
      showToast('Registro exitoso. Ahora puedes iniciar sesión', 'success')
      setActiveTab('login')
      setRegisterForm({
        name: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        age: '',
        socialSecurityNumber: '',
        companyName: '',
        companyDescription: '',
        role: 'worker'
      })
    } catch (err) {
      showToast(err.message, 'error')
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target
    setRegisterForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
      <div className="card shadow-lg" style={{ width: '100%', maxWidth: '500px' }}>
        <div className="card-body p-4">
          {/* Pestañas */}
          <ul className="nav nav-tabs mb-4" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => setActiveTab('login')}
                type="button"
              >
                Iniciar Sesión
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => setActiveTab('register')}
                type="button"
              >
                Registrarse
              </button>
            </li>
          </ul>

          {/* Contenido de las pestañas */}
          <div className="tab-content">
            {/* Tab de Login */}
            {activeTab === 'login' && (
              <div>
                <h4 className="text-center mb-4">Iniciar Sesión</h4>
                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label htmlFor="loginEmail" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="loginEmail"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="loginPassword" className="form-label">Contraseña</label>
                    <input
                      type="password"
                      className="form-control"
                      id="loginPassword"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? 'Entrando...' : 'Entrar'}
                  </button>
                </form>
              </div>
            )}

            {/* Tab de Registro */}
            {activeTab === 'register' && (
              <div>
                <h4 className="text-center mb-4">Registrarse</h4>
                
                {/* Selección de tipo de usuario */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Tipo de usuario</label>
                  <div className="row">
                    <div className="col-6">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="userType"
                          id="workerType"
                          value="worker"
                          checked={registerForm.role === 'worker'}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, role: e.target.value }))}
                        />
                        <label className="form-check-label" htmlFor="workerType">
                          <i className="bi bi-person-workspace me-2"></i>
                          Trabajador
                        </label>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="userType"
                          id="employerType"
                          value="employer"
                          checked={registerForm.role === 'employer'}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, role: e.target.value }))}
                        />
                        <label className="form-check-label" htmlFor="employerType">
                          <i className="bi bi-building me-2"></i>
                          Empresa
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleRegister}>
                  {/* Campos comunes */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="name" className="form-label">Nombre</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={registerForm.name}
                        onChange={handleRegisterInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="lastName" className="form-label">Apellidos</label>
                      <input
                        type="text"
                        className="form-control"
                        id="lastName"
                        name="lastName"
                        value={registerForm.lastName}
                        onChange={handleRegisterInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={registerForm.email}
                        onChange={handleRegisterInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="password" className="form-label">Contraseña</label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={registerForm.password}
                        onChange={handleRegisterInputChange}
                        required
                        minLength="6"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="confirmPassword" className="form-label">Confirmar contraseña</label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={registerForm.confirmPassword}
                        onChange={handleRegisterInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="age" className="form-label">Edad</label>
                      <input
                        type="number"
                        className="form-control"
                        id="age"
                        name="age"
                        value={registerForm.age}
                        onChange={handleRegisterInputChange}
                        required
                        min="18"
                        max="65"
                      />
                    </div>
                  </div>

                  {/* Campos específicos para trabajadores */}
                  {registerForm.role === 'worker' && (
                    <div className="row">
                      <div className="col-12 mb-3">
                        <label htmlFor="socialSecurityNumber" className="form-label">Número de Seguridad Social</label>
                        <input
                          type="text"
                          className="form-control"
                          id="socialSecurityNumber"
                          name="socialSecurityNumber"
                          value={registerForm.socialSecurityNumber}
                          onChange={handleRegisterInputChange}
                          required
                          placeholder="12345678901"
                        />
                      </div>
                    </div>
                  )}

                  {/* Campos específicos para empresas */}
                  {registerForm.role === 'employer' && (
                    <div className="row">
                      <div className="col-12 mb-3">
                        <label htmlFor="companyName" className="form-label">Nombre de la empresa</label>
                        <input
                          type="text"
                          className="form-control"
                          id="companyName"
                          name="companyName"
                          value={registerForm.companyName}
                          onChange={handleRegisterInputChange}
                          required
                          placeholder="Mi Empresa S.L."
                        />
                      </div>
                      <div className="col-12 mb-3">
                        <label htmlFor="companyDescription" className="form-label">Descripción de la empresa</label>
                        <textarea
                          className="form-control"
                          id="companyDescription"
                          name="companyDescription"
                          value={registerForm.companyDescription}
                          onChange={handleRegisterInputChange}
                          rows="3"
                          placeholder="Describe brevemente tu empresa y el tipo de trabajos que ofreces..."
                        />
                      </div>
                    </div>
                  )}
                  
                  <button 
                    type="submit" 
                    className={`btn w-100 ${registerForm.role === 'worker' ? 'btn-success' : 'btn-primary'}`}
                    disabled={loading}
                  >
                    {loading ? 'Registrando...' : `Registrarse como ${registerForm.role === 'worker' ? 'Trabajador' : 'Empresa'}`}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="alert alert-danger mt-3" role="alert">
              {error}
            </div>
          )}

          {/* Información de usuarios de prueba */}
          {activeTab === 'login' && (
            <div className="mt-4 p-3 bg-light rounded">
              <small className="text-muted">
                <strong>Usuarios de prueba:</strong><br/>
                Empresario: empresa1@test.com / 123456<br/>
                Trabajador: worker1@test.com / 123456
              </small>
            </div>
          )}
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
    <div className="bg-light min-vh-100">
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="mb-4">
              <h1 className="display-4 fw-bold text-dark mb-2">
                Ofertas de Trabajo
              </h1>
              <p className="lead text-muted">
                Encuentra trabajos de 2-8 horas con mínimo 2 horas de antelación
              </p>
              <div className="row g-3 mt-3">
                <div className="col-md-4">
                  <input 
                    className="form-control" 
                    placeholder="Buscar por título o descripción" 
                    value={query} 
                    onChange={e => setQuery(e.target.value)} 
                  />
                </div>
                <div className="col-md-4">
                  <input 
                    className="form-control" 
                    placeholder="Filtrar por empresa" 
                    value={company} 
                    onChange={e => setCompany(e.target.value)} 
                  />
                </div>
                <div className="col-md-4">
                  <input 
                    type="date" 
                    className="form-control" 
                    value={dateFrom} 
                    onChange={e => setDateFrom(e.target.value)} 
                  />
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center p-5 bg-white rounded shadow-sm">
                <div className="h5 text-muted">
                  No hay ofertas disponibles en este momento
                </div>
              </div>
            ) : (
              <div className="row g-4">
                {filtered.map(job => (
                  <div key={job._id} className="col-12">
                    <div className="card shadow-sm h-100">
                      <div className="card-body">
                        <div className="row">
                          <div className="col-lg-8">
                            <h5 className="card-title fw-bold text-dark mb-3">
                              {job.title}
                            </h5>
                            <div className="d-flex flex-wrap gap-2 mb-3">
                              <span className="badge bg-primary">
                                {job.employer?.name}
                              </span>
                              <span className="badge bg-warning text-dark">
                                {job.durationHours}h
                              </span>
                              <span className="badge bg-secondary">
                                {job.applicants?.length || 0}/{job.maxApplicants} postulantes
                              </span>
                            </div>
                            <p className="text-muted mb-3">
                              <strong>Fecha:</strong> {new Date(job.date).toLocaleString('es-ES')}
                            </p>
                            <div className="bg-light p-3 rounded">
                              <div dangerouslySetInnerHTML={{ __html: job.descriptionMarkdown }} />
                            </div>
                          </div>
                          <div className="col-lg-4 d-flex align-items-start justify-content-center pt-2 pt-lg-0">
                            {user?.role === 'worker' && (() => {
                              const applicants = job.applicants || []
                              const currentUserId = user._id
                              const isApplied = applicants.some(a => (typeof a === 'string' ? a : a?._id) === currentUserId)
                              const isFull = (applicants.length || 0) >= (job.maxApplicants || 0)
                              const isLoading = applyingId === job._id
                              const disabled = isApplied || isFull || isLoading
                              const label = isApplied ? 'Ya postulado' : isFull ? 'No se puede aplicar' : (isLoading ? 'Postulando...' : 'Postularme')
                              if (disabled) {
                                return (
                                  <div className="text-center">
                                    <span className={`btn ${isApplied ? 'btn-secondary' : 'btn-outline-secondary'} disabled`}>
                                      {label}
                                    </span>
                                    <small className="d-block text-muted mt-1">
                                      {isApplied ? 'Ya estás postulado' : 'Ya no puedes inscribirte'}
                                    </small>
                                  </div>
                                )
                              }
                              return (
                                <button
                                  onClick={() => handleApply(job._id)}
                                  className="btn btn-primary"
                                  disabled={isLoading}
                                >
                                  {isLoading ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                      Postulando...
                                    </>
                                  ) : (
                                    label
                                  )}
                                </button>
                              )
                            })()}
                            {user?.role === 'employer' && job.employer?._id === user._id && (
                              <Link to={`/jobs/${job._id}/applicants`} className="btn btn-outline-primary">
                                Ver candidatos
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MePage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({
    education: '',
    experience: '',
    skills: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    async function loadData() {
      if (!user) {
        setLoading(false)
        return
      }
      
      try {
        const [historyData, profileData] = await Promise.all([
          apiFetch('/users/me/history'),
          apiFetch('/users/me')
        ])
        setHistory(historyData.history || [])
        
        // Actualizar el formulario con los datos del perfil
        if (profileData) {
          setProfileForm({
            education: profileData.education || '',
            experience: profileData.experience || '',
            skills: profileData.skills ? profileData.skills.join(', ') : '',
            phone: profileData.phone || '',
            address: profileData.address || ''
          })
        }
      } catch (err) {
        console.error('Error loading data:', err)
        showToast('Error cargando datos del perfil', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user, showToast])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      
      const skillsArray = profileForm.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0)

      const updateData = {
        ...profileForm,
        skills: skillsArray
      }

      await apiFetch('/users/me', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      })

      setIsEditing(false)
      showToast('Perfil actualizado correctamente', 'success')
      
      window.location.reload()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setProfileForm({
      education: user?.education || '',
      experience: user?.experience || '',
      skills: user?.skills ? user.skills.join(', ') : '',
      phone: user?.phone || '',
      address: user?.address || ''
    })
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <div className="mt-3">Cargando perfil...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h2>No estás autenticado</h2>
          <p>Por favor, inicia sesión para ver tu perfil.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-light min-vh-100">
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="display-4 fw-bold text-dark mb-0">
                Mi Perfil
              </h1>
              {user?.role === 'worker' && (
                <button
                  className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancelar' : 'Editar Perfil'}
                </button>
              )}
            </div>
            
            <div className="row g-4">
              <div className="col-lg-6">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <h5 className="card-title fw-bold mb-3">
                      Información Personal
                    </h5>
                    <div className="row g-2">
                      <div className="col-12">
                        <strong>Nombre:</strong> {user?.name}
                      </div>
                      <div className="col-12">
                        <strong>Email:</strong> {user?.email}
                      </div>
                      <div className="col-12">
                        <strong>Edad:</strong> {user?.age} años
                      </div>
                      <div className="col-12">
                        <strong>Rol:</strong> 
                        <span className={`badge ${user?.role === 'employer' ? 'bg-success' : 'bg-warning'} ms-2`}>
                          {user?.role === 'employer' ? 'Empresario' : 'Trabajador'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulario de Perfil (solo para workers) */}
              {user?.role === 'worker' && (
                <div className="col-lg-6">
                  <div className="card shadow-sm h-100">
                    <div className="card-body">
                      <h5 className="card-title fw-bold mb-3">
                        {isEditing ? 'Completar Perfil' : 'Mi Perfil Profesional'}
                      </h5>
                      
                      {isEditing ? (
                        <form onSubmit={handleSaveProfile}>
                          <div className="mb-3">
                            <label htmlFor="education" className="form-label">Formación</label>
                            <textarea
                              className="form-control"
                              id="education"
                              name="education"
                              value={profileForm.education}
                              onChange={handleInputChange}
                              rows="3"
                              placeholder="Ej: Grado en Ingeniería Informática, Universidad XYZ (2020-2024)"
                            />
                          </div>

                          <div className="mb-3">
                            <label htmlFor="experience" className="form-label">Experiencia Laboral</label>
                            <textarea
                              className="form-control"
                              id="experience"
                              name="experience"
                              value={profileForm.experience}
                              onChange={handleInputChange}
                              rows="3"
                              placeholder="Ej: 2 años como desarrollador web en empresa ABC, especializado en React y Node.js"
                            />
                          </div>

                          <div className="mb-3">
                            <label htmlFor="skills" className="form-label">Habilidades</label>
                            <input
                              type="text"
                              className="form-control"
                              id="skills"
                              name="skills"
                              value={profileForm.skills}
                              onChange={handleInputChange}
                              placeholder="Ej: JavaScript, React, Node.js, Python, Comunicación, Trabajo en equipo"
                            />
                            <div className="form-text">Separa las habilidades con comas</div>
                          </div>

                          <div className="mb-3">
                            <label htmlFor="phone" className="form-label">Teléfono</label>
                            <input
                              type="tel"
                              className="form-control"
                              id="phone"
                              name="phone"
                              value={profileForm.phone}
                              onChange={handleInputChange}
                              placeholder="Ej: +34 123 456 789"
                            />
                          </div>

                          <div className="mb-3">
                            <label htmlFor="address" className="form-label">Dirección</label>
                            <input
                              type="text"
                              className="form-control"
                              id="address"
                              name="address"
                              value={profileForm.address}
                              onChange={handleInputChange}
                              placeholder="Ej: Calle Mayor 123, Madrid, España"
                            />
                          </div>

                          <div className="d-grid gap-2">
                            <button
                              type="submit"
                              className="btn btn-primary"
                              disabled={saving}
                            >
                              {saving ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Guardando...
                                </>
                              ) : (
                                'Guardar Perfil'
                              )}
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={handleCancelEdit}
                              disabled={saving}
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div>
                          <div className="mb-3">
                            <strong>Formación:</strong>
                            <p className="text-muted">{user?.education || 'No especificada'}</p>
                          </div>
                          <div className="mb-3">
                            <strong>Experiencia:</strong>
                            <p className="text-muted">{user?.experience || 'No especificada'}</p>
                          </div>
                          <div className="mb-3">
                            <strong>Habilidades:</strong>
                            {user?.skills && user.skills.length > 0 ? (
                              <div className="d-flex flex-wrap gap-1 mt-2">
                                {user.skills.map((skill, index) => (
                                  <span key={index} className="badge bg-secondary">{skill}</span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted">No especificadas</p>
                            )}
                          </div>
                          <div className="mb-3">
                            <strong>Teléfono:</strong>
                            <p className="text-muted">{user?.phone || 'No especificado'}</p>
                          </div>
                          <div className="mb-3">
                            <strong>Dirección:</strong>
                            <p className="text-muted">{user?.address || 'No especificada'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Historial de Trabajos */}
              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title fw-bold mb-3">
                      Historial de Trabajos
                    </h5>
                    {history.length === 0 ? (
                      <div className="text-center text-muted py-4">
                        No tienes trabajos completados aún
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {history.map((job, index) => (
                          <div key={index} className="bg-light p-3 rounded">
                            <div className="fw-semibold mb-2">
                              {job.title}
                            </div>
                            <div className="small text-muted">
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
              </div>
            </div>
          </div>
        </div>
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
    <div className="bg-light min-vh-100">
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <h1 className="display-4 fw-bold text-dark mb-4">Mis postulaciones</h1>
            {apps.length === 0 ? (
              <div className="text-center p-5 bg-white rounded shadow-sm">
                <div className="h5 text-muted">No tienes postulaciones.</div>
              </div>
            ) : (
              <div className="row g-4">
                {apps.map(job => (
                  <div key={job._id} className="col-12">
                    <div className="card shadow-sm">
                      <div className="card-body">
                        <div className="row align-items-center">
                          <div className="col-md-8">
                            <h5 className="card-title fw-bold mb-2">{job.title}</h5>
                            <p className="text-muted mb-0">
                              Empresa: {job.employer?.name} · {job.durationHours}h · {new Date(job.date).toLocaleString('es-ES')}
                            </p>
                          </div>
                          <div className="col-md-4 text-md-end">
                            <span className={`badge ${job.status === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                              {job.status === 'completed' ? 'Completado' : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ApplicantsPage() {
  const [applicants, setApplicants] = useState([])
  const [acceptedApplicants, setAcceptedApplicants] = useState([])
  const [rejectedApplicants, setRejectedApplicants] = useState([])
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState({})
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
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
          setAcceptedApplicants(res.acceptedApplicants || [])
          setRejectedApplicants(res.rejectedApplicants || [])
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

  const handleAccept = async (applicantId) => {
    try {
      setProcessing(prev => ({ ...prev, [applicantId]: 'accepting' }))
      await apiFetch(`/jobs/${jobId}/applicants/${applicantId}/accept`, { method: 'POST' })
      showToast('Candidato aceptado', 'success')
      
      // Actualizar la lista
      const applicant = applicants.find(a => a._id === applicantId)
      if (applicant) {
        setApplicants(prev => prev.filter(a => a._id !== applicantId))
        setAcceptedApplicants(prev => [...prev, applicant])
      }
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setProcessing(prev => ({ ...prev, [applicantId]: null }))
    }
  }

  const handleReject = async (applicantId) => {
    try {
      setProcessing(prev => ({ ...prev, [applicantId]: 'rejecting' }))
      await apiFetch(`/jobs/${jobId}/applicants/${applicantId}/reject`, { method: 'POST' })
      showToast('Candidato rechazado', 'success')
      
      // Actualizar la lista
      const applicant = applicants.find(a => a._id === applicantId)
      if (applicant) {
        setApplicants(prev => prev.filter(a => a._id !== applicantId))
        setRejectedApplicants(prev => [...prev, applicant])
      }
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setProcessing(prev => ({ ...prev, [applicantId]: null }))
    }
  }

  const handleViewProfile = async (applicantId) => {
    try {
      setProfileLoading(true)
      const profile = await apiFetch(`/users/${applicantId}`)
      setSelectedProfile(profile)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setProfileLoading(false)
    }
  }

  if (user?.role !== 'employer') return <Navigate to="/jobs" replace />
  if (loading) return <div style={{ padding: '2rem' }}>Cargando...</div>

  const totalApplicants = applicants.length + acceptedApplicants.length + rejectedApplicants.length

  return (
    <div className="bg-light min-vh-100">
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <h1 className="display-4 fw-bold text-dark mb-4">Candidatos</h1>
            
            {totalApplicants === 0 ? (
              <div className="text-center p-5 bg-white rounded shadow-sm">
                <div className="h5 text-muted">No hay candidatos para esta oferta aún.</div>
              </div>
            ) : (
              <>
                {/* Candidatos pendientes */}
                {applicants.length > 0 && (
                  <div className="mb-5">
                    <h3 className="h4 fw-bold text-dark mb-3">
                      Candidatos Pendientes ({applicants.length})
                    </h3>
                    <div className="row g-4">
                      {applicants.map(a => (
                        <div key={a._id} className="col-md-6 col-lg-4">
                          <div className="card shadow-sm h-100">
                            <div className="card-body">
                              <h5 className="card-title fw-bold">{a.name}</h5>
                              <p className="text-muted mb-3">{a.email}</p>
                              <div className="d-grid gap-2">
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => handleViewProfile(a._id)}
                                  disabled={profileLoading}
                                >
                                  {profileLoading ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                      Cargando...
                                    </>
                                  ) : (
                                    'Ver Perfil'
                                  )}
                                </button>
                                <button
                                  className="btn btn-success"
                                  onClick={() => handleAccept(a._id)}
                                  disabled={processing[a._id]}
                                >
                                  {processing[a._id] === 'accepting' ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                      Aceptando...
                                    </>
                                  ) : (
                                    'Aceptar'
                                  )}
                                </button>
                                <button
                                  className="btn btn-danger"
                                  onClick={() => handleReject(a._id)}
                                  disabled={processing[a._id]}
                                >
                                  {processing[a._id] === 'rejecting' ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                      Rechazando...
                                    </>
                                  ) : (
                                    'Rechazar'
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Candidatos aceptados */}
                {acceptedApplicants.length > 0 && (
                  <div className="mb-5">
                    <h3 className="h4 fw-bold text-success mb-3">
                      Candidatos Aceptados ({acceptedApplicants.length})
                    </h3>
                    <div className="row g-4">
                      {acceptedApplicants.map(a => (
                        <div key={a._id} className="col-md-6 col-lg-4">
                        <div className="card border-success shadow-sm h-100">
                          <div className="card-body">
                            <h5 className="card-title fw-bold text-success">{a.name}</h5>
                            <p className="text-muted mb-3">{a.email}</p>
                            <div className="d-grid gap-2">
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => handleViewProfile(a._id)}
                                disabled={profileLoading}
                              >
                                {profileLoading ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Cargando...
                                  </>
                                ) : (
                                  'Ver Perfil'
                                )}
                              </button>
                              <span className="badge bg-success">Aceptado</span>
                            </div>
                          </div>
                        </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Candidatos rechazados */}
                {rejectedApplicants.length > 0 && (
                  <div className="mb-5">
                    <h3 className="h4 fw-bold text-danger mb-3">
                      Candidatos Rechazados ({rejectedApplicants.length})
                    </h3>
                    <div className="row g-4">
                      {rejectedApplicants.map(a => (
                        <div key={a._id} className="col-md-6 col-lg-4">
                        <div className="card border-danger shadow-sm h-100">
                          <div className="card-body">
                            <h5 className="card-title fw-bold text-danger">{a.name}</h5>
                            <p className="text-muted mb-3">{a.email}</p>
                            <div className="d-grid gap-2">
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => handleViewProfile(a._id)}
                                disabled={profileLoading}
                              >
                                {profileLoading ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Cargando...
                                  </>
                                ) : (
                                  'Ver Perfil'
                                )}
                              </button>
                              <span className="badge bg-danger">Rechazado</span>
                            </div>
                          </div>
                        </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de perfil */}
      {selectedProfile && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Perfil del Candidato</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedProfile(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="fw-bold text-primary mb-3">Información Personal</h6>
                    <div className="mb-3">
                      <strong>Nombre:</strong> {selectedProfile.name}
                    </div>
                    <div className="mb-3">
                      <strong>Email:</strong> {selectedProfile.email}
                    </div>
                    <div className="mb-3">
                      <strong>Edad:</strong> {selectedProfile.age} años
                    </div>
                    <div className="mb-3">
                      <strong>Teléfono:</strong> {selectedProfile.phone || 'No especificado'}
                    </div>
                    <div className="mb-3">
                      <strong>Dirección:</strong> {selectedProfile.address || 'No especificada'}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold text-primary mb-3">Formación y Experiencia</h6>
                    <div className="mb-3">
                      <strong>Educación:</strong>
                      <p className="text-muted">{selectedProfile.education || 'No especificada'}</p>
                    </div>
                    <div className="mb-3">
                      <strong>Experiencia:</strong>
                      <p className="text-muted">{selectedProfile.experience || 'No especificada'}</p>
                    </div>
                    <div className="mb-3">
                      <strong>Habilidades:</strong>
                      {selectedProfile.skills && selectedProfile.skills.length > 0 ? (
                        <div className="d-flex flex-wrap gap-1 mt-2">
                          {selectedProfile.skills.map((skill, index) => (
                            <span key={index} className="badge bg-secondary">{skill}</span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted">No especificadas</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedProfile(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
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
    <div className="bg-light min-vh-100">
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8 col-xl-6">
            <div className="card shadow">
              <div className="card-body p-4">
                <h2 className="card-title fw-bold text-dark mb-4">Crear Oferta</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Título</label>
                    <input 
                      className="form-control"
                      value={form.title} 
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Descripción (Markdown)</label>
                    <textarea 
                      className="form-control"
                      rows={5} 
                      value={form.descriptionMarkdown} 
                      onChange={e => setForm(f => ({ ...f, descriptionMarkdown: e.target.value }))} 
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Fecha y hora</label>
                    <input 
                      type="datetime-local" 
                      className="form-control"
                      value={form.date} 
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))} 
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Duración (horas)</label>
                      <input 
                        type="number" 
                        className="form-control"
                        min={1} 
                        max={12} 
                        value={form.durationHours} 
                        onChange={e => setForm(f => ({ ...f, durationHours: e.target.value }))} 
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Máximo de postulantes</label>
                      <input 
                        type="number" 
                        className="form-control"
                        min={1} 
                        max={10} 
                        value={form.maxApplicants} 
                        onChange={e => setForm(f => ({ ...f, maxApplicants: e.target.value }))} 
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creando...
                      </>
                    ) : (
                      'Crear Oferta'
                    )}
                  </button>
                </form>

                {error && (
                  <div className="alert alert-danger mt-3">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
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
        <div>
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