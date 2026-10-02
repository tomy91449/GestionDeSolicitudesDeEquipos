# Sistema de Gestión y Solicitudes de Equipos

**Universidad Tecnológica Nacional - Facultad Regional Córdoba (UTN-FRC)**
**Cátedra:** Desarrollo de Software · **Curso:** 3K3 · **Grupo:** 6 · **Año:** 2026

Aplicación web Full-Stack para gestionar un catálogo de equipos (notebooks, proyectores, cámaras, etc.) y coordinar sus solicitudes de préstamo, con roles, seguimiento de estados e historial de auditoría.

> ⚠️ Hay problemas conocidos en el módulo de solicitudes que impiden usarlo de punta a punta. Ver [Problemas conocidos](#problemas-conocidos).

---

## Tecnologías

| Capa          | Stack                                                                        |
|---------------|------------------------------------------------------------------------------|
| Frontend      | React 18 + Vite, `react-router-dom` v6, Context API (`AuthContext`), Axios     |
| Backend       | Node.js + Express, JWT (`jsonwebtoken`), `bcryptjs`, `uuid`, `dayjs`          |
| Base de datos | SQLite (`sqlite` + `sqlite3`), archivo local `backend/database.sqlite`        |
| Tests         | Jest + Supertest                                                             |

---

## Estructura del proyecto

```
├── backend/src/
│   ├── app.js             # Express + montaje de rutas (lo usan los tests sin levantar el puerto)
│   ├── server.js          # Inicializa la BD y escucha en el puerto 3000
│   ├── database/db.js     # Conexión SQLite y creación de tablas
│   ├── routes/            # auth, equipos, solicitudes
│   ├── controllers/       # Manejo de request/response
│   ├── services/          # Lógica de negocio
│   ├── models/            # Usuario, Equipo, Solicitud (validaciones y acceso a datos)
│   ├── middlewares/       # verifyToken, verifyRole
│   ├── seeders/seed.js    # Carga el catálogo inicial de equipos
│   └── tests/             # auth, equipos, solicitudes
└── frontend/src/
    ├── routes/AppRouter.jsx   # Rutas públicas y protegidas
    ├── context/AuthContext.jsx
    ├── services/              # api.js (Axios + token) y servicios por recurso
    ├── pages/                 # Login, Registro, Equipos, Solicitudes, Detalle, ResumenAdmin
    └── components/            # Navbar, ProtectedRoute, tablas, filtros, acciones
```

---

## Instalación y ejecución local

Requisitos: **Node.js 18+** y npm. Se necesitan dos terminales.

### 1. Backend: `http://localhost:3000`

```bash
cd backend
npm install
npm run dev                # crea database.sqlite y las tablas si no existen
node src/seeders/seed.js   # en otra terminal, la primera vez: carga 8 equipos de ejemplo
```

El seeder no duplica equipos si se ejecuta más de una vez. `database.sqlite` está en `.gitignore`; para empezar de cero alcanza con borrarlo.

### 2. Frontend: `http://localhost:5173`

```bash
cd frontend
npm install
npm run dev
```

El frontend apunta a `http://localhost:3000/api` ([frontend/src/services/api.js](frontend/src/services/api.js)).

### 3. Tests

```bash
cd backend
npm test
```

19 tests en 3 suites (autenticación, equipos y solicitudes).

### Usuarios de prueba

El seeder carga solo equipos, no usuarios. Un usuario común se crea desde `/registro`. Para crear un admin (o `encargado`), usá la API:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Admin","email":"admin@dd.com","password":"123456","rol":"admin"}'
```

---

## Roles

| Rol         | Permisos                                                                       |
|-------------|---------------------------------------------------------------------------------|
| `usuario`   | Ver equipos, crear, ver y cancelar sus solicitudes                              |
| `encargado` | Lo mismo que `usuario`, más aprobar, rechazar, registrar devoluciones y ver el resumen |
| `admin`     | Lo mismo que `encargado`, más crear, editar y eliminar equipos                  |

---

## API

Las rutas protegidas requieren la cabecera `Authorization: Bearer <token>`. El token dura **2 horas**.

### Auth

| Método | Endpoint             | Body                                | Respuesta |
|--------|----------------------|-------------------------------------|-----------|
| POST   | `/api/auth/register` | `{ nombre, email, password, rol? }` | `201` usuario creado · `400` email duplicado o datos inválidos |
| POST   | `/api/auth/login`    | `{ email, password }`               | `200` `{ token, usuario }` · `401` credenciales inválidas |

### Equipos

| Método | Endpoint           | Acceso       |
|--------|--------------------|--------------|
| GET    | `/api/equipos`     | Público      |
| GET    | `/api/equipos/:id` | Público      |
| POST   | `/api/equipos`     | `admin`      |
| PUT    | `/api/equipos/:id` | `admin`      |
| DELETE | `/api/equipos/:id` | `admin`      |

Estados de un equipo: `disponible`, `prestado`, `mantenimiento`.

### Solicitudes

| Método | Endpoint                         | Acceso                | Descripción                  |
|--------|----------------------------------|-----------------------|------------------------------|
| POST   | `/api/solicitudes`               | Logueado              | Crear (`{ equipoId, fechaRetiro, fechaDevolucion, motivo }`) |
| GET    | `/api/solicitudes`               | Logueado              | Listado                      |
| GET    | `/api/solicitudes/resumen`       | `admin` / `encargado` | Métricas del panel           |
| GET    | `/api/solicitudes/:id`           | Logueado              | Detalle                      |
| GET    | `/api/solicitudes/:id/historial` | Logueado              | Historial de cambios         |
| PATCH  | `/api/solicitudes/:id/cancelar`  | Logueado              | Cancelar                     |
| PATCH  | `/api/solicitudes/:id/aprobar`   | `admin` / `encargado` | Aprobar                      |
| PATCH  | `/api/solicitudes/:id/rechazar`  | `admin` / `encargado` | Rechazar                     |
| PATCH  | `/api/solicitudes/:id/devolver`  | `admin` / `encargado` | Registrar devolución         |

---

## Rutas del frontend

| Ruta                 | Acceso                | Descripción                    |
|----------------------|-----------------------|--------------------------------|
| `/`                  | Público               | Redirige a `/login`            |
| `/login`             | Público               | Inicio de sesión (redirige a `/equipos`) |
| `/registro`          | Público               | Creación de cuenta con rol `usuario` |
| `/equipos`           | Logueado              | Catálogo de equipos            |
| `/solicitudes`       | Logueado              | Listado con filtros            |
| `/solicitudes/nueva` | Logueado              | Nueva solicitud                |
| `/solicitudes/:id`   | Logueado              | Detalle, historial y acciones  |
| `/admin`             | `admin` / `encargado` | Panel de resumen               |
| `*`                  | —                     | Página 404                     |

Si un usuario sin el rol necesario entra a `/admin`, lo redirige a `/solicitudes`.

---

## Reglas de negocio

- **Superposición de fechas:** no se puede crear una solicitud para un equipo si ya tiene otra `pendiente` o `aprobada` cuyas fechas se superpongan. En ese caso la API responde `400`.
- **Ciclo de vida:** una solicitud nace `pendiente` y puede pasar a `aprobada`, `rechazada` o `cancelada`. Solo una `aprobada` puede pasar a `devuelta`.
- **Auditoría:** cada cambio de estado se guarda en `historial_solicitudes` con el usuario, la fecha y hora, y los valores anterior y nuevo.

## Seguridad

- Contraseñas hasheadas con bcrypt.
- El payload del JWT contiene solo `id`, `nombre` y `rol`.
- `verifyToken` responde `401` si falta el token o si es inválido o expiró. `verifyRole([...])` responde `403` si el rol no está permitido.

---

## Problemas conocidos

- **El módulo de solicitudes no funciona de punta a punta.** `solicitudes.controller.js` llama a `listarSolicitudes`, `obtenerSolicitudPorId`, `obtenerHistorial`, `cambiarEstado` y `cancelarSolicitud`, pero [solicitudes.service.js](backend/src/services/solicitudes.service.js) solo exporta `crearSolicitud`. Además, `crearSolicitud` usa `db.all` sobre el módulo de `db.js` en vez de una conexión (`connectDB()`). Resultado: crear, listar, ver detalle e historial, aprobar, rechazar, devolver y cancelar responden error (`400`, `404` o `500`). Parece que la implementación completa quedó en [models/Solicitud.js](backend/src/models/Solicitud.js), cuyo encabezado dice `src/services/solicitudes.service.js`.
- **Los tests de solicitudes no detectan esto**, porque varios aceptan `400` o `404` como resultado válido, y ese es justamente el código que devuelve el error.
- **`POST /api/auth/register` acepta `rol` desde el body**, así que cualquiera puede registrarse como `admin` llamando a la API directamente.
- **La clave JWT está hardcodeada** en `auth.service.js` y `auth.middleware.js`. Debería ir en un `.env` (`dotenv` ya está instalado).
- **Dependencias sin uso:** `bcrypt`, `pg`, `pg-hstore` y `sequelize`.
