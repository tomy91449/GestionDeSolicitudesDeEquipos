import api from './api';

// Opción 1: obtenerEquipos
export const obtenerEquipos = async () => {
    const res = await api.get('/equipos');
    return res.data;
};

// Opción 2: listarEquipos (Por si el JSX la busca con este nombre)
export const listarEquipos = async () => {
    const res = await api.get('/equipos');
    return res.data;
};

// Opción 3: getEquipos (Muy común si usan nombres en inglés)
export const getEquipos = async () => {
    const res = await api.get('/equipos');
    return res.data;
};

// Crear equipo (Por si también lo necesita el panel)
export const crearEquipo = async (datos) => {
    const res = await api.post('/equipos', datos);
    return res.data;
};