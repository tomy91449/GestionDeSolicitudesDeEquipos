const { connectDB } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

const ESTADOS_VALIDOS = [
    'disponible',
    'prestado',
    'mantenimiento'
];

class Equipo {
    constructor({
        id,
        codigoInventario,
        nombre,
        categoria,
        estado,
        ubicacion,
        requiereAutorizacion
    }) {
        this.id = id;
        this.codigoInventario = codigoInventario;
        this.nombre = nombre;
        this.categoria = categoria;
        this.estado = estado;
        this.ubicacion = ubicacion;
        this.requiereAutorizacion = requiereAutorizacion;
    }

    static validar(datos) {

        const errores = [];

        if (!datos.codigoInventario)
            errores.push('El código de inventario es obligatorio');

        if (!datos.nombre)
            errores.push('El nombre es obligatorio');

        if (!datos.categoria)
            errores.push('La categoría es obligatoria');

        if (
            datos.estado &&
            !ESTADOS_VALIDOS.includes(datos.estado)
        ) {
            errores.push(
                `Estado inválido. Debe ser: ${ESTADOS_VALIDOS.join(', ')}`
            );
        }

        if (errores.length > 0) {
            throw new Error(errores.join('. '));
        }
    }

    static async findAll() {

        const db = await connectDB();

        return db.all(`
            SELECT *
            FROM equipos
            ORDER BY nombre
        `);
    }

    static async findById(id) {

        const db = await connectDB();

        return db.get(
            `
            SELECT *
            FROM equipos
            WHERE id = ?
            `,
            [id]
        );
    }

    static async create(datos) {

        Equipo.validar(datos);

        const db = await connectDB();

        const id = uuidv4();

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
                id,
                datos.codigoInventario,
                datos.nombre,
                datos.categoria,
                datos.estado || 'disponible',
                datos.ubicacion || '',
                datos.requiereAutorizacion ? 1 : 0
            ]
        );

        return this.findById(id);
    }
}

module.exports = Equipo;