import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

import {
    aprobarSolicitud,
    rechazarSolicitud,
    devolverSolicitud,
    cancelarSolicitud
} from '../services/solicitudes.service';

const AccionesSolicitud = ({ solicitud, onCambio }) => {
    const { user } = useContext(AuthContext);
    const [error, setError] = useState('');

    if (!user || !solicitud) return null;

    const esAdminOEncargado =
        ['admin', 'encargado'].includes(user?.rol);

    const esPropietario =
        user?.id === solicitud.usuarioId;

    /* =========================
       PERMISOS
    ========================== */

    const puedeCancelar =
        esPropietario &&
        ['pendiente', 'aprobada'].includes(solicitud.estado);

    const puedeEditar =
        esPropietario &&
        solicitud.estado === 'pendiente';

    const puedeAprobar =
        esAdminOEncargado &&
        solicitud.estado === 'pendiente';

    const puedeRechazar =
        esAdminOEncargado &&
        solicitud.estado === 'pendiente';

    const puedeMarcarDevuelta =
        esAdminOEncargado &&
        solicitud.estado === 'aprobada';

    /* =========================
       HANDLERS
    ========================== */

    const handleCambioEstado = async (estado) => {
        try {
            setError('');

            if (estado === 'aprobada') {
                await aprobarSolicitud(solicitud.id);
            }

            if (estado === 'rechazada') {
                await rechazarSolicitud(solicitud.id);
            }

            if (estado === 'devuelta') {
                await devolverSolicitud(solicitud.id);
            }

            onCambio?.();
        } catch (e) {
            setError(e.response?.data?.error || 'Error al cambiar estado');
        }
    };

    const handleCancelar = async () => {
        try {
            setError('');

            await cancelarSolicitud(solicitud.id);

            onCambio?.();
        } catch (e) {
            setError(e.response?.data?.error || 'Error al cancelar');
        }
    };

    /* =========================
       UI
    ========================== */

    return (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>

            {error && (
                <p style={{ color: 'red', width: '100%' }}>
                    {error}
                </p>
            )}

            {/* ADMIN */}
            {puedeAprobar && (
                <button onClick={() => handleCambioEstado('aprobada')}>
                    Aprobar
                </button>
            )}

            {puedeRechazar && (
                <button onClick={() => handleCambioEstado('rechazada')}>
                    Rechazar
                </button>
            )}

            {puedeMarcarDevuelta && (
                <button onClick={() => handleCambioEstado('devuelta')}>
                    Marcar como devuelta
                </button>
            )}

            {/* USUARIO */}
            {puedeCancelar && (
                <button onClick={handleCancelar}>
                    Cancelar solicitud
                </button>
            )}

            {puedeEditar && (
                <button onClick={() => console.log('editar solicitud')}>
                    Editar solicitud
                </button>
            )}

        </div>
    );
};

export default AccionesSolicitud;