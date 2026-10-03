import React from 'react';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import './Filtros.css';

const CATEGORIAS = ['Notebook', 'Proyector', 'Cámara', 'Tablet', 'Micrófono'];

const Filtros = ({
    filtroNombre,
    setFiltroNombre,
    filtroCategoria,
    setFiltroCategoria
}) => {

    return (
        <div className="filtros">
            <div className="filtro-busqueda">
                <MagnifyingGlassIcon size={18} className="filtro-busqueda-icono" aria-hidden="true" />
                <label htmlFor="filtro-nombre" className="sr-only">Buscar equipo por nombre</label>
                <input
                    id="filtro-nombre"
                    type="search"
                    placeholder="Buscar equipo..."
                    value={filtroNombre}
                    onChange={(e) => setFiltroNombre(e.target.value)}
                    className="filtro-campo"
                />
            </div>

            <label htmlFor="filtro-categoria" className="sr-only">Filtrar por categoría</label>
            <select
                id="filtro-categoria"
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="filtro-campo filtro-categoria"
            >
                <option value="">Todas las categorías</option>
                {CATEGORIAS.map((categoria) => (
                    <option key={categoria} value={categoria}>{categoria}</option>
                ))}
            </select>
        </div>
    );
};

export default Filtros;
