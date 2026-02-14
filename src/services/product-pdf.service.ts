import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Product } from '@/types/product';

interface PDFTranslations {
  title: string;
  subtitle: string;
  product: string;
  code: string;
  sku: string;
  brand: string;
  category: string;
  measurementUnit: string;
  type: string;
  tax: string;
  basePrice: string;
  status: string;
  total: string;
  footer: string;
  active: string;
  inactive: string;
  generatedOn: string;
  page: string;
  locale?: string;
}

export class ProductPDFService {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 15;
  private currentY: number = 15;
  private locale: string = 'es';

  constructor(locale?: string) {
    this.doc = new jsPDF({ orientation: 'landscape' });
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

  private formatDate(date: Date): string {
    const localeMap: Record<string, string> = {
      'es': 'es-PE',
      'en': 'en-US'
    };
    return date.toLocaleDateString(localeMap[this.locale] || 'es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private addHeader(translations: PDFTranslations) {
    // Título
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(translations.title.toUpperCase(), this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.currentY += 8;

    // Subtítulo con fecha
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    const subtitle = `${translations.subtitle} - ${this.formatDate(new Date())}`;
    this.doc.text(subtitle, this.pageWidth / 2, this.currentY, { align: 'center' });
    this.doc.setTextColor(0, 0, 0);

    this.currentY += 10;
  }

  private addProductsTable(products: Product[], translations: PDFTranslations) {
    const tableData = products.map(product => {
      // Truncar nombre del producto si es muy largo
      const productName = product.name.length > 40 
        ? product.name.substring(0, 37) + '...'
        : product.name;

      const brand = typeof product.brand === 'object' ? product.brand.code : product.brand;
      const category = typeof product.category === 'object' ? product.category.name : product.category;
      const measurementUnit = typeof product.measurement_unit === 'object' 
        ? product.measurement_unit.code 
        : product.measurement_unit;
      const tax = typeof product.tax === 'object' ? product.tax.code : product.tax;
      const status = product.is_active ? translations.active : translations.inactive;

      return [
        productName,
        product.code,
        product.sku,
        brand,
        category,
        measurementUnit,
        product.type,
        tax,
        this.formatCurrency(product.base_price),
        status
      ];
    });

    autoTable(this.doc, {
      startY: this.currentY,
      head: [[
        translations.product,
        translations.code,
        translations.sku,
        translations.brand,
        translations.category,
        translations.measurementUnit,
        translations.type,
        translations.tax,
        translations.basePrice,
        translations.status
      ]],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246], // Color primario
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 1.5
      },
      columnStyles: {
        0: { cellWidth: 'auto', halign: 'left' },   // Producto - ancho automático
        1: { cellWidth: 18, halign: 'center' },      // Código - 18mm
        2: { cellWidth: 18, halign: 'center' },      // SKU - 18mm
        3: { cellWidth: 18, halign: 'left' },        // Marca - 18mm
        4: { cellWidth: 22, halign: 'left' },        // Categoría - 22mm
        5: { cellWidth: 15, halign: 'center' },      // Unidad - 15mm
        6: { cellWidth: 18, halign: 'center' },      // Tipo - 18mm
        7: { cellWidth: 15, halign: 'center' },      // Impuesto - 15mm
        8: { cellWidth: 22, halign: 'right' },       // Precio - 22mm
        9: { cellWidth: 18, halign: 'center' }       // Estado - 18mm
      },
      margin: { left: this.margin, right: this.margin },
      tableWidth: 'auto',
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap'
      }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 8;
  }

  private addSummary(products: Product[], translations: PDFTranslations) {
    const rightAlign = this.pageWidth - this.margin;
    const labelX = rightAlign - 60;
    const valueX = rightAlign;

    // Total de productos
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${translations.total}:`, labelX, this.currentY, { align: 'right' });
    this.doc.text(`${products.length} ${translations.product.toLowerCase()}${products.length !== 1 ? 's' : ''}`, valueX, this.currentY, { align: 'right' });

    this.currentY += 8;
  }

  private addFooter(translations: PDFTranslations) {
    const footerY = this.pageHeight - 15;
    
    this.doc.setFontSize(7);
    this.doc.setTextColor(100, 100, 100);
    this.doc.setFont('helvetica', 'italic');
    
    const footerText = translations.footer || 'Documento generado automáticamente';
    this.doc.text(footerText, this.pageWidth / 2, footerY, { align: 'center' });
    
    // Fecha de generación
    const localeMap: Record<string, string> = {
      'es': 'es-PE',
      'en': 'en-US'
    };
    const dateTimeString = new Date().toLocaleString(localeMap[this.locale] || 'es-PE');
    this.doc.text(
      `${translations.generatedOn}: ${dateTimeString}`,
      this.pageWidth / 2,
      footerY + 4,
      { align: 'center' }
    );
    
    // Número de página
    this.doc.text(
      `${translations.page} ${this.doc.getCurrentPageInfo().pageNumber}`,
      this.pageWidth / 2,
      footerY + 8,
      { align: 'center' }
    );
    
    this.doc.setTextColor(0, 0, 0);
  }

  public generatePDF(
    products: Product[],
    translations: PDFTranslations,
    filename?: string
  ): void {
    // Generar el contenido del PDF
    this.addHeader(translations);
    this.addProductsTable(products, translations);
    this.addSummary(products, translations);
    this.addFooter(translations);

    // Descargar el PDF
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' +
      now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const fileName = filename || `productos_${timestamp}.pdf`;
    this.doc.save(fileName);
  }

  public openPDF(
    products: Product[],
    translations: PDFTranslations
  ): void {
    // Generar el contenido del PDF
    this.addHeader(translations);
    this.addProductsTable(products, translations);
    this.addSummary(products, translations);
    this.addFooter(translations);

    // Abrir en nueva ventana
    const pdfBlob = this.doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  }
}

export const productPDFService = new ProductPDFService();
