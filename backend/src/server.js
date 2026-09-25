const app = require('./app');
const { initDB } = require('./database/db'); // Asegurate de que la ruta sea /database/db

const PORT = 3000;

// Primero inicializamos SQLite, luego levantamos Express
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor funcionando en http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error("Error al arrancar el servidor:", err);
});