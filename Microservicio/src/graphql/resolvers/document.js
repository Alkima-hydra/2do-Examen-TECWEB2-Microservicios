const documentService = require('../../services/documentService');
const pdfGenerator = require('../../utils/pdfGenerator');

module.exports = {
  Query: {
    documentos: async (_, { filter = {} }) => {
      try {
        const documentos = await documentService.getFilteredDocuments(filter);
        return documentos;
      } catch (error) {
        throw new Error(`Error al consultar documentos: ${error.message}`);
      }
    },
  },
  Mutation: {
    generarReportePDF: async (_, { filter = {} }) => {
      try {
        // Filtramos documentos
        const documentos = await documentService.getFilteredDocuments(filter);
        
        const fileName = await pdfGenerator.generatePDFReport(documentos);
        return fileName;
      } catch (error) {
        throw new Error(`Error al generar PDF: ${error.message}`);
      }
    },
  },
};