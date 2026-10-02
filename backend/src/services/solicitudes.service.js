const Solicitud = require('../models/Solicitud');
const Equipo = require('../models/Equipo');
const { connectDB } = require('../database/db');
const { registrarHistorial } = require('./historial.service');

const ROLES_GESTION = ['admin', 'encargado'];

// Estado actual -> estados a los que puede pasar
const TRANSICIONES = {
    pendiente: ['aprobada', 'rechazada', 'cancelada'],
    aprobada: ['devuelta'],
    rechazada: [],
    cancelada: [],
    devuelta: []
};

const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const httpError = (mensaje, statusCode) => {
    const error = new Error(mensaje);
    error.statusCode = statusCode;
    return error;
};

const esGestor = (usuario) => ROLES_GESTION.includes(usuario.rol);

const esFechaValida = (fecha) =>
    typeof fecha === 'string' &&
    FECHA_REGEX.test(fecha) &&
    !isNaN(Date.parse(fecha));

const validarDatos = ({ fechaRetiro, fechaDevolucion, motivo }) => {

    const errores = [];

    if (!esFechaValida(fechaRetiro))
        errores.push('La fecha de retiro es obligatoria (formato AAAA-MM-DD)');

    if (!esFechaValida(fechaDevolucion))
        errores.push('La fecha de devolución es obligatoria (formato AAAA-MM-DD)');

    if (!motivo || !String(motivo).trim())
        errores.push('El motivo es obligatorio');

    if (errores.length > 0)
        throw httpError(errores.join('. '), 400);

    if (fechaDevolucion < fechaRetiro)
        throw httpError('La fecha de devolución no puede ser anterior a la de retiro', 400);
};

const validarDisponibilidad = async (equipoId, fechaRetiro, fechaDevolucion, excluirId) => {

    const ocupado = await Solicitud.haySuperposicion(
        equipoId,
        fechaRetiro,
        fechaDevolucion,
        excluirId
    );

    if (ocupado)
        throw httpError('Superposición de fechas: el equipo ya está reservado en ese período', 400);
};

/**
 * Busca la solicitud y verifica que el usuario pueda verla:
 * el dueño o un admin/encargado.
 */
const obtenerSolicitudPorId = async (id, usuario) => {

    const solicitud = await Solicitud.findById(id);

    if (!solicitud)
        throw httpError('Solicitud no encontrada', 404);

    if (!esGestor(usuario) && solicitud.usuarioId !== usuario.id)
        throw httpError('No tenés permiso para ver esta solicitud', 403);

    return solicitud;
};

const crearSolicitud = async (
    equipoId,
    usuarioId,
    fechaRetiro,
    fechaDevolucion,
    motivo
) => {

    if (!equipoId)
        throw httpError('El equipo es obligatorio', 400);

    validarDatos({ fechaRetiro, fechaDevolucion, motivo });

    const equipo = await Equipo.findById(equipoId);

    if (!equipo)
        throw httpError('El equipo indicado no existe', 400);

    if (equipo.estado === 'mantenimiento')
        throw httpError('El equipo está en mantenimiento', 400);

    await validarDisponibilidad(equipoId, fechaRetiro, fechaDevolucion);

    const solicitud = await Solicitud.create({
        equipoId,
        usuarioId,
        fechaRetiro,
        fechaDevolucion,
        motivo: String(motivo).trim()
    });

    const db = await connectDB();
    await registrarHistorial(
        db,
        solicitud.id,
        usuarioId,
        'CREACION',
        null,
        { estado: 'pendiente' }
    );

    return solicitud;
};

/**
 * Los usuarios ven solo sus solicitudes; admin y encargado ven todas.
 */
const listarSolicitudes = async ({ usuarioId, rol }) => {

    if (ROLES_GESTION.includes(rol))
        return Solicitud.findAll();

    return Solicitud.findAll({ usuarioId });
};

/**
 * Edita fechas y motivo. Solo el dueño y mientras esté pendiente.
 */
const editarSolicitud = async (id, datos, usuario) => {

    const solicitud = await obtenerSolicitudPorId(id, usuario);

    if (solicitud.usuarioId !== usuario.id)
        throw httpError('Solo el solicitante puede editar la solicitud', 403);

    if (solicitud.estado !== 'pendiente')
        throw httpError('Solo se pueden editar solicitudes pendientes', 400);

    const nuevos = {
        fechaRetiro: datos.fechaRetiro ?? solicitud.fechaRetiro,
        fechaDevolucion: datos.fechaDevolucion ?? solicitud.fechaDevolucion,
        motivo: datos.motivo ?? solicitud.motivo
    };

    validarDatos(nuevos);

    await validarDisponibilidad(
        solicitud.equipoId,
        nuevos.fechaRetiro,
        nuevos.fechaDevolucion,
        solicitud.id
    );

    const actualizada = await Solicitud.update(id, {
        ...nuevos,
        motivo: String(nuevos.motivo).trim()
    });

    const db = await connectDB();
    await registrarHistorial(
        db,
        id,
        usuario.id,
        'EDICION',
        {
            fechaRetiro: solicitud.fechaRetiro,
            fechaDevolucion: solicitud.fechaDevolucion,
            motivo: solicitud.motivo
        },
        {
            fechaRetiro: actualizada.fechaRetiro,
            fechaDevolucion: actualizada.fechaDevolucion,
            motivo: actualizada.motivo
        }
    );

    return actualizada;
};

/**
 * Aplica una transición de estado validando que esté permitida.
 * Los permisos por rol ya los controla verifyRole en las rutas.
 */
const cambiarEstado = async (id, nuevoEstado, usuarioId) => {

    const estado = String(nuevoEstado || '').toLowerCase();

    if (!Solicitud.ESTADOS.includes(estado))
        throw httpError(`Estado inválido. Debe ser: ${Solicitud.ESTADOS.join(', ')}`, 400);

    const solicitud = await Solicitud.findById(id);

    if (!solicitud)
        throw httpError('Solicitud no encontrada', 404);

    const permitidos = TRANSICIONES[solicitud.estado] || [];

    if (!permitidos.includes(estado)) {
        throw httpError(
            `No se puede pasar una solicitud de "${solicitud.estado}" a "${estado}"`,
            400
        );
    }

    // Queda registrado quién aprobó o rechazó
    const autorizadoPor =
        estado === 'aprobada' || estado === 'rechazada'
            ? usuarioId
            : null;

    const actualizada = await Solicitud.updateEstado(id, estado, autorizadoPor);

    const db = await connectDB();
    await registrarHistorial(
        db,
        id,
        usuarioId,
        `CAMBIO_ESTADO_${estado.toUpperCase()}`,
        { estado: solicitud.estado },
        { estado }
    );

    return actualizada;
};

/**
 * Solo el dueño puede cancelar, y solo si está pendiente.
 */
const cancelarSolicitud = async (id, usuarioId) => {

    const solicitud = await Solicitud.findById(id);

    if (!solicitud)
        throw httpError('Solicitud no encontrada', 404);

    if (solicitud.usuarioId !== usuarioId)
        throw httpError('Solo el solicitante puede cancelar la solicitud', 403);

    return cambiarEstado(id, 'cancelada', usuarioId);
};

const obtenerHistorial = async (id, usuario) => {

    // Valida existencia y permisos
    await obtenerSolicitudPorId(id, usuario);

    return Solicitud.findHistorial(id);
};

const obtenerResumenAdmin = async () => {

    const filas = await Solicitud.contarPorEstado();

    const porEstado = Object.fromEntries(
        Solicitud.ESTADOS.map((estado) => [estado, 0])
    );

    for (const fila of filas)
        porEstado[fila.estado] = fila.total;

    const total = filas.reduce((suma, fila) => suma + fila.total, 0);

    return { total, porEstado };
};

module.exports = {
    crearSolicitud,
    listarSolicitudes,
    obtenerSolicitudPorId,
    editarSolicitud,
    cambiarEstado,
    cancelarSolicitud,
    obtenerHistorial,
    obtenerResumenAdmin
};
