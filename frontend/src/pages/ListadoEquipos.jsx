import React, { useEffect, useState } from 'react';
import { obtenerEquipos } from '../services/equipos.service';
import TablaEquipos from '../components/TablaEquipos';
import Filtros from '../components/Filtros';

const STYLES = `
    @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse   { 0%,100%{opacity:.4} 50%{opacity:.9} }

    .le-glass {
        background:rgba(255,255,255,.04);
        backdrop-filter:blur(24px);
        -webkit-backdrop-filter:blur(24px);
        border:1px solid rgba(255,255,255,.1);
        border-radius:20px;
        position:relative;
        overflow:hidden;
    }
    .le-glass::before {
        content:'';
        position:absolute; top:0; left:40px; right:40px; height:2px;
        background:linear-gradient(90deg, transparent, #4f6eff, #a78bfa, transparent);
        border-radius:0 0 4px 4px;
    }
`;

const ListadoEquipos = () => {
    const [equipos, setEquipos] = useState([]);
    const [filtroNombre, setFiltroNombre] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarEquipos = async () => {
            try {
                const data = await obtenerEquipos();

                console.log('DATA COMPLETA:', data);
                console.log('ES ARRAY?:', Array.isArray(data));

                if (Array.isArray(data)) {
                    setEquipos(data);
                } else if (data && Array.isArray(data.data)) {
                    setEquipos(data.data);
                } else if (data && Array.isArray(data.equipos)) {
                    setEquipos(data.equipos);
                } else {
                    console.warn("La API no devolvió un formato de array conocido:", data);
                }
            } catch (error) {
                console.error('Error cargando equipos:', error);
            } finally {
                setLoading(false);
            }
        };
        cargarEquipos();
    }, []);

    const equiposFiltrados = equipos.filter((equipo) => {
        const nombreEquipo = equipo.nombre ? equipo.nombre.toLowerCase() : '';
        const coincideNombre = nombreEquipo.includes(filtroNombre.toLowerCase());
        const coincideCategoria = filtroCategoria === '' || equipo.categoria === filtroCategoria;
        return coincideNombre && coincideCategoria;
    });

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
                <div style={{ marginBottom:28 }}>
                    <p style={{ color:'rgba(255,255,255,.3)', fontSize:12, letterSpacing:'1.5px', textTransform:'uppercase', margin:'0 0 6px' }}>
                        Sistema de control de equipamiento
                    </p>
                    <h1 style={{ color:'#fff', margin:0, fontSize:24, fontWeight:700, letterSpacing:'-.4px' }}>
                        Catálogo de equipos
                    </h1>
                </div>

                {/* Card con filtros + tabla */}
                <div className="le-glass" style={{ padding:'28px 32px' }}>

                    {/* Filtros */}
                    <div style={{ marginBottom:24 }}>
                        <Filtros
                            filtroNombre={filtroNombre}
                            setFiltroNombre={setFiltroNombre}
                            filtroCategoria={filtroCategoria}
                            setFiltroCategoria={setFiltroCategoria}
                        />
                    </div>

                    <div style={{ height:1, background:'rgba(255,255,255,.07)', marginBottom:24 }} />

                    {/* Conteo */}
                    <div style={{ marginBottom:16, display:'flex', alignItems:'center', gap:10 }}>
                        <span style={{ color:'rgba(255,255,255,.3)', fontSize:12, letterSpacing:'1px', textTransform:'uppercase' }}>
                            Mostrando
                        </span>
                        <span style={{ background:'rgba(79,110,255,.2)', border:'1px solid rgba(79,110,255,.3)', color:'#818cf8', borderRadius:20, padding:'2px 10px', fontSize:12, fontWeight:700 }}>
                            {loading ? '...' : equiposFiltrados.length}
                        </span>
                        <span style={{ color:'rgba(255,255,255,.3)', fontSize:12 }}>equipos</span>
                    </div>

                    {loading ? (
                        <p style={{ color:'rgba(255,255,255,.3)', fontSize:13, textAlign:'center', padding:'40px 0' }}>Cargando equipos...</p>
                    ) : (
                        <TablaEquipos equipos={equiposFiltrados} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListadoEquipos;
