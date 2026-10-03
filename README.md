# Sistema de Gestión y Solicitudes de Equipos

**Universidad Tecnológica Nacional - Facultad Regional Córdoba (UTN-FRC)**
**Cátedra:** Desarrollo de Software · **Curso:** 3K3 · **Grupo:** 6 · **Año:** 2026

Aplicación web Full-Stack para gestionar un catálogo de equipos (notebooks, proyectores, cámaras, etc.) y coordinar sus solicitudes de préstamo, con roles, seguimiento de estados e historial de auditoría.

---

## Tecnologías

| Capa          | Stack                                                                        |
|---------------|------------------------------------------------------------------------------|
| Frontend      | React 18 + Vite, `react-router-dom` v6, Context API (`AuthContext`), Axios     |
| Backend       | Node.js + Express, JWT (`jsonwebtoken`), `bcryptjs`, `uuid`, `dotenv`         |
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
cp .env.example .env       # y completá JWT_SECRET con una clave aleatoria
npm run dev                # crea database.sqlite y las tablas si no existen
node src/seeders/seed.js   # carga 8 equipos y los usuarios de prueba
```

Para generar una clave: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Si falta `JWT_SECRET`, el servidor no arranca y avisa qué hacer. El archivo `.env` está en `.gitignore`: no lo subas.

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
npm test        # Jest + Supertest: autenticación, equipos y solicitudes
```

Los tests del backend usan una base en memoria, así que no tocan `database.sqlite`.

```bash
cd frontend
npm test        # Vitest + Testing Library: componentes (sesión y rutas protegidas)
```

### Usuarios de prueba

El seeder crea estos usuarios (no los duplica si ya existen):

| Rol         | Email              | Contraseña     |
|-------------|--------------------|----------------|
| `admin`     | `admin@dd.com`     | `admin123`     |
| `encargado` | `encargado@dd.com` | `encargado123` |
| `usuario`   | `usuario@dd.com`   | `usuario123`   |

Son credenciales solo para desarrollo. El registro público (`/registro` o `POST /api/auth/register`) siempre crea usuarios con rol `usuario`, aunque se mande otro `rol`; los admin y encargados se crean únicamente desde el seeder.

---

## Roles

| Rol         | Permisos                                                                       |
|-------------|---------------------------------------------------------------------------------|
| `usuario`   | Ver equipos; crear, ver, editar y cancelar sus propias solicitudes             |
| `encargado` | Lo mismo que `usuario`, más aprobar, rechazar, registrar devoluciones y ver el resumen |
| `admin`     | Lo mismo que `encargado`, más crear, editar y eliminar equipos                  |

---

## API

Las rutas protegidas requieren la cabecera `Authorization: Bearer <token>`. El token dura **2 horas**. En las tablas, "gestor" significa `admin` o `encargado`, y "dueño" es el usuario que creó la solicitud.

### Auth

| Método | Endpoint             | Body                                | Respuesta |
|--------|----------------------|-------------------------------------|-----------|
| POST   | `/api/auth/register` | `{ nombre, email, password }`       | `201` usuario creado con rol `usuario` · `400` email duplicado o datos inválidos |
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
| GET    | `/api/solicitudes`               | Logueado              | Listado (propias, o todas si es gestor) |
| GET    | `/api/solicitudes/resumen`       | `admin` / `encargado` | Métricas del panel           |
| GET    | `/api/solicitudes/:id`           | Dueño o gestor        | Detalle                      |
| PUT    | `/api/solicitudes/:id`           | Dueño                 | Editar fechas y motivo (solo `pendiente`) |
| GET    | `/api/solicitudes/:id/historial` | Dueño o gestor        | Historial de cambios         |
| PATCH  | `/api/solicitudes/:id/cancelar`  | Dueño                 | Cancelar                     |
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

- **Validaciones al crear o editar:** `equipoId`, `fechaRetiro`, `fechaDevolucion` (formato `AAAA-MM-DD`) y `motivo` son obligatorios, y la devolución no puede ser anterior al retiro. El equipo tiene que existir y no estar en `mantenimiento`.
- **Superposición de fechas:** no se puede reservar un equipo si ya tiene otra solicitud `pendiente` o `aprobada` cuyas fechas se pisen con las pedidas. En ese caso la API responde `400`.
- **Ciclo de vida:** `pendiente` puede pasar a `aprobada` o `rechazada` (admin/encargado), o a `cancelada` (solo el dueño). `aprobada` puede pasar a `devuelta` (admin/encargado) o a `cancelada` (el dueño, solo antes de la fecha de retiro). Cualquier otra transición responde `400`. Al aprobar o rechazar se guarda quién lo hizo en `autorizadoPor`.
- **Visibilidad:** un `usuario` solo ve y edita sus propias solicitudes; admin y encargado ven todas. Solo se pueden editar las `pendiente`.
- **Auditoría:** la creación, cada edición y cada cambio de estado se guardan en `historial_solicitudes` con el usuario, la fecha y hora, y los valores anterior y nuevo.

## Seguridad

- Contraseñas hasheadas con bcrypt.
- El payload del JWT contiene solo `id`, `nombre` y `rol`.
- `verifyToken` responde `401` si falta el token o si es inválido o expiró. `verifyRole([...])` responde `403` si el rol no está permitido.

---

## Problemas conocidos

- **Los tests de solicitudes son permisivos:** por ejemplo, "Solicitud válida" también pasa si la API responde `400`, así que no alcanzan para detectar regresiones.
