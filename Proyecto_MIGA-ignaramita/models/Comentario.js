const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');
const Documento = require('./Documento');

const Comentario = sequelize.define('Comentario', {
  id_comentario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  comentario: DataTypes.TEXT,
  DOCUMENTO_id_documento: DataTypes.INTEGER,
  fecha: DataTypes.DATE,
  isDeleted: DataTypes.BOOLEAN,
  publicado: DataTypes.BOOLEAN
}, {
  tableName: 'COMENTARIOS',
  timestamps: false
});

// Para la relacion
Comentario.belongsTo(Documento, {
  foreignKey: 'DOCUMENTO_id_documento'
});
Documento.hasMany(Comentario, {
  foreignKey: 'DOCUMENTO_id_documento'
});

module.exports = Comentario;
