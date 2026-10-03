import React from 'react';
import { Link } from 'react-router-dom';
import { CaretRightIcon } from '@phosphor-icons/react';
import './Tabla.css';

const ESTADOS = ['pendiente', 'aprobada', 'rechazada', 'devuelta', 'cancelada'];

const claseEstado = (estado) => {
    const valor = (estado || '').toLowerCase();
    return ESTADOS.includes(valor) ? `estado estado-${valor}` : 'estado estado-cancelada';
};

const TablaSolicitudes = ({ solicitudes = [] }) => {

    if (!Array.isArray(solicitudes)) {
        return <p role="alert" className="tabla-vacia">Error: datos inválidos</p>;
    }

    if (solicitudes.length === 0) {
        return <p className="tabla-vacia">No hay solicitudes registradas.</p>;
    }

    return (
        <div className="tabla-contenedor" role="region" aria-label="Tabla de solicitudes" tabIndex={0}>
            <table className="tabla">
                <caption className="sr-only">Solicitudes de préstamo de equipos</caption>
                <thead>
                    <tr>
                        <th scope="col">Equipo</th>
                        <th scope="col">Usuario</th>
                        <th scope="col">Retiro</th>
                        <th scope="col">Devolución</th>
                        <th scope="col">Estado</th>
                        <th scope="col"><span className="sr-only">Acciones</span></th>
                    </tr>
                </thead>

                <tbody>
                    {solicitudes.map((solicitud) => {
                        const equipo = solicitud.equipoNombre || solicitud.equipoId;

                        return (
                            <tr key={solicitud.id}>
                                <td className="tabla-principal">{equipo}</td>
                                <td>{solicitud.usuarioNombre || solicitud.usuarioId}</td>
                                <td className="tabla-fecha">{solicitud.fechaRetiro}</td>
                                <td className="tabla-fecha">{solicitud.fechaDevolucion}</td>
                                <td>
                                    <span className={claseEstado(solicitud.estado)}>
                                        {solicitud.estado}
                                    </span>
                                </td>
                                <td>
                                    <Link
                                        to={`/solicitudes/${solicitud.id}`}
                                        className="tabla-link"
                                        aria-label={`Ver detalle de la solicitud de ${equipo}`}
                                    >
                                        Ver detalle
                                        <CaretRightIcon size={14} weight="bold" aria-hidden="true" />
                                    </Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default TablaSolicitudes;
