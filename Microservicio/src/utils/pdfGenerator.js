const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const moment = require('moment');

class PDFGenerator {
  
  constructor() {
    this.uploadDir = path.join(__dirname, '../Uploads');
    
    this.colors = {
      primary: '#336699',
      secondary: '#666666',
      light: '#f5f5f5',
      border: '#cccccc',
      accent: '#4a86e8',
      lightGrey: '#eeeeee',
      textDark: '#333333'
    };
    
    this.fonts = {
      regular: 'Helvetica',
      bold: 'Helvetica-Bold',
      italic: 'Helvetica-Oblique'
    };
    
    this.fileRetentionTime = 3600000;
    
    this.cleanupInterval = 24 * 60 * 60 * 1000;
    
    this._initializeUploadDirectory();
    this._startCleanupScheduler();
  }

  _initializeUploadDirectory() {
    try {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
    } catch (error) {
      throw new Error(`No se pudo inicializar el directorio de uploads: ${error.message}`);
    }
  }

  async generatePDFReport(documentos, options = {}, filter = {}) {
    try {
      // Campos por defecto si no se especifican
      const fields = options.fields || [
        'id_documento', 'nombre', 'tipo', 'fuente_origen', 
        'anio_publicacion', 'aplicacion', 'vistas'
      ];
      
      const timestamp = new Date().getTime();
      const fileName = `reporte_documentos_${timestamp}.pdf`;
      const filePath = path.join(this.uploadDir, fileName);
      
      const doc = this._createPDFDocument(filePath);
      
      // Aplicar estilos y contenido al documento
      this._applyDocumentStyles(doc);
      this._addHeader(doc);
      this._addFilterInfo(doc, filter, documentos.length);
      
      // Crear tabla de documentos solo si hay resultados
      if (documentos.length > 0) {
        this._createDocumentsTable(doc, documentos, fields);
      } else {
        this._addNoResultsMessage(doc);
        this._addFooter(doc, 1);
      }
      
      doc.end();
      
      return this._createFileInfoPromise(fileName, filePath);
    } catch (error) {
      throw new Error(`No se pudo generar el reporte PDF: ${error.message}`);
    }
  }

  _createPDFDocument(filePath) {
    const doc = new PDFDocument({
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: 'Reporte de Documentos',
        Author: 'Sistema de Gestión Documental',
        CreationDate: new Date(),
        Keywords: 'documentos, reporte, sistema de gestión',
        Producer: 'PDFKit',
        Subject: 'Reporte de Documentos del Sistema'
      },
      autoFirstPage: true,
      bufferPages: true
    });
    
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    
    return doc;
  }

  _applyDocumentStyles(doc) {
    doc.font(this.fonts.regular);
    
    let pageCount = 0;
    doc.on('pageAdded', () => {
      pageCount++;
    });
  }

  _addHeader(doc) {
    try {
      doc.image('./src/assets/miga-24.png', 50, 30, { 
        width: 50, 
        height: 50,
        align: 'left'
      });
      
      doc.fontSize(22)
         .font(this.fonts.bold)
         .fillColor(this.colors.primary)
         .text('Reporte de Documentos', 100, 40, { align: 'center' });
      
      doc.fontSize(10)
         .font(this.fonts.italic)
         .fillColor(this.colors.secondary)
         .text(`Generado: ${moment().format('DD/MM/YYYY HH:mm')}`, { align: 'right' });
      
      const y = doc.y + 10;
      doc.strokeColor(this.colors.accent)
         .lineWidth(1)
         .moveTo(50, y)
         .lineTo(doc.page.width - 50, y)
         .stroke();
      
      doc.moveDown(2);
    } catch (error) {
      doc.moveDown(1);
    }
  }

  _addFilterInfo(doc, filter, totalDocs) {
    doc.rect(50, doc.y, doc.page.width - 100, 70)
       .fillColor(this.colors.light)
       .fill();
    
    const startY = doc.y + 10;
    
    doc.fontSize(14)
       .font(this.fonts.bold)
       .fillColor(this.colors.primary)
       .text('Criterios de filtrado:', 60, startY);
    
    doc.fontSize(10)
       .font(this.fonts.regular)
       .fillColor(this.colors.textDark)
       .text('', 60, startY + 20);
    
    const filterTexts = [];
    if (filter.tipo) filterTexts.push(`Tipo: ${filter.tipo}`);
    if (filter.anio) filterTexts.push(`Año: ${filter.anio}`);
    if (filter.orderBy) {
      const direction = filter.orderDirection === 'ASC' ? 'Ascendente' : 'Descendente';
      filterTexts.push(`Ordenado por: ${filter.orderBy} (${direction})`);
    }
    
    if (filterTexts.length === 0) {
      filterTexts.push('Sin filtros aplicados');
    }
    
    doc.text(filterTexts.join(' | '), { align: 'left' });
    
    doc.moveDown(0.5);
    doc.font(this.fonts.bold)
       .fillColor(this.colors.primary)
       .text(`Total de documentos encontrados: ${totalDocs}`, { align: 'left' });
    
    doc.moveDown(2);
  }

  _addNoResultsMessage(doc) {
    const y = doc.y;
    doc.rect(100, y, doc.page.width - 200, 60)
       .fillColor(this.colors.light)
       .fill()
       .strokeColor(this.colors.border)
       .lineWidth(1)
       .stroke();
    
    doc.fontSize(14)
       .font(this.fonts.italic)
       .fillColor(this.colors.secondary)
       .text('No se encontraron documentos con los criterios especificados.', 
             120, y + 20, { align: 'center' });
  }

  _createDocumentsTable(doc, documentos, fields) {
    const startX = 50;
    let startY = doc.y;
    let currentPage = 1;
    const footerHeight = 40; // Espacio para el footer

    const columnWidth = {
      id_documento: 40,
      nombre: 150,
      tipo: 80,
      fuente_origen: 80,
      descripcion: 100,
      importancia: 60,
      anio_publicacion: 50,
      enlace: 100,
      alcance: 60,
      USUARIO_id_usuario: 40,
      vistas: 40,
      aplicacion: 80,
      cpe: 60,
      jerarquia: 60,
      concepto_basico: 100,
      palabras_clave_procesadas: 100
    };
    
    // ancho total disponible
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    
    // Ajustar anchos de columna según campos seleccionados
    const selectedColumnWidths = this._calculateColumnWidths(fields, columnWidth, pageWidth);
    
    const fieldTitles = {
      id_documento: 'ID',
      nombre: 'Nombre',
      tipo: 'Tipo',
      fuente_origen: 'Fuente',
      descripcion: 'Descripción',
      importancia: 'Importancia',
      anio_publicacion: 'Año',
      enlace: 'Enlace',
      alcance: 'Alcance',
      USUARIO_id_usuario: 'Usuario ID',
      vistas: 'Vistas',
      aplicacion: 'Aplicación',
      cpe: 'CPE',
      jerarquia: 'Jerarquía',
      concepto_basico: 'Concepto',
      palabras_clave_procesadas: 'Palabras clave'
    };
    
    this._drawTableHeader(doc, startX, startY, pageWidth, fields, selectedColumnWidths, fieldTitles);
    startY += 25; // Altura del encabezado
    
    // Dibujar filas de datos con estilos alternados
    documentos.forEach((documento, index) => {
      // Estimar la altura de la fila
      const estimatedRowHeight = this._estimateRowHeight(doc, fields, selectedColumnWidths, documento);
      
      // Verificar espacio para columna y pie de pagina
      if (startY + estimatedRowHeight + footerHeight > doc.page.height - doc.page.margins.bottom) {
        this._addFooter(doc, currentPage);
        
        doc.addPage();
        currentPage++;
        startY = doc.page.margins.top;
        
        // Repetir encabezado en la nueva página
        this._drawTableHeader(doc, startX, startY, pageWidth, fields, selectedColumnWidths, fieldTitles);
        startY += 25;
      }
      
      // Alternar colores de fila
      if (index % 2 === 0) {
        doc.rect(startX, startY, pageWidth, estimatedRowHeight)
           .fillColor(this.colors.light)
           .fillOpacity(0.5)
           .fill()
           .fillOpacity(1);
      }
      const rowHeight = this._drawTableRow(
        doc, startX, startY, fields, selectedColumnWidths, documento
      );
      
      startY += rowHeight;
    });
    
    this._addFooter(doc, currentPage);
  }

  _estimateRowHeight(doc, fields, columnWidths, documento) {
    let rowHeight = 20; // Altura mínima
    
    fields.forEach(field => {
      if (columnWidths[field]) {
        const value = this._formatFieldValue(field, documento[field]);
        const textHeight = doc.heightOfString(value, {
          width: columnWidths[field] - 10,
          align: 'left'
        });
        rowHeight = Math.max(rowHeight, textHeight + 10);
      }
    });
    
    return rowHeight;
  }
  _calculateColumnWidths(fields, columnWidth, pageWidth) {
    const selectedColumnWidths = {};
    let totalWidth = 0;
    
    fields.forEach(field => {
      if (columnWidth[field]) {
        selectedColumnWidths[field] = columnWidth[field];
        totalWidth += columnWidth[field];
      }
    });
    
    if (totalWidth > pageWidth) {
      const scaleFactor = pageWidth / totalWidth;
      Object.keys(selectedColumnWidths).forEach(key => {
        selectedColumnWidths[key] = Math.floor(selectedColumnWidths[key] * scaleFactor);
      });
    }
    
    return selectedColumnWidths;
  }

  _drawTableHeader(doc, startX, startY, width, fields, columnWidths, fieldTitles) {
    doc.rect(startX, startY, width, 25)
       .fillColor(this.colors.primary)
       .fill();
    
    doc.font(this.fonts.bold)
       .fontSize(10)
       .fillColor('#FFFFFF');
    
    let currentX = startX + 5;
    fields.forEach(field => {
      if (columnWidths[field]) {
        doc.text(
          fieldTitles[field] || field, 
          currentX, 
          startY + 8, 
          {
            width: columnWidths[field] - 10,
            height: 15,
            align: 'left'
          }
        );
        currentX += columnWidths[field];
      }
    });
  }

  _drawTableRow(doc, startX, startY, fields, columnWidths, documento) {
    doc.font(this.fonts.regular)
       .fontSize(9)
       .fillColor(this.colors.textDark);
    
    let rowHeight = 20; // Altura mínima
    let currentX = startX + 5;
    
    fields.forEach(field => {
      if (columnWidths[field]) {
        const value = this._formatFieldValue(field, documento[field]);
        
        // Calcular altura necesaria para el texto
        const textHeight = doc.heightOfString(value, {
          width: columnWidths[field] - 10,
          align: 'left'
        });
        
        rowHeight = Math.max(rowHeight, textHeight + 10);
        
        doc.text(value, currentX, startY + 5, {
          width: columnWidths[field] - 10,
          align: 'left'
        });
        
        currentX += columnWidths[field];
      }
    });
    
    // Separación entre filas
    doc.strokeColor(this.colors.lightGrey)
       .lineWidth(0.5)
       .moveTo(startX, startY + rowHeight)
       .lineTo(startX + doc.page.width - 100, startY + rowHeight)
       .stroke();
    
    return rowHeight;
  }

  _formatFieldValue(field, value) {
    if (value === null || value === undefined) return 'N/A';
    
    switch (field) {
      case 'anio_publicacion':
        // Verificar si es una fecha válida y extraer el año
        if (value instanceof Date || !isNaN(new Date(value).getTime())) {
          return new Date(value).getUTCFullYear().toString();
        }
        return value.toString();
      
      case 'enlace':
        // Acortar URLs largas para mejor visualización
        if (typeof value === 'string' && value.length > 30) {
          return value.substring(0, 27) + '...';
        }
        return value.toString();
      
      default:
        if (typeof value === 'boolean') {
          return value ? 'Sí' : 'No';
        }
        return value.toString();
    }
  }
  _addFooter(doc, currentPage) {
    const bottom = doc.page.height - doc.page.margins.bottom;
    
    doc.strokeColor(this.colors.primary)
       .lineWidth(1)
       .opacity(0.7)
       .moveTo(50, bottom - 20)
       .lineTo(doc.page.width - 50, bottom - 20)
       .stroke()
       .opacity(1);
    
    doc.font(this.fonts.italic)
       .fontSize(8)
       .fillColor(this.colors.secondary)
       .text(
         `Sistema de Gestión Documental | Página ${currentPage}`, 
         50, 
         bottom - 15, 
         { align: 'center' }
       );
  }

  _createFileInfoPromise(fileName, filePath) {
    return new Promise((resolve, reject) => {
      const fileStream = fs.createReadStream(filePath);
      
      fileStream.on('error', (error) => {
        reject(new Error(`Error al leer el archivo generado: ${error.message}`));
      });
      
      fileStream.on('open', () => {
        // Programar la eliminación del archivo después del tiempo de retención
        setTimeout(() => {
          this._deleteFile(filePath);
        }, this.fileRetentionTime);
        
        resolve({ 
          fileName, 
          filePath,
          downloadUrl: `/download/${fileName}`,
          expiresIn: 'La descarga estará disponible durante 1 hora'
        });
      });
    });
  }

  _startCleanupScheduler() {
    // Ejecutar una limpieza inicial al iniciar
    this._cleanupOldFiles();
    
    // Programar limpiezas periódicas
    setInterval(() => {
      this._cleanupOldFiles();
    }, this.cleanupInterval);
  }

  _cleanupOldFiles() {
    try {
      const files = fs.readdirSync(this.uploadDir);
      const now = new Date().getTime();
      
      files.forEach(file => {
        if (file.endsWith('.pdf')) {
          const filePath = path.join(this.uploadDir, file);
          const stats = fs.statSync(filePath);
          const fileAge = now - stats.mtimeMs;
          
          // Eliminar archivos con más de 24 horas
          if (fileAge > this.cleanupInterval) {
            this._deleteFile(filePath);
          }
        }
      });
    } catch (error) {
    }
  }

  _deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
    }
  }
}

module.exports = new PDFGenerator();