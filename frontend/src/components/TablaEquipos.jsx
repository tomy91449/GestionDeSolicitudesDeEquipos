import React from 'react';
import './Tabla.css';

const ESTADOS = ['disponible', 'prestado', 'mantenimiento'];

const claseEstado = (estado) => {
    const valor = (estado || '').toLowerCase();
    return ESTADOS.includes(valor) ? `estado estado-${valor}` : 'estado estado-cancelada';
};

const TablaEquipos = ({ equipos = [] }) => {

    if (equipos.length === 0) {
        return <p className="tabla-vacia">No hay equipos que coincidan con la búsqueda.</p>;
    }

    return (
        <div className="tabla-contenedor" role="region" aria-label="Tabla de equipos" tabIndex={0}>
            <table className="tabla">
                <caption className="sr-only">Catálogo de equipos</caption>
                <thead>
                    <tr>
                        <th scope="col">Código</th>
                        <th scope="col">Nombre</th>
                        <th scope="col">Categoría</th>
                        <th scope="col">Estado</th>
                        <th scope="col">Ubicación</th>
                    </tr>
                </thead>

                <tbody>
                    {equipos.map((equipo) => (
                        <tr key={equipo.id}>
                            <td className="tabla-codigo">{equipo.codigoInventario}</td>
                            <td className="tabla-principal">{equipo.nombre}</td>
                            <td>{equipo.categoria}</td>
                            <td>
                                <span className={claseEstado(equipo.estado)}>
                                    {equipo.estado}
                                </span>
                            </td>
                            <td>{equipo.ubicacion}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TablaEquipos;
