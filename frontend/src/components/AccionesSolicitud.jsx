import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

import {
    aprobarSolicitud,
    rechazarSolicitud,
    devolverSolicitud
} from '../services/solicitudes.service';

// Acciones de admin/encargado. Las del dueño (editar y cancelar) están
// en DetalleSolicitud, para no mostrarlas dos veces.
const AccionesSolicitud = ({ solicitud, onCambio }) => {
    const { user } = useContext(AuthContext);
    const [error, setError] = useState('');

    if (!user || !solicitud) return null;

    const esAdminOEncargado =
        ['admin', 'encargado'].includes(user?.rol);

    /* =========================
       PERMISOS
    ========================== */

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

        </div>
    );
};

export default AccionesSolicitud;
