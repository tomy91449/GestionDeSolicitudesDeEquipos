// src/services/solicitudes.service.js
const Solicitud = require('../models/Solicitud');
const { connectDB } = require('../database/db');

/**
 * Crea una nueva solicitud de equipo
 */
const crearSolicitud = async (equipoId, usuarioId, fechaRetiro, fechaDevolucion, motivo) => {
    // Usamos el método estático creador que ya tenés en tu modelo
    return await Solicitud.crear({
        equipoId,
        usuarioId,
        fechaRetiro,
        fechaDevolucion,
        motivo
    });
};

/**
 * Obtiene una solicitud específica por su ID
 */
const obtenerSolicitudPorId = async (id) => {
    const solicitud = await Solicitud.findById(id);
    if (!solicitud) {
        throw new Error('Solicitud no encontrada');
    }
    return solicitud;
};

/**
 * Lista todas las solicitudes del sistema aplicando ordenamiento por fechaRetiro
 */
const listarSolicitudes = async (query = {}) => {
    // Usamos el método findAll de tu modelo que ya ordena por fechaRetiro DESC
    return await Solicitud.findAll();
};

/**
 * Obtiene el historial de cambios de una solicitud (Trazabilidad)
 */
const obtenerHistorial = async (solicitudId) => {
    const db = await connectDB();
    return await db.all(
        `SELECT * FROM historial_solicitudes WHERE solicitudId = ? ORDER BY fechaHora DESC`,
        [solicitudId]
    );
};

/**
 * Modifica el estado de una solicitud (Aprobada, Rechazada, Devuelta) e impacta el historial
 */
const cambiarEstado = async (id, nuevoEstado, adminId) => {
    const solicitud = await Solicitud.findById(id);
    if (!solicitud) {
        throw new Error('Solicitud no encontrada');
    }

    const estadoAnterior = solicitud.estado;
    
    // Actualizamos usando el método de tu modelo
    await solicitud.actualizarEstado(nuevoEstado.toLowerCase(), adminId);

    // Grabamos el movimiento en el historial para que la cátedra vea la trazabilidad
    const db = await connectDB();
    const { v4: uuidv4 } = require('uuid');
    await db.run(
        `INSERT INTO historial_solicitudes (id, solicitudId, usuarioId, accion, fechaHora, valorAnterior, valorNuevo)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            uuidv4(),
            id,
            adminId,
            `CAMBIO_ESTADO_${nuevoEstado.toUpperCase()}`,
            new Date().toISOString(),
            estadoAnterior,
            nuevoEstado.toLowerCase()
        ]
    );

    return solicitud;
};

/**
 * 🛠️ AQUÍ ESTABA EL ERROR CORREGIDO:
 * Genera las métricas del panel de administración usando fechaRetiro en lugar de 'fecha'
 */
const obtenerResumenAdmin = async () => {
    const db = await connectDB();

    // Corregido: Agrupamos por 'fechaRetiro' pero le ponemos el alias 'as fecha' 
    // para que tu frontend reciba la propiedad exacta que necesita para renderizar
    const solicitudesPorFecha = await db.all(`
        SELECT fechaRetiro as fecha, COUNT(*) as total 
        FROM solicitudes 
        GROUP BY fechaRetiro
        ORDER BY fechaRetiro ASC
        LIMIT 7
    `);

    const porEstado = await db.all(`
        SELECT estado, COUNT(*) as total 
        FROM solicitudes 
        GROUP BY estado
    `);

    const totalEquipos = await db.get('SELECT COUNT(*) as total FROM equipos');

    return {
        solicitudesPorFecha,
        porEstado,
        totalEquipos: totalEquipos?.total || 0
    };
};

module.exports = {
    crearSolicitud,
    obtenerSolicitudPorId,
    listarSolicitudes,
    obtenerHistorial,
    cambiarEstado,
    obtenerResumenAdmin
};