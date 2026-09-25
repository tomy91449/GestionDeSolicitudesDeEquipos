import React, { useEffect, useState } from 'react';
import { crearSolicitud } from '../services/solicitudes.service';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const STYLES = `
    @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse   { 0%,100%{opacity:.4} 50%{opacity:.9} }
    @keyframes scanline { 0%{top:-20px} 100%{top:110%} }

    .fs-glass {
        background:rgba(255,255,255,.04);
        backdrop-filter:blur(24px);
        -webkit-backdrop-filter:blur(24px);
        border:1px solid rgba(255,255,255,.1);
        border-radius:20px;
        position:relative;
        overflow:hidden;
    }
    .fs-glass::before {
        content:'';
        position:absolute; top:0; left:40px; right:40px; height:2px;
        background:linear-gradient(90deg, transparent, #4f6eff, #a78bfa, transparent);
        border-radius:0 0 4px 4px;
    }
    .fs-label {
        display:block; font-size:10px; font-weight:700;
        letter-spacing:1.4px; color:rgba(255,255,255,.35);
        margin-bottom:8px; text-transform:uppercase;
    }
    .fs-input {
        width:100%; padding:12px 14px;
        background:rgba(255,255,255,.06);
        border:1px solid rgba(255,255,255,.1);
        border-radius:10px; outline:none;
        color:#fff; font-size:14px;
        transition:all .2s ease; box-sizing:border-box;
        font-family:'Segoe UI', sans-serif;
    }
    .fs-input::placeholder { color:rgba(255,255,255,.2); }
    .fs-input:focus {
        border-color:rgba(99,130,255,.8);
        background:rgba(99,130,255,.08);
        box-shadow:0 0 0 3px rgba(99,130,255,.15);
    }
    .fs-input option { background:#0d1230; color:#fff; }
    .fs-btn {
        width:100%; padding:13px; border:none; border-radius:12px;
        background:linear-gradient(135deg,#4f6eff,#7c3aed);
        color:#fff; font-size:14px; font-weight:700;
        cursor:pointer; letter-spacing:.8px;
        box-shadow:0 4px 20px rgba(79,110,255,.4);
        transition:all .25s ease; margin-top:6px;
    }
    .fs-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 30px rgba(79,110,255,.6); }
    .fs-btn:disabled { opacity:.5; cursor:not-allowed; }
`;

const FormularioSolicitud = () => {
    const navigate = useNavigate();
    const [equipos, setEquipos] = useState([]);
    const [form, setForm] = useState({ equipoId:'', fechaRetiro:'', fechaDevolucion:'', motivo:'' });
    const [loading, setLoading] = useState(false);
    const [loadingEquipos, setLoadingEquipos] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarEquipos = async () => {
            try {
                const res = await api.get('/equipos');
                setEquipos(res.data);
            } catch (err) {
                console.error('Error cargando equipos:', err);
            } finally {
                setLoadingEquipos(false);
            }
        };
        cargarEquipos();
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await crearSolicitud(form);
            localStorage.setItem('refreshSolicitudes', '1');
            navigate('/solicitudes');
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight:'100vh',
            background:'linear-gradient(135deg, #060818 0%, #0d1230 40%, #0a1628 70%, #050d1f 100%)',
            fontFamily:"'Segoe UI', sans-serif",
            display:'flex', alignItems:'center', justifyContent:'center',
            padding:'40px 20px', position:'relative', overflow:'hidden'
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

            {/* Card */}
            <div className="fs-glass" style={{ width:'100%', maxWidth:'520px', padding:'40px 36px', position:'relative', zIndex:10, animation:'slideUp .5s ease both' }}>

                {/* Scanline */}
                <div style={{ position:'absolute', left:0, right:0, height:'2px', background:'linear-gradient(90deg, transparent, rgba(99,130,255,.3), transparent)', animation:'scanline 4s linear infinite', pointerEvents:'none' }} />

                {/* Ícono + título */}
                <div style={{ textAlign:'center', marginBottom:28 }}>
                    <div style={{ width:52, height:52, borderRadius:14, background:'linear-gradient(135deg,#4f6eff,#7c3aed)', display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:14, boxShadow:'0 8px 24px rgba(79,110,255,.4)', fontSize:22 }}>
                        📋
                    </div>
                    <p style={{ color:'#fff', fontSize:19, fontWeight:700, margin:'0 0 4px', letterSpacing:'-.3px' }}>Nueva solicitud</p>
                    <p style={{ color:'rgba(255,255,255,.35)', fontSize:13, margin:0 }}>Completá los datos del pedido</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>

                    {/* Equipo */}
                    <div>
                        <label className="fs-label">Equipo</label>
                        <select name="equipoId" value={form.equipoId} onChange={handleChange} required disabled={loadingEquipos} className="fs-input">
                            <option value="">{loadingEquipos ? 'Cargando equipos...' : 'Seleccionar equipo'}</option>
                            {equipos.map(eq => (
                                <option key={eq.id} value={eq.id}>
                                    {eq.nombre || eq.modelo || `Equipo ${eq.id}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Fechas */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                        <div>
                            <label className="fs-label">Fecha de retiro</label>
                            <input type="date" name="fechaRetiro" value={form.fechaRetiro} onChange={handleChange} required className="fs-input" />
                        </div>
                        <div>
                            <label className="fs-label">Fecha de devolución</label>
                            <input type="date" name="fechaDevolucion" value={form.fechaDevolucion} onChange={handleChange} required className="fs-input" />
                        </div>
                    </div>

                    {/* Motivo */}
                    <div>
                        <label className="fs-label">Motivo</label>
                        <textarea
                            name="motivo" value={form.motivo} onChange={handleChange}
                            placeholder="Explicá para qué necesitás el equipo..."
                            rows={4} required className="fs-input" style={{ resize:'vertical' }}
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{ background:'rgba(220,38,38,.15)', border:'1px solid rgba(220,38,38,.3)', borderRadius:10, padding:'10px 14px', color:'#fca5a5', fontSize:13 }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="fs-btn">
                        {loading ? 'Creando...' : 'CREAR SOLICITUD'}
                    </button>
                </form>

                {/* Badge */}
                <div style={{ textAlign:'center', marginTop:20, fontSize:11, color:'rgba(255,255,255,.18)', borderTop:'1px solid rgba(255,255,255,.06)', paddingTop:14 }}>
                    🛡 Conexión segura · JWT · Cifrado AES-256
                </div>
            </div>
        </div>
    );
};

export default FormularioSolicitud;
