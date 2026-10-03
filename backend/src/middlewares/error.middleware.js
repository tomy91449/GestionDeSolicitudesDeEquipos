// Manejador central de errores: atrapa lo que no manejan los controllers
// (por ejemplo, un body con JSON inválido) y responde siempre en JSON,
// sin exponer el stack trace al cliente. Express lo reconoce como
// manejador de errores porque recibe 4 parámetros.
const errorHandler = (err, req, res, next) => {

    // express.json() no pudo parsear el body
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'El cuerpo del pedido no es un JSON válido' });
    }

    const status = err.statusCode || err.status || 500;

    if (status >= 500) {
        console.error(err);
        return res.status(status).json({ error: 'Error interno del servidor' });
    }

    return res.status(status).json({ error: err.message });
};

module.exports = errorHandler;
