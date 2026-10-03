import React from 'react';
import { render, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, afterEach, vi } from 'vitest';

import FormularioSolicitud from '../pages/FormularioSolicitud';
import { hoyLocal } from '../utils/fechas';

vi.mock('../services/api', () => ({
    default: { get: vi.fn().mockResolvedValue({ data: [] }) }
}));

vi.mock('../services/solicitudes.service', () => ({
    crearSolicitud: vi.fn()
}));

const abrirFormulario = () => render(
    <MemoryRouter>
        <FormularioSolicitud />
    </MemoryRouter>
);

describe('Formulario de nueva solicitud - fechas', () => {

    afterEach(() => cleanup());

    test('la fecha de retiro no permite días anteriores a hoy', async () => {
        const { container } = abrirFormulario();

        const retiro = container.querySelector('input[name="fechaRetiro"]');

        expect(retiro.getAttribute('min')).toBe(hoyLocal());
    });

    test('la devolución no permite días anteriores al retiro elegido', async () => {
        const { container } = abrirFormulario();

        const retiro = container.querySelector('input[name="fechaRetiro"]');
        const devolucion = container.querySelector('input[name="fechaDevolucion"]');

        // Sin retiro elegido, el mínimo es hoy
        expect(devolucion.getAttribute('min')).toBe(hoyLocal());

        fireEvent.change(retiro, { target: { value: '2099-05-10' } });

        await waitFor(() => expect(devolucion.getAttribute('min')).toBe('2099-05-10'));
    });
});
