import React, { useEffect, useState } from 'react';
import { listarSolicitudes } from '../services/solicitudes.service';

const STYLES = `
    @keyframes slideUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse    { 0%,100%{opacity:.4} 50%{opacity:.9} }
    @keyframes countUp  { from{opacity:0;transform:scale(.8)} to{opacity:1;transform:scale(1)} }

    .ra-glass {
        background:rgba(255,255,255,.04);
        backdrop-filter:blur(24px);
        -webkit-backdrop-filter:blur(24px);
        border:1px solid rgba(255,255,255,.1);
        border-radius:20px;
        position:relative;
        overflow:hidden;
        transition: transform .2s ease, box-shadow .2s ease;
    }
    .ra-glass::before {
        content:'';
        position:absolute; top:0; left:30px; right:30px; height:2px;
        border-radius:0 0 4px 4px;
    }
    .ra-glass:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 40px rgba(0,0,0,.3);
    }
    .ra-card-total::before    { background:linear-gradient(90deg, transparent, #6b7280, transparent); }
    .ra-card-pendiente::before { background:linear-gradient(90deg, transparent, #f59e0b, transparent); }
    .ra-card-aprobada::before  { background:linear-gradient(90deg, transparent, #10b981, transparent); }
    .ra-card-rechazada::before { background:linear-gradient(90deg, transparent, #ef4444, transparent); }
    .ra-card-devuelta::before  { background:linear-gradient(90deg, transparent, #3b82f6, transparent); }
`;

const tarjetaConfig = [
    { key:'total',     label:'Total',      emoji:'📊', accent:'#818cf8', glow:'rgba(129,140,248,.2)', cls:'ra-card-total'     },
    { key:'pendientes',label:'Pendientes', emoji:'⏳', accent:'#fbbf24', glow:'rgba(251,191,36,.2)',  cls:'ra-card-pendiente' },
    { key:'aprobadas', label:'Aprobadas',  emoji:'✅', accent:'#34d399', glow:'rgba(52,211,153,.2)',  cls:'ra-card-aprobada'  },
    { key:'rechazadas',label:'Rechazadas', emoji:'❌', accent:'#f87171', glow:'rgba(248,113,113,.2)', cls:'ra-card-rechazada' },
    { key:'devueltas', label:'Devueltas',  emoji:'🔄', accent:'#60a5fa', glow:'rgba(96,165,250,.2)',  cls:'ra-card-devuelta'  },
];

const ResumenAdmin = () => {
    const [resumen, setResumen] = useState({ total:0, pendientes:0, aprobadas:0, rechazadas:0, devueltas:0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarResumen = async () => {
            try {
                const solicitudes = await listarSolicitudes();
                setResumen({
                    total:      solicitudes.length,
                    pendientes: solicitudes.filter(s => s.estado === 'pendiente').length,
                    aprobadas:  solicitudes.filter(s => s.estado === 'aprobada').length,
                    rechazadas: solicitudes.filter(s => s.estado === 'rechazada').length,
                    devueltas:  solicitudes.filter(s => s.estado === 'devuelta').length,
                });
            } catch (error) {
                console.error('Error cargando resumen', error);
            } finally {
                setLoading(false);
            }
        };
        cargarResumen();
    }, []);

    if (loading) return (
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
            background:'linear-gradient(135deg, #060818 0%, #0d1230 40%, #0a1628 70%, #050d1f 100%)',
            color:'rgba(255,255,255,.4)', fontFamily:"'Segoe UI', sans-serif", fontSize:14 }}>
            Cargando panel...
        </div>
    );

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
            <div style={{ position:'fixed', width:'400px', height:'400px', top:'-120px', left:'-120px', borderRadius:'50%', background:'rgba(79,110,255,.08)', filter:'blur(90px)', animation:'pulse 4s ease-in-out infinite', pointerEvents:'none' }} />
            <div style={{ position:'fixed', width:'300px', height:'300px', bottom:'-80px', right:'-80px', borderRadius:'50%', background:'rgba(120,80,255,.07)', filter:'blur(70px)', animation:'pulse 5s ease-in-out infinite 1.5s', pointerEvents:'none' }} />

            <div style={{ maxWidth:'1200px', margin:'0 auto', position:'relative', zIndex:10, animation:'slideUp .5s ease both' }}>

                {/* Header */}
                <div style={{ marginBottom:36 }}>
                    <p style={{ color:'rgba(255,255,255,.3)', fontSize:12, letterSpacing:'1.5px', textTransform:'uppercase', margin:'0 0 6px' }}>
                        Sistema de control de equipamiento
                    </p>
                    <h1 style={{ color:'#fff', margin:0, fontSize:26, fontWeight:700, letterSpacing:'-.4px' }}>
                        Panel de administración
                    </h1>
                    <p style={{ color:'rgba(255,255,255,.3)', fontSize:13, margin:'6px 0 0' }}>
                        Resumen de solicitudes del sistema
                    </p>
                </div>

                {/* Tarjetas */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:20, marginBottom:36 }}>
                    {tarjetaConfig.map(({ key, label, emoji, accent, glow, cls }) => (
                        <div key={key} className={`ra-glass ${cls}`} style={{ padding:'28px 24px' }}>
                            {/* Glow de fondo */}
                            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'60%', background:`radial-gradient(ellipse at bottom, ${glow}, transparent)`, pointerEvents:'none' }} />

                            <div style={{ position:'relative', zIndex:1 }}>
                                <div style={{ fontSize:28, marginBottom:12 }}>{emoji}</div>
                                <div style={{ color:'rgba(255,255,255,.4)', fontSize:10, letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:8 }}>
                                    {label}
                                </div>
                                <div style={{ color: accent, fontSize:44, fontWeight:800, lineHeight:1, letterSpacing:'-2px', animation:'countUp .4s ease both' }}>
                                    {resumen[key]}
                                </div>
                                <div style={{ marginTop:12, height:3, borderRadius:2, background:`linear-gradient(90deg, ${accent}, transparent)`, opacity:.6 }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Barra proporcional */}
                {resumen.total > 0 && (
                    <div className="ra-glass" style={{ padding:'24px 28px' }}>
                        <p style={{ color:'rgba(255,255,255,.3)', fontSize:11, letterSpacing:'1.5px', textTransform:'uppercase', margin:'0 0 14px' }}>
                            Distribución por estado
                        </p>
                        <div style={{ display:'flex', height:10, borderRadius:6, overflow:'hidden', gap:2 }}>
                            {[
                                { key:'pendientes', color:'#f59e0b' },
                                { key:'aprobadas',  color:'#10b981' },
                                { key:'rechazadas', color:'#ef4444' },
                                { key:'devueltas',  color:'#3b82f6' },
                            ].map(({ key, color }) => {
                                const pct = resumen.total > 0 ? (resumen[key] / resumen.total) * 100 : 0;
                                return pct > 0 ? (
                                    <div key={key} style={{ flex: pct, background: color, borderRadius:3, transition:'flex .5s ease' }} title={`${key}: ${resumen[key]}`} />
                                ) : null;
                            })}
                        </div>
                        <div style={{ display:'flex', gap:20, marginTop:12, flexWrap:'wrap' }}>
                            {[
                                { key:'pendientes', color:'#f59e0b', label:'Pendientes' },
                                { key:'aprobadas',  color:'#10b981', label:'Aprobadas'  },
                                { key:'rechazadas', color:'#ef4444', label:'Rechazadas' },
                                { key:'devueltas',  color:'#3b82f6', label:'Devueltas'  },
                            ].map(({ key, color, label }) => (
                                <div key={key} style={{ display:'flex', alignItems:'center', gap:6 }}>
                                    <div style={{ width:8, height:8, borderRadius:2, background:color }} />
                                    <span style={{ color:'rgba(255,255,255,.4)', fontSize:12 }}>{label}</span>
                                    <span style={{ color:'rgba(255,255,255,.6)', fontSize:12, fontWeight:600 }}>
                                        {resumen.total > 0 ? Math.round((resumen[key] / resumen.total) * 100) : 0}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumenAdmin;
