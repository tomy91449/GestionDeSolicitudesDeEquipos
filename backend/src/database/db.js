const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

// Ruta absoluta para que el servidor y el seeder usen siempre el mismo
// archivo (backend/database.sqlite), sin importar desde qué carpeta se
// ejecuten. Se puede cambiar con la variable DB_PATH; con ":memory:" la
// base vive en memoria (la usan los tests).
const resolverRuta = (ruta) => {
    if (!ruta) return path.join(__dirname, '..', '..', 'database.sqlite');
    if (ruta === ':memory:') return ruta;
    return path.resolve(ruta);
};

const DB_PATH = resolverRuta(process.env.DB_PATH);

// Conexión única compartida por toda la app. Se guarda la promesa para
// que llamadas simultáneas mientras se abre esperen la misma conexión.
let conexion = null;

// Devuelve la conexión compartida (la abre la primera vez)
function connectDB() {
    if (!conexion) {
        conexion = open({
            filename: DB_PATH,
            driver: sqlite3.Database
        }).catch((error) => {
            // Si falló al abrir, el próximo llamado vuelve a intentar
            conexion = null;
            throw error;
        });
    }
    return conexion;
}

// Cierra la conexión compartida (al apagar el servidor o al terminar un script)
async function closeDB() {
    if (!conexion) return;
    const db = await conexion;
    conexion = null;
    await db.close();
}

// Función para inicializar las tablas
async function initDB() {
    const db = await connectDB();

    // Creación de las entidades mínimas obligatorias
    await db.exec(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id TEXT PRIMARY KEY,
            nombre TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            passwordHash TEXT NOT NULL,
            rol TEXT NOT NULL,
            activo INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS equipos (
            id TEXT PRIMARY KEY,
            codigoInventario TEXT UNIQUE NOT NULL,
            nombre TEXT NOT NULL,
            categoria TEXT NOT NULL,
            estado TEXT NOT NULL,
            ubicacion TEXT NOT NULL,
            requiereAutorizacion INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS solicitudes (
            id TEXT PRIMARY KEY,
            equipoId TEXT NOT NULL,
            usuarioId TEXT NOT NULL,
            fechaRetiro TEXT NOT NULL,
            fechaDevolucion TEXT NOT NULL,
            motivo TEXT NOT NULL,
            estado TEXT NOT NULL,
            autorizadoPor TEXT,
            FOREIGN KEY (equipoId) REFERENCES equipos(id),
            FOREIGN KEY (usuarioId) REFERENCES usuarios(id)
        );

        CREATE TABLE IF NOT EXISTS historial_solicitudes (
            id TEXT PRIMARY KEY,
            solicitudId TEXT NOT NULL,
            usuarioId TEXT NOT NULL,
            accion TEXT NOT NULL,
            fechaHora TEXT NOT NULL,
            valorAnterior TEXT,
            valorNuevo TEXT,
            FOREIGN KEY (solicitudId) REFERENCES solicitudes(id),
            FOREIGN KEY (usuarioId) REFERENCES usuarios(id)
        );
    `);

    console.log("Base de datos SQLite inicializada correctamente.");


}

module.exports = { connectDB, initDB, closeDB };