import api from './api';

export const listarSolicitudes = async () => {
    const res = await api.get('/solicitudes');
    return res.data;
};

export const crearSolicitud = async (datos) => {
    const res = await api.post('/solicitudes', datos);
    return res.data;
};

export const obtenerSolicitudPorId = async (id) => {
    const res = await api.get(`/solicitudes/${id}`);
    return res.data;
};

export const editarSolicitud = async (id, datos) => {
    const res = await api.put(`/solicitudes/${id}`, datos);
    return res.data;
};

export const obtenerHistorial = async (id) => {
    const res = await api.get(`/solicitudes/${id}/historial`);
    return res.data;
};

export const aprobarSolicitud = async (id) => {
    const res = await api.patch(`/solicitudes/${id}/aprobar`);
    return res.data;
};

export const rechazarSolicitud = async (id) => {
    const res = await api.patch(`/solicitudes/${id}/rechazar`);
    return res.data;
};

export const devolverSolicitud = async (id) => {
    const res = await api.patch(`/solicitudes/${id}/devolver`);
    return res.data;
};

export const cancelarSolicitud = async (id) => {
    const res = await api.patch(`/solicitudes/${id}/cancelar`);
    return res.data;
};