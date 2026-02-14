import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Reception, ReceptionDetail } from '@/types/reception';

interface PDFTranslations {
  title: string;
  code: string;
  date: string;
  provider: string;
  warehouse: string;
  document: string;
  status: string;
  product: string;
  sku: string;
  brand: string;
  category: string;
  quantity: string;
  price: string;
  subtotal: string;
  total: string;
  footer: string;
  statusOpen: string;
  statusClosed: string;
  page: string;
  locale?: string;
}

export class ReceptionPDFService {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private currentY: number = 20;
  private locale: string = 'es';

  constructor(locale?: string) {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.locale = locale || 'es';
  }

  private formatCurrency(value: number): string {
    const localeMap: Record<string, string> = {
      'es': 'es-PE',
      'en': 'en-US'
    };
    return new Intl.NumberFormat(localeMap[this.locale] || 'es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(value);
  }

  private formatDate(date: string): string {
    const localeMap: Record<string, string> = {
      'es': 'es-PE',
      'en': 'en-US'
    };
    return new Date(date).toLocaleDateString(localeMap[this.locale] || 'es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private addHeader(reception: Reception, translations: PDFTranslations) {
    // Título usando traducción
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(translations.title.toUpperCase(), this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.currentY += 12;

    // Información de la recepción en formato compacto
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    
    // Código y fecha en la misma línea
    const leftColumn = this.margin;
    const rightColumn = this.pageWidth / 2 + 10;

    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${translations.code}:`, leftColumn, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(reception.code, leftColumn + 20, this.currentY);

    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${translations.date}:`, rightColumn, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.formatDate(reception.date), rightColumn + 20, this.currentY);

    this.currentY += 6;

    // Documento y estado
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${translations.document}:`, leftColumn, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(reception.document, leftColumn + 20, this.currentY);

    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${translations.status}:`, rightColumn, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    const statusText = reception.status ? translations.statusOpen : translations.statusClosed;
    this.doc.text(statusText.toUpperCase(), rightColumn + 20, this.currentY);

    this.currentY += 12;
  }

  private addProviderInfo(reception: Reception, translations: PDFTranslations) {
    // Sección de proveedor
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(this.margin, this.currentY - 4, this.pageWidth - 2 * this.margin, 20, 'F');

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${translations.provider}:`, this.margin + 5, this.currentY);
    
    this.currentY += 6;
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(reception.provider.name, this.margin + 5, this.currentY);
    
    this.currentY += 5;
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    if (reception.provider.phone) {
      this.doc.text(`Tel: ${reception.provider.phone}`, this.margin + 5, this.currentY);
    }
    this.doc.setTextColor(0, 0, 0);

    this.currentY += 12;
  }

  private addWarehouseInfo(reception: Reception, translations: PDFTranslations) {
    // Sección de almacén
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(this.margin, this.currentY - 4, this.pageWidth - 2 * this.margin, 20, 'F');

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${translations.warehouse}:`, this.margin + 5, this.currentY);
    
    this.currentY += 6;
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(reception.warehouse.name, this.margin + 5, this.currentY);
    
    this.currentY += 5;
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(`Código: ${reception.warehouse.code}`, this.margin + 5, this.currentY);
    this.doc.setTextColor(0, 0, 0);

    this.currentY += 12;
  }

  private addProductsTable(details: ReceptionDetail[], translations: PDFTranslations) {
    const tableData = details.map(detail => {
      // Truncar nombre del producto si es muy largo
      const productName = detail.product.name.length > 35 
        ? detail.product.name.substring(0, 32) + '...'
        : detail.product.name;

      const quantity = Number(detail.quantity);
      const price = Number(detail.price);
      const subtotal = quantity * price;

      return [
        productName,
        detail.product.sku,
        detail.product.brand.description,
        detail.product.category.name,
        `${quantity} ${detail.product.measurement_unit?.code || ''}`,
        this.formatCurrency(price),
        this.formatCurrency(subtotal)
      ];
    });

    autoTable(this.doc, {
      startY: this.currentY,
      head: [[
        translations.product,
        translations.sku,
        translations.brand,
        translations.category,
        translations.quantity,
        translations.price,
        translations.subtotal
      ]],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246], // Color primario
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 'auto', halign: 'left' },   // Producto - ancho automático
        1: { cellWidth: 20, halign: 'center' },      // SKU - 20mm
        2: { cellWidth: 22, halign: 'left' },        // Marca - 22mm
        3: { cellWidth: 22, halign: 'left' },        // Categoría - 22mm
        4: { cellWidth: 20, halign: 'center' },      // Cantidad - 20mm
        5: { cellWidth: 25, halign: 'right' },       // Precio - 25mm
        6: { cellWidth: 28, halign: 'right' }        // Subtotal - 28mm
      },
      margin: { left: this.margin, right: this.margin },
      tableWidth: 'auto',
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap'
      }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
  }

  private addTotal(details: ReceptionDetail[], translations: PDFTranslations) {
    const rightAlign = this.pageWidth - this.margin;
    const labelX = rightAlign - 50;
    const valueX = rightAlign;

    // Calcular total
    const total = details.reduce((sum, detail) => {
      return sum + (Number(detail.quantity) * Number(detail.price));
    }, 0);

    // Total
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${translations.total}:`, labelX, this.currentY, { align: 'right' });
    this.doc.text(this.formatCurrency(total), valueX, this.currentY, { align: 'right' });

    this.currentY += 12;
  }

  private addFooter(translations: PDFTranslations) {
    const footerY = this.pageHeight - 20;
    
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    this.doc.setFont('helvetica', 'italic');
    
    const footerText = translations.footer || 'Documento generado automáticamente';
    this.doc.text(footerText, this.pageWidth / 2, footerY, { align: 'center' });
    
    // Número de página
    this.doc.text(
      `${translations.page} ${this.doc.getCurrentPageInfo().pageNumber}`,
      this.pageWidth / 2,
      footerY + 5,
      { align: 'center' }
    );
    
    this.doc.setTextColor(0, 0, 0);
  }

  public generatePDF(
    reception: Reception,
    details: ReceptionDetail[],
    translations: PDFTranslations
  ): void {
    // Generar el contenido del PDF
    this.addHeader(reception, translations);
    this.addProviderInfo(reception, translations);
    this.addWarehouseInfo(reception, translations);
    this.addProductsTable(details, translations);
    this.addTotal(details, translations);
    this.addFooter(translations);

    // Descargar el PDF
    const fileName = `recepcion-${reception.code}.pdf`;
    this.doc.save(fileName);
  }

  public openPDF(
    reception: Reception,
    details: ReceptionDetail[],
    translations: PDFTranslations
  ): void {
    // Generar el contenido del PDF
    this.addHeader(reception, translations);
    this.addProviderInfo(reception, translations);
    this.addWarehouseInfo(reception, translations);
    this.addProductsTable(details, translations);
    this.addTotal(details, translations);
    this.addFooter(translations);

    // Abrir en nueva ventana
    const pdfBlob = this.doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  }
}

export const receptionPDFService = new ReceptionPDFService();
