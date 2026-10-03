const request = require('supertest');
const app = require('../app');
const { initDB } = require('../database/db');
const Usuario = require('../models/Usuario');

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
                fechaRetiro: '2026-09-01',
                fechaDevolucion: '2026-09-03',
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
                fechaRetiro: '2026-12-10', // Diciembre para evitar cruces
                fechaDevolucion: '2026-12-12',
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
                fechaRetiro: '2026-10-15',
                fechaDevolucion: '2026-10-11',
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
                fechaRetiro: '2026-11-01',
                fechaDevolucion: '2026-11-05',
                motivo: 'Reserva original fija'
            });
        expect(original.statusCode).toBe(201);

        const res = await request(app)
            .post('/api/solicitudes')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                equipoId: equipoId,
                fechaRetiro: '2026-11-03',
                fechaDevolucion: '2026-11-06',
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
        const id = await crearSolicitud('2031-03-01', '2031-03-02');
        await accion(id, 'aprobar', adminToken);

        const res = await accion(id, 'cancelar', userToken);

        expect(res.statusCode).toBe(200);
        expect(res.body.estado).toBe('cancelada');
    });

    test('No se puede cancelar una aprobada cuando ya llegó la fecha de retiro', async () => {
        const id = await crearSolicitud('2020-03-01', '2020-03-02');
        await accion(id, 'aprobar', adminToken);

        const res = await accion(id, 'cancelar', userToken);

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/fecha de retiro/i);
    });

    test('No se puede cancelar una rechazada', async () => {
        const id = await crearSolicitud('2031-04-01', '2031-04-02');
        await accion(id, 'rechazar', adminToken);

        const res = await accion(id, 'cancelar', userToken);

        expect(res.statusCode).toBe(400);
    });

    test('No se puede cancelar una devuelta', async () => {
        const id = await crearSolicitud('2031-05-01', '2031-05-02');
        await accion(id, 'aprobar', adminToken);
        await accion(id, 'devolver', adminToken);

        const res = await accion(id, 'cancelar', userToken);

        expect(res.statusCode).toBe(400);
    });
});