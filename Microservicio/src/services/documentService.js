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

  async getDocumentsByType(tipo) {
    const documentos = await this.getAllDocuments();
    const filtered = documentos.filter(doc => doc.tipo === tipo);
    return filtered;
  }

  async getDocumentsByYear(anio) {
    const documentos = await this.getAllDocuments();
    const filtered = documentos.filter(doc => {
      if (!doc.anio_publicacion || isNaN(new Date(doc.anio_publicacion).getTime())) {
        return false;
      }
      return new Date(doc.anio_publicacion).getUTCFullYear() === anio;
    });
    return filtered;
  }

  async getQueryReport() {
    const documentos = await this.getAllDocuments();
    const report = documentos.map(doc => ({
      ...doc,
      vistas: doc.vistas,
    }));
    return report;
  }
}

module.exports = new DocumentService();