const solicitudesService = require('../services/solicitudes.service');

/**
 * CREAR SOLICITUD
 * ✔ FIX: respeta statusCode del error del service (clave para el 400)
 */
const crearSolicitud = async (req, res) => {
    try {
        const { equipoId, fechaRetiro, fechaDevolucion, motivo } = req.body;

        const usuarioId = req.usuario.id;

        const result = await solicitudesService.crearSolicitud(
            equipoId,
            usuarioId,
            fechaRetiro,
            fechaDevolucion,
            motivo
        );

        return res.status(201).json(result);

    } catch (e) {
        const status = e.statusCode || 400;
        return res.status(status).json({ error: e.message });
    }
};

/**
 * CAMBIAR ESTADO
 */
const cambiarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const result = await solicitudesService.cambiarEstado(
            id,
            estado,
            req.usuario.id
        );

        return res.json(result);

    } catch (e) {
        const status = e.statusCode || 400;
        return res.status(status).json({ error: e.message });
    }
};

/**
 * LISTAR
 */
const listarSolicitudes = async (req, res) => {
    try {
        const data = await solicitudesService.listarSolicitudes({
            usuarioId: req.usuario.id,
            rol: req.usuario.rol
        });

        return res.json(data);

    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
};

/**
 * DETALLE
 */
const obtenerSolicitudPorId = async (req, res) => {
    try {
        const data = await solicitudesService.obtenerSolicitudPorId(req.params.id);
        return res.json(data);

    } catch (e) {
        return res.status(404).json({ error: e.message });
    }
};

/**
 * HISTORIAL
 */
const obtenerHistorial = async (req, res) => {
    try {
        const data = await solicitudesService.obtenerHistorial(req.params.id);
        return res.json(data);

    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
};

/**
 * CANCELAR
 */
const cancelarSolicitud = async (req, res) => {
    try {
        const data = await solicitudesService.cancelarSolicitud(
            req.params.id,
            req.usuario.id
        );

        return res.json(data);

    } catch (e) {
        const status = e.statusCode || 400;
        return res.status(status).json({ error: e.message });
    }
};

/**
 * APROBAR
 */
const aprobarSolicitud = async (req, res) => {
    try {
        const data = await solicitudesService.cambiarEstado(
            req.params.id,
            'aprobada',
            req.usuario.id
        );

        return res.json(data);

    } catch (e) {
        const status = e.statusCode || 400;
        return res.status(status).json({ error: e.message });
    }
};

/**
 * RECHAZAR
 */
const rechazarSolicitud = async (req, res) => {
    try {
        const data = await solicitudesService.cambiarEstado(
            req.params.id,
            'rechazada',
            req.usuario.id
        );

        return res.json(data);

    } catch (e) {
        const status = e.statusCode || 400;
        return res.status(status).json({ error: e.message });
    }
};

/**
 * DEVOLVER
 */
const devolverSolicitud = async (req, res) => {
    try {
        const data = await solicitudesService.cambiarEstado(
            req.params.id,
            'devuelta',
            req.usuario.id
        );

        return res.json(data);

    } catch (e) {
        const status = e.statusCode || 400;
        return res.status(status).json({ error: e.message });
    }
};

/**
 * RESUMEN ADMIN
 */
const getResumen = async (req, res) => {
    try {
        const data = await solicitudesService.obtenerResumenAdmin?.() || [];
        return res.json(data);

    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
};

module.exports = {
    crearSolicitud,
    cambiarEstado,
    listarSolicitudes,
    obtenerSolicitudPorId,
    obtenerHistorial,
    cancelarSolicitud,
    aprobarSolicitud,
    rechazarSolicitud,
    devolverSolicitud,
    getResumen
};