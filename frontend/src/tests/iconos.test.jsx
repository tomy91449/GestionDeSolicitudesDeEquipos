import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, afterEach, vi } from 'vitest';

import { AuthContext } from '../context/AuthContext';
import Login from '../pages/Login';
import Registro from '../pages/Registro';
import FormularioSolicitud from '../pages/FormularioSolicitud';
import ResumenAdmin from '../pages/ResumenAdmin';

vi.mock('../services/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: [] }) } }));
vi.mock('../services/solicitudes.service', () => ({
    crearSolicitud: vi.fn(),
    listarSolicitudes: vi.fn().mockResolvedValue([])
}));

const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}]/u;

const renderizar = (Pagina) => render(
    <AuthContext.Provider value={{ login: vi.fn() }}>
        <MemoryRouter><Pagina /></MemoryRouter>
    </AuthContext.Provider>
);

describe.each([
    ['Login', Login],
    ['Registro', Registro],
    ['Nueva solicitud', FormularioSolicitud],
    ['Panel admin', ResumenAdmin]
])('%s', (_, Pagina) => {

    afterEach(() => cleanup());

    test('no usa emojis como íconos y los SVG decorativos están ocultos', async () => {
        const { container, findAllByText } = renderizar(Pagina);

        // El panel admin carga datos antes de mostrarse
        if (Pagina === ResumenAdmin) await findAllByText(/pendientes/i);

        expect(container.textContent).not.toMatch(EMOJI);

        const svgs = container.querySelectorAll('svg');
        expect(svgs.length).toBeGreaterThan(0);

        // Los íconos de Phosphor van ocultos; los SVG de fondo del login no son íconos
        svgs.forEach((svg) => {
            if (svg.closest('[aria-hidden="true"]') || svg.getAttribute('aria-hidden') === 'true') return;
            expect(svg.style.pointerEvents).toBe('none');
        });
    });

    test('no promete un cifrado que la app no usa', async () => {
        const { container, findAllByText } = renderizar(Pagina);
        if (Pagina === ResumenAdmin) await findAllByText(/pendientes/i);

        expect(container.textContent).not.toMatch(/AES/);
    });
});
