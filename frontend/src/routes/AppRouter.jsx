import React, { useContext } from 'react';
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';

import Login from '../pages/Login';
import Registro from '../pages/Registro';
import FormularioSolicitud from '../pages/FormularioSolicitud';
import ListadoSolicitudes from '../pages/ListadoSolicitudes';
import DetalleSolicitud from '../pages/DetalleSolicitud';
import ResumenAdmin from '../pages/ResumenAdmin';
import ListadoEquipos from '../pages/ListadoEquipos';

const AppRouter = () => {
    const { user } = useContext(AuthContext);

    return (
        <BrowserRouter>
            <Navbar />
            <Routes>

                {/* Redirección inicial */}
                <Route
                    path="/"
                    element={<Navigate to="/login" />}
                />

                {/* Rutas públicas */}
                <Route path="/login"    element={<Login />} />
                <Route path="/registro" element={<Registro />} />

                {/* Rutas protegidas — cualquier usuario logueado */}
                <Route
                    path="/equipos"
                    element={
                        <ProtectedRoute user={user}>
                            <ListadoEquipos />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/solicitudes"
                    element={
                        <ProtectedRoute user={user}>
                            <ListadoSolicitudes />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/solicitudes/nueva"
                    element={
                        <ProtectedRoute user={user}>
                            <FormularioSolicitud />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/solicitudes/:id"
                    element={
                        <ProtectedRoute user={user}>
                            <DetalleSolicitud />
                        </ProtectedRoute>
                    }
                />

                {/* Ruta protegida — solo admin */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute user={user} roles={['admin', 'encargado']}>
                            <ResumenAdmin />
                        </ProtectedRoute>
                    }
                />

                {/* 404 */}
                <Route
                    path="*"
                    element={
                        <div style={{ textAlign: 'center', marginTop: '50px' }}>
                            <h2>404 - Página no encontrada</h2>
                        </div>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;