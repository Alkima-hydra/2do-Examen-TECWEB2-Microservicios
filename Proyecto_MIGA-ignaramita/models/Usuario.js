// models/Usuario.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');

const Usuario = sequelize.define('Usuario', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  tipo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  correo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  contrasenia: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
}, {
  tableName: 'USUARIO',
  timestamps: false
});

module.exports = Usuario;
