import React from 'react';
import { Link } from 'react-router-dom';
import { CompassIcon } from '@phosphor-icons/react';

// Página 404 con la misma tarjeta de vidrio que el resto de la app
const NotFound = () => (
    <main style={{
        minHeight: 'calc(100vh - 60px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 16px',
        background: 'var(--bg-gradient)',
        fontFamily: 'var(--font-sans)'
    }}>
        <div style={{
            width: '100%', maxWidth: 420,
            padding: '40px 32px',
            textAlign: 'center',
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border)',
            borderRadius: 24
        }}>
            <div style={{
                width: 56, height: 56, margin: '0 auto 20px',
                borderRadius: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--accent-gradient)',
                boxShadow: '0 8px 24px rgba(79,110,255,.4)'
            }}>
                <CompassIcon size={26} weight="bold" color="#fff" aria-hidden="true" />
            </div>

            <p style={{ margin: '0 0 6px', color: 'var(--text-subtle)', fontSize: 12, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                Error 404
            </p>
            <h1 style={{ margin: '0 0 8px', color: 'var(--text-strong)', fontSize: 22, fontWeight: 700 }}>
                Página no encontrada
            </h1>
            <p style={{ margin: '0 0 28px', color: 'var(--text-muted)', fontSize: 14 }}>
                La dirección no existe o fue movida.
            </p>

            <Link to="/equipos" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minHeight: 44, padding: '10px 22px',
                borderRadius: 12,
                background: 'var(--accent-gradient)',
                color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: '.6px',
                textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(79,110,255,.4)'
            }}>
                Volver al inicio
            </Link>
        </div>
    </main>
);

export default NotFound;
