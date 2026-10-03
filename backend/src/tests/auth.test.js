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

    it("7. Debe aceptar el token del login y rechazar uno firmado con otra clave", async () => {
        const jwt = require('jsonwebtoken');

        const login = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password });

        const conTokenValido = await request(app)
            .get('/api/solicitudes')
            .set('Authorization', `Bearer ${login.body.token}`);

        expect(conTokenValido.statusCode).toBe(200);

        // Misma información, pero firmado con la clave que antes estaba hardcodeada
        const tokenFalso = jwt.sign(
            { id: login.body.usuario.id, nombre: 'x', rol: 'admin' },
            'clave_secreta_utn_dds'
        );

        const conTokenFalso = await request(app)
            .get('/api/solicitudes')
            .set('Authorization', `Bearer ${tokenFalso}`);

        expect(conTokenFalso.statusCode).toBe(401);
    });

    it("8. No debe permitir registrarse como admin desde el registro público", async () => {
        const intruso = {
            nombre: "Intruso",
            email: `intruso_${Date.now()}@dds.com`,
            password: "password123",
            rol: "admin"
        };

        const registro = await request(app)
            .post('/api/auth/register')
            .send(intruso);

        expect(registro.statusCode).toBe(201);
        expect(registro.body.rol).toBe('usuario');

        const login = await request(app)
            .post('/api/auth/login')
            .send({ email: intruso.email, password: intruso.password });

        expect(login.body.usuario.rol).toBe('usuario');

        // Y con ese token no puede usar rutas de admin
        const crearEquipo = await request(app)
            .post('/api/equipos')
            .set('Authorization', `Bearer ${login.body.token}`)
            .send({ codigoInventario: 'HACK-1', nombre: 'x', categoria: 'x', estado: 'disponible', ubicacion: 'x' });

        expect(crearEquipo.statusCode).toBe(403);
    });
});