const express = require('express');
const router = express.Router();

const equiposController = require('../controllers/equipos.controller');
const verifyToken = require('../middlewares/auth.middleware');
const verifyRole = require('../middlewares/role.middleware');

// Lectura (cualquier usuario logueado)
router.get(
    '/',
    equiposController.obtenerEquipos
);

router.get(
    '/:id',
    equiposController.obtenerEquipoPorId
);


//router.get(
//    '/',
//    verifyToken,
//    equiposController.obtenerEquipos
//);
//
//router.get(
//    '/:id',
//    verifyToken,
//    equiposController.obtenerEquipoPorId
//);

// Solo administrador
router.post(
    '/',
    verifyToken,
    verifyRole(['admin']),
    equiposController.crearEquipo
);

router.put(
    '/:id',
    verifyToken,
    verifyRole(['admin']),
    equiposController.actualizarEquipo
);

router.delete(
    '/:id',
    verifyToken,
    verifyRole(['admin']),
    equiposController.eliminarEquipo
);

module.exports = router;