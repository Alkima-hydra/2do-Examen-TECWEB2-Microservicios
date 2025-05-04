const axios = require('axios');
const { REST_API_URL } = require('../config');

class DocumentService {
  async getAllDocuments() {
    try {
      const response = await axios.get(REST_API_URL);
      if (!response.data.ok) {
        throw new Error('Fallo al consumir documentos de REST API');
      }
      return response.data.documentos;
    } catch (error) {
      console.error(`Error al consumir: ${error.message}`);
      throw error;
    }
  }

  async getFilteredDocuments(filter = {}) {
    try {
      let documentos = await this.getAllDocuments();

      if (filter.tipo) {
        documentos = documentos.filter(doc => doc.tipo === filter.tipo);
      }

      if (filter.anio) {
        documentos = documentos.filter(doc => {
          if (!doc.anio_publicacion || isNaN(new Date(doc.anio_publicacion).getTime())) {
            return false;
          }
          return new Date(doc.anio_publicacion).getUTCFullYear() === filter.anio;
        });
      }

      // Ordenar por el campo especificado
      if (filter.orderBy) {
        const orderField = filter.orderBy;
        documentos.sort((a, b) => {
          if (a[orderField] === null || a[orderField] === undefined) return 1;
          if (b[orderField] === null || b[orderField] === undefined) return -1;
          
          // Ordenamiento para campos num[ericos
          if (typeof a[orderField] === 'number') {
            return filter.orderDirection === 'DESC' 
              ? b[orderField] - a[orderField] 
              : a[orderField] - b[orderField];
          }
          
          // Ordenamiento para campos de texto
          return filter.orderDirection === 'DESC'
            ? b[orderField].localeCompare(a[orderField])
            : a[orderField].localeCompare(b[orderField]);
        });
      }

      return documentos;
    } catch (error) {
      console.error(`Error al filtrar documentos: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new DocumentService();