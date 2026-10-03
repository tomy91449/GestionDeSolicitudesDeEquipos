import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, afterEach, vi } from 'vitest';

import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const abrirEn = (ruta, rol = 'usuario') => render(
    <AuthContext.Provider value={{ user: { id: 'u1', nombre: 'Ana', rol }, logout: vi.fn() }}>
        <MemoryRouter initialEntries={[ruta]}>
            <Navbar />
        </MemoryRouter>
    </AuthContext.Provider>
);

const paginaActual = () => screen.getAllByRole('link').filter((l) => l.getAttribute('aria-current') === 'page');

describe('Navbar', () => {

    afterEach(() => cleanup());

    test('es una región de navegación con nombre', () => {
        abrirEn('/equipos');

        expect(screen.getByRole('navigation', { name: /principal/i })).toBeTruthy();
    });

    test.each([
        ['/equipos', /^equipos$/i],
        ['/solicitudes', /^solicitudes$/i],
        ['/solicitudes/abc-123', /^solicitudes$/i],
        ['/solicitudes/nueva', /nueva solicitud/i]
    ])('en %s marca como actual solo el link correcto', (ruta, nombre) => {
        abrirEn(ruta);

        const actuales = paginaActual();

        expect(actuales).toHaveLength(1);
        expect(actuales[0].textContent).toMatch(nombre);
    });

    test('el panel admin solo aparece para admin o encargado', () => {
        abrirEn('/equipos', 'usuario');
        expect(screen.queryByRole('link', { name: /panel admin/i })).toBeNull();
        cleanup();

        abrirEn('/admin', 'encargado');
        expect(paginaActual()[0].textContent).toMatch(/panel admin/i);
    });

    test('cerrar sesión es un botón con nombre accesible', () => {
        abrirEn('/equipos');

        expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeTruthy();
    });
});
