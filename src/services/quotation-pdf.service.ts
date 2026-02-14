import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quotation, QuotationDetail } from '@/types/quotation';

interface PDFTranslations {
  title: string;
  code: string;
  date: string;
  validUntil: string;
  client: string;
  warehouse: string;
  status: string;
  product: string;
  quantity: string;
  price: string;
  discount: string;
  subtotal: string;
  total: string;
  tax: string;
  notes: string;
  footer: string;
  page: string;
  locale?: string;
}

export class QuotationPDFService {
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

  private addHeader(quotation: Quotation, translations: PDFTranslations) {
    // Título usando traducción
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(translations.title.toUpperCase(), this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.currentY += 12;

    // Información de la cotización en formato compacto
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    
    // Código y fecha en la misma línea
    const leftColumn = this.margin;
    const rightColumn = this.pageWidth / 2 + 10;

    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${translations.code}:`, leftColumn, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(quotation.code, leftColumn + 20, this.currentY);

    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${translations.date}:`, rightColumn, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.formatDate(quotation.date), rightColumn + 20, this.currentY);

    this.currentY += 6;

    // Estado y válida hasta
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${translations.status}:`, leftColumn, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(quotation.status.toUpperCase(), leftColumn + 20, this.currentY);

    if (quotation.valid_until) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${translations.validUntil}:`, rightColumn, this.currentY);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(this.formatDate(quotation.valid_until), rightColumn + 20, this.currentY);
    }

    this.currentY += 12;
  }

  private addClientInfo(quotation: Quotation, translations: PDFTranslations) {
    // Sección de cliente
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(this.margin, this.currentY - 4, this.pageWidth - 2 * this.margin, 20, 'F');

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${translations.client}:`, this.margin + 5, this.currentY);
    
    this.currentY += 6;
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(quotation.client.name, this.margin + 5, this.currentY);
    
    this.currentY += 5;
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(`Código: ${quotation.client.code}`, this.margin + 5, this.currentY);
    this.doc.setTextColor(0, 0, 0);

    this.currentY += 12;
  }

  private addProductsTable(details: QuotationDetail[], translations: PDFTranslations) {
    const tableData = details.map(detail => {
      // Truncar nombre del producto si es muy largo
      const productName = detail.product.name.length > 40 
        ? detail.product.name.substring(0, 37) + '...'
        : detail.product.name;

      return [
        productName,
        `${detail.quantity} ${detail.product.measurement_unit?.code || ''}`,
        this.formatCurrency(Number(detail.price)),
        Number(detail.discount_percentage) > 0 
          ? `-${detail.discount_percentage}%` 
          : Number(detail.discount_amount) > 0 
            ? `-${this.formatCurrency(Number(detail.discount_amount))}`
            : '-',
        this.formatCurrency(Number(detail.subtotal))
      ];
    });

    autoTable(this.doc, {
      startY: this.currentY,
      head: [[
        translations.product,
        translations.quantity,
        translations.price,
        translations.discount,
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
        1: { cellWidth: 25, halign: 'center' },      // Cantidad - 25mm
        2: { cellWidth: 25, halign: 'right' },       // Precio - 25mm
        3: { cellWidth: 25, halign: 'center' },      // Descuento - 25mm
        4: { cellWidth: 30, halign: 'right' }        // Subtotal - 30mm
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

  private addTotals(quotation: Quotation, translations: PDFTranslations) {
    const rightAlign = this.pageWidth - this.margin;
    const labelX = rightAlign - 50;
    const valueX = rightAlign;

    // Subtotal
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`${translations.subtotal}:`, labelX, this.currentY, { align: 'right' });
    this.doc.text(this.formatCurrency(quotation.subtotal), valueX, this.currentY, { align: 'right' });

    this.currentY += 6;

    // Impuestos
    this.doc.text(`${translations.tax}:`, labelX, this.currentY, { align: 'right' });
    this.doc.text(this.formatCurrency(quotation.tax), valueX, this.currentY, { align: 'right' });

    this.currentY += 8;

    // Total
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${translations.total}:`, labelX, this.currentY, { align: 'right' });
    this.doc.text(this.formatCurrency(quotation.total), valueX, this.currentY, { align: 'right' });

    this.currentY += 12;
  }

  private addNotes(quotation: Quotation, translations: PDFTranslations) {
    if (quotation.notes) {
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${translations.notes}:`, this.margin, this.currentY);
      
      this.currentY += 6;
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      
      const splitNotes = this.doc.splitTextToSize(
        quotation.notes,
        this.pageWidth - 2 * this.margin
      );
      this.doc.text(splitNotes, this.margin, this.currentY);
      
      this.currentY += splitNotes.length * 4 + 8;
    }
  }

  private addFooter(translations: PDFTranslations) {
    const footerY = this.pageHeight - 20;
    
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    this.doc.setFont('helvetica', 'italic');
    
    const footerText = translations.footer || 'Gracias por su preferencia';
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
    quotation: Quotation,
    details: QuotationDetail[],
    translations: PDFTranslations
  ): void {
    // Generar el contenido del PDF
    this.addHeader(quotation, translations);
    this.addClientInfo(quotation, translations);
    this.addProductsTable(details, translations);
    this.addTotals(quotation, translations);
    this.addNotes(quotation, translations);
    this.addFooter(translations);

    // Descargar el PDF
    const fileName = `cotizacion-${quotation.code}.pdf`;
    this.doc.save(fileName);
  }

  public openPDF(
    quotation: Quotation,
    details: QuotationDetail[],
    translations: PDFTranslations
  ): void {
    // Generar el contenido del PDF
    this.addHeader(quotation, translations);
    this.addClientInfo(quotation, translations);
    this.addProductsTable(details, translations);
    this.addTotals(quotation, translations);
    this.addNotes(quotation, translations);
    this.addFooter(translations);

    // Abrir en nueva ventana
    const pdfBlob = this.doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  }
}

export const quotationPDFService = new QuotationPDFService();
