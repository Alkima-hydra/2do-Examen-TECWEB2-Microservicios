const documentService = require('../../services/documentService');
const pdfGenerator = require('../../utils/pdfGenerator');

module.exports = {
  Query: {
    documentos: async () => {
      try {
        const documentos = await documentService.getAllDocuments();
        return documentos;
      } catch (error) {
        throw new Error(`Error al consumir documentos: ${error.message}`);
      }
    },
    documentosPorTipo: async (_, { tipo }) => {
      try {
        const documentos = await documentService.getDocumentsByType(tipo);
        return documentos;
      } catch (error) {
        throw new Error(`Error al consumir documentos por tipo: ${error.message}`);
      }
    },
    documentosPorAnio: async (_, { anio }) => {
      try {
        const documentos = await documentService.getDocumentsByYear(anio);
        return documentos;
      } catch (error) {
        throw new Error(`Error al consumir documentos por fecha: ${error.message}`);
      }
    },
    reporteConsultas: async () => {
      try {
        const documentos = await documentService.getQueryReport();
        return documentos;
      } catch (error) {
        throw new Error(`Error al consumir las consultas de reportes: ${error.message}`);
      }
    },
  },
  Mutation: {
    generarReportePDF: async (_, { tipo, anio }) => {
      try {
        const fileName = await pdfGenerator.generatePDFReport(tipo, anio);
        return fileName;
      } catch (error) {
        throw new Error(`Error al generar pdf: ${error.message}`);
      }
    },
  },
};