const path = require('path');

// Carga backend/.env sin importar desde qué carpeta se ejecute el comando
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error(
        'Falta la variable de entorno JWT_SECRET. ' +
        'Copiá backend/.env.example a backend/.env y definí una clave.'
    );
}

module.exports = { JWT_SECRET };
