import jsPDF from 'jspdf';

export interface PDFTableData {
  headers: string[];
  rows: (string | number)[][];
}

export interface PDFOptions {
  title?: string;
  subtitle?: string;
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  unit?: 'mm' | 'cm' | 'in' | 'pt';
  format?: 'a4' | 'a3' | 'letter' | 'legal';
}

export class PDFService {
  private doc: jsPDF;

  constructor(options: PDFOptions = {}) {
    this.doc = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: options.unit || 'mm',
      format: options.format || 'a4',
    });
  }

  /**
   * Genera un PDF con una tabla de datos
   */
  generateTablePDF(data: PDFTableData, options: PDFOptions = {}): void {
    const { title, subtitle, filename, orientation } = options;

    // Configurar fuente y colores
    this.doc.setFont('helvetica');
    this.doc.setFontSize(16);
    this.doc.setTextColor(0, 0, 0);

    // Título
    if (title) {
      this.doc.text(title, 20, 20);
    }

    // Subtítulo
    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.text(subtitle, 20, 30);
    }

    // Generar tabla
    this.generateTable(data, title ? 40 : 20, orientation);

    // Guardar PDF
    this.doc.save(filename || 'report.pdf');
  }

  /**
   * Genera una tabla en el PDF
   */
  private generateTable(data: PDFTableData, startY: number, orientation?: 'portrait' | 'landscape'): void {
    const { headers, rows } = data;
    const pageWidth = this.doc.internal.pageSize.getWidth();
    const margin = orientation === 'landscape' ? 10 : 15; // Márgenes más pequeños en horizontal
    const tableWidth = pageWidth - (margin * 2);
    
    // Calcular anchos de columna personalizados basados en el contenido y orientación
    const colWidths = this.calculateColumnWidths(headers, rows, tableWidth);
    
    let currentY = startY;
    const rowHeight = orientation === 'landscape' ? 10 : 12; // Filas más pequeñas en horizontal
    const headerHeight = orientation === 'landscape' ? 12 : 14; // Headers más pequeños en horizontal

    // Estilos para encabezados
    this.doc.setFillColor(240, 240, 240);
    this.doc.setFontSize(orientation === 'landscape' ? 8 : 9); // Fuente más pequeña en horizontal
    this.doc.setFont('helvetica', 'bold');

    // Dibujar encabezados
    let currentX = margin;
    
    // Primero dibujar todos los rectángulos de fondo
    headers.forEach((header, index) => {
      const colWidth = colWidths[index];
      // Dibujar rectángulo de fondo para esta columna específica
      this.doc.rect(currentX, currentY, colWidth, headerHeight, 'F');
      
      // Mover a la siguiente columna
      currentX += colWidth;
    });
    
    // Luego dibujar todo el texto
    currentX = margin;
    headers.forEach((header, index) => {
      const colWidth = colWidths[index];
          // Alinear texto a la izquierda (igual que los datos)
      this.doc.text(header, currentX + 2, currentY + 9);
      
      // Mover a la siguiente columna
      currentX += colWidth;
    });

    currentY += headerHeight;

    // Estilos para filas
    this.doc.setFontSize(orientation === 'landscape' ? 7 : 8); // Fuente más pequeña en horizontal
    this.doc.setFont('helvetica', 'normal');

    // Dibujar filas
    rows.forEach((row, rowIndex) => {
      // Verificar si necesitamos una nueva página
      if (currentY + rowHeight > this.doc.internal.pageSize.getHeight() - 20) {
        this.doc.addPage();
        currentY = 20;
      }
    
      // Verificar que la fila tenga el mismo número de columnas que los headers
      if (row.length !== headers.length) {
        console.warn(`Row ${rowIndex} has ${row.length} columns but headers has ${headers.length}`);
      }
      
      // Reiniciar X para cada fila
      currentX = margin;
      row.forEach((cell, colIndex) => {
        const colWidth = colWidths[colIndex];
        const cellText = String(cell || ''); // Manejar valores null/undefined
        
         // Truncar texto si es muy largo
        const maxWidth = colWidth - 4;
        const truncatedText = this.doc.splitTextToSize(cellText, maxWidth);
        
        // Centrar texto verticalmente
        const textY = currentY + (rowHeight - (truncatedText.length * 3)) / 2 + 3;
        this.doc.text(truncatedText, currentX + 2, textY);
        
        // Mover a la siguiente columna
        currentX += colWidth;
      });

      currentY += rowHeight;
    });
  }

  /**
   * Calcula anchos de columna personalizados
   */
  private calculateColumnWidths(headers: string[], rows: (string | number)[][], totalWidth: number): number[] {
    const numColumns = headers.length;
    
    // Dividir el ancho total entre el número de columnas
    const equalWidth = totalWidth / numColumns;
    return new Array(numColumns).fill(equalWidth);
  }

  /**
   * Genera un PDF simple con texto
   */
  generateTextPDF(content: string[], options: PDFOptions = {}): void {
    const { title, filename } = options;
    
    this.doc.setFont('helvetica');
    this.doc.setFontSize(16);
    this.doc.setTextColor(0, 0, 0);

    // Título
    if (title) {
      this.doc.text(title, 20, 20);
    }

    // Contenido
    this.doc.setFontSize(12);
    let currentY = title ? 35 : 20;

    content.forEach((line) => {
      if (currentY > this.doc.internal.pageSize.getHeight() - 20) {
        this.doc.addPage();
        currentY = 20;
      }
      this.doc.text(line, 20, currentY);
      currentY += 7;
    });

    this.doc.save(filename || 'document.pdf');
  }

  /**
   * Genera un PDF con códigos de barras
   */
  generateBarcodePDF(barcodes: Array<{ name: string; code: string }>, options: PDFOptions = {}): void {
    const { title, filename } = options;
    
    this.doc.setFont('helvetica');
    this.doc.setFontSize(16);
    this.doc.setTextColor(0, 0, 0);

    // Título
    if (title) {
      this.doc.text(title, 20, 20);
    }

    let currentY = title ? 35 : 20;
    const barcodeHeight = 15;
    const barcodeWidth = 40;
    const margin = 20;
    const colsPerRow = 4;
    const colWidth = (this.doc.internal.pageSize.getWidth() - (margin * 2)) / colsPerRow;

    barcodes.forEach((barcode, index) => {
      const row = Math.floor(index / colsPerRow);
      const col = index % colsPerRow;
      const x = margin + (col * colWidth);
      const y = currentY + (row * 25);

      // Verificar si necesitamos una nueva página
      if (y + 25 > this.doc.internal.pageSize.getHeight() - 20) {
        this.doc.addPage();
        currentY = 20;
      }

      // Nombre del producto
      this.doc.setFontSize(8);
      this.doc.text(barcode.name, x + 5, y);

      // Código de barras (simulado con líneas)
      this.doc.setLineWidth(0.5);
      for (let i = 0; i < barcodeWidth; i += 2) {
        const lineHeight = Math.random() * barcodeHeight;
        this.doc.line(x + i, y + 5, x + i, y + 5 + lineHeight);
      }

      // Código numérico
      this.doc.setFontSize(6);
      this.doc.text(barcode.code, x + 5, y + 20);
    });

    this.doc.save(filename || 'barcodes.pdf');
  }
} 