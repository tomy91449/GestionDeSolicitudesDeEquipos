const request = require('supertest');
const app = require('../app');
const { initDB, connectDB } = require('../database/db');
const Usuario = require('../models/Usuario');
const { fecha } = require('./fechas');

// Simula que pasó el tiempo: la API ya no permite crear solicitudes con
// retiro en el pasado, así que se mueven las fechas directo en la base
const moverFechas = async (id, fechaRetiro, fechaDevolucion) => {
    const db = await connectDB();
    await db.run(
        'UPDATE solicitudes SET fechaRetiro = ?, fechaDevolucion = ? WHERE id = ?',
        [fechaRetiro, fechaDevolucion, id]
    );
};

describe('SUITE COMPLETA SOLICITUDES', () => {
    let adminToken;
    let userToken;
    let equipoId;
    let solicitudId;

    const loginToken = async (email) => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email, password: '123456' });
        expect(res.statusCode).toBe(200);
        return res.body.token;
    };

    // La base de tests arranca vacía (ver setup.js): todo se crea acá y,
    // si algo falla, la suite falla en vez de seguir con datos falsos.
    beforeAll(async () => {
        await initDB();

        // 1. Usuarios. El registro público no permite elegir rol: el admin se crea con el modelo
        await Usuario.crear({ nombre: 'Admin', email: 'admin@utn.com', password: '123456', rol: 'admin' });
        adminToken = await loginToken('admin@utn.com');

        const registro = await request(app)
            .post('/api/auth/register')
            .send({ nombre: 'Usuario', email: 'usuario@utn.com', password: '123456' });
        expect(registro.statusCode).toBe(201);
        userToken = await loginToken('usuario@utn.com');

        // 2. Equipo de prueba
        const nuevoEquipo = await request(app)
            .post('/api/equipos')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                codigoInventario: 'EQ-TEST-999',
                nombre: 'Equipo de Prueba Solicitudes',
                categoria: 'Multimedia',
                estado: 'disponible',
                ubicacion: 'Laboratorio'
            });

        expect(nuevoEquipo.statusCode).toBe(201);
        equipoId = nuevoEquipo.body.id;

        // 3. Solicitud base (pendiente) para los tests de transiciones
        const solicitudRes = await request(app)
            .post('/api/solicitudes')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                equipoId,
                fechaRetiro: fecha(30),
                fechaDevolucion: fecha(32),
                motivo: 'Solicitud base operativa'
            });

        expect(solicitudRes.statusCode).toBe(201);
        solicitudId = solicitudRes.body.id;
    });

    // =========================================================
    // TESTS DE AUTENTICACIÓN
    // =========================================================
    test('Login válido', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@utn.com', password: '123456' });
        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    test('Login inválido', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@utn.com', password: 'mal' });
        expect(res.statusCode).toBe(401);
    });

    test('Sin token no puede acceder', async () => {
        const res = await request(app).get('/api/solicitudes');
        expect(res.statusCode).toBe(401);
    });

    test('Rol insuficiente (usuario no puede aprobar)', async () => {
        const res = await request(app)
            .patch(`/api/solicitudes/${solicitudId}/aprobar`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toBe(403);
    });

    // =========================================================
    // SOLICITUD VALIDA
    // =========================================================
    test('Solicitud válida', async () => {
        const res = await request(app)
            .post('/api/solicitudes')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                equipoId,
                fechaRetiro: fecha(90),
                fechaDevolucion: fecha(92),
                motivo: 'Reserva limpia de fin de año'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.estado).toBe('pendiente');
        expect(res.body.equipoId).toBe(equipoId);
    });

    // =========================================================
    // VALIDACIONES DE NEGOCIO
    // =========================================================
    test('Solicitud inválida por fechas', async () => {
        const res = await request(app)
            .post('/api/solicitudes')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                equipoId: equipoId,
                fechaRetiro: fecha(60),
                fechaDevolucion: fecha(56),
                motivo: 'Fechas cruzadas'
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/devolución no puede ser anterior/i);
    });

    test('Superposición de fechas', async () => {
        const original = await request(app)
            .post('/api/solicitudes')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                equipoId: equipoId,
                fechaRetiro: fecha(120),
                fechaDevolucion: fecha(124),
                motivo: 'Reserva original fija'
            });
        expect(original.statusCode).toBe(201);

        const res = await request(app)
            .post('/api/solicitudes')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                equipoId: equipoId,
                fechaRetiro: fecha(122),
                fechaDevolucion: fecha(125),
                motivo: 'Intento fallido de solapamiento'
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/superposición de fechas/i);
    });

    test('Devolución inválida (no aprobada)', async () => {
        const res = await request(app)
            .patch(`/api/solicitudes/${solicitudId}/devolver`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/de "pendiente" a "devuelta"/);
    });

    test('Transición inválida de estado', async () => {
        const cancelada = await request(app)
            .patch(`/api/solicitudes/${solicitudId}/cancelar`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(cancelada.statusCode).toBe(200);

        const res = await request(app)
            .patch(`/api/solicitudes/${solicitudId}/aprobar`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/de "cancelada" a "aprobada"/);
    });

    // =========================================================
    // CANCELACIÓN
    // =========================================================
    const crearSolicitud = async (fechaRetiro, fechaDevolucion) => {
        const res = await request(app)
            .post('/api/solicitudes')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ equipoId, fechaRetiro, fechaDevolucion, motivo: 'Prueba de cancelación' });
        return res.body.id;
    };

    const accion = (id, nombre, token) => request(app)
        .patch(`/api/solicitudes/${id}/${nombre}`)
        .set('Authorization', `Bearer ${token}`);

    test('Se puede cancelar una aprobada antes de la fecha de retiro', async () => {
        const id = await crearSolicitud(fecha(150), fecha(151));
        await accion(id, 'aprobar', adminToken);

        const res = await accion(id, 'cancelar', userToken);

        expect(res.statusCode).toBe(200);
        expect(res.body.estado).toBe('cancelada');
    });

    test('No se puede cancelar una aprobada cuando ya llegó la fecha de retiro', async () => {
        const id = await crearSolicitud(fecha(200), fecha(201));
        await accion(id, 'aprobar', adminToken);
        await moverFechas(id, fecha(-20), fecha(-18));

        const res = await accion(id, 'cancelar', userToken);

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/fecha de retiro/i);
    });

    test('No se puede cancelar una rechazada', async () => {
        const id = await crearSolicitud(fecha(160), fecha(161));
        await accion(id, 'rechazar', adminToken);

        const res = await accion(id, 'cancelar', userToken);

        expect(res.statusCode).toBe(400);
    });

    test('No se puede cancelar una devuelta', async () => {
        const id = await crearSolicitud(fecha(170), fecha(171));
        await accion(id, 'aprobar', adminToken);
        await accion(id, 'devolver', adminToken);

        const res = await accion(id, 'cancelar', userToken);

        expect(res.statusCode).toBe(400);
    });

    // =========================================================
    // FECHA DE RETIRO EN EL PASADO
    // =========================================================
    const crear = (fechaRetiro, fechaDevolucion) => request(app)
        .post('/api/solicitudes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ equipoId, fechaRetiro, fechaDevolucion, motivo: 'Prueba de fechas' });

    const editar = (id, datos) => request(app)
        .put(`/api/solicitudes/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(datos);

    test('No se puede crear una solicitud con retiro anterior a hoy', async () => {
        const res = await crear(fecha(-1), fecha(1));

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('La fecha de retiro no puede ser anterior a hoy');
    });

    test('Se puede crear una solicitud con retiro hoy', async () => {
        const res = await crear(fecha(0), fecha(1));

        expect(res.statusCode).toBe(201);
    });

    test('No se puede editar una solicitud para moverla al pasado', async () => {
        const creada = await crear(fecha(300), fecha(301));

        const res = await editar(creada.body.id, { fechaRetiro: fecha(-5), fechaDevolucion: fecha(-4) });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('La fecha de retiro no puede ser anterior a hoy');
    });

    test('Se puede editar el motivo de una pendiente cuyo retiro ya llegó', async () => {
        const creada = await crear(fecha(310), fecha(311));
        await moverFechas(creada.body.id, fecha(-10), fecha(-8));

        const res = await editar(creada.body.id, { motivo: 'Motivo corregido' });

        expect(res.statusCode).toBe(200);
        expect(res.body.motivo).toBe('Motivo corregido');
    });
});