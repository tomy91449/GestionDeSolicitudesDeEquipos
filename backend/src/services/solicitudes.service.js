const db = require('../database/db');

/**
 * VERIFICAR SOLAPAMIENTO DE FECHAS
 */
function haySolapamiento(equipoId, fechaRetiro, fechaDevolucion) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT * FROM solicitudes
            WHERE equipoId = ?
            AND estado IN ('pendiente', 'aprobada')
            AND (
                (fechaRetiro <= ? AND fechaDevolucion >= ?)
            )
        `;

        db.all(query, [equipoId, fechaDevolucion, fechaRetiro], (err, rows) => {
            if (err) return reject(err);
            resolve(rows.length > 0);
        });
    });
}

/**
 * CREAR SOLICITUD
 */
async function crearSolicitud(
    equipoId,
    usuarioId,
    fechaRetiro,
    fechaDevolucion,
    motivo
) {
    // 🔥 VALIDACIÓN CRÍTICA (ESTO TE FALTABA)
    const overlap = await haySolapamiento(
        equipoId,
        fechaRetiro,
        fechaDevolucion
    );

    if (overlap) {
        const error = new Error('Superposición de fechas');
        error.statusCode = 400;
        throw error;
    }

    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO solicitudes
            (equipoId, usuarioId, fechaRetiro, fechaDevolucion, motivo, estado)
            VALUES (?, ?, ?, ?, ?, 'pendiente')
        `;

        db.run(
            query,
            [equipoId, usuarioId, fechaRetiro, fechaDevolucion, motivo],
            function (err) {
                if (err) return reject(err);

                resolve({
                    id: this.lastID,
                    equipoId,
                    usuarioId,
                    fechaRetiro,
                    fechaDevolucion,
                    motivo,
                    estado: 'pendiente'
                });
            }
        );
    });
}

module.exports = {
    crearSolicitud
};