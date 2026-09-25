import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (
        location.pathname === '/login' ||
        location.pathname === '/registro'
    ) {
        return null;
    }

    return (
        <nav
            style={{
                backgroundColor: '#1f2937',
                padding: '15px 30px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}
        >
            <div style={{ display: 'flex', gap: '20px' }}>
                <Link to="/solicitudes" style={{ color: 'white', textDecoration: 'none' }}>
                    Solicitudes
                </Link>
                <Link to="/solicitudes/nueva" style={{ color: 'white', textDecoration: 'none' }}>
                    Nueva Solicitud
                </Link>
                <Link to="/equipos" style={{ color: 'white', textDecoration: 'none' }}>
                    Equipos
                </Link>
                {(user?.rol === 'admin' || user?.rol === 'encargado') && (
                    <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>
                        Panel Admin
                    </Link>
                )}
            </div>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <span style={{ color: 'white' }}>{user?.nombre}</span>
                <button
                    onClick={handleLogout}
                    style={{ cursor: 'pointer' }}
                >
                    Cerrar sesión
                </button>
            </div>
        </nav>
    );
};

export default Navbar;