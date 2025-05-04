const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');
const Documento = require('./Documento');
const Usuario = require('./Usuario');

const VersionDocumento = sequelize.define('VersionDocumento', {
  id_version: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: DataTypes.STRING(255), // Nombre del documento
  tipo: DataTypes.STRING(255),
  fuente_origen: DataTypes.STRING(255),
  descripcion: DataTypes.TEXT,
  importancia: DataTypes.TEXT,
  anio_publicacion: DataTypes.DATE,
  enlace: DataTypes.STRING(2083),
  alcance: DataTypes.STRING(255),
  concepto_basico: DataTypes.TEXT,
  isfavorite: DataTypes.BOOLEAN,
  aplicacion: DataTypes.STRING(255),
  cpe: DataTypes.TEXT,
  jerarquia: DataTypes.STRING(255),
  isVersion: DataTypes.BOOLEAN,
  vistas: DataTypes.INTEGER,
  DOCUMENTO_id_documento: DataTypes.INTEGER,
  USUARIO_id_usuario: DataTypes.INTEGER,
  fecha_version: DataTypes.DATE,
  numero_version: DataTypes.INTEGER,
  palabras_clave_procesadas: DataTypes.TEXT
}, {
  tableName: 'VERSION_DOCUMENTO',
  timestamps: false
});

// RELACIONES
VersionDocumento.belongsTo(Documento, {
  foreignKey: 'DOCUMENTO_id_documento'
});
Documento.hasMany(VersionDocumento, {
  foreignKey: 'DOCUMENTO_id_documento'
});

VersionDocumento.belongsTo(Usuario, {
  foreignKey: 'USUARIO_id_usuario'
});
Usuario.hasMany(VersionDocumento, {
  foreignKey: 'USUARIO_id_usuario'
});

module.exports = VersionDocumento;
