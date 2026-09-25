import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, user, roles }) => {

    // Si no hay usuario logueado, mandá al login
    if (!user) {
        return <Navigate to="/login" />;
    }

    // Si se especificaron roles y el usuario no tiene ninguno de ellos
    if (roles && !roles.includes(user.rol)) {
        return <Navigate to="/solicitudes" />;
    }

    return children;
};

export default ProtectedRoute;