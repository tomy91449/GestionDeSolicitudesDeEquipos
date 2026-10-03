import React from 'react';
import { render, waitFor, cleanup, screen } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

// Las páginas piden datos al backend: devolvemos listas vacías
vi.mock('../services/api', () => ({
    default: {
        get: vi.fn().mockResolvedValue({ data: [] }),
        post: vi.fn().mockResolvedValue({ data: {} }),
        put: vi.fn().mockResolvedValue({ data: {} }),
        patch: vi.fn().mockResolvedValue({ data: {} }),
        interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } }
    }
}));

import { AuthProvider } from '../context/AuthContext';
import AppRouter from '../routes/AppRouter';

const abrirApp = (ruta) => {
    // Simula entrar a la URL directamente (como al apretar F5)
    window.history.pushState({}, '', ruta);

    return render(
        <AuthProvider>
            <AppRouter />
        </AuthProvider>
    );
};

describe('Sesión al recargar la página', () => {

    beforeEach(() => localStorage.clear());
    afterEach(() => cleanup());

    test('con sesión guardada, recargar una ruta protegida no manda al login', async () => {
        localStorage.setItem('token', 'token-de-prueba');
        localStorage.setItem('user', JSON.stringify({ id: 'u1', nombre: 'Ana', rol: 'usuario' }));

        abrirApp('/solicitudes');

        // Esperamos a que corran los efectos y redirecciones
        await waitFor(() => expect(window.location.pathname).toBe('/solicitudes'));
        await new Promise((r) => setTimeout(r, 50));

        expect(window.location.pathname).toBe('/solicitudes');
    });

    test('sin sesión, una ruta protegida sí manda al login', async () => {
        abrirApp('/solicitudes');

        await waitFor(() => expect(window.location.pathname).toBe('/login'));
    });

    test('con sesión de admin, recargar /admin no manda a otra página', async () => {
        localStorage.setItem('token', 'token-de-prueba');
        localStorage.setItem('user', JSON.stringify({ id: 'a1', nombre: 'Admin', rol: 'admin' }));

        abrirApp('/admin');

        await new Promise((r) => setTimeout(r, 50));

        expect(window.location.pathname).toBe('/admin');
    });

    test('el login muestra un aviso cuando la sesión venció', async () => {
        abrirApp('/login?sesion=vencida');

        expect(await screen.findByText('Tu sesión venció. Iniciá sesión de nuevo.')).toBeTruthy();
    });

    test('el login normal no muestra el aviso', () => {
        abrirApp('/login');

        expect(screen.queryByText(/Tu sesión venció/)).toBeNull();
    });
});
