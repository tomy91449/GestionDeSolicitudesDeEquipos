const { connectDB } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

const obtenerEquipos = async () => {
    const db = await connectDB();

    return await db.all(`
        SELECT *
        FROM equipos
        ORDER BY nombre
    `);
};

const obtenerEquipoPorId = async (id) => {
    const db = await connectDB();

    return await db.get(
        `
        SELECT *
        FROM equipos
        WHERE id = ?
        `,
        [id]
    );
};

const crearEquipo = async (datos) => {

    const db = await connectDB();

    const {
        codigoInventario,
        nombre,
        categoria,
        estado,
        ubicacion,
        requiereAutorizacion
    } = datos;

    const existente = await db.get(
        `
        SELECT *
        FROM equipos
        WHERE codigoInventario = ?
        `,
        [codigoInventario]
    );

    if (existente) {
        throw new Error(
            'Ya existe un equipo con ese código de inventario'
        );
    }

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
            codigoInventario,
            nombre,
            categoria,
            estado,
            ubicacion,
            requiereAutorizacion ? 1 : 0
        ]
    );

    return {
        id,
        codigoInventario,
        nombre,
        categoria,
        estado,
        ubicacion,
        requiereAutorizacion
    };
};

const actualizarEquipo = async (id, datos) => {

    const db = await connectDB();

    const equipo = await db.get(
        `
        SELECT *
        FROM equipos
        WHERE id = ?
        `,
        [id]
    );

    if (!equipo) {
        throw new Error('Equipo no encontrado');
    }

    const {
        codigoInventario,
        nombre,
        categoria,
        estado,
        ubicacion,
        requiereAutorizacion
    } = datos;

    await db.run(
        `
        UPDATE equipos
        SET
            codigoInventario = ?,
            nombre = ?,
            categoria = ?,
            estado = ?,
            ubicacion = ?,
            requiereAutorizacion = ?
        WHERE id = ?
        `,
        [
            codigoInventario,
            nombre,
            categoria,
            estado,
            ubicacion,
            requiereAutorizacion ? 1 : 0,
            id
        ]
    );

    return {
        id,
        codigoInventario,
        nombre,
        categoria,
        estado,
        ubicacion,
        requiereAutorizacion
    };
};

const eliminarEquipo = async (id) => {

    const db = await connectDB();

    const equipo = await db.get(
        `
        SELECT *
        FROM equipos
        WHERE id = ?
        `,
        [id]
    );

    if (!equipo) {
        throw new Error('Equipo no encontrado');
    }

    await db.run(
        `
        DELETE FROM equipos
        WHERE id = ?
        `,
        [id]
    );
};

module.exports = {
    obtenerEquipos,
    obtenerEquipoPorId,
    crearEquipo,
    actualizarEquipo,
    eliminarEquipo
};