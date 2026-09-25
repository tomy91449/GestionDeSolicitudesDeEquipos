# Sistema de Gestión y Solicitudes de Equipos

**Universidad Tecnológica Nacional - Facultad Regional Córdoba (UTN-FRC)**  
**Cátedra:** Desarrollo de Software  
**Curso:** 3K3  
**Grupo:** 6  
**Año:** 2026  

## Descripción del Proyecto

Este proyecto es una aplicación web Full-Stack diseñada para gestionar el catálogo de equipos y coordinar las solicitudes de préstamos de los mismos. El sistema cuenta con distintos niveles de acceso (Usuarios y Administradores) garantizando la seguridad de los datos, el seguimiento de los estados y la auditoría de las operaciones.

---

## Arquitectura y Tecnologías

El proyecto está dividido en dos grandes bloques:

- **Frontend:** Desarrollado con React (empaquetado con Vite). Utiliza `react-router-dom` para la navegación, `Context API` (`AuthContext`) para el manejo del estado global de sesión, y CSS nativo puro para interfaces modernas y minimalistas.
- **Backend:** Construido con Node.js y Express.
- **Base de Datos:** Motor relacional SQLite para un despliegue ágil y autocontenido.
- **Control de Versiones:** Git y GitLab.

---

## Módulos Implementados

### Módulo 1: Seguridad y Autenticación (Auth)

Gestión integral del acceso al sistema protegiendo tanto la interfaz visual como los endpoints del servidor.

- **Registro de Usuarios:** Formulario con UI moderna, validación frontend de doble contraseña y encriptación de datos. Asignación automática de rol `usuario`.
- **Inicio de Sesión:** Autenticación de credenciales y generación de tokens de acceso (JWT).
- **Protección de Rutas (Middlewares):** Implementación de `verifyToken` para asegurar que solo usuarios logueados accedan al sistema, y `requireRole` para registrar acciones sensibles a los administradores.

### Módulo 2: Catálogo de Equipos

Visualización y gestión del inventario físico.

- Listado de equipos disponibles para ser prestados.
- Visualización de detalles técnicos y disponibilidad actual de cada ítem.

### Módulo 3: Gestión de Solicitudes (Usuarios)

Flujo principal donde los usuarios interactúan con el inventario.

- **Creación de Solicitudes:** Endpoint `POST /api/solicitudes` que registra la reserva de un equipo (`equipoId`), indicando fechas de retiro, devolución y el motivo del pedido.
- **Listado General:** Visualización en formato tabla de todos los pedidos registrados en el sistema (`GET /api/solicitudes`).
- **Detalle Específico:** Consulta profunda de una solicitud particular a través de su ID.

### Módulo 4: Administración y Auditoría (Admin)

Herramientas exclusivas para que los encargados gestionen el ciclo de vida de las reservas.

- **Cambio de Estados:** Capacidad de aprobar, rechazar o finalizar una solicitud a través del endpoint `PATCH /:id/estado` (ruta protegida exclusiva para administradores).
- **Historial de Cambios:** Endpoint `GET /:id/historial` que permite auditar toda la línea de tiempo de una solicitud, viendo quién y cuándo modificó su estado.

---

## Instalación y Ejecución Local

Para levantar el entorno de desarrollo, es necesario correr ambos servidores en terminales separadas.

### 1. Backend (Puerto 3000)

```bash
cd backend
npm install
node src/seeders/seed.js # Carga los datos semilla en la base de datos 
npm run dev
```

### 2. Frontend (Puerto 5173)

```bash
cd frontend
npm install
npm run dev
```

### 3. Ejecución de Tests

Para ejecutar las pruebas automatizadas (Jest + Supertest) sobre la API:

```bash
cd backend
npm test
```

---

## Credenciales de Prueba (Datos Semilla)

El sistema cuenta con datos precargados para facilitar las pruebas de corrección:

| Rol     | Email            | Contraseña |
|---------|------------------|------------|
| Admin   | admin@dd.com     | 1234       |
| Usuario | usuario@dd.com   | 1234       |

---

## Listado de Rutas y Endpoints

### Rutas Frontend (React Router)

| Ruta               | Descripción                              |
|--------------------|------------------------------------------|
| `/login`           | Inicio de sesión                         |
| `/registro`        | Creación de nueva cuenta                 |
| `/solicitudes`     | Listado general con filtros              |
| `/solicitudes/nueva` | Formulario de creación de pedido       |
| `/solicitudes/:id` | Detalle e historial de la solicitud      |
| `/resumen`         | Panel administrativo (Solo Admin)        |
| `*`                | Página no encontrada (404)               |

### Endpoints Backend (API REST)

**Auth:**

| Método | Endpoint               | Descripción          |
|--------|------------------------|----------------------|
| POST   | `/api/auth/register`   | Registro de usuario  |
| POST   | `/api/auth/login`      | Inicio de sesión     |

**Equipos:**

| Método | Endpoint       | Descripción              |
|--------|----------------|--------------------------|
| GET    | `/api/equipos` | Listado de equipos       |

**Solicitudes:**

| Método | Endpoint                          | Descripción                                          |
|--------|-----------------------------------|------------------------------------------------------|
| GET    | `/api/solicitudes`                | Listado general (params: `estado`, `equipoId`, `categoria`, `desde`, `hasta`) |
| GET    | `/api/solicitudes/resumen`        | Resumen administrativo                               |
| GET    | `/api/solicitudes/:id`            | Detalle de una solicitud                             |
| GET    | `/api/solicitudes/:id/historial`  | Historial de cambios de estado                       |
| POST   | `/api/solicitudes`                | Crear nueva solicitud                                |
| PUT    | `/api/solicitudes/:id`            | Actualizar solicitud                                 |
| PATCH  | `/api/solicitudes/:id/cancelar`   | Cancelar solicitud                                   |
| PATCH  | `/api/solicitudes/:id/aprobar`    | Aprobar solicitud (solo Admin)                       |
| PATCH  | `/api/solicitudes/:id/rechazar`   | Rechazar solicitud (solo Admin)                      |
| PATCH  | `/api/solicitudes/:id/devolver`   | Registrar devolución (solo Admin)                    |

---

## Lógica de Negocio y Seguridad

### Disponibilidad de Equipos

La validación de disponibilidad se realiza de forma estricta en la capa de servicios del backend. Un equipo se considera disponible únicamente si:

1. Su estado actual es `"disponible"`.
2. No cuenta con ninguna solicitud en estado `"aprobada"` cuyas fechas se superpongan con el período solicitado.

> Las solicitudes en estado `"pendiente"` **no** bloquean la disponibilidad del equipo físico.

### JWT, Roles y Autorización

- **Autenticación (JWT):** Al iniciar sesión, el servidor genera un token JWT firmado (sin incluir contraseñas ni datos sensibles en el payload). El frontend almacena este token y lo envía en la cabecera `Authorization: Bearer <token>` mediante un interceptor o servicio de Axios.

- **Roles:** El sistema implementa los roles `usuario` y `admin`.

- **Autorización:** Se utilizan dos middlewares clave en Express:
  - `verifyToken`: Asegura que el usuario esté logueado y el token no haya expirado.
  - `requireRole('admin')`: Restringe los endpoints sensibles. Los usuarios comunes solo pueden crear o cancelar sus propios pedidos, mientras que las acciones de aprobar, rechazar o marcar devoluciones están bloqueadas a nivel servidor exclusivamente para el rol administrador.