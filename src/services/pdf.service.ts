import jsPDF from 'jspdf';
import { Reception, ReceptionDetail } from '@/types/reception';
import { Sale, SaleDetail } from '@/types/sale';
import { PurchaseOrder, PurchaseOrderDetail } from '@/types/purchase-order';

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
    this.doc.setFillColor(248, 249, 250); // Color gris muy claro
    this.doc.setFontSize(orientation === 'landscape' ? 8 : 9); // Fuente más pequeña en horizontal
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0); // Texto negro

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
    this.doc.setTextColor(0, 0, 0); // Asegurar texto negro

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

  /**
   * Genera un PDF de recepción con sus detalles
   */
  generateReceptionPDF(reception: Reception, details: ReceptionDetail[], options: PDFOptions = {}): void {
    const { filename } = options;

    this.doc.setFont('helvetica');
    this.doc.setFontSize(16);
    this.doc.setTextColor(0, 0, 0);

    let currentY = 20;
    const margin = 20;
    const pageWidth = this.doc.internal.pageSize.getWidth();

    // Título del documento
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('RECEPCIÓN DE MERCADERÍA', pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;

    // Información de la recepción
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');

    // Código y fecha
    this.doc.text(`Código: ${reception.code}`, margin, currentY);
    this.doc.text(`Fecha: ${new Date(reception.date).toLocaleDateString('es-ES')}`, pageWidth - margin - 60, currentY);
    currentY += 10;

    // Proveedor
    this.doc.text(`Proveedor: ${reception.provider.name}`, margin, currentY);
    currentY += 8;
    this.doc.text(`Documento: ${reception.document}`, margin, currentY);
    currentY += 10;

    // Almacén
    this.doc.text(`Almacén: ${reception.warehouse.name}`, margin, currentY);
    currentY += 8;
    this.doc.text(`Dirección: ${reception.warehouse.address}`, margin, currentY);
    currentY += 10;

    // Estado
    this.doc.text(`Estado: ${reception.status ? 'Abierta' : 'Cerrada'}`, margin, currentY);
    currentY += 15;

    // Tabla de productos
    if (details.length > 0) {
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('DETALLES DE PRODUCTOS', margin, currentY);
      currentY += 10;

      // Preparar datos para la tabla
      const headers = ['Producto', 'SKU', 'Marca', 'Categoría', 'Cantidad', 'Precio', 'Subtotal'];
      const rows: (string | number)[][] = [];
      let totalAmount = 0;

      details.forEach((detail) => {
        const quantity = parseFloat(detail.quantity.toString());
        const price = parseFloat(detail.price.toString());
        const subtotal = quantity * price;
        totalAmount += subtotal;

        rows.push([
          detail.product.name,
          detail.product.sku,
          detail.product.brand.description,
          detail.product.category.name,
          quantity.toString(),
          `$${price.toFixed(2)}`,
          `$${subtotal.toFixed(2)}`
        ]);
      });

      // Generar tabla usando el método específico para recepciones
      this.generateReceptionTable(headers, rows, currentY);

      // Agregar total después de la tabla
      currentY = this.doc.internal.pageSize.getHeight() - 40;
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(0, 0, 0); // Asegurar que el texto sea negro
      this.doc.text(`TOTAL: $${totalAmount.toFixed(2)}`, pageWidth - margin - 50, currentY);
    } else {
      this.doc.setFontSize(12);
      this.doc.text('No hay productos registrados en esta recepción.', margin, currentY);
    }

    // Pie de página
    currentY = this.doc.internal.pageSize.getHeight() - 20;
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, margin, currentY);

    this.doc.save(filename || `reception-${reception.code}.pdf`);
  }

  /**
   * Genera una tabla específica para recepciones con mejor formato
   */
  private generateReceptionTable(headers: string[], rows: (string | number)[][], startY: number): void {
    const margin = 20;

    // Anchos de columna personalizados para recepciones
    const colWidths = [60, 30, 30, 30, 25, 30, 35]; // Ajustados para 7 columnas

    let currentY = startY;
    const rowHeight = 12;
    const headerHeight = 14;

    // Estilos para encabezados
    this.doc.setFillColor(240, 240, 240); // Gris claro
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0); // Texto negro

    // Dibujar encabezados
    let currentX = margin;

    // Primero dibujar todos los rectángulos de fondo
    headers.forEach((header, index) => {
      const colWidth = colWidths[index] || 30; // Usar ancho personalizado o default
      this.doc.rect(currentX, currentY, colWidth, headerHeight, 'F');
      currentX += colWidth;
    });

    // Luego dibujar todo el texto
    currentX = margin;
    headers.forEach((header, index) => {
      const colWidth = colWidths[index] || 30;
      this.doc.text(header, currentX + 3, currentY + 10);
      currentX += colWidth;
    });

    currentY += headerHeight;

    // Estilos para filas
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);

    // Dibujar filas
    rows.forEach((row) => {
      // Verificar si necesitamos una nueva página
      if (currentY + rowHeight > this.doc.internal.pageSize.getHeight() - 30) {
        this.doc.addPage();
        currentY = 20;
      }

      currentX = margin;
      row.forEach((cell, colIndex) => {
        const colWidth = colWidths[colIndex] || 30;
        const cellText = String(cell || '');

        // Truncar texto si es muy largo
        const maxWidth = colWidth - 6;
        const truncatedText = this.doc.splitTextToSize(cellText, maxWidth);

        // Centrar texto verticalmente
        const textY = currentY + (rowHeight - (truncatedText.length * 3)) / 2 + 3;
        this.doc.text(truncatedText, currentX + 3, textY);

        currentX += colWidth;
      });

      currentY += rowHeight;
    });
  }

  /**
   * Genera un PDF de venta con sus detalles
   */
  generateSalePDF(sale: Sale, details: SaleDetail[], options: PDFOptions = {}): void {
    const { filename } = options;

    this.doc.setFont('helvetica');
    this.doc.setFontSize(16);
    this.doc.setTextColor(0, 0, 0);

    let currentY = 20;
    const margin = 20;
    const pageWidth = this.doc.internal.pageSize.getWidth();

    // Título del documento
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('NOTA DE VENTA', pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;

    // Información de la venta
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');

    // Código y fecha
    this.doc.text(`Código: ${sale.code}`, margin, currentY);
    this.doc.text(`Fecha: ${new Date(sale.created_at).toLocaleDateString('es-ES')}`, pageWidth - margin - 60, currentY);
    currentY += 10;

    // Cliente
    this.doc.text(`Cliente: ${sale.client.name}`, margin, currentY);
    currentY += 8;
    this.doc.text(`Email: ${sale.client.email}`, margin, currentY);
    currentY += 8;
    this.doc.text(`Teléfono: ${sale.client.phone}`, margin, currentY);
    currentY += 8;
    this.doc.text(`Dirección: ${sale.client.address}`, margin, currentY);
    currentY += 10;

    // Destino
    this.doc.text(`Destino: ${sale.destination}`, margin, currentY);
    currentY += 8;
    this.doc.text(`Estado: ${sale.status ? 'Completada' : 'Pendiente'}`, margin, currentY);
    currentY += 15;

    // Tabla de productos
    if (details.length > 0) {
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('DETALLES DE PRODUCTOS', margin, currentY);
      currentY += 10;

      // Preparar datos para la tabla
      const headers = ['Producto', 'SKU', 'Marca', 'Categoría', 'Cantidad', 'Precio', 'Subtotal'];
      const rows: (string | number)[][] = [];
      let totalAmount = 0;
      details.forEach((detail) => {
        const quantity = Number(detail.quantity);
        const price = Number(detail.price);
        const subtotal = Number(quantity) * Number(price);
        totalAmount += subtotal;
        rows.push([
          detail.product.name,
          detail.product.sku,
          detail.product.brand.description,
          detail.product.category.name,
          quantity.toString(),
          `$${price.toFixed(2)}`,
          `$${subtotal.toFixed(2)}`
        ]);
      });

      // Generar tabla usando el método específico para ventas
      this.generateSaleTable(headers, rows, currentY);

      // Agregar total después de la tabla
      currentY = this.doc.internal.pageSize.getHeight() - 40;
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(0, 0, 0); // Asegurar que el texto sea negro
      this.doc.text(`TOTAL: $${totalAmount.toFixed(2)}`, pageWidth - margin - 50, currentY);
    } else {
      this.doc.setFontSize(12);
      this.doc.text('No hay productos registrados en esta venta.', margin, currentY);
    }

    // Pie de página
    currentY = this.doc.internal.pageSize.getHeight() - 20;
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, margin, currentY);

    this.doc.save(filename || `sale-${sale.code}.pdf`);
  }

  /**
   * Genera una tabla específica para ventas con mejor formato
   */
  private generateSaleTable(headers: string[], rows: (string | number)[][], startY: number): void {
    const margin = 20;

    // Anchos de columna personalizados para ventas
    const colWidths = [60, 30, 30, 30, 25, 30, 35]; // Ajustados para 7 columnas

    let currentY = startY;
    const rowHeight = 12;
    const headerHeight = 14;

    // Estilos para encabezados
    this.doc.setFillColor(240, 240, 240); // Gris claro
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0); // Texto negro

    // Dibujar encabezados
    let currentX = margin;

    // Primero dibujar todos los rectángulos de fondo
    headers.forEach((header, index) => {
      const colWidth = colWidths[index] || 30; // Usar ancho personalizado o default
      this.doc.rect(currentX, currentY, colWidth, headerHeight, 'F');
      currentX += colWidth;
    });

    // Luego dibujar todo el texto
    currentX = margin;
    headers.forEach((header, index) => {
      const colWidth = colWidths[index] || 30;
      this.doc.text(header, currentX + 3, currentY + 10);
      currentX += colWidth;
    });

    currentY += headerHeight;

    // Estilos para filas
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);

    // Dibujar filas
    rows.forEach((row) => {
      // Verificar si necesitamos una nueva página
      if (currentY + rowHeight > this.doc.internal.pageSize.getHeight() - 30) {
        this.doc.addPage();
        currentY = 20;
      }

      currentX = margin;
      row.forEach((cell, colIndex) => {
        const colWidth = colWidths[colIndex] || 30;
        const cellText = String(cell || '');

        // Truncar texto si es muy largo
        const maxWidth = colWidth - 6;
        const truncatedText = this.doc.splitTextToSize(cellText, maxWidth);

        // Centrar texto verticalmente
        const textY = currentY + (rowHeight - (truncatedText.length * 3)) / 2 + 3;
        this.doc.text(truncatedText, currentX + 3, textY);

        currentX += colWidth;
      });

      currentY += rowHeight;
    });
  }

  /**
   * Genera un PDF para una orden de compra
   */
  generatePurchaseOrderPDF(purchaseOrder: PurchaseOrder, details: PurchaseOrderDetail[], options: PDFOptions = {}): void {
    const { filename } = options;
    const margin = 20;
    const pageWidth = this.doc.internal.pageSize.getWidth();
    let currentY = 20;

    // Configurar fuente y colores
    this.doc.setFont('helvetica');
    this.doc.setFontSize(16);
    this.doc.setTextColor(0, 0, 0);

    // Título
    this.doc.text('ORDEN DE COMPRA', pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;

    // Información de la orden
    this.doc.setFontSize(12);
    this.doc.text(`Código: ${purchaseOrder.code}`, margin, currentY);
    currentY += 8;
    this.doc.text(`Fecha: ${new Date(purchaseOrder.date).toLocaleDateString('es-ES')}`, margin, currentY);
    currentY += 8;
    this.doc.text(`Proveedor: ${purchaseOrder.provider.name}`, margin, currentY);
    currentY += 8;
    this.doc.text(`Almacén: ${purchaseOrder.warehouse.name}`, margin, currentY);
    currentY += 8;
    this.doc.text(`Documento: ${purchaseOrder.document}`, margin, currentY);
    currentY += 8;
    this.doc.text(`Fecha de Entrega Esperada: ${new Date(purchaseOrder.expected_delivery_date).toLocaleDateString('es-ES')}`, margin, currentY);
    currentY += 8;
    this.doc.text(`Estado: ${purchaseOrder.status}`, margin, currentY);
    currentY += 15;

    // Tabla de productos
    if (details && details.length > 0) {
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('PRODUCTOS', margin, currentY);
      currentY += 10;

      const headers = ['Producto', 'SKU', 'Marca', 'Categoría', 'Cantidad', 'Precio', 'Subtotal'];
      const rows: (string | number)[][] = [];
      let totalAmount = 0;

      details.forEach((detail) => {
        const subtotal = detail.quantity * detail.price;
        totalAmount += subtotal;
        rows.push([
          detail.product.name,
          detail.product.sku,
          detail.product.brand.name,
          detail.product.category.name,
          detail.quantity.toString(),
          `$${detail.price.toFixed(2)}`,
          `$${subtotal.toFixed(2)}`
        ]);
      });

      // Generar tabla usando el método específico para órdenes de compra
      this.generatePurchaseOrderTable(headers, rows, currentY);

      // Agregar total después de la tabla
      currentY = this.doc.internal.pageSize.getHeight() - 40;
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(`TOTAL: $${totalAmount.toFixed(2)}`, pageWidth - margin - 50, currentY);
    } else {
      this.doc.setFontSize(12);
      this.doc.text('No hay productos registrados en esta orden de compra.', margin, currentY);
    }

    // Pie de página
    currentY = this.doc.internal.pageSize.getHeight() - 20;
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, margin, currentY);

    this.doc.save(filename || `purchase-order-${purchaseOrder.code}.pdf`);
  }

  /**
   * Genera una tabla específica para órdenes de compra con mejor formato
   */
  private generatePurchaseOrderTable(headers: string[], rows: (string | number)[][], startY: number): void {
    const margin = 20;

    // Anchos de columna personalizados para órdenes de compra
    const colWidths = [60, 30, 30, 30, 25, 30, 35]; // Ajustados para 7 columnas

    let currentY = startY;
    const rowHeight = 12;
    const headerHeight = 14;

    // Estilos para encabezados
    this.doc.setFillColor(240, 240, 240); // Gris claro
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);

    // Dibujar encabezados
    let currentX = margin;

    // Primero dibujar todos los rectángulos de fondo
    headers.forEach((header, index) => {
      const colWidth = colWidths[index] || 30;
      this.doc.rect(currentX, currentY, colWidth, headerHeight, 'F');
      currentX += colWidth;
    });

    // Luego dibujar todo el texto
    currentX = margin;
    headers.forEach((header, index) => {
      const colWidth = colWidths[index] || 30;
      this.doc.text(header, currentX + 3, currentY + 10);
      currentX += colWidth;
    });

    currentY += headerHeight;

    // Estilos para filas
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);

    // Dibujar filas
    rows.forEach((row) => {
      // Verificar si necesitamos una nueva página
      if (currentY + rowHeight > this.doc.internal.pageSize.getHeight() - 30) {
        this.doc.addPage();
        currentY = 20;
      }

      currentX = margin;
      row.forEach((cell, colIndex) => {
        const colWidth = colWidths[colIndex] || 30;
        const cellText = String(cell || '');

        // Truncar texto si es muy largo
        const maxWidth = colWidth - 6;
        const truncatedText = this.doc.splitTextToSize(cellText, maxWidth);

        // Centrar texto verticalmente
        const textY = currentY + (rowHeight - (truncatedText.length * 3)) / 2 + 3;
        this.doc.text(truncatedText, currentX + 3, textY);

        currentX += colWidth;
      });

      currentY += rowHeight;
    });
  }
} 