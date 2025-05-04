/*
    Rutas de versionesDocumentos / Documentos
    host + /api/versionesDocumentos
*/

const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { 
    getVersionesDocumento,
    getVersionDocumento,
    restaurarVersion
} = require('../controllers/versionDocumento');

const router = Router();

router.use(validarJWT);

// Obtener todas las versiones de un documento
router.get('/documento/:id', [
    check('id', 'El ID del documento debe ser un número válido').isInt(),
    validarCampos
], getVersionesDocumento);

// Obtener una versi[on especifica
router.get('/documento/:id/version/:versionId', [
    check('id', 'El ID del documento debe ser un número válido').isInt(),
    check('versionId', 'El ID de la versión debe ser un número válido').isInt(),
    validarCampos
], getVersionDocumento);

// Restaurar una version especifica
router.post('/documento/:id/version/:versionId/restaurar', [
    check('id', 'El ID del documento debe ser un número válido').isInt(),
    check('versionId', 'El ID de la versión debe ser un número válido').isInt(),
    validarCampos
], restaurarVersion);

module.exports = router;