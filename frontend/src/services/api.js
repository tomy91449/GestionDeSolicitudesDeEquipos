import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Si el backend rechaza el token (vencido o inválido), cerramos la sesión
// y volvemos al login con un aviso. Solo cuando el pedido llevaba token:
// un login con contraseña incorrecta también responde 401 y no es esto.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const enviabaToken = Boolean(error.config?.headers?.Authorization);

        if (error.response?.status === 401 && enviabaToken) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Recarga completa para que AuthContext arranque sin sesión
            if (window.location.pathname !== '/login') {
                window.location.assign('/login?sesion=vencida');
            }
        }

        return Promise.reject(error);
    }
);

export default api;