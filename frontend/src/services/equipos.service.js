import api from './api';

export const obtenerEquipos = async () => {
    const res = await api.get('/equipos');
    return res.data;
};
