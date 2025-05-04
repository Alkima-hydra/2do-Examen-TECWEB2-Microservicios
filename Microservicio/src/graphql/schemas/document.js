const { gql } = require('apollo-server');

const documentSchema = gql`
  type User {
    id_usuario: Int
    tipo: String
    correo: String
    isDeleted: Boolean
  }

  type Document {
    id_documento: Int
    nombre: String
    tipo: String
    fuente_origen: String
    descripcion: String
    importancia: String
    anio_publicacion: String
    enlace: String
    alcance: String
    concepto_basico: String
    USUARIO_id_usuario: Int
    isfavorite: Boolean
    aplicacion: String
    cpe: String
    jerarquia: String
    isDeleted: Boolean
    vistas: Int
    palabras_clave_procesadas: String
    usuario: User
  }

  input DocumentFilter {
    tipo: String
    anio: Int
    orderBy: String
    orderDirection: String
  }
  type Query {
    documentos(filter: DocumentFilter): [Document]
  }
  type Mutation {
    generarReportePDF(filter: DocumentFilter): String
  }
`;

module.exports = documentSchema;