const express = require('express');
const router = express.Router();

const solicitudesController = require('../controllers/solicitudes.controller');
const verifyToken = require('../middlewares/auth.middleware');
const verifyRole = require('../middlewares/role.middleware');

/* ================= CREAR ================= */
router.post('/', verifyToken, solicitudesController.crearSolicitud);

/* ================= LISTAR ================= */
router.get('/', verifyToken, solicitudesController.listarSolicitudes);

/* ================= RESUMEN ================= */
router.get(
    '/resumen',
    verifyToken,
    verifyRole(['admin', 'encargado']),
    solicitudesController.getResumen
);

/* ================= DETALLE ================= */
router.get('/:id', verifyToken, solicitudesController.obtenerSolicitudPorId);

/* ================= HISTORIAL ================= */
router.get('/:id/historial', verifyToken, solicitudesController.obtenerHistorial);

/* ================= CANCELAR ================= */
router.patch('/:id/cancelar', verifyToken, solicitudesController.cancelarSolicitud);

/* ================= APROBAR ================= */
router.patch(
    '/:id/aprobar',
    verifyToken,
    verifyRole(['admin', 'encargado']),
    solicitudesController.aprobarSolicitud
);

/* ================= RECHAZAR ================= */
router.patch(
    '/:id/rechazar',
    verifyToken,
    verifyRole(['admin', 'encargado']),
    solicitudesController.rechazarSolicitud
);

/* ================= DEVOLVER ================= */
router.patch(
    '/:id/devolver',
    verifyToken,
    verifyRole(['admin', 'encargado']),
    solicitudesController.devolverSolicitud
);

module.exports = router;