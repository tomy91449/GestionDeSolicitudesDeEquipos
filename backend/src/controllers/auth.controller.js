const authService = require('../services/auth.service');

const register = async (req, res, next) => {
    try {
        const { nombre, email, password, rol } = req.body;
        const nuevoUsuario = await authService.registrarUsuario(nombre, email, password, rol);
        res.status(201).json(nuevoUsuario);
    } catch (error) {
        // Le pasamos el error al error.middleware.js
        res.status(400).json({ error: error.message });
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const datos = await authService.loginUsuario(email, password);
        res.status(200).json(datos);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

module.exports = { register, login };