const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

// Función para abrir la conexión a la base de datos
async function connectDB() {
    return open({
        filename: './database.sqlite', // Este es el archivo físico que se creará
        driver: sqlite3.Database
    });
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

module.exports = { connectDB, initDB };