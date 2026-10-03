// Se ejecuta antes de cada archivo de test (setupFilesAfterEnv en package.json).
//
// Cada archivo de test usa su propia base SQLite en memoria: arranca vacía,
// no toca backend/database.sqlite y desaparece al cerrar la conexión.
// Tiene que definirse antes de que se cargue database/db.js.
process.env.DB_PATH = ':memory:';

// Clave fija para los tests, así no dependen del .env de cada uno
process.env.JWT_SECRET = 'clave-solo-para-tests';

afterAll(async () => {
    const { closeDB } = require('../database/db');
    await closeDB();
});
