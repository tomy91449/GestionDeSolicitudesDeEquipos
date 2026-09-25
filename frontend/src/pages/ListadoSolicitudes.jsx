import { listarSolicitudes } from '../services/solicitudes.service';
import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import TablaSolicitudes from '../components/TablaSolicitudes';

const STYLES = `
    @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse   { 0%,100%{opacity:.4} 50%{opacity:.9} }

    .ls-glass {
        background:rgba(255,255,255,.04);
        backdrop-filter:blur(24px);
        -webkit-backdrop-filter:blur(24px);
        border:1px solid rgba(255,255,255,.1);
        border-radius:20px;
        position:relative;
        overflow:hidden;
    }
    .ls-glass::before {
        content:'';
        position:absolute; top:0; left:40px; right:40px; height:2px;
        background:linear-gradient(90deg, transparent, #4f6eff, #a78bfa, transparent);
        border-radius:0 0 4px 4px;
    }
    .ls-btn-nueva {
        padding:10px 20px; border:none; border-radius:10px;
        background:linear-gradient(135deg,#4f6eff,#7c3aed);
        color:#fff; font-size:13px; font-weight:700;
        cursor:pointer; letter-spacing:.6px;
        box-shadow:0 4px 16px rgba(79,110,255,.35);
        transition:all .2s ease; text-decoration:none;
        display:inline-flex; align-items:center; gap:6px;
    }
    .ls-btn-nueva:hover { transform:translateY(-1px); box-shadow:0 6px 24px rgba(79,110,255,.5); }
`;

const ListadoSolicitudes = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);

    const cargarSolicitudes = async () => {
        try {
            const data = await listarSolicitudes();
            console.log('SOLICITUDES:', data);
            setSolicitudes(data);
        } catch (error) {
            console.error('Error cargando solicitudes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargarSolicitudes(); }, []);

    return (
        <div style={{
            minHeight:'100vh',
            background:'linear-gradient(135deg, #060818 0%, #0d1230 40%, #0a1628 70%, #050d1f 100%)',
            fontFamily:"'Segoe UI', sans-serif",
            padding:'40px 20px',
            position:'relative', overflow:'hidden'
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
            <div style={{ position:'fixed', width:'350px', height:'350px', top:'-100px', left:'-100px', borderRadius:'50%', background:'rgba(79,110,255,.08)', filter:'blur(80px)', animation:'pulse 4s ease-in-out infinite', pointerEvents:'none' }} />
            <div style={{ position:'fixed', width:'250px', height:'250px', bottom:'-60px', right:'-60px', borderRadius:'50%', background:'rgba(120,80,255,.07)', filter:'blur(60px)', animation:'pulse 5s ease-in-out infinite 1.5s', pointerEvents:'none' }} />

            <div style={{ maxWidth:'1200px', margin:'0 auto', position:'relative', zIndex:10, animation:'slideUp .5s ease both' }}>

                {/* Header */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:28 }}>
                    <div>
                        <p style={{ color:'rgba(255,255,255,.3)', fontSize:12, letterSpacing:'1.5px', textTransform:'uppercase', margin:'0 0 6px' }}>
                            Sistema de control de equipamiento
                        </p>
                        <h1 style={{ color:'#fff', margin:0, fontSize:24, fontWeight:700, letterSpacing:'-.4px' }}>
                            Solicitudes
                        </h1>
                    </div>
                    <Link to="/solicitudes/nueva" className="ls-btn-nueva">
                        + Nueva solicitud
                    </Link>
                </div>

                {/* Card */}
                <div className="ls-glass" style={{ padding:'28px 32px' }}>

                    {/* Sub-header */}
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                        <span style={{ color:'rgba(255,255,255,.3)', fontSize:12, letterSpacing:'1px', textTransform:'uppercase' }}>
                            Total registradas
                        </span>
                        <span style={{ background:'rgba(79,110,255,.2)', border:'1px solid rgba(79,110,255,.3)', color:'#818cf8', borderRadius:20, padding:'2px 10px', fontSize:12, fontWeight:700 }}>
                            {loading ? '...' : solicitudes.length}
                        </span>
                    </div>

                    <div style={{ height:1, background:'rgba(255,255,255,.07)', marginBottom:24 }} />

                    {loading ? (
                        <p style={{ color:'rgba(255,255,255,.3)', fontSize:13, textAlign:'center', padding:'40px 0' }}>Cargando solicitudes...</p>
                    ) : solicitudes.length === 0 ? (
                        <div style={{ textAlign:'center', padding:'40px 0' }}>
                            <p style={{ color:'rgba(255,255,255,.3)', fontSize:13, margin:'0 0 12px' }}>No hay solicitudes registradas.</p>
                            <Link to="/solicitudes/nueva" className="ls-btn-nueva">
                                + Crear la primera
                            </Link>
                        </div>
                    ) : (
                        <TablaSolicitudes solicitudes={solicitudes} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListadoSolicitudes;
