/*
    Rutas de Usuarios / Usuarios
    host + /api/usuarios
*/

const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { crearUsuario, loginUsuario, revalidarToken, getUsuario, getUsuarios } = require('../controllers/usuarios');
const { validarJWT } = require('../middlewares/validar-jwt');

const router = Router();

router.post(
    '/new',
    [
        check('correo', 'El correo es obligatorio').isEmail(),
        check('contrasenia', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
        check('tipo', 'El tipo es obligatorio').not().isEmpty(),
        validarCampos
    ],
    crearUsuario
);

router.post(
    '/',
    [//middlewares
        check('correo', 'El correo es obligatorio').isEmail(),
        check('contrasenia', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
        validarCampos
    ],
    loginUsuario
);

//Revalidar token
router.get('/renew',validarJWT, revalidarToken);


// Obtener usuario por ID (requiere token)
router.get('/:id', validarJWT, getUsuario);

// Obtener todos los usuarios (requiere token)
router.get('/', validarJWT, getUsuarios);


module.exports = router;