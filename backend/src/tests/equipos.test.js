const request = require('supertest');
const app = require('../app'); // Con un solo punto de retroceso
const { initDB } = require('../database/db');

describe('Pruebas Módulo 2 - Equipos', () => {

    beforeAll(async () => {
        await initDB();
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