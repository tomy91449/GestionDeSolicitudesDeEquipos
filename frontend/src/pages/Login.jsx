import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!email.includes('@')) { setError('El email no es válido'); return; }
        if (!password.trim()) { setError('La contraseña es obligatoria'); return; }
        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data.token, response.data.usuario);
            navigate('/equipos');
        } catch (err) {
            setError(err.response?.data?.error || 'Error al iniciar sesión');
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontFamily: "'Segoe UI', sans-serif",
            background: 'linear-gradient(135deg, #060818 0%, #0d1230 40%, #0a1628 70%, #050d1f 100%)',
            position: 'relative', overflow: 'hidden'
        }}>
            <style>{`
                @keyframes float1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
                @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
                @keyframes float3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-22px)} }
                @keyframes pulse  { 0%,100%{opacity:.4} 50%{opacity:.9} }
                @keyframes drift  { 0%{transform:translate(0,0)} 25%{transform:translate(12px,-8px)} 50%{transform:translate(-6px,14px)} 75%{transform:translate(-14px,-4px)} 100%{transform:translate(0,0)} }
                @keyframes scanline { 0%{top:-20px} 100%{top:110%} }
                @keyframes glow { 0%,100%{box-shadow:0 25px 50px rgba(0,0,0,.5),0 0 20px rgba(99,130,255,.2)} 50%{box-shadow:0 25px 50px rgba(0,0,0,.5),0 0 40px rgba(99,130,255,.4)} }
                @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
                @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
                .glass-input-login { width:100%;padding:12px 16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;outline:none;color:#fff;font-size:14px;transition:all .25s ease;box-sizing:border-box; }
                .glass-input-login::placeholder { color:rgba(255,255,255,.25); }
                .glass-input-login:focus { border-color:rgba(99,130,255,.8);background:rgba(99,130,255,.08);box-shadow:0 0 0 3px rgba(99,130,255,.15); }
                .btn-login-main { width:100%;padding:13px;background:linear-gradient(135deg,#4f6eff,#7c3aed);border:none;border-radius:12px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;letter-spacing:.8px;box-shadow:0 4px 20px rgba(79,110,255,.4);transition:all .25s ease;margin-top:8px; }
                .btn-login-main:hover { transform:translateY(-2px);box-shadow:0 8px 30px rgba(79,110,255,.6); }
                .cursor-blink { display:inline-block;width:2px;height:16px;background:#4f6eff;animation:blink 1s step-end infinite;vertical-align:middle;margin-left:2px; }
            `}</style>

            {/* Grid de fondo */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(rgba(79,110,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(79,110,255,.06) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)'
            }} />

            {/* Orbes */}
            <div style={{ position:'absolute', width:'300px', height:'300px', top:'-80px', left:'-80px', borderRadius:'50%', background:'rgba(79,110,255,.12)', filter:'blur(60px)', animation:'pulse 4s ease-in-out infinite', pointerEvents:'none' }} />
            <div style={{ position:'absolute', width:'250px', height:'250px', bottom:'-60px', right:'-60px', borderRadius:'50%', background:'rgba(120,80,255,.1)', filter:'blur(60px)', animation:'pulse 5s ease-in-out infinite 1.5s', pointerEvents:'none' }} />

            {/* Laptop izquierda */}
            <svg style={{ position:'absolute', top:'8%', left:'3%', animation:'float1 6s ease-in-out infinite', opacity:.22, pointerEvents:'none' }} width="160" height="110" viewBox="0 0 160 110">
                <rect x="10" y="5" width="140" height="90" rx="6" fill="none" stroke="#4f6eff" strokeWidth="1.5"/>
                <rect x="16" y="11" width="128" height="78" rx="3" fill="rgba(79,110,255,.08)" stroke="#4f6eff" strokeWidth=".5"/>
                <line x1="0" y1="100" x2="160" y2="100" stroke="#4f6eff" strokeWidth="1.5"/>
                <rect x="55" y="100" width="50" height="6" rx="3" fill="rgba(79,110,255,.3)"/>
                <rect x="25" y="22" width="60" height="3" rx="1" fill="rgba(99,130,255,.5)"/>
                <rect x="25" y="30" width="90" height="2" rx="1" fill="rgba(99,130,255,.25)"/>
                <rect x="25" y="36" width="75" height="2" rx="1" fill="rgba(99,130,255,.25)"/>
                <rect x="25" y="50" width="40" height="20" rx="3" fill="rgba(79,110,255,.15)" stroke="rgba(99,130,255,.3)" strokeWidth=".5"/>
                <rect x="75" y="50" width="55" height="8" rx="2" fill="rgba(99,130,255,.12)"/>
                <rect x="75" y="62" width="40" height="8" rx="2" fill="rgba(99,130,255,.12)"/>
            </svg>

            {/* Monitor derecha */}
            <svg style={{ position:'absolute', top:'5%', right:'3%', animation:'float3 8s ease-in-out infinite', opacity:.18, pointerEvents:'none' }} width="180" height="130" viewBox="0 0 180 130">
                <rect x="5" y="5" width="170" height="100" rx="6" fill="none" stroke="#7c3aed" strokeWidth="1.5"/>
                <rect x="11" y="11" width="158" height="88" rx="3" fill="rgba(124,58,237,.08)" stroke="#7c3aed" strokeWidth=".5"/>
                <rect x="75" y="108" width="30" height="12" rx="2" fill="rgba(124,58,237,.3)"/>
                <line x1="30" y1="120" x2="150" y2="120" stroke="#7c3aed" strokeWidth="1.5"/>
                <rect x="25" y="60" width="12" height="30" rx="2" fill="rgba(124,58,237,.5)"/>
                <rect x="42" y="45" width="12" height="45" rx="2" fill="rgba(124,58,237,.6)"/>
                <rect x="59" y="55" width="12" height="35" rx="2" fill="rgba(124,58,237,.45)"/>
                <rect x="76" y="35" width="12" height="55" rx="2" fill="rgba(124,58,237,.7)"/>
                <rect x="93" y="50" width="12" height="40" rx="2" fill="rgba(124,58,237,.5)"/>
                <line x1="20" y1="92" x2="160" y2="92" stroke="rgba(124,58,237,.3)" strokeWidth=".5"/>
            </svg>

            {/* Tablet abajo izquierda */}
            <svg style={{ position:'absolute', bottom:'10%', left:'5%', animation:'float2 7s ease-in-out infinite', opacity:.18, pointerEvents:'none' }} width="90" height="128" viewBox="0 0 100 140">
                <rect x="5" y="5" width="90" height="130" rx="10" fill="none" stroke="#06b6d4" strokeWidth="1.5"/>
                <rect x="11" y="14" width="78" height="105" rx="4" fill="rgba(6,182,212,.06)" stroke="#06b6d4" strokeWidth=".5"/>
                <circle cx="50" cy="127" r="5" fill="none" stroke="#06b6d4" strokeWidth="1"/>
                <rect x="20" y="24" width="60" height="35" rx="3" fill="rgba(6,182,212,.1)"/>
                <rect x="20" y="66" width="27" height="4" rx="1" fill="rgba(6,182,212,.4)"/>
                <rect x="20" y="74" width="60" height="2" rx="1" fill="rgba(6,182,212,.2)"/>
                <rect x="20" y="80" width="50" height="2" rx="1" fill="rgba(6,182,212,.2)"/>
                <rect x="20" y="90" width="30" height="12" rx="6" fill="rgba(6,182,212,.3)"/>
            </svg>

            {/* Teléfono abajo derecha */}
            <svg style={{ position:'absolute', bottom:'8%', right:'5%', animation:'float1 5s ease-in-out infinite 1s', opacity:.2, pointerEvents:'none' }} width="65" height="112" viewBox="0 0 70 120">
                <rect x="5" y="5" width="60" height="110" rx="12" fill="none" stroke="#a78bfa" strokeWidth="1.5"/>
                <rect x="10" y="14" width="50" height="84" rx="4" fill="rgba(167,139,250,.06)" stroke="#a78bfa" strokeWidth=".5"/>
                <circle cx="35" cy="106" r="4" fill="none" stroke="#a78bfa" strokeWidth="1"/>
                <rect x="28" y="7" width="14" height="3" rx="1.5" fill="rgba(167,139,250,.4)"/>
                <rect x="14" y="22" width="16" height="16" rx="4" fill="rgba(167,139,250,.25)"/>
                <rect x="34" y="22" width="16" height="16" rx="4" fill="rgba(167,139,250,.2)"/>
                <rect x="14" y="43" width="16" height="16" rx="4" fill="rgba(167,139,250,.15)"/>
                <rect x="34" y="43" width="16" height="16" rx="4" fill="rgba(167,139,250,.3)"/>
            </svg>

            {/* Partículas */}
            {[
                {w:3,t:'20%',l:'15%',d:'0s',dur:'9s'},
                {w:2,t:'60%',l:'25%',d:'2s',dur:'7s'},
                {w:4,t:'35%',r:'20%',d:'4s',dur:'11s'},
                {w:2,t:'75%',r:'30%',d:'1s',dur:'8s'},
                {w:3,t:'10%',r:'40%',d:'3s',dur:'10s'},
            ].map((p,i) => (
                <div key={i} style={{
                    position:'absolute', width:`${p.w}px`, height:`${p.w}px`,
                    borderRadius:'50%', background:'rgba(99,130,255,.6)',
                    top:p.t, left:p.l, right:p.r,
                    animation:`drift ${p.dur} ease-in-out infinite ${p.d}`
                }} />
            ))}

            {/* Card glassmorphism */}
            <div style={{
                position: 'relative', zIndex: 10,
                background: 'rgba(255,255,255,.04)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: '24px',
                padding: '44px 40px',
                width: '360px',
                animation: 'slideUp .6s ease both, glow 3s ease-in-out infinite 1s'
            }}>

                {/* Línea top degradada */}
                <div style={{
                    position:'absolute', top:0, left:'50px', right:'50px', height:'2px',
                    background:'linear-gradient(90deg, transparent, #4f6eff, #a78bfa, transparent)',
                    borderRadius:'0 0 4px 4px'
                }} />

                {/* Scanline animada */}
                <div style={{
                    position:'absolute', left:0, right:0, height:'2px',
                    background:'linear-gradient(90deg, transparent, rgba(99,130,255,.35), transparent)',
                    animation:'scanline 4s linear infinite',
                    pointerEvents:'none', borderRadius:'24px'
                }} />

                {/* Ícono */}
                <div style={{
                    width:'56px', height:'56px', borderRadius:'16px',
                    background:'linear-gradient(135deg,#4f6eff,#7c3aed)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    margin:'0 auto 20px',
                    boxShadow:'0 8px 24px rgba(79,110,255,.4)',
                    fontSize:'24px'
                }}>🔐</div>

                <p style={{ color:'#fff', fontSize:'20px', fontWeight:'700', textAlign:'center', margin:'0 0 4px', letterSpacing:'-.3px' }}>
                    Bienvenido<span className="cursor-blink" />
                </p>
                <p style={{ color:'rgba(255,255,255,.4)', fontSize:'13px', textAlign:'center', margin:'0 0 28px' }}>
                    Sistema de control de equipamiento
                </p>

                {error && (
                    <div style={{
                        background:'rgba(220,38,38,.15)', border:'1px solid rgba(220,38,38,.3)',
                        borderRadius:'10px', padding:'10px 14px',
                        color:'#fca5a5', fontSize:'13px', marginBottom:'16px'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom:'16px' }}>
                        <label style={{ display:'block', fontSize:'11px', fontWeight:'600', letterSpacing:'1.2px', color:'rgba(255,255,255,.4)', marginBottom:'8px' }}>
                            EMAIL
                        </label>
                        <input
                            type="email" value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="usuario@institución.edu"
                            required className="glass-input-login"
                        />
                    </div>

                    <div style={{ marginBottom:'8px' }}>
                        <label style={{ display:'block', fontSize:'11px', fontWeight:'600', letterSpacing:'1.2px', color:'rgba(255,255,255,.4)', marginBottom:'8px' }}>
                            CONTRASEÑA
                        </label>
                        <input
                            type="password" value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required className="glass-input-login"
                        />
                    </div>

                    <button type="submit" className="btn-login-main">
                        INGRESAR AL SISTEMA
                    </button>
                </form>

                <p style={{ textAlign:'center', marginTop:'20px', fontSize:'13px', color:'rgba(255,255,255,.35)' }}>
                    ¿No tenés cuenta?{' '}
                    <Link to="/registro" style={{ color:'#818cf8', fontWeight:'600', textDecoration:'none' }}>
                        Registrate acá
                    </Link>
                </p>

                {/* Badge seguridad */}
                <div style={{
                    textAlign:'center', marginTop:'24px',
                    fontSize:'11px', color:'rgba(255,255,255,.2)',
                    borderTop:'1px solid rgba(255,255,255,.06)', paddingTop:'16px'
                }}>
                    🛡 Conexión segura · JWT · Cifrado AES-256
                </div>
            </div>
        </div>
    );
};

export default Login;