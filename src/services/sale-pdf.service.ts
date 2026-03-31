import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sale, SaleDetail } from '@/types/sale';
import { companySettingsService } from '@/services/company-settings.service';
import type { CompanySettings } from '@/types/company-settings';
import { API_BASE_URL } from '@/lib/config';

interface PDFTranslations {
  title: string;
  code: string;
  date: string;
  client: string;
  destination: string;
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

export class SalePDFService {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private currentY: number = 20;
  private locale: string = 'es';
  private companySettings: CompanySettings | null = null;

  constructor(locale?: string) {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.locale = locale || 'es';
  }

  private async loadCompanySettings(): Promise<void> {
    try {
      this.companySettings = await companySettingsService.get();
    } catch (error) {
      console.warn('No se pudieron cargar los datos de la empresa:', error);
      this.companySettings = null;
    }
  }

  private getLogoFullUrl(logoUrl: string | null): string | null {
    if (!logoUrl) return null;
    if (logoUrl.startsWith('http')) return logoUrl;
    const base = API_BASE_URL;
    const baseClean = base.replace(/\/$/, '');
    const path = logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`;
    return `${baseClean}${path}`;
  }

  private async addLogo(): Promise<void> {
    if (!this.companySettings?.logoUrl) return;

    try {
      const logoUrl = this.getLogoFullUrl(this.companySettings.logoUrl);
      if (!logoUrl) return;

      // Crear una imagen temporal para obtener las dimensiones
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          try {
            // Calcular dimensiones manteniendo proporción
            const maxWidth = 40;
            const maxHeight = 25;
            let width = img.width;
            let height = img.height;

            // Escalar manteniendo proporción
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }

            // Posicionar en la esquina superior derecha
            const x = this.pageWidth - this.margin - width;
            const y = this.currentY;

            // Agregar la imagen al PDF
            this.doc.addImage(img, 'JPEG', x, y, width, height);
            resolve();
          } catch (error) {
            console.warn('Error al agregar logo al PDF:', error);
            resolve(); // No fallar si hay error con el logo
          }
        };
        img.onerror = () => {
          console.warn('Error al cargar el logo para el PDF');
          resolve(); // No fallar si hay error con el logo
        };
        img.src = logoUrl;
      });
    } catch (error) {
      console.warn('Error al procesar el logo:', error);
    }
  }

  private formatCurrency(value: number, currencyCode?: string): string {
    const code = currencyCode || 'MXN';
    const localeStr = code === 'MXN' ? 'es-MX' : this.locale === 'es' ? 'es-MX' : 'en-US';
    return new Intl.NumberFormat(localeStr, {
      style: 'currency',
      currency: code,
    }).format(value);
  }

  private formatDate(date: string): string {
    const localeMap: Record<string, string> = {
      'es': 'es-MX',
      'en': 'en-US'
    };
    return new Date(date).toLocaleDateString(localeMap[this.locale] || 'es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private async addHeader(sale: Sale, translations: PDFTranslations) {
    // Agregar logo si existe
    await this.addLogo();

    // Información de la empresa si está disponible
    if (this.companySettings) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      
      // Nombre de la empresa
      if (this.companySettings.name) {
        this.doc.text(this.companySettings.name, this.margin, this.currentY);
        this.currentY += 6;
      }
      
      // Información adicional de la empresa
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100, 100, 100);
      
      if (this.companySettings.address) {
        this.doc.text(this.companySettings.address, this.margin, this.currentY);
        this.currentY += 4;
      }
      
      if (this.companySettings.phone) {
        this.doc.text(`Tel: ${this.companySettings.phone}`, this.margin, this.currentY);
        this.currentY += 4;
      }
      
      if (this.companySettings.taxId) {
        const taxLabel = this.locale === 'es' ? 'RFC' : 'Tax ID';
        this.doc.text(`${taxLabel}: ${this.companySettings.taxId}`, this.margin, this.currentY);
        this.currentY += 4;
      }
      
      this.doc.setTextColor(0, 0, 0);
      this.currentY += 8;
    }

    // Título usando traducción
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(translations.title.toUpperCase(), this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.currentY += 12;

    // Información de la venta en formato compacto
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    
    // Código y fecha en la misma línea
    const leftColumn = this.margin;
    const rightColumn = this.pageWidth / 2 + 10;

    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${translations.code}:`, leftColumn, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(sale.code, leftColumn + 20, this.currentY);

    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${translations.date}:`, rightColumn, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.formatDate(sale.created_at), rightColumn + 20, this.currentY);

    this.currentY += 6;

    // Destino y estado
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${translations.destination}:`, leftColumn, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(sale.destination, leftColumn + 20, this.currentY);

    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${translations.status}:`, rightColumn, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    const statusText = sale.status === 'CLOSED' ? translations.statusClosed : translations.statusOpen;
    this.doc.text(statusText.toUpperCase(), rightColumn + 20, this.currentY);

    this.currentY += 12;
  }

  private addClientInfo(sale: Sale, translations: PDFTranslations) {
    // Sección de cliente
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(this.margin, this.currentY - 4, this.pageWidth - 2 * this.margin, 20, 'F');

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${translations.client}:`, this.margin + 5, this.currentY);
    
    this.currentY += 6;
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(sale.client.name, this.margin + 5, this.currentY);
    
    this.currentY += 5;
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    if (sale.client.email) {
      this.doc.text(`Email: ${sale.client.email}`, this.margin + 5, this.currentY);
    }
    if (sale.client.phone) {
      this.doc.text(`Tel: ${sale.client.phone}`, this.margin + 80, this.currentY);
    }
    this.doc.setTextColor(0, 0, 0);

    this.currentY += 12;
  }

  private addProductsTable(details: SaleDetail[], translations: PDFTranslations) {
    const tableData = details.map(detail => {
      const productName = detail.product.name.length > 30
        ? detail.product.name.substring(0, 27) + '...'
        : detail.product.name;

      const quantity = Number(detail.quantity);
      const price = Number(detail.price);
      const subtotal = quantity * price;
      const currencyCode = detail.product.currency?.code;

      const taxRate = (detail.product.taxes || []).reduce((acc, tax) => {
        if (tax.type === 'PERCENTAGE') return acc + Number(tax.value) / 100;
        return acc;
      }, 0);
      const taxAmount = subtotal * taxRate;
      const total = subtotal + taxAmount;

      return [
        productName,
        detail.product.sku,
        `${quantity} ${detail.product.measurement_unit?.code || ''}`,
        this.formatCurrency(price, currencyCode),
        this.formatCurrency(subtotal, currencyCode),
        taxAmount > 0 ? this.formatCurrency(taxAmount, currencyCode) : '—',
        this.formatCurrency(total, currencyCode),
      ];
    });

    autoTable(this.doc, {
      startY: this.currentY,
      head: [[
        translations.product,
        translations.sku,
        translations.quantity,
        translations.price,
        translations.subtotal,
        'IVA',
        translations.total,
      ]],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
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
        0: { cellWidth: 'auto', halign: 'left' },
        1: { cellWidth: 18, halign: 'center' },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 24, halign: 'right' },
        4: { cellWidth: 24, halign: 'right' },
        5: { cellWidth: 22, halign: 'right' },
        6: { cellWidth: 26, halign: 'right' },
      },
      margin: { left: this.margin, right: this.margin },
      tableWidth: 'auto',
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap'
      }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 6;
  }

  private addTotal(details: SaleDetail[], translations: PDFTranslations) {
    const rightAlign = this.pageWidth - this.margin;
    const labelX = rightAlign - 45;
    const valueX = rightAlign;

    const currencyCode = details[0]?.product.currency?.code;

    const grandSubtotal = details.reduce((sum, d) => sum + Number(d.quantity) * Number(d.price), 0);
    const grandTax = details.reduce((sum, d) => {
      const subtotal = Number(d.quantity) * Number(d.price);
      const taxRate = (d.product.taxes || []).reduce((acc, tax) => {
        if (tax.type === 'PERCENTAGE') return acc + Number(tax.value) / 100;
        return acc;
      }, 0);
      return sum + subtotal * taxRate;
    }, 0);
    const grandTotal = grandSubtotal + grandTax;

    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`${translations.subtotal}:`, labelX, this.currentY, { align: 'right' });
    this.doc.text(this.formatCurrency(grandSubtotal, currencyCode), valueX, this.currentY, { align: 'right' });

    this.currentY += 6;
    this.doc.text('IVA:', labelX, this.currentY, { align: 'right' });
    this.doc.text(grandTax > 0 ? this.formatCurrency(grandTax, currencyCode) : '—', valueX, this.currentY, { align: 'right' });

    this.currentY += 6;
    // Línea separadora
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(labelX - 20, this.currentY - 2, valueX, this.currentY - 2);

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${translations.total}:`, labelX, this.currentY + 2, { align: 'right' });
    this.doc.text(this.formatCurrency(grandTotal, currencyCode), valueX, this.currentY + 2, { align: 'right' });

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

  public async generatePDF(
    sale: Sale,
    details: SaleDetail[],
    translations: PDFTranslations
  ): Promise<void> {
    // Cargar configuración de la empresa
    await this.loadCompanySettings();

    // Generar el contenido del PDF
    await this.addHeader(sale, translations);
    this.addClientInfo(sale, translations);
    this.addProductsTable(details, translations);
    this.addTotal(details, translations);
    this.addFooter(translations);

    // Descargar el PDF
    const fileName = `venta-${sale.code}.pdf`;
    this.doc.save(fileName);
  }

  public async openPDF(
    sale: Sale,
    details: SaleDetail[],
    translations: PDFTranslations
  ): Promise<void> {
    // Cargar configuración de la empresa
    await this.loadCompanySettings();

    // Generar el contenido del PDF
    await this.addHeader(sale, translations);
    this.addClientInfo(sale, translations);
    this.addProductsTable(details, translations);
    this.addTotal(details, translations);
    this.addFooter(translations);

    // Abrir en nueva ventana
    const pdfBlob = this.doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  }
}

export const salePDFService = new SalePDFService();
