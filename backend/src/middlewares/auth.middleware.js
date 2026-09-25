const jwt = require('jsonwebtoken');

const SECRET_KEY = "clave_secreta_utn_dds";

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ error: "Acceso denegado" });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Acceso denegado" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.usuario = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Acceso denegado" });
    }
};

module.exports = verifyToken;