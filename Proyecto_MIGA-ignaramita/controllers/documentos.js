const { response } = require('express');
const Documento = require('../models/Documento');
const VersionDocumento = require('../models/VersionDocumento');
const { validarCampos } = require('../middlewares/validar-campos');

// Obtener todos los documentos activos
const getDocumentos = async (req, res = response) => {
    try {
        const documentos = await Documento.findAll({
            where: { isDeleted: false },
            include: [{ model: require('../models/Usuario'), attributes: ['id_usuario'] }]
        });

        res.json({
            ok: true,
            documentos
        });
    } catch (error) {
        console.error('Error al obtener documentos:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener los documentos'
        });
    }
};

// Obtener un documento por ID
const getDocumento = async (req, res = response) => {
    const { id } = req.params;
    try {
        const documento = await Documento.findOne({
            where: { id_documento: id, isDeleted: false },
            include: [{ model: require('../models/Usuario'), attributes: ['id_usuario'] }]
        });

        if (!documento) {
            return res.status(404).json({
                ok: false,
                msg: 'Documento no encontrado'
            });
        }

        // Incrementar vistas
        await documento.increment('vistas');

        res.json({
            ok: true,
            documento
        });
    } catch (error) {
        console.error('Error al obtener documento:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener el documento'
        });
    }
};

// Crear un nuevo documento
const crearDocumento = async (req, res = response) => {
    const { tipo, fuente_origen, descripcion, importancia, anio_publicacion, enlace, 
            alcance, concepto_basico, aplicacion, cpe, jerarquia, palabras_clave_procesadas } = req.body;
    
    try {
        const usuarioId = req.uid; // Obtenido del JWT

        // Verificar usuario
        const Usuario = require('../models/Usuario');
        const usuario = await Usuario.findByPk(usuarioId);
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario no encontrado'
            });
        }

        // Crear documento
        const documento = await Documento.create({
            nombre,
            tipo,
            fuente_origen,
            descripcion,
            importancia,
            anio_publicacion,
            enlace,
            alcance,
            concepto_basico,
            USUARIO_id_usuario: usuarioId,
            isfavorite: false,
            aplicacion,
            cpe,
            jerarquia,
            isDeleted: false,
            vistas: 0,
            palabras_clave_procesadas
        });

        res.status(201).json({
            ok: true,
            documento
        });
    } catch (error) {
        console.error('Error al crear documento:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al crear el documento'
        });
    }
};

// Actualizar un documento
const actualizarDocumento = async (req, res = response) => {
    const { id } = req.params;
    const { tipo, fuente_origen, descripcion, importancia, anio_publicacion, enlace, 
            alcance, concepto_basico, aplicacion, cpe, jerarquia, palabras_clave_procesadas, isfavorite } = req.body;

    try {
        const documento = await Documento.findOne({
            where: { id_documento: id, isDeleted: false }
        });

        if (!documento) {
            return res.status(404).json({
                ok: false,
                msg: 'Documento no encontrado'
            });
        }

        // Guardar versi[on anterior
        const previousVersionCount = await VersionDocumento.count({
            where: { DOCUMENTO_id_documento: id }
        });

        await VersionDocumento.create({
            nombre: documento.nombre,
            tipo: documento.tipo,
            fuente_origen: documento.fuente_origen,
            descripcion: documento.descripcion,
            importancia: documento.importancia,
            anio_publicacion: documento.anio_publicacion,
            enlace: documento.enlace,
            alcance: documento.alcance,
            concepto_basico: documento.concepto_basico,
            isfavorite: documento.isfavorite,
            aplicacion: documento.aplicacion,
            cpe: documento.cpe,
            jerarquia: documento.jerarquia,
            isVersion: true,
            vistas: documento.vistas,
            DOCUMENTO_id_documento: id,
            USUARIO_id_usuario: req.uid,
            fecha_version: new Date(),
            numero_version: previousVersionCount + 1,
            palabras_clave_procesadas: documento.palabras_clave_procesadas
        });

        // Actualizar campos
        await documento.update({
            nombre,
            tipo,
            fuente_origen,
            descripcion,
            importancia,
            anio_publicacion,
            enlace,
            alcance,
            concepto_basico,
            aplicacion,
            cpe,
            jerarquia,
            palabras_clave_procesadas,
            isfavorite
        });

        res.json({
            ok: true,
            documento
        });
    } catch (error) {
        console.error('Error al actualizar documento:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al actualizar el documento'
        });
    }
};

// Eliminado l{ogico de un documento
const eliminarDocumento = async (req, res = response) => {
    const { id } = req.params;

    try {
        const documento = await Documento.findOne({
            where: { id_documento: id, isDeleted: false }
        });

        if (!documento) {
            return res.status(404).json({
                ok: false,
                msg: 'Documento no encontrado'
            });
        }

        await documento.update({ isDeleted: true });

        res.json({
            ok: true,
            msg: 'Documento eliminado correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar documento:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al eliminar el documento'
        });
    }
};

module.exports = {
    getDocumentos,
    getDocumento,
    crearDocumento,
    actualizarDocumento,
    eliminarDocumento
};