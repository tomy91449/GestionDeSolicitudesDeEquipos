import React, { useContext, useState } from 'react';
import { ArrowCounterClockwiseIcon, CheckIcon, WarningIcon, XIcon } from '@phosphor-icons/react';
import { AuthContext } from '../context/AuthContext';
import './AccionesSolicitud.css';

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
    // Evita enviar dos veces la misma acción con un doble clic
    const [procesando, setProcesando] = useState(false);

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
        setProcesando(true);
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
        } finally {
            setProcesando(false);
        }
    };

    /* =========================
       UI
    ========================== */

    const hayAcciones = puedeAprobar || puedeRechazar || puedeMarcarDevuelta;

    return (
        <div>
            <span className="acciones-titulo">Acciones de gestión</span>

            {error && (
                <div role="alert" className="alerta alerta-error">
                    <WarningIcon size={16} weight="bold" aria-hidden="true" className="icono" />
                    {error}
                </div>
            )}

            {!hayAcciones ? (
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-subtle)' }}>
                    No hay acciones disponibles para una solicitud {solicitud.estado}.
                </p>
            ) : (
                <div className="acciones">
                    {puedeAprobar && (
                        <button type="button" className="accion accion-aprobar" disabled={procesando} onClick={() => handleCambioEstado('aprobada')}>
                            <CheckIcon size={16} weight="bold" aria-hidden="true" />
                            Aprobar
                        </button>
                    )}

                    {puedeRechazar && (
                        <button type="button" className="accion accion-rechazar" disabled={procesando} onClick={() => handleCambioEstado('rechazada')}>
                            <XIcon size={16} weight="bold" aria-hidden="true" />
                            Rechazar
                        </button>
                    )}

                    {puedeMarcarDevuelta && (
                        <button type="button" className="accion accion-devolver" disabled={procesando} onClick={() => handleCambioEstado('devuelta')}>
                            <ArrowCounterClockwiseIcon size={16} weight="bold" aria-hidden="true" />
                            Marcar como devuelta
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default AccionesSolicitud;
