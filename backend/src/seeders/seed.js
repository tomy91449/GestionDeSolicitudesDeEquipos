const { connectDB, initDB, closeDB } = require('../database/db');
const { v4: uuidv4 } = require('uuid');
const Usuario = require('../models/Usuario');

// Usuarios de prueba para desarrollo. Son la única forma de tener un admin
// o un encargado, porque el registro público siempre crea usuarios comunes.
const USUARIOS = [
    { nombre: 'Administrador', email: 'admin@dd.com', password: 'admin123', rol: 'admin' },
    { nombre: 'Encargado', email: 'encargado@dd.com', password: 'encargado123', rol: 'encargado' },
    { nombre: 'Usuario', email: 'usuario@dd.com', password: 'usuario123', rol: 'usuario' }
];

async function seedUsuarios() {

    for (const datos of USUARIOS) {

        const existe = await Usuario.findByEmail(datos.email);

        if (!existe) {
            await Usuario.crear(datos);
            console.log(`Usuario agregado: ${datos.email} (${datos.rol})`);
        }
    }
}

async function seedEquipos() {

    // Crea las tablas si todavía no existen (base nueva)
    await initDB();

    const db = await connectDB();

    const equipos = [
        {
            codigoInventario: 'NB-001',
            nombre: 'Dell Latitude 5520',
            categoria: 'Notebook',
            estado: 'disponible',
            ubicacion: 'Laboratorio A',
            requiereAutorizacion: 0
        },
        {
            codigoInventario: 'NB-002',
            nombre: 'Lenovo ThinkPad E15',
            categoria: 'Notebook',
            estado: 'disponible',
            ubicacion: 'Laboratorio A',
            requiereAutorizacion: 0
        },
        {
            codigoInventario: 'NB-003',
            nombre: 'HP ProBook 450 G8',
            categoria: 'Notebook',
            estado: 'disponible',
            ubicacion: 'Laboratorio B',
            requiereAutorizacion: 0
        },
        {
            codigoInventario: 'PROY-001',
            nombre: 'Epson PowerLite X49',
            categoria: 'Proyector',
            estado: 'disponible',
            ubicacion: 'Depósito',
            requiereAutorizacion: 1
        },
        {
            codigoInventario: 'PROY-002',
            nombre: 'BenQ MS550',
            categoria: 'Proyector',
            estado: 'disponible',
            ubicacion: 'Depósito',
            requiereAutorizacion: 1
        },
        {
            codigoInventario: 'CAM-001',
            nombre: 'Canon EOS Rebel T7',
            categoria: 'Cámara',
            estado: 'disponible',
            ubicacion: 'Laboratorio Multimedia',
            requiereAutorizacion: 1
        },
        {
            codigoInventario: 'TAB-001',
            nombre: 'Samsung Galaxy Tab S9',
            categoria: 'Tablet',
            estado: 'disponible',
            ubicacion: 'Laboratorio Multimedia',
            requiereAutorizacion: 0
        },
        {
            codigoInventario: 'MIC-001',
            nombre: 'Blue Yeti USB',
            categoria: 'Micrófono',
            estado: 'disponible',
            ubicacion: 'Estudio',
            requiereAutorizacion: 0
        }
    ];

    for (const equipo of equipos) {

        const existe = await db.get(
            `
            SELECT *
            FROM equipos
            WHERE codigoInventario = ?
            `,
            [equipo.codigoInventario]
        );

        if (!existe) {

            await db.run(
                `
                INSERT INTO equipos
                (
                    id,
                    codigoInventario,
                    nombre,
                    categoria,
                    estado,
                    ubicacion,
                    requiereAutorizacion
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    uuidv4(),
                    equipo.codigoInventario,
                    equipo.nombre,
                    equipo.categoria,
                    equipo.estado,
                    equipo.ubicacion,
                    equipo.requiereAutorizacion
                ]
            );

            console.log(
                `Equipo agregado: ${equipo.nombre}`
            );
        }
    }

}

seedEquipos()
    .then(seedUsuarios)
    .then(async () => {
        console.log('Seeder ejecutado correctamente');
        await closeDB();
        process.exit();
    })
    .catch(async (error) => {
        console.error(error);
        await closeDB().catch(() => {});
        process.exit(1);
    });