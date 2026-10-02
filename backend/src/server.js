const app = require('./app');
const { initDB, closeDB } = require('./database/db');

const PORT = 3000;

// Primero inicializamos SQLite, luego levantamos Express
initDB().then(() => {
    const server = app.listen(PORT, () => {
        console.log(`Servidor funcionando en http://localhost:${PORT}`);
    });

    // Cierre ordenado: dejar de aceptar pedidos y después cerrar la base
    const apagar = (senal) => {
        console.log(`\n${senal} recibido, cerrando servidor...`);

        // Si alguna conexión HTTP queda colgada, forzar la salida a los 5 s
        setTimeout(() => process.exit(1), 5000).unref();

        server.close(async () => {
            try {
                await closeDB();
                console.log('Conexión a la base cerrada.');
                process.exit(0);
            } catch (err) {
                console.error('Error al cerrar la base:', err);
                process.exit(1);
            }
        });

        // Cerrar las conexiones keep-alive inactivas (navegador) para no esperar
        server.closeIdleConnections?.();
    };

    process.on('SIGINT', () => apagar('SIGINT'));
    process.on('SIGTERM', () => apagar('SIGTERM'));
}).catch(err => {
    console.error("Error al arrancar el servidor:", err);
});
