const { response } = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const { generarJWT } = require('../helpers/jwt');

// Obtener todos los usuarios activos
const getUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({ where: { isDeleted: false } });

        res.json({
            ok: true,
            usuarios
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener los usuarios'
        });
    }
};

const crearUsuario = async (req, res) => {
    const { correo, contrasenia, tipo } = req.body;
    try {
      // Verificar si existe el correo
      const existe = await Usuario.findOne({ where: { correo } });
      if (existe) {
        return res.status(400).json({ ok: false, msg: 'El correo ya está registrado' });
      }
  
      // Encriptar contraseña antes de crear el usuario
      const salt = bcrypt.genSaltSync();
      const contraseniaHasheada = bcrypt.hashSync(contrasenia, salt);
  
      const usuario = await Usuario.create({
        correo,
        contrasenia: contraseniaHasheada,
        tipo,
        isDeleted: false
      });
  
      const token = await generarJWT(usuario.id_usuario, usuario.correo);
  
      res.status(201).json({
        ok: true,
        uid: usuario.id_usuario,
        correo: usuario.correo,
        token
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, msg: 'Hable con el administrador' });
    }
  };
  

//Login de usuario
const loginUsuario = async (req, res) => {
    const { correo, contrasenia } = req.body;
    try {
      const usuario = await Usuario.findOne({ where: { correo, isDeleted: false } });
      if (!usuario) {
        return res.status(400).json({ ok: false, msg: 'Usuario no existe' });
      }

      const valid = bcrypt.compareSync(contrasenia, usuario.contrasenia);
      if (!valid) {
        return res.status(400).json({ ok: false, msg: 'Contraseña incorrecta' });
      }

      //Generar el token
      const token = await generarJWT(usuario.id_usuario, usuario.correo);
  
      res.json({
        ok: true,
        uid: usuario.id_usuario,
        correo: usuario.correo,
        token
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, msg: 'Hable con el administrador' });
    }
  };

// Obtener un usuario por ID
const getUsuario = async (req, res) => {
    const { id } = req.params;
    try {
      const usuario = await Usuario.findOne({
        where: { id_usuario: id, isDeleted: false }
      });
      if (!usuario) {
        return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
      }
      res.json({ ok: true, usuario });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, msg: 'Error al obtener usuario' });
    }
  };
  
  // Revalidar token
  const revalidarToken = async (req, res) => {
    const { uid, correo } = req;  // name proviene de tu middleware de validación JWT
    const token = await generarJWT(uid, correo);
    res.json({ ok: true, uid, correo, token });
  };
  
  module.exports = {
    getUsuarios,
    crearUsuario,
    loginUsuario,
    getUsuario,
    revalidarToken
  };