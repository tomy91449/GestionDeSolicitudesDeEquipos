import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import api from '../services/api';

// Simula la respuesta del backend sin hacer pedidos reales
const responderCon = (status, data = {}) => {
    api.defaults.adapter = async (config) => {
        const response = { status, data, headers: {}, config, statusText: '' };
        if (status >= 400) {
            const error = new Error(`Request failed with status code ${status}`);
            error.config = config;
            error.response = response;
            error.isAxiosError = true;
            throw error;
        }
        return response;
    };
};

describe('Token vencido o inválido', () => {

    let redirigir;

    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem('token', 'token-vencido');
        localStorage.setItem('user', JSON.stringify({ id: 'u1', nombre: 'Ana', rol: 'usuario' }));

        // jsdom no navega de verdad: espiamos la redirección
        redirigir = vi.fn();
        vi.stubGlobal('location', { ...window.location, pathname: '/solicitudes', assign: redirigir });
    });

    afterEach(() => vi.unstubAllGlobals());

    test('un 401 con token cierra la sesión y manda al login con aviso', async () => {
        responderCon(401, { error: 'Acceso denegado' });

        await expect(api.get('/solicitudes')).rejects.toBeTruthy();

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
        expect(redirigir).toHaveBeenCalledWith('/login?sesion=vencida');
    });

    test('un login fallido (401) no cierra sesión ni redirige', async () => {
        localStorage.clear();
        responderCon(401, { error: 'Credenciales inválidas' });

        await expect(api.post('/auth/login', { email: 'a@x.com', password: 'mal' })).rejects.toBeTruthy();

        expect(redirigir).not.toHaveBeenCalled();
    });

    test('otros errores (403) no cierran la sesión', async () => {
        responderCon(403, { error: 'Sin permisos' });

        await expect(api.get('/solicitudes/resumen')).rejects.toBeTruthy();

        expect(localStorage.getItem('token')).toBe('token-vencido');
        expect(redirigir).not.toHaveBeenCalled();
    });
});
