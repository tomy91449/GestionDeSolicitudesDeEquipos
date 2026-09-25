const { connectDB } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

const registrarHistorial = async (
    db, // 👈 ahora SÍ recibe db correctamente
    solicitudId,
    usuarioId,
    accion,
    valorAnterior = null,
    valorNuevo = null
) => {
    await db.run(
        `INSERT INTO historial_solicitudes
        (id, solicitudId, usuarioId, accion, fechaHora, valorAnterior, valorNuevo)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            uuidv4(),
            solicitudId,
            usuarioId,
            accion,
            new Date().toISOString(),
            valorAnterior ? JSON.stringify(valorAnterior) : null,
            valorNuevo ? JSON.stringify(valorNuevo) : null
        ]
    );
};

module.exports = {
    registrarHistorial
};