const { response } = require('express');
const VersionDocumento = require('../models/VersionDocumento');

// Obtener todas las versiones de un documento
const getVersionesDocumento = async (req, res = response) => {
    const { id } = req.params;
    try {
        const versiones = await VersionDocumento.findAll({
            where: { DOCUMENTO_id_documento: id },
            include: [
                { model: require('../models/Usuario'), attributes: ['id_usuario'] },
                { model: require('../models/Documento'), attributes: ['id_documento'] }
            ],
            order: [['numero_version', 'DESC']]
        });

        res.json({
            ok: true,
            versiones
        });
    } catch (error) {
        console.error('Error al obtener versiones:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener las versiones'
        });
    }
};

// Obtener una versión específica
const getVersionDocumento = async (req, res = response) => {
    const { id, versionId } = req.params;
    try {
        const version = await VersionDocumento.findOne({
            where: { 
                id_version: versionId, 
                DOCUMENTO_id_documento: id 
            },
            include: [
                { model: require('../models/Usuario'), attributes: ['id_usuario'] },
                { model: require('../models/Documento'), attributes: ['id_documento'] }
            ]
        });

        if (!version) {
            return res.status(404).json({
                ok: false,
                msg: 'Versión no encontrada'
            });
        }

        res.json({
            ok: true,
            version
        });
    } catch (error) {
        console.error('Error al obtener versión:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener la versión'
        });
    }
};

// Restaurar una versión específica
const restaurarVersion = async (req, res = response) => {
    const { id, versionId } = req.params;

    try {
        const version = await VersionDocumento.findOne({
            where: { 
                id_version: versionId, 
                DOCUMENTO_id_documento: id 
            }
        });

        if (!version) {
            return res.status(404).json({
                ok: false,
                msg: 'Versión no encontrada'
            });
        }

        const documento = await require('../models/Documento').findOne({
            where: { 
                id_documento: id, 
                isDeleted: false 
            }
        });

        if (!documento) {
            return res.status(404).json({
                ok: false,
                msg: 'Documento no encontrado'
            });
        }

        // Actualizar documento con los datos de la versión
        await documento.update({
            nombre: version.nombre,
            tipo: version.tipo,
            fuente_origen: version.fuente_origen,
            descripcion: version.descripcion,
            importancia: version.importancia,
            anio_publicacion: version.anio_publicacion,
            enlace: version.enlace,
            alcance: version.alcance,
            concepto_basico: version.concepto_basico,
            isfavorite: version.isfavorite,
            aplicacion: version.aplicacion,
            cpe: version.cpe,
            jerarquia: version.jerarquia,
            palabras_clave_procesadas: version.palabras_clave_procesadas
        });

        // Guardar nueva versión con el estado actual antes de restaurar
        const previousVersionCount = await VersionDocumento.count({
            where: { DOCUMENTO_id_documento: id }
        });

        await VersionDocumento.create({
            nombre: version.nombre,
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

        res.json({
            ok: true,
            documento
        });
    } catch (error) {
        console.error('Error al restaurar versión:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al restaurar la versión.'
        });
    }
};

module.exports = {
    getVersionesDocumento,
    getVersionDocumento,
    restaurarVersion
};