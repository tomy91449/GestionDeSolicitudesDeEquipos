const request = require('supertest');
const app = require('../app');
const { initDB } = require('../database/db');

describe("Pruebas del Módulo 1: Autenticación", () => {
    
    // Antes de arrancar los tests, inicializamos la base de datos
    beforeAll(async () => {
        await initDB();
    });

    // Creamos un email dinámico con Date.now() para que el test no falle por "email duplicado"
    // si lo corremos varias veces seguidas.
    const testUser = {
        nombre: "Test User",
        email: `usuario_${Date.now()}@dds.com`,
        password: "password123",
        rol: "usuario"
    };

    it("1. Debe registrar un usuario correctamente", async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send(testUser);
            
        expect(response.statusCode).toEqual(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.email).toBe(testUser.email);
    });

    it("2. Debe iniciar sesión correctamente con credenciales válidas (Login correcto)", async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password });
            
        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('usuario');
    });

    it("3. Debe fallar el login con credenciales inválidas (Login inválido)", async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: "clave_equivocada" });
            
        expect(response.statusCode).toEqual(401);
        expect(response.body).toHaveProperty('error');
    });

    it("4. Debe denegar el acceso sin JWT a una ruta protegida", async () => {
        // Asumiendo que /api/solicitudes está protegida por auth.middleware.js
        const response = await request(app)
            .post('/api/solicitudes') // Intentamos crear una solicitud sin token
            .send({});
            
        expect(response.statusCode).toEqual(401);
        expect(response.body.error).toMatch(/Acceso denegado/i);
    });

    it("5. Debe rechazar emails duplicados", async     () => {

        await request(app)
            .post('/api/auth/register')
            .send(testUser);

        const response = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(response.statusCode)
            .toBe(400);
    });

    it("6. Debe rechazar email inválido", async ()     => {

        const response = await request(app)
            .post('/api/auth/register')
            .send({
                nombre: "Usuario",
                email: "correo-invalido",
                password: "123456"
            });

        expect(response.statusCode)
            .toBe(400);
    });
});