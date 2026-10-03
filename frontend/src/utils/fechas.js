// Fecha local de hoy en formato AAAA-MM-DD (toISOString usaría UTC)
export const hoyLocal = () => {
    const d = new Date();
    const dosDigitos = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`;
};
