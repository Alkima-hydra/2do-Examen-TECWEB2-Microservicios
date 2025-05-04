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
  Mutation : {
    generarReportePDF: async (_, { filter = {}, fields = null }) => {
      try {
        const documentos = await documentService.getFilteredDocuments(filter);
        
        const options = {
          fields: fields || ['id_documento', 'nombre','tipo','fuente_origen', 'anio_publicacion','aplicacion', 'vistas']
        };
        
        const result = await pdfGenerator.generatePDFReport(documentos, options, filter);
        
        return {
          fileName: result.fileName,
          downloadUrl: result.downloadUrl
        };
      } catch (error) {
        console.error(`Error al generar PDF: ${error.message}`);
        throw new Error(`Error al generar PDF: ${error.message}`);
      }
    },
  }
};