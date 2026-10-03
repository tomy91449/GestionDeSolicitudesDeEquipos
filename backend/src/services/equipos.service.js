const { connectDB } = require('../database/db');
const { v4: uuidv4 } = require('uuid');
const Equipo = require('../models/Equipo');

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

    // Campos obligatorios y estado dentro de los permitidos
    Equipo.validar(datos);

    if (!datos.estado) {
        throw new Error(
            `El estado es obligatorio. Debe ser: ${Equipo.ESTADOS_VALIDOS.join(', ')}`
        );
    }

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
        const error = new Error('Equipo no encontrado');
        error.statusCode = 404;
        throw error;
    }

    // Actualización parcial: los campos que no se envían conservan su valor
    const campos = [
        'codigoInventario',
        'nombre',
        'categoria',
        'estado',
        'ubicacion',
        'requiereAutorizacion'
    ];

    const combinado = { ...equipo };

    for (const campo of campos) {
        if (datos[campo] !== undefined) {
            combinado[campo] = datos[campo];
        }
    }

    Equipo.validar(combinado);

    // Mismo control que al crear: el código no puede usarlo otro equipo
    const duplicado = await db.get(
        `
        SELECT id
        FROM equipos
        WHERE codigoInventario = ? AND id <> ?
        `,
        [combinado.codigoInventario, id]
    );

    if (duplicado) {
        throw new Error(
            'Ya existe un equipo con ese código de inventario'
        );
    }

    const {
        codigoInventario,
        nombre,
        categoria,
        estado,
        ubicacion
    } = combinado;

    const requiereAutorizacion = Boolean(combinado.requiereAutorizacion);

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

    // No se borra si tiene solicitudes (de cualquier estado): quedarían
    // apuntando a un equipo inexistente y se perdería su historial
    const { total } = await db.get(
        `
        SELECT COUNT(*) AS total
        FROM solicitudes
        WHERE equipoId = ?
        `,
        [id]
    );

    if (total > 0) {
        const error = new Error(
            `No se puede eliminar el equipo porque tiene ${total} solicitud(es) asociada(s)`
        );
        error.statusCode = 409;
        throw error;
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