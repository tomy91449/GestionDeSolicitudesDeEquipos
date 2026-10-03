const { connectDB } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

const ESTADOS = [
    'pendiente',
    'aprobada',
    'rechazada',
    'cancelada',
    'devuelta'
];

// Estados que ocupan el equipo durante su rango de fechas
const ESTADOS_ACTIVOS = ['pendiente', 'aprobada'];

// Trae la solicitud con el nombre del equipo y del usuario (lo usa el frontend)
const SELECT_CON_NOMBRES = `
    SELECT
        s.*,
        e.nombre AS equipoNombre,
        e.categoria AS equipoCategoria,
        u.nombre AS usuarioNombre
    FROM solicitudes s
    LEFT JOIN equipos e ON e.id = s.equipoId
    LEFT JOIN usuarios u ON u.id = s.usuarioId
`;

class Solicitud {

    static async findAll({ usuarioId } = {}) {

        const db = await connectDB();

        if (usuarioId) {
            return db.all(
                `${SELECT_CON_NOMBRES}
                WHERE s.usuarioId = ?
                ORDER BY s.fechaRetiro DESC`,
                [usuarioId]
            );
        }

        return db.all(`
            ${SELECT_CON_NOMBRES}
            ORDER BY s.fechaRetiro DESC
        `);
    }

    static async findById(id) {

        const db = await connectDB();

        return db.get(
            `${SELECT_CON_NOMBRES}
            WHERE s.id = ?`,
            [id]
        );
    }

    /**
     * Devuelve true si el equipo tiene otra solicitud activa
     * cuyas fechas se pisan con el rango indicado.
     */
    static async haySuperposicion(
        equipoId,
        fechaRetiro,
        fechaDevolucion,
        excluirId = null
    ) {

        const db = await connectDB();

        const fila = await db.get(
            `
            SELECT id
            FROM solicitudes
            WHERE equipoId = ?
            AND estado IN (${ESTADOS_ACTIVOS.map(() => '?').join(', ')})
            AND fechaRetiro <= ?
            AND fechaDevolucion >= ?
            AND id IS NOT ?
            LIMIT 1
            `,
            [
                equipoId,
                ...ESTADOS_ACTIVOS,
                fechaDevolucion,
                fechaRetiro,
                excluirId
            ]
        );

        return Boolean(fila);
    }

    static async create({
        equipoId,
        usuarioId,
        fechaRetiro,
        fechaDevolucion,
        motivo
    }) {

        const db = await connectDB();

        const id = uuidv4();

        await db.run(
            `
            INSERT INTO solicitudes
            (
                id,
                equipoId,
                usuarioId,
                fechaRetiro,
                fechaDevolucion,
                motivo,
                estado
            )
            VALUES (?, ?, ?, ?, ?, ?, 'pendiente')
            `,
            [id, equipoId, usuarioId, fechaRetiro, fechaDevolucion, motivo]
        );

        return this.findById(id);
    }

    static async update(id, { fechaRetiro, fechaDevolucion, motivo }) {

        const db = await connectDB();

        await db.run(
            `
            UPDATE solicitudes
            SET fechaRetiro = ?,
                fechaDevolucion = ?,
                motivo = ?
            WHERE id = ?
            `,
            [fechaRetiro, fechaDevolucion, motivo, id]
        );

        return this.findById(id);
    }

    static async updateEstado(id, estado, autorizadoPor = null) {

        const db = await connectDB();

        await db.run(
            `
            UPDATE solicitudes
            SET estado = ?,
                autorizadoPor = COALESCE(?, autorizadoPor)
            WHERE id = ?
            `,
            [estado, autorizadoPor, id]
        );

        return this.findById(id);
    }

    static async findHistorial(solicitudId) {

        const db = await connectDB();

        return db.all(
            `
            SELECT h.*, u.nombre AS usuarioNombre
            FROM historial_solicitudes h
            LEFT JOIN usuarios u ON u.id = h.usuarioId
            WHERE h.solicitudId = ?
            ORDER BY h.fechaHora DESC
            `,
            [solicitudId]
        );
    }

    static async contarPorEstado() {

        const db = await connectDB();

        return db.all(`
            SELECT estado, COUNT(*) AS total
            FROM solicitudes
            GROUP BY estado
        `);
    }
}

Solicitud.ESTADOS = ESTADOS;

module.exports = Solicitud;
