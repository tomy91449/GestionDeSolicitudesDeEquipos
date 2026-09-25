const equiposService = require('../services/equipos.service');

const obtenerEquipos = async (req, res) => {
    try {
        const equipos = await equiposService.obtenerEquipos();
        res.status(200).json(equipos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtenerEquipoPorId = async (req, res) => {
    try {
        const equipo = await equiposService.obtenerEquipoPorId(req.params.id);

        if (!equipo) {
            return res.status(404).json({
                error: 'Equipo no encontrado'
            });
        }

        res.status(200).json(equipo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearEquipo = async (req, res) => {
    try {
        const equipo = await equiposService.crearEquipo(req.body);
        res.status(201).json(equipo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const actualizarEquipo = async (req, res) => {
    try {
        const equipo = await equiposService.actualizarEquipo(
            req.params.id,
            req.body
        );

        res.status(200).json(equipo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const eliminarEquipo = async (req, res) => {
    try {
        await equiposService.eliminarEquipo(req.params.id);

        res.status(200).json({
            mensaje: 'Equipo eliminado correctamente'
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    obtenerEquipos,
    obtenerEquipoPorId,
    crearEquipo,
    actualizarEquipo,
    eliminarEquipo
};