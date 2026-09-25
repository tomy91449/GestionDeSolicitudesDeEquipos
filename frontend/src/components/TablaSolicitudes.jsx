import React from 'react';
import { Link } from 'react-router-dom';
import {
    aprobarSolicitud,
    rechazarSolicitud,
    devolverSolicitud
} from '../services/solicitudes.service';
const TablaSolicitudes = ({ solicitudes = [] }) => {

    if (!Array.isArray(solicitudes)) {
        return <p>Error: datos inválidos</p>;
    }

    if (solicitudes.length === 0) {
        return (
            <p style={{ padding: '20px', color: '#666' }}>
                No hay solicitudes registradas.
            </p>
        );
    }

    const obtenerColorEstado = (estado) => {
        switch ((estado || '').toLowerCase()) {
            case 'pendiente':
                return '#f57c00';
            case 'aprobada':
                return '#2e7d32';
            case 'rechazada':
                return '#d32f2f';
            case 'devuelta':
                return '#1976d2';
            case 'cancelada':
                return '#616161';
            default:
                return '#616161';
        }
    };

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
                <thead>
                    <tr style={{ backgroundColor: '#1f2937', color: 'white' }}>
                        <th style={{ padding: '14px' }}>Equipo</th>
                        <th style={{ padding: '14px' }}>Usuario</th>
                        <th style={{ padding: '14px' }}>Retiro</th>
                        <th style={{ padding: '14px' }}>Devolución</th>
                        <th style={{ padding: '14px' }}>Estado</th>
                        <th style={{ padding: '14px' }}>Detalle</th>
                    </tr>
                </thead>

                <tbody>
                    {solicitudes.map((solicitud, index) => (
                        <tr
                            key={solicitud.id}
                            style={{
                                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                            }}
                        >
                            <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                                {solicitud.equipoNombre || solicitud.equipoId}
                            </td>

                            <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                                {solicitud.usuarioNombre || solicitud.usuarioId}
                            </td>

                            <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                                {solicitud.fechaRetiro}
                            </td>

                            <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                                {solicitud.fechaDevolucion}
                            </td>

                            <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                                <span
                                    style={{
                                        backgroundColor: obtenerColorEstado(solicitud.estado),
                                        color: 'white',
                                        padding: '5px 10px',
                                        borderRadius: '20px'
                                    }}
                                >
                                    {solicitud.estado}
                                </span>
                            </td>

                            <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                                <Link to={`/solicitudes/${solicitud.id}`}>
                                    Ver detalle
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TablaSolicitudes;