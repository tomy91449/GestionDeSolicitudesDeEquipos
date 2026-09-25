const { connectDB } = require('../database/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const ROLES_VALIDOS = ['usuario', 'encargado', 'admin'];

class Usuario {
    constructor({ id, nombre, email, passwordHash, rol, activo }) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.passwordHash = passwordHash;
        this.rol = rol;
        this.activo = activo;
    }

    // ─── Validaciones ───────────────────────────────────────────────────────────

    static validar({ nombre, email, password, rol }) {
        const errores = [];

        if (!nombre || nombre.trim().length < 2)
            errores.push("El nombre debe tener al menos 2 caracteres.");

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            errores.push("El email no tiene un formato válido.");

        if (!password || password.length < 6)
            errores.push("La contraseña debe tener al menos 6 caracteres.");

        if (rol && !ROLES_VALIDOS.includes(rol))
            errores.push(`El rol debe ser uno de: ${ROLES_VALIDOS.join(', ')}.`);

        if (errores.length > 0) throw new Error(errores.join(' '));
    }

    // ─── Métodos estáticos (acceso a SQLite) ────────────────────────────────────

    /**
     * Busca un usuario por su email.
     * @param {string} email
     * @returns {Usuario|null}
     */
    static async findByEmail(email) {
        const db = await connectDB();
        const fila = await db.get(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );
        return fila ? new Usuario(fila) : null;
    }

    /**
     * Busca un usuario por su ID.
     * @param {string} id
     * @returns {Usuario|null}
     */
    static async findById(id) {
        const db = await connectDB();
        const fila = await db.get(
            'SELECT * FROM usuarios WHERE id = ?',
            [id]
        );
        return fila ? new Usuario(fila) : null;
    }

    /**
     * Devuelve todos los usuarios (sin passwordHash).
     * @returns {Usuario[]}
     */
    static async findAll() {
        const db = await connectDB();
        const filas = await db.all(
            'SELECT id, nombre, email, rol, activo FROM usuarios'
        );
        return filas.map(f => new Usuario({ ...f, passwordHash: null }));
    }

    /**
     * Crea y guarda un nuevo usuario en la base de datos.
     * @param {object} datos - { nombre, email, password, rol }
     * @returns {Usuario}
     */
    static async crear({ nombre, email, password, rol = 'usuario' }) {
        // 1. Validar campos
        Usuario.validar({ nombre, email, password, rol });

        // 2. Verificar email duplicado
        const existe = await Usuario.findByEmail(email);
        if (existe) throw new Error("El email ya está registrado.");

        // 3. Hashear contraseña y guardar
        const db = await connectDB();
        const id = uuidv4();
        const passwordHash = await bcrypt.hash(password, 10);

        await db.run(
            'INSERT INTO usuarios (id, nombre, email, passwordHash, rol, activo) VALUES (?, ?, ?, ?, ?, ?)',
            [id, nombre, email, passwordHash, rol, 1]
        );

        return new Usuario({ id, nombre, email, passwordHash, rol, activo: 1 });
    }

    /**
     * Desactiva (baja lógica) un usuario por ID.
     * @param {string} id
     */
    static async desactivar(id) {
        const db = await connectDB();
        const resultado = await db.run(
            'UPDATE usuarios SET activo = 0 WHERE id = ?',
            [id]
        );
        if (resultado.changes === 0) throw new Error("Usuario no encontrado.");
    }

    /**
     * Actualiza el rol de un usuario.
     * @param {string} id
     * @param {string} nuevoRol
     */
    static async actualizarRol(id, nuevoRol) {
        if (!ROLES_VALIDOS.includes(nuevoRol))
            throw new Error(`Rol inválido. Debe ser: ${ROLES_VALIDOS.join(', ')}.`);

        const db = await connectDB();
        const resultado = await db.run(
            'UPDATE usuarios SET rol = ? WHERE id = ?',
            [nuevoRol, id]
        );
        if (resultado.changes === 0) throw new Error("Usuario no encontrado.");
    }

    // ─── Métodos de instancia ───────────────────────────────────────────────────

    /**
     * Verifica si la contraseña ingresada es correcta.
     * @param {string} passwordIngresada
     * @returns {boolean}
     */
    async verificarPassword(passwordIngresada) {
        return bcrypt.compare(passwordIngresada, this.passwordHash);
    }

    /**
     * Devuelve el usuario sin datos sensibles (sin passwordHash).
     * @returns {object}
     */
    toPublic() {
        return {
            id: this.id,
            nombre: this.nombre,
            email: this.email,
            rol: this.rol,
            activo: this.activo,
        };
    }

    /**
     * Indica si el usuario tiene un rol con permisos elevados.
     * @returns {boolean}
     */
    esAdmin() {
        return this.rol === 'admin';
    }

    esEncargado() {
        return this.rol === 'encargado';
    }
}

module.exports = Usuario;
