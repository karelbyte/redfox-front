import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sale, SaleDetail, PaymentMethod, CardType } from '@/types/sale';
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
  paymentMethod: string;
  fiscalStatus: string;
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
  paymentMethods?: {
    cash: string;
    creditCard: string;
    debitCard: string;
    transfer: string;
    credit: string;
  };
  fiscalStatuses?: {
    receiptOnly: string;
    invoicedDirect: string;
    invoicedGlobal: string;
  };
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

  private resetDocument(): void {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.currentY = 20;
  }

  private getSafeText(value: unknown, fallback: string = '—'): string {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : fallback;
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? String(value) : fallback;
    }

    if (value === null || value === undefined) {
      return fallback;
    }

    const text = String(value).trim();
    return text.length > 0 ? text : fallback;
  }

  private drawText(
    value: unknown,
    x: number,
    y: number,
    options?: Parameters<jsPDF['text']>[3]
  ): void {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return;
    }

    this.doc.text(this.getSafeText(value), x, y, options);
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
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return this.getSafeText(date);
    }

    const localeMap: Record<string, string> = {
      'es': 'es-MX',
      'en': 'en-US'
    };
    return parsedDate.toLocaleDateString(localeMap[this.locale] || 'es-MX', {
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
        this.drawText(this.companySettings.name, this.margin, this.currentY);
        this.currentY += 6;
      }
      
      // Información adicional de la empresa
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100, 100, 100);
      
      if (this.companySettings.address) {
        this.drawText(this.companySettings.address, this.margin, this.currentY);
        this.currentY += 4;
      }
      
      if (this.companySettings.phone) {
        this.drawText(`Tel: ${this.companySettings.phone}`, this.margin, this.currentY);
        this.currentY += 4;
      }
      
      if (this.companySettings.taxId) {
        const taxLabel = this.locale === 'es' ? 'RFC' : 'Tax ID';
        this.drawText(`${taxLabel}: ${this.companySettings.taxId}`, this.margin, this.currentY);
        this.currentY += 4;
      }
      
      this.doc.setTextColor(0, 0, 0);
      this.currentY += 8;
    }

    // Título usando traducción
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.drawText(this.getSafeText(translations.title, 'Venta').toUpperCase(), this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.currentY += 12;

    // Información de la venta en formato compacto
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    
    // Código y fecha en la misma línea
    const leftColumn = this.margin;
    const rightColumn = this.pageWidth / 2 + 10;

    this.doc.setFont('helvetica', 'bold');
    this.drawText(`${this.getSafeText(translations.code, 'Código')}:`, leftColumn, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.drawText(sale.code, leftColumn + 20, this.currentY);

    this.doc.setFont('helvetica', 'bold');
    this.drawText(`${this.getSafeText(translations.date, 'Fecha')}:`, rightColumn, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.drawText(this.formatDate(sale.created_at), rightColumn + 20, this.currentY);

    this.currentY += 6;

    // Destino y estado
    this.doc.setFont('helvetica', 'bold');
    this.drawText(`${this.getSafeText(translations.destination, 'Destino')}:`, leftColumn, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.drawText(sale.destination, leftColumn + 20, this.currentY);

    this.doc.setFont('helvetica', 'bold');
    this.drawText(`${this.getSafeText(translations.status, 'Estado')}:`, rightColumn, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    const statusText = sale.status === 'CLOSED' ? translations.statusClosed : translations.statusOpen;
    this.drawText(this.getSafeText(statusText, '—').toUpperCase(), rightColumn + 20, this.currentY);

    this.currentY += 6;

    // Método de pago y estado fiscal
    this.doc.setFont('helvetica', 'bold');
    this.drawText(`${this.getSafeText(translations.paymentMethod, 'Método de Pago')}:`, leftColumn, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    const paymentMethodText = this.getPaymentMethodText(sale, translations);
    this.drawText(paymentMethodText, leftColumn + 20, this.currentY);

    this.doc.setFont('helvetica', 'bold');
    this.drawText(`${this.getSafeText(translations.fiscalStatus, 'Estado Fiscal')}:`, rightColumn, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    const fiscalStatusText = this.getFiscalStatusText(sale, translations);
    this.drawText(fiscalStatusText, rightColumn + 20, this.currentY);

    this.currentY += 12;
  }

  private getPaymentMethodText(sale: Sale, translations: PDFTranslations): string {
    if (!sale.payment_method) return '—';
    
    if (sale.payment_method === PaymentMethod.CASH) {
      return translations.paymentMethods?.cash || 'Efectivo';
    }
    
    if (sale.payment_method === PaymentMethod.CARD) {
      if (sale.card_type === CardType.CREDIT) {
        return translations.paymentMethods?.creditCard || 'Tarjeta de Crédito';
      }
      if (sale.card_type === CardType.DEBIT) {
        return translations.paymentMethods?.debitCard || 'Tarjeta de Débito';
      }
    }
    
    if (sale.payment_method === PaymentMethod.CREDIT) {
      return translations.paymentMethods?.credit || 'Crédito';
    }
    
    if (sale.payment_method === PaymentMethod.TRANSFER) {
      return translations.paymentMethods?.transfer || 'Transferencia';
    }
    
    return sale.payment_method;
  }

  private getFiscalStatusText(sale: Sale, translations: PDFTranslations): string {
    if (!sale.pack_fiscal_status) return translations.fiscalStatuses?.receiptOnly || 'Solo nota';
    
    if (sale.pack_fiscal_status === 'INVOICED_DIRECT') {
      return translations.fiscalStatuses?.invoicedDirect || 'Facturada directa';
    }
    
    if (sale.pack_fiscal_status === 'INVOICED_GLOBAL') {
      return translations.fiscalStatuses?.invoicedGlobal || 'Facturada global';
    }
    
    return translations.fiscalStatuses?.receiptOnly || 'Solo nota';
  }

  private addClientInfo(sale: Sale, translations: PDFTranslations) {
    // Sección de cliente
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(this.margin, this.currentY - 4, this.pageWidth - 2 * this.margin, 20, 'F');

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.drawText(`${this.getSafeText(translations.client, 'Cliente')}:`, this.margin + 5, this.currentY);
    
    this.currentY += 6;
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.drawText(sale.client?.name, this.margin + 5, this.currentY);
    
    this.currentY += 5;
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    if (sale.client?.email) {
      this.drawText(`Email: ${sale.client.email}`, this.margin + 5, this.currentY);
    }
    if (sale.client?.phone) {
      this.drawText(`Tel: ${sale.client.phone}`, this.margin + 80, this.currentY);
    }
    this.doc.setTextColor(0, 0, 0);

    this.currentY += 12;
  }

  private addProductsTable(details: SaleDetail[], translations: PDFTranslations) {
    const tableData = details.map(detail => {
      const rawProductName = this.getSafeText(detail.product?.name);
      const productName = rawProductName.length > 30
        ? rawProductName.substring(0, 27) + '...'
        : rawProductName;

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
        this.getSafeText(detail.product?.sku),
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
        1: { cellWidth: 18, halign: 'right' },
        2: { cellWidth: 18, halign: 'right' },
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
    this.drawText(`${this.getSafeText(translations.subtotal, 'Subtotal')}:`, labelX, this.currentY, { align: 'right' });
    this.drawText(this.formatCurrency(grandSubtotal, currencyCode), valueX, this.currentY, { align: 'right' });

    this.currentY += 6;
    this.drawText('IVA:', labelX, this.currentY, { align: 'right' });
    this.drawText(grandTax > 0 ? this.formatCurrency(grandTax, currencyCode) : '—', valueX, this.currentY, { align: 'right' });

    this.currentY += 6;
    // Línea separadora
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(labelX - 20, this.currentY - 2, valueX, this.currentY - 2);

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.drawText(`${this.getSafeText(translations.total, 'Total')}:`, labelX, this.currentY + 2, { align: 'right' });
    this.drawText(this.formatCurrency(grandTotal, currencyCode), valueX, this.currentY + 2, { align: 'right' });

    this.currentY += 12;
  }

  private async loadQRCode(): Promise<string | null> {
    const qrUrl = this.companySettings?.website?.trim() || 'https://nitrostock.work';
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(qrUrl)}`;
    try {
      const response = await fetch(qrApiUrl);
      if (!response.ok) return null;
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  private addFooter(translations: PDFTranslations, qrBase64?: string | null) {
    const footerY = this.pageHeight - 30;

    // QR code
    if (qrBase64) {
      try {
        this.doc.addImage(qrBase64, 'PNG', this.margin, footerY - 18, 18, 18);
        const qrUrl = this.companySettings?.website?.trim() || 'https://nitrostock.work';
        const shortUrl = qrUrl.replace(/^https?:\/\//, '').replace(/\/$/, '').substring(0, 25);
        if (shortUrl) {
          this.doc.setFontSize(6);
          this.doc.setTextColor(130, 130, 130);
          this.doc.setFont('helvetica', 'normal');
          this.drawText(shortUrl, this.margin + 9, footerY + 2, { align: 'center' });
        }
      } catch { /* continuar sin QR */ }
    }

    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    this.doc.setFont('helvetica', 'italic');

    const footerText = translations.footer || 'Documento generado automáticamente';
    if (footerText) {
      this.drawText(footerText, this.pageWidth / 2, footerY + 5, { align: 'center' });
    }

    const pageLabel = `${this.getSafeText(translations.page, 'Página')} ${this.doc.getCurrentPageInfo().pageNumber}`;
    this.drawText(pageLabel, this.pageWidth / 2, footerY + 10, { align: 'center' });

    this.doc.setTextColor(0, 0, 0);
  }

  public async generatePDF(
    sale: Sale,
    details: SaleDetail[],
    translations: PDFTranslations
  ): Promise<void> {
    this.resetDocument();
    await this.loadCompanySettings();
    const qrBase64 = await this.loadQRCode();

    await this.addHeader(sale, translations);
    this.addClientInfo(sale, translations);
    this.addProductsTable(details, translations);
    this.addTotal(details, translations);
    this.addFooter(translations, qrBase64);

    const fileName = `venta-${sale.code}.pdf`;
    this.doc.save(fileName);
  }

  public async openPDF(
    sale: Sale,
    details: SaleDetail[],
    translations: PDFTranslations
  ): Promise<void> {
    this.resetDocument();
    await this.loadCompanySettings();
    const qrBase64 = await this.loadQRCode();

    await this.addHeader(sale, translations);
    this.addClientInfo(sale, translations);
    this.addProductsTable(details, translations);
    this.addTotal(details, translations);
    this.addFooter(translations, qrBase64);

    const pdfBlob = this.doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  }
}

export const salePDFService = new SalePDFService();
