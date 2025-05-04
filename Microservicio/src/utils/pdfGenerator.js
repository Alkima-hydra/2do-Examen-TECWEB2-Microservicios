const PDFDocument = require('pdfkit');
const fs = require('fs');
const moment = require('moment');
const documentService = require('../services/documentService');

class PDFGenerator {
  async generatePDFReport(tipo, anio) {
    let documentos = await documentService.getAllDocuments();

    if (tipo) {
      documentos = documentos.filter(doc => doc.tipo === tipo);
    }
    if (anio) {
      documentos = documentos.filter(doc => moment(doc.anio_publicacion).year() === anio);
    }

    // Initialize PDF in landscape mode
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
    const fileName = `reporte_${Date.now()}.pdf`;
    const stream = fs.createWriteStream(fileName);
    doc.pipe(stream);

    // Title
    doc.fontSize(16).text('Reporte de Documentos', { align: 'center' });
    doc.moveDown(2);

    // Table configuration
    const headers = [
      'Nombre',
      'Tipo',
      'Fuente Origen',
      'Año Publicación',
      'Enlace',
      'Alcance',
      'Aplicación',
      'Jerarquía',
      'Vistas'
    ];
    const columnWidths = [80, 50, 60, 100, 50, 60, 80, 50, 80, 60, 50, 50];
    const rowHeight = 20;
    const tableTop = doc.y;
    const tableLeft = 10;

    // Draw table headers
    doc.font('Helvetica-Bold').fontSize(10);
    headers.forEach((header, i) => {
      doc.text(header, tableLeft + (i * columnWidths[i]), tableTop, {
        width: columnWidths[i],
        align: 'left'
      });
    });

    // Draw header underline
    doc.moveTo(tableLeft, tableTop + rowHeight)
       .lineTo(tableLeft + columnWidths.reduce((a, b) => a + b, 0), tableTop + rowHeight)
       .stroke();

    // Draw table rows
    doc.font('Helvetica').fontSize(8);
    documentos.forEach((docData, rowIndex) => {
      const y = tableTop + (rowIndex + 1) * rowHeight;
      const rowData = [
        docData.nombre,
        docData.tipo,
        docData.fuente_origen,
        moment(docData.anio_publicacion).year().toString(),
        docData.enlace,
        docData.alcance,
        docData.aplicacion,
        docData.jerarquia,
        docData.vistas.toString()
      ];

      rowData.forEach((cell, i) => {
        doc.text(cell, tableLeft + (i * columnWidths[i]), y, {
          width: columnWidths[i],
          align: 'left'
        });
      });
    });

    doc.end();
    return fileName;
  }
}

module.exports = new PDFGenerator();