const { connectDB } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

async function seedEquipos() {

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

    console.log('Seeder ejecutado correctamente');
}

seedEquipos()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });