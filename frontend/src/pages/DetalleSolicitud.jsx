import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

import {
    obtenerSolicitudPorId,
    obtenerHistorial,
    editarSolicitud,
    cancelarSolicitud
} from '../services/solicitudes.service';

import AccionesSolicitud from '../components/AccionesSolicitud';

const STYLES = `
    @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse  { 0%,100%{opacity:.4} 50%{opacity:.9} }
    @keyframes scanline { 0%{top:-20px} 100%{top:110%} }

    .ds-glass {
        background: rgba(255,255,255,.04);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid rgba(255,255,255,.1);
        border-radius: 20px;
        position: relative;
        overflow: hidden;
    }
    .ds-glass::before {
        content:'';
        position:absolute;
        top:0; left:40px; right:40px; height:2px;
        background:linear-gradient(90deg, transparent, #4f6eff, #a78bfa, transparent);
        border-radius: 0 0 4px 4px;
    }
    .ds-label {
        display:block; font-size:10px; font-weight:700;
        letter-spacing:1.4px; color:rgba(255,255,255,.35);
        margin-bottom:6px; text-transform:uppercase;
    }
    .ds-value {
        font-size:14px; color:rgba(255,255,255,.85); line-height:1.6;
    }
    .ds-input {
        width:100%; padding:11px 14px;
        background:rgba(255,255,255,.06);
        border:1px solid rgba(255,255,255,.1);
        border-radius:10px; outline:none;
        color:#fff; font-size:14px;
        transition:all .2s ease; box-sizing:border-box;
        font-family:'Segoe UI', sans-serif;
    }
    .ds-input::placeholder { color:rgba(255,255,255,.2); }
    .ds-input:focus {
        border-color:rgba(99,130,255,.8);
        background:rgba(99,130,255,.08);
        box-shadow:0 0 0 3px rgba(99,130,255,.15);
    }
    .ds-btn-primary {
        padding:10px 20px; border:none; border-radius:10px;
        background:linear-gradient(135deg,#4f6eff,#7c3aed);
        color:#fff; font-size:13px; font-weight:700;
        cursor:pointer; letter-spacing:.6px;
        box-shadow:0 4px 16px rgba(79,110,255,.35);
        transition:all .2s ease;
    }
    .ds-btn-primary:hover { transform:translateY(-1px); box-shadow:0 6px 24px rgba(79,110,255,.5); }
    .ds-btn-outline-blue {
        padding:9px 18px; border-radius:10px;
        border:1px solid rgba(79,110,255,.5);
        background:rgba(79,110,255,.08);
        color:#818cf8; font-size:13px; font-weight:600;
        cursor:pointer; transition:all .2s ease;
    }
    .ds-btn-outline-blue:hover { background:rgba(79,110,255,.18); border-color:#818cf8; }
    .ds-btn-outline-red {
        padding:9px 18px; border-radius:10px;
        border:1px solid rgba(220,38,38,.4);
        background:rgba(220,38,38,.08);
        color:#fca5a5; font-size:13px; font-weight:600;
        cursor:pointer; transition:all .2s ease;
    }
    .ds-btn-outline-red:hover { background:rgba(220,38,38,.18); border-color:#fca5a5; }
    .ds-hist-row {
        padding:14px 0;
        border-bottom:1px solid rgba(255,255,255,.06);
        display:flex; align-items:flex-start; gap:12px;
    }
    .ds-hist-row:last-child { border-bottom:none; }
`;

const estadoConfig = {
    aprobada:  { color: '#10b981', bg: 'rgba(16,185,129,.15)',  border: 'rgba(16,185,129,.3)'  },
    rechazada: { color: '#ef4444', bg: 'rgba(239,68,68,.15)',   border: 'rgba(239,68,68,.3)'   },
    devuelta:  { color: '#3b82f6', bg: 'rgba(59,130,246,.15)',  border: 'rgba(59,130,246,.3)'  },
    cancelada: { color: '#6b7280', bg: 'rgba(107,114,128,.15)', border: 'rgba(107,114,128,.3)' },
    pendiente: { color: '#f59e0b', bg: 'rgba(245,158,11,.15)',  border: 'rgba(245,158,11,.3)'  },
};

const DetalleSolicitud = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);

    const [solicitud, setSolicitud] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [editando, setEditando] = useState(false);
    const [fechaRetiro, setFechaRetiro] = useState('');
    const [fechaDevolucion, setFechaDevolucion] = useState('');
    const [motivo, setMotivo] = useState('');

    const cargar = async () => {
        try {
            setError('');
            const [dataSol, dataHist] = await Promise.all([
                obtenerSolicitudPorId(id),
                obtenerHistorial(id)
            ]);
            setSolicitud(dataSol);
            setHistorial(dataHist);
            setFechaRetiro(dataSol.fechaRetiro);
            setFechaDevolucion(dataSol.fechaDevolucion);
            setMotivo(dataSol.motivo);
        } catch (e) {
            setError(e.response?.data?.error || 'Error al cargar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargar(); }, [id]);

    const handleGuardar = async () => {
        try {
            await editarSolicitud(solicitud.id, { fechaRetiro, fechaDevolucion, motivo });
            setEditando(false);
            cargar();
        } catch (e) {
            setError(e.response?.data?.error || 'Error al editar');
        }
    };

    const handleCancelar = async () => {
        if (!window.confirm('¿Cancelar la solicitud?')) return;
        try {
            await cancelarSolicitud(solicitud.id);
            cargar();
        } catch (e) {
            setError(e.response?.data?.error || 'Error al cancelar');
        }
    };

    if (loading) return (
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
            background:'linear-gradient(135deg, #060818 0%, #0d1230 40%, #0a1628 70%, #050d1f 100%)',
            color:'rgba(255,255,255,.5)', fontFamily:"'Segoe UI', sans-serif", fontSize:14 }}>
            Cargando solicitud...
        </div>
    );

    if (error && !solicitud) return (
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
            background:'linear-gradient(135deg, #060818 0%, #0d1230 40%, #0a1628 70%, #050d1f 100%)',
            color:'#fca5a5', fontFamily:"'Segoe UI', sans-serif", fontSize:14 }}>
            ⚠️ {error}
        </div>
    );

    if (!solicitud) return null;

    const esPropietario = user?.id === solicitud.usuarioId;
    const esAdminOEncargado = ['admin', 'encargado'].includes(user?.rol);
    const cfg = estadoConfig[solicitud.estado] || estadoConfig.pendiente;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #060818 0%, #0d1230 40%, #0a1628 70%, #050d1f 100%)',
            fontFamily: "'Segoe UI', sans-serif",
            padding: '40px 20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <style>{STYLES}</style>

            {/* Grid fondo */}
            <div style={{
                position:'fixed', inset:0, pointerEvents:'none',
                backgroundImage:'linear-gradient(rgba(79,110,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(79,110,255,.04) 1px, transparent 1px)',
                backgroundSize:'40px 40px',
                maskImage:'radial-gradient(ellipse at center, black 30%, transparent 80%)'
            }} />

            {/* Orbes */}
            <div style={{ position:'fixed', width:'300px', height:'300px', top:'-80px', left:'-80px', borderRadius:'50%', background:'rgba(79,110,255,.1)', filter:'blur(60px)', animation:'pulse 4s ease-in-out infinite', pointerEvents:'none' }} />
            <div style={{ position:'fixed', width:'250px', height:'250px', bottom:'-60px', right:'-60px', borderRadius:'50%', background:'rgba(120,80,255,.08)', filter:'blur(60px)', animation:'pulse 5s ease-in-out infinite 1.5s', pointerEvents:'none' }} />

            <div style={{ maxWidth:'860px', margin:'0 auto', position:'relative', zIndex:10, animation:'slideUp .5s ease both' }}>

                {/* Header */}
                <div style={{ marginBottom:28 }}>
                    <p style={{ color:'rgba(255,255,255,.3)', fontSize:12, letterSpacing:'1.5px', textTransform:'uppercase', margin:'0 0 6px' }}>
                        Sistema de control de equipamiento
                    </p>
                    <h2 style={{ color:'#fff', margin:0, fontSize:22, fontWeight:700, letterSpacing:'-.3px' }}>
                        Detalle de solicitud
                    </h2>
                </div>

                {error && (
                    <div style={{ background:'rgba(220,38,38,.15)', border:'1px solid rgba(220,38,38,.3)', borderRadius:10, padding:'10px 14px', color:'#fca5a5', fontSize:13, marginBottom:20 }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Card principal */}
                <div className="ds-glass" style={{ padding:'28px 32px', marginBottom:20 }}>

                    {/* Header info */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
                        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                            <div>
                                <span className="ds-label">Equipo</span>
                                <span className="ds-value" style={{ fontSize:16, fontWeight:600 }}>{solicitud.equipoNombre}</span>
                            </div>
                            <div>
                                <span className="ds-label">Solicitante</span>
                                <span className="ds-value">{solicitud.usuarioNombre}</span>
                            </div>
                        </div>
                        <span style={{
                            padding:'6px 14px', borderRadius:20,
                            background: cfg.bg, border:`1px solid ${cfg.border}`,
                            color: cfg.color, fontWeight:700, fontSize:11,
                            letterSpacing:'1px', textTransform:'uppercase', whiteSpace:'nowrap'
                        }}>
                            {solicitud.estado}
                        </span>
                    </div>

                    <div style={{ height:1, background:'rgba(255,255,255,.07)', marginBottom:24 }} />

                    {/* Info editable */}
                    {editando ? (
                        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                            <div>
                                <label className="ds-label">Fecha de retiro</label>
                                <input type="date" value={fechaRetiro} onChange={e => setFechaRetiro(e.target.value)} className="ds-input" />
                            </div>
                            <div>
                                <label className="ds-label">Fecha de devolución</label>
                                <input type="date" value={fechaDevolucion} onChange={e => setFechaDevolucion(e.target.value)} className="ds-input" />
                            </div>
                            <div>
                                <label className="ds-label">Motivo</label>
                                <textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={3} className="ds-input" style={{ resize:'vertical' }} />
                            </div>
                            <div style={{ display:'flex', gap:10, marginTop:4 }}>
                                <button onClick={handleGuardar} className="ds-btn-primary">Guardar cambios</button>
                                <button onClick={() => setEditando(false)} className="ds-btn-outline-blue">Cancelar</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20 }}>
                            <div>
                                <span className="ds-label">Fecha de retiro</span>
                                <span className="ds-value">{solicitud.fechaRetiro}</span>
                            </div>
                            <div>
                                <span className="ds-label">Fecha de devolución</span>
                                <span className="ds-value">{solicitud.fechaDevolucion}</span>
                            </div>
                            <div style={{ gridColumn:'1 / -1' }}>
                                <span className="ds-label">Motivo</span>
                                <span className="ds-value">{solicitud.motivo}</span>
                            </div>
                        </div>
                    )}

                    {/* Acciones propietario */}
                    {esPropietario && solicitud.estado === 'pendiente' && !editando && (
                        <div style={{ marginTop:28, display:'flex', gap:10, paddingTop:20, borderTop:'1px solid rgba(255,255,255,.07)' }}>
                            <button onClick={() => setEditando(true)} className="ds-btn-outline-blue">✏️ Editar</button>
                            <button onClick={handleCancelar} className="ds-btn-outline-red">✕ Cancelar solicitud</button>
                        </div>
                    )}

                    {/* Acciones admin */}
                    {esAdminOEncargado && (
                        <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid rgba(255,255,255,.07)' }}>
                            <AccionesSolicitud solicitud={solicitud} onCambio={cargar} />
                        </div>
                    )}
                </div>

                {/* Historial */}
                <div className="ds-glass" style={{ padding:'28px 32px' }}>
                    <h3 style={{ color:'#fff', margin:'0 0 20px', fontSize:15, fontWeight:700, letterSpacing:'-.2px' }}>
                        Historial de cambios
                    </h3>

                    {historial.length === 0 ? (
                        <p style={{ color:'rgba(255,255,255,.3)', fontSize:13, margin:0 }}>Sin cambios registrados.</p>
                    ) : (
                        <div>
                            {historial.map(h => (
                                <div key={h.id} className="ds-hist-row">
                                    <div style={{ width:8, height:8, borderRadius:'50%', background:'#4f6eff', marginTop:5, flexShrink:0 }} />
                                    <div>
                                        <span style={{ color:'rgba(255,255,255,.8)', fontSize:13, fontWeight:600 }}>{h.usuarioNombre}</span>
                                        <span style={{ color:'rgba(255,255,255,.4)', fontSize:13 }}> — {h.accion}</span>
                                        <div style={{ color:'rgba(255,255,255,.25)', fontSize:11, marginTop:3, letterSpacing:'.3px' }}>
                                            {new Date(h.fechaHora).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetalleSolicitud;
