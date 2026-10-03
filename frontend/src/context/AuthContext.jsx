import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

// Se lee de forma síncrona en el estado inicial: si se hiciera en un
// useEffect, ProtectedRoute vería user = null en el primer render y
// mandaría al login al recargar la página (F5).
const leerUsuarioGuardado = () => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) return null;

    try {
        return JSON.parse(storedUser);
    } catch (e) {
        localStorage.removeItem('user');
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(leerUsuarioGuardado);
    const [token, setToken] = useState(localStorage.getItem('token'));

    const login = (tokenData, userData) => {
        localStorage.setItem('token', tokenData);
        localStorage.setItem('user', JSON.stringify(userData));

        setToken(tokenData);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};