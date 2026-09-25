const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const SECRET_KEY = "clave_secreta_utn_dds";

const registrarUsuario = async (
    nombre,
    email,
    password,
    rol = 'usuario'
) => {

    const usuario = await Usuario.crear({
        nombre,
        email,
        password,
        rol
    });

    return usuario.toPublic();
};

const loginUsuario = async (
    email,
    password
) => {

    const usuario = await Usuario.findByEmail(email);

    if (!usuario || usuario.activo === 0) {
        throw new Error(
            "Credenciales inválidas o usuario inactivo"
        );
    }

    const passwordValida =
        await usuario.verificarPassword(password);

    if (!passwordValida) {
        throw new Error("Credenciales inválidas");
    }

    const token = jwt.sign(
        {
            id: usuario.id,
            nombre: usuario.nombre,
            rol: usuario.rol
        },
        SECRET_KEY,
        {
            expiresIn: '2h'
        }
    );

    return {
        token,
        usuario: usuario.toPublic()
    };
};

module.exports = {
    registrarUsuario,
    loginUsuario
};