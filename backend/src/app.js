const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const solicitudesRoutes = require('./routes/solicitudes.routes');
const equiposRoutes = require('./routes/equipos.routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/equipos', equiposRoutes);

// Siempre al final, después de las rutas
app.use(errorHandler);

module.exports = app;