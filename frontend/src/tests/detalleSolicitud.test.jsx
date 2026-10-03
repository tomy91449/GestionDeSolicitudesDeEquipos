import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, test, expect, afterEach, vi } from 'vitest';

import { AuthContext } from '../context/AuthContext';
import DetalleSolicitud from '../pages/DetalleSolicitud';
import * as solicitudesService from '../services/solicitudes.service';

vi.mock('../services/solicitudes.service', () => ({
    obtenerSolicitudPorId: vi.fn(),
    obtenerHistorial: vi.fn().mockResolvedValue([]),
    editarSolicitud: vi.fn(),
    cancelarSolicitud: vi.fn(),
    aprobarSolicitud: vi.fn(),
    rechazarSolicitud: vi.fn(),
    devolverSolicitud: vi.fn()
}));

const solicitudBase = {
    id: 's1',
    equipoId: 'e1',
    equipoNombre: 'Notebook',
    usuarioId: 'u1',
    usuarioNombre: 'Ana',
    fechaRetiro: '2031-01-10',
    fechaDevolucion: '2031-01-12',
    motivo: 'Clase',
    estado: 'pendiente'
};

const abrirDetalle = async (usuario, solicitud) => {
    solicitudesService.obtenerSolicitudPorId.mockResolvedValue({ ...solicitudBase, ...solicitud });

    render(
        <AuthContext.Provider value={{ user: usuario }}>
            <MemoryRouter initialEntries={['/solicitudes/s1']}>
                <Routes>
                    <Route path="/solicitudes/:id" element={<DetalleSolicitud />} />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    );

    // Espera a que termine de cargar
    await screen.findByText('Notebook');
};

const botonesCancelar = () => screen.queryAllByRole('button', { name: /cancelar solicitud/i });

describe('Detalle de solicitud - botones', () => {

    afterEach(() => cleanup());

    test('un admin dueño de una pendiente ve un solo botón de cancelar', async () => {
        await abrirDetalle({ id: 'u1', nombre: 'Ana', rol: 'admin' }, { estado: 'pendiente' });

        expect(botonesCancelar()).toHaveLength(1);
        expect(screen.getByRole('button', { name: /aprobar/i })).toBeTruthy();
    });

    test('las acciones de admin no incluyen un "Editar solicitud" sin función', async () => {
        await abrirDetalle({ id: 'u1', nombre: 'Ana', rol: 'admin' }, { estado: 'pendiente' });

        expect(screen.queryByRole('button', { name: /editar solicitud/i })).toBeNull();
    });

    const usuarioDueno = { id: 'u1', nombre: 'Ana', rol: 'usuario' };

    test('el dueño puede cancelar una aprobada antes de la fecha de retiro', async () => {
        await abrirDetalle(usuarioDueno, { estado: 'aprobada', fechaRetiro: '2031-01-10' });

        expect(botonesCancelar()).toHaveLength(1);
        // Una aprobada ya no se puede editar
        expect(screen.queryByRole('button', { name: /editar/i })).toBeNull();
    });

    test('el dueño no ve "Cancelar" si ya llegó la fecha de retiro', async () => {
        await abrirDetalle(usuarioDueno, { estado: 'aprobada', fechaRetiro: '2020-01-10', fechaDevolucion: '2020-01-12' });

        expect(botonesCancelar()).toHaveLength(0);
    });

    test('el dueño no ve "Cancelar" en una rechazada', async () => {
        await abrirDetalle(usuarioDueno, { estado: 'rechazada' });

        expect(botonesCancelar()).toHaveLength(0);
    });
});
