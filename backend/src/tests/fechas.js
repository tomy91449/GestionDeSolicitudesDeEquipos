// Fechas relativas a hoy para los tests, en formato AAAA-MM-DD (hora local).
// Así los tests no se rompen solos cuando una fecha fija queda en el pasado.
const fecha = (diasDesdeHoy) => {
    const d = new Date();
    d.setDate(d.getDate() + diasDesdeHoy);
    const dosDigitos = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`;
};

module.exports = { fecha };
