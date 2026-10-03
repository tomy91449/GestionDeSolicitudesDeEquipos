const request = require('supertest');
const app = require('../app');
const { initDB } = require('../database/db');

describe('Manejo central de errores', () => {

    beforeAll(async () => {
        await initDB();
    });

    test('un JSON mal formado responde 400 en JSON, sin stack trace', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .set('Content-Type', 'application/json')
            .send('{mal json');

        expect(response.statusCode).toBe(400);
        expect(response.headers['content-type']).toMatch(/application\/json/);
        expect(response.body).toEqual({ error: 'El cuerpo del pedido no es un JSON válido' });
        expect(response.text).not.toMatch(/node_modules|at /);
    });
});
