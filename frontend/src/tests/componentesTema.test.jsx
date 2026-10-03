import React from 'react';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, afterEach, vi } from 'vitest';

import { AuthContext } from '../context/AuthContext';
import TablaSolicitudes from '../components/TablaSolicitudes';
import TablaEquipos from '../components/TablaEquipos';
import AccionesSolicitud from '../components/AccionesSolicitud';
import NotFound from '../pages/NotFound';
import * as solicitudesService from '../services/solicitudes.service';

vi.mock('../services/solicitudes.service', () => ({
    aprobarSolicitud: vi.fn(),
    rechazarSolicitud: vi.fn(),
    devolverSolicitud: vi.fn()
}));

const conRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('Tablas', () => {

    afterEach(() => cleanup());

    test('cada "Ver detalle" dice de qué solicitud es', () => {
        conRouter(<TablaSolicitudes solicitudes={[
            { id: 's1', equipoNombre: 'Notebook Dell', usuarioNombre: 'Ana', fechaRetiro: '2031-01-10', fechaDevolucion: '2031-01-12', estado: 'pendiente' },
            { id: 's2', equipoNombre: 'Proyector Epson', usuarioNombre: 'Luis', fechaRetiro: '2031-02-10', fechaDevolucion: '2031-02-12', estado: 'aprobada' }
        ]} />);

        expect(screen.getByRole('link', { name: 'Ver detalle de la solicitud de Notebook Dell' }).getAttribute('href')).toBe('/solicitudes/s1');
        expect(screen.getByRole('link', { name: 'Ver detalle de la solicitud de Proyector Epson' })).toBeTruthy();
    });

    test('el estado se muestra con texto, no solo con color', () => {
        conRouter(<TablaSolicitudes solicitudes={[
            { id: 's1', equipoNombre: 'Notebook', estado: 'rechazada' }
        ]} />);

        const estado = screen.getByText('rechazada');
        expect(estado.className).toContain('estado-rechazada');
    });

    test('las columnas tienen encabezados de tabla', () => {
        render(<TablaEquipos equipos={[
            { id: 'e1', codigoInventario: 'NB-001', nombre: 'Dell', categoria: 'Notebook', estado: 'mantenimiento', ubicacion: 'Lab' }
        ]} />);

        expect(screen.getAllByRole('columnheader').map((th) => th.textContent))
            .toEqual(['Código', 'Nombre', 'Categoría', 'Estado', 'Ubicación']);
        expect(screen.getByText('mantenimiento').className).toContain('estado-mantenimiento');
    });

    test('sin equipos muestra un mensaje en lugar de una tabla vacía', () => {
        render(<TablaEquipos equipos={[]} />);

        expect(screen.queryByRole('table')).toBeNull();
        expect(screen.getByText(/no hay equipos/i)).toBeTruthy();
    });
});

describe('Acciones de gestión', () => {

    afterEach(() => cleanup());

    const conAdmin = (solicitud) => render(
        <AuthContext.Provider value={{ user: { id: 'a1', rol: 'admin' } }}>
            <AccionesSolicitud solicitud={solicitud} onCambio={vi.fn()} />
        </AuthContext.Provider>
    );

    test('los botones se deshabilitan mientras se procesa la acción', async () => {
        let terminar;
        solicitudesService.aprobarSolicitud.mockImplementation(() => new Promise((r) => { terminar = r; }));

        conAdmin({ id: 's1', estado: 'pendiente' });

        fireEvent.click(screen.getByRole('button', { name: /aprobar/i }));

        expect(screen.getByRole('button', { name: /aprobar/i }).disabled).toBe(true);
        expect(screen.getByRole('button', { name: /rechazar/i }).disabled).toBe(true);

        terminar();
        await waitFor(() => expect(screen.getByRole('button', { name: /aprobar/i }).disabled).toBe(false));
    });

    test('sin acciones posibles muestra una nota en vez de una sección vacía', () => {
        conAdmin({ id: 's1', estado: 'rechazada' });

        expect(screen.queryAllByRole('button')).toHaveLength(0);
        expect(screen.getByText(/no hay acciones disponibles/i)).toBeTruthy();
    });
});

describe('Página 404', () => {

    afterEach(() => cleanup());

    test('explica el error y ofrece volver al inicio', () => {
        conRouter(<NotFound />);

        expect(screen.getByRole('heading', { name: /página no encontrada/i })).toBeTruthy();
        expect(screen.getByRole('link', { name: /volver al inicio/i }).getAttribute('href')).toBe('/equipos');
    });
});
