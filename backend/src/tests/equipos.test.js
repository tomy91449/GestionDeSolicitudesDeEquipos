const request = require('supertest');
const app = require('../app'); // Con un solo punto de retroceso
const { initDB } = require('../database/db');
const Equipo = require('../models/Equipo');
const Usuario = require('../models/Usuario');

describe('Pruebas Módulo 2 - Equipos', () => {

    beforeAll(async () => {
        await initDB();

        // La base de tests arranca vacía: cargamos un equipo de ejemplo
        await Equipo.create({
            codigoInventario: 'TEST-001',
            nombre: 'Notebook de prueba',
            categoria: 'Notebook',
            ubicacion: 'Laboratorio'
        });
    });

    test(
        'Debe obtener listado de equipos',
        async () => {

            const response = await request(app)
                .get('/api/equipos');

            expect(response.statusCode)
                .toBe(200);

            expect(
                Array.isArray(response.body)
            ).toBe(true);
        }
    );

    test(
        'Cada equipo debe tener estructura correcta',
        async () => {

            const response = await request(app)
                .get('/api/equipos');

            expect(response.statusCode)
                .toBe(200);

            if (response.body.length > 0) {

                const equipo =
                    response.body[0];

                expect(equipo)
                    .toHaveProperty('id');

                expect(equipo)
                    .toHaveProperty(
                        'codigoInventario'
                    );

                expect(equipo)
                    .toHaveProperty(
                        'nombre'
                    );

                expect(equipo)
                    .toHaveProperty(
                        'categoria'
                    );

                expect(equipo)
                    .toHaveProperty(
                        'estado'
                    );
            }
        }
    );

    test(
        'Debe obtener un equipo por ID',
        async () => {

            const listado = await request(app)
                .get('/api/equipos');

            const id =
                listado.body[0]?.id;

            if (!id) return;

            const response = await request(app)
                .get(`/api/equipos/${id}`);

            expect(response.statusCode)
                .toBe(200);

            expect(response.body.id)
                .toBe(id);
        }
    );

    test(
        'Debe devolver 404 si el equipo no existe',
        async () => {

            const response = await request(app)
                .get(
                    '/api/equipos/id-inexistente'
                );

            expect(
                response.statusCode
            ).toBe(404);
        }
    );
});

describe('Equipos - alta, edición y baja (admin)', () => {

    let adminToken;

    const nuevoEquipo = (codigo, extra = {}) => ({
        codigoInventario: codigo,
        nombre: 'Equipo de prueba',
        categoria: 'Notebook',
        ubicacion: 'Laboratorio',
        estado: 'disponible',
        ...extra
    });

    const crear = (datos) => request(app)
        .post('/api/equipos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(datos);

    beforeAll(async () => {
        await initDB();

        await Usuario.crear({
            nombre: 'Admin Equipos',
            email: 'admin-equipos@test.com',
            password: '123456',
            rol: 'admin'
        });

        const login = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin-equipos@test.com', password: '123456' });

        adminToken = login.body.token;
    });

    test('Debe rechazar un equipo sin estado con un mensaje claro', async () => {
        const { estado, ...sinEstado } = nuevoEquipo('VAL-001');

        const response = await crear(sinEstado);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toMatch(/estado es obligatorio/i);
    });

    test('Debe rechazar un equipo sin ubicación con un mensaje claro', async () => {
        const { ubicacion, ...sinUbicacion } = nuevoEquipo('VAL-004');

        const response = await crear(sinUbicacion);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toMatch(/ubicación es obligatoria/i);
    });

    test('Debe rechazar un estado que no existe', async () => {
        const response = await crear(nuevoEquipo('VAL-002', { estado: 'roto' }));

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toMatch(/estado inválido/i);
    });

    test('Debe crear un equipo válido', async () => {
        const response = await crear(nuevoEquipo('VAL-003'));

        expect(response.statusCode).toBe(201);
        expect(response.body.estado).toBe('disponible');
    });

    const actualizar = (id, datos) => request(app)
        .put(`/api/equipos/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(datos);

    test('PUT parcial debe cambiar solo el estado y conservar el resto', async () => {
        const creado = await crear(nuevoEquipo('PUT-001', {
            nombre: 'Proyector Epson',
            ubicacion: 'Aula 3',
            requiereAutorizacion: true
        }));

        const response = await actualizar(creado.body.id, { estado: 'mantenimiento' });

        expect(response.statusCode).toBe(200);

        const guardado = await request(app).get(`/api/equipos/${creado.body.id}`);

        expect(guardado.body).toMatchObject({
            codigoInventario: 'PUT-001',
            nombre: 'Proyector Epson',
            categoria: 'Notebook',
            ubicacion: 'Aula 3',
            estado: 'mantenimiento',
            requiereAutorizacion: 1
        });
    });

    test('PUT con un estado inválido debe dar 400', async () => {
        const creado = await crear(nuevoEquipo('PUT-002'));

        const response = await actualizar(creado.body.id, { estado: 'roto' });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toMatch(/estado inválido/i);
    });

    test('PUT con el código de otro equipo debe dar 400 con mensaje claro', async () => {
        await crear(nuevoEquipo('PUT-003'));
        const otro = await crear(nuevoEquipo('PUT-004'));

        const response = await actualizar(otro.body.id, { codigoInventario: 'PUT-003' });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toMatch(/ya existe un equipo con ese código/i);

        // Mantener su propio código no cuenta como duplicado
        const mismoCodigo = await actualizar(otro.body.id, { codigoInventario: 'PUT-004', nombre: 'Renombrado' });
        expect(mismoCodigo.statusCode).toBe(200);
    });

    test('PUT de un equipo inexistente debe dar 404', async () => {
        const response = await actualizar('id-inexistente', { nombre: 'x' });

        expect(response.statusCode).toBe(404);
    });

    const eliminar = (id) => request(app)
        .delete(`/api/equipos/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

    test('No debe borrar un equipo que tiene solicitudes (409)', async () => {
        const creado = await crear(nuevoEquipo('DEL-001'));

        await request(app)
            .post('/api/solicitudes')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                equipoId: creado.body.id,
                fechaRetiro: '2030-01-10',
                fechaDevolucion: '2030-01-12',
                motivo: 'Reserva que bloquea el borrado'
            });

        const response = await eliminar(creado.body.id);

        expect(response.statusCode).toBe(409);
        expect(response.body.error).toMatch(/solicitud/i);

        // El equipo sigue existiendo
        const sigue = await request(app).get(`/api/equipos/${creado.body.id}`);
        expect(sigue.statusCode).toBe(200);
    });

    test('Debe borrar un equipo sin solicitudes', async () => {
        const creado = await crear(nuevoEquipo('DEL-002'));

        const response = await eliminar(creado.body.id);

        expect(response.statusCode).toBe(200);

        const borrado = await request(app).get(`/api/equipos/${creado.body.id}`);
        expect(borrado.statusCode).toBe(404);
    });
});