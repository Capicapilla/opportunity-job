# Opportunity Job - Plataforma de Empleo

Una plataforma completa de empleo que conecta trabajadores con empresas, desarrollada con React y Node.js.

## Características

### 👥 Para Trabajadores
- **Registro y perfil profesional** con experiencia, educación y habilidades
- **Búsqueda de empleo** con filtros avanzados
- **Aplicación a ofertas** con un solo clic
- **Seguimiento de aplicaciones** (pendientes, aceptadas, rechazadas)
- **Historial de trabajo** completo

### Para Empresas
- **Registro empresarial** con información de la compañía
- **Publicación de ofertas** de trabajo
- **Gestión de candidatos** (ver, aceptar, rechazar)
- **Visualización de perfiles** detallados de los aplicantes
- **Dashboard de aplicaciones** organizadas por estado

## Tecnologías

### Frontend
- **React 18** con Vite
- **Bootstrap 5** para diseño responsive
- **React Router DOM** para navegación
- **Context API** para estado global
- **Fetch API** para comunicación con backend

### Backend
- **Node.js** con Express
- **MongoDB** con Mongoose
- **Express Session** para autenticación
- **CORS** configurado para producción
- **Morgan** para logging

### Base de Datos
- **MongoDB Atlas** (producción)
- **MongoDB local** (desarrollo)

## Despliegue

### Frontend (Vercel)
1. Conecta tu repositorio a Vercel
2. Configura el Root Directory como `web/`
3. Agrega la variable de entorno:
   - `VITE_API_URL` = URL de tu backend

### Backend (Vercel)
1. Conecta tu repositorio a Vercel
2. Configura el Root Directory como `./`
3. Agrega las variables de entorno:
   - `MONGO_URI` = Tu connection string de MongoDB Atlas
   - `SESSION_SECRET` = Una clave secreta
   - `NODE_ENV` = production

## Estructura del Proyecto

```
opportunity-job/
├── web/                    # Frontend React
│   ├── src/
│   │   ├── App.jsx        # Componente principal
│   │   ├── lib/
│   │   │   └── api.js     # Configuración de API
│   │   └── main.jsx       # Punto de entrada
│   └── package.json
├── api/                    # Backend Node.js
│   ├── src/
│   │   ├── app.js         # Servidor principal
│   │   ├── api/
│   │   │   ├── controllers/ # Controladores de rutas
│   │   │   └── middlewares/ # Middlewares
│   │   └── lib/
│   │       ├── models/     # Modelos de MongoDB
│   │       └── config.js   # Configuración
│   └── package.json
└── README.md
```

## Instalación Local

### Prerrequisitos
- Node.js 18+
- MongoDB (local o Atlas)

### Pasos
1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/opportunity-job.git
   cd opportunity-job
   ```

2. **Instala dependencias del backend:**
   ```bash
   cd api
   npm install
   ```

3. **Instala dependencias del frontend:**
   ```bash
   cd ../web
   npm install
   ```

4. **Configura variables de entorno:**
   - Crea `.env` en `api/` con `MONGO_URI` y `SESSION_SECRET`
   - Crea `.env.local` en `web/` con `VITE_API_URL=http://localhost:3000`

5. **Ejecuta el proyecto:**
   ```bash
   # Terminal 1 - Backend
   cd api && npm run dev
   
   # Terminal 2 - Frontend
   cd web && npm run dev
   ```

## Funcionalidades Principales

### Autenticación
- Registro diferenciado (Trabajador/Empresa)
- Login con sesiones persistentes
- Logout seguro

### Gestión de Empleos
- CRUD completo de ofertas de trabajo
- Filtros por ubicación, tipo de contrato, salario
- Aplicación con un clic

### Perfiles de Usuario
- **Trabajadores:** Experiencia, educación, habilidades, contacto
- **Empresas:** Información de la compañía, descripción

### Dashboard de Aplicaciones
- **Trabajadores:** Ver estado de sus aplicaciones
- **Empresas:** Gestionar candidatos (aceptar/rechazar)

## Diseño

- **Responsive Design** con Bootstrap 5
- **UI/UX moderna** y intuitiva
- **Navegación fluida** entre secciones
- **Feedback visual** con toasts y estados de carga

## Seguridad

- **Autenticación basada en sesiones**
- **CORS configurado** para producción
- **Validación de datos** en frontend y backend
- **Sanitización de inputs**

## Próximas Mejoras

- [ ] Sistema de notificaciones por email
- [ ] Chat entre empresas y candidatos
- [ ] Sistema de calificaciones y reviews
- [ ] Filtros avanzados de búsqueda
- [ ] Dashboard de estadísticas
- [ ] Aplicación móvil

## Desarrollado por

**Javier Capilla * - [GitHub](https://github.com/tu-usuario)

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
