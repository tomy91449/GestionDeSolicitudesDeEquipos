import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, SignOut } from '@phosphor-icons/react';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

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

    const esGestor = user?.rol === 'admin' || user?.rol === 'encargado';

    const ruta = location.pathname;

    // "Solicitudes" queda activo también en el detalle (/solicitudes/:id),
    // pero no en /solicitudes/nueva, que tiene su propio link
    const links = [
        { to: '/equipos', texto: 'Equipos', activo: ruta === '/equipos' },
        {
            to: '/solicitudes',
            texto: 'Solicitudes',
            activo: ruta.startsWith('/solicitudes') && ruta !== '/solicitudes/nueva'
        },
        { to: '/solicitudes/nueva', texto: 'Nueva solicitud', activo: ruta === '/solicitudes/nueva' },
        ...(esGestor ? [{ to: '/admin', texto: 'Panel admin', activo: ruta === '/admin' }] : [])
    ];

    return (
        <nav className="nav-barra" aria-label="Principal">
            <Link to="/equipos" className="nav-marca">
                <span className="nav-marca-icono" aria-hidden="true">
                    <Package size={18} weight="bold" color="#fff" />
                </span>
                Control de Equipamiento
            </Link>

            <ul className="nav-links">
                {links.map(({ to, texto, activo }) => (
                    <li key={to}>
                        <Link
                            to={to}
                            className="nav-link"
                            aria-current={activo ? 'page' : undefined}
                        >
                            {texto}
                        </Link>
                    </li>
                ))}
            </ul>

            <div className="nav-usuario">
                {user?.nombre && <span className="nav-nombre">{user.nombre}</span>}
                <button type="button" onClick={handleLogout} className="nav-salir">
                    <SignOut size={16} weight="bold" aria-hidden="true" />
                    Cerrar sesión
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
