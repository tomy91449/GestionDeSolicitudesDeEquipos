import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, afterEach, vi } from 'vitest';

import { AuthContext } from '../context/AuthContext';
import Login from '../pages/Login';
import Registro from '../pages/Registro';
import FormularioSolicitud from '../pages/FormularioSolicitud';
import Filtros from '../components/Filtros';

vi.mock('../services/api', () => ({
    default: {
        get: vi.fn().mockResolvedValue({ data: [] }),
        post: vi.fn().mockRejectedValue({ response: { data: { error: 'Credenciales inválidas' } } })
    }
}));

vi.mock('../services/solicitudes.service', () => ({ crearSolicitud: vi.fn() }));

const conRouter = (ui) => render(
    <AuthContext.Provider value={{ login: vi.fn() }}>
        <MemoryRouter>{ui}</MemoryRouter>
    </AuthContext.Provider>
);

describe('Formularios accesibles', () => {

    afterEach(() => cleanup());

    test('Login: cada campo tiene su etiqueta y autocompletado', () => {
        conRouter(<Login />);

        expect(screen.getByLabelText(/email/i).getAttribute('autocomplete')).toBe('email');
        expect(screen.getByLabelText(/contraseña/i).getAttribute('autocomplete')).toBe('current-password');
    });

    test('Login: el error del servidor se anuncia como alerta', async () => {
        conRouter(<Login />);

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@x.com' } });
        fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'mal' } });
        fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

        expect((await screen.findByRole('alert')).textContent).toMatch(/credenciales inválidas/i);
    });

    test('Registro: cada campo tiene su etiqueta y autocompletado', () => {
        conRouter(<Registro />);

        expect(screen.getByLabelText(/nombre/i).getAttribute('autocomplete')).toBe('name');
        expect(screen.getByLabelText(/email/i).getAttribute('autocomplete')).toBe('email');
        expect(screen.getByLabelText(/contraseña/i).getAttribute('autocomplete')).toBe('new-password');
    });

    test('Nueva solicitud: equipo, fechas y motivo tienen etiqueta', () => {
        conRouter(<FormularioSolicitud />);

        expect(screen.getByLabelText(/^equipo$/i).tagName).toBe('SELECT');
        expect(screen.getByLabelText(/fecha de retiro/i).getAttribute('type')).toBe('date');
        expect(screen.getByLabelText(/fecha de devolución/i).getAttribute('type')).toBe('date');
        expect(screen.getByLabelText(/motivo/i).tagName).toBe('TEXTAREA');
    });

    test('Filtros: la búsqueda y la categoría tienen nombre accesible', () => {
        render(
            <Filtros filtroNombre="" setFiltroNombre={vi.fn()} filtroCategoria="" setFiltroCategoria={vi.fn()} />
        );

        expect(screen.getByLabelText(/buscar equipo/i).tagName).toBe('INPUT');
        expect(screen.getByLabelText(/categoría/i).tagName).toBe('SELECT');
    });
});
