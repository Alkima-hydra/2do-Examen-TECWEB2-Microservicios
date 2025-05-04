// models/Documento.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');
const Usuario = require('./Usuario');

const Documento = sequelize.define('Documento', {
  id_documento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  }, // Nombre del documento
  tipo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  fuente_origen: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  descripcion: DataTypes.TEXT,
  importancia: DataTypes.TEXT,
  anio_publicacion: DataTypes.DATE,
  enlace: DataTypes.STRING(2083),
  alcance: DataTypes.STRING(255),
  concepto_basico: DataTypes.TEXT,
  USUARIO_id_usuario: {
  type: DataTypes.INTEGER,
  allowNull: false,
  references: {
    model: Usuario,
    key: 'id_usuario'
  }
},
  isfavorite: DataTypes.BOOLEAN,
  aplicacion: DataTypes.STRING(255),
  cpe: DataTypes.TEXT,
  jerarquia: DataTypes.STRING(255),
  isDeleted: DataTypes.BOOLEAN,
  vistas: DataTypes.INTEGER,
  palabras_clave_procesadas: DataTypes.TEXT
}, {
  tableName: 'DOCUMENTO',
  timestamps: false
});

Documento.belongsTo(Usuario, {
    foreignKey: 'USUARIO_id_usuario'
  });
  Usuario.hasMany(Documento, {
    foreignKey: 'USUARIO_id_usuario'
  });
  
  module.exports = Documento;