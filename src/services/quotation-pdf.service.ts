import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { companySettingsService } from '@/services/company-settings.service';
import type { CompanySettings } from '@/types/company-settings';
import { Quotation, QuotationDetail, QuotationStatus } from '@/types/quotation';
import { API_BASE_URL } from '@/lib/config';

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

type SupportedLocale = 'es' | 'en' | 'zh';

type QuotationPdfCopy = {
  companySection: string;
  quoteSection: string;
  quoteCode: string;
  quoteDate: string;
  quoteValidity: string;
  quoteStatus: string;
  warehouse: string;
  clientCode: string;
  clientEmail: string;
  clientPhone: string;
  clientTaxId: string;
  clientAddress: string;
  legalName: string;
  taxId: string;
  phone: string;
  email: string;
  unit: string;
  lineTax: string;
  productCode: string;
  summary: string;
  discountTotal: string;
  siteQrLabel: string;
  generatedBy: string;
  notAvailable: string;
  statusMap: Record<QuotationStatus, string>;
};

const DEFAULT_WEBSITE_URL = 'https://nitrostock.work';

const COPY: Record<SupportedLocale, QuotationPdfCopy> = {
  es: {
    companySection: 'Datos de la empresa',
    quoteSection: 'Resumen de cotización',
    quoteCode: 'Folio',
    quoteDate: 'Fecha',
    quoteValidity: 'Vigencia',
    quoteStatus: 'Estado',
    warehouse: 'Almacén',
    clientCode: 'Código',
    clientEmail: 'Correo',
    clientPhone: 'Teléfono',
    clientTaxId: 'RFC',
    clientAddress: 'Dirección',
    legalName: 'Razón social',
    taxId: 'RFC',
    phone: 'Teléfono',
    email: 'Correo',
    unit: 'Unidad',
    lineTax: 'IVA',
    productCode: 'Código',
    summary: 'Resumen',
    discountTotal: 'Descuento',
    siteQrLabel: 'Sitio web',
    generatedBy: 'Documento generado desde Nitro',
    notAvailable: '—',
    statusMap: {
      draft: 'Borrador',
      sent: 'Enviada',
      accepted: 'Aceptada',
      rejected: 'Rechazada',
      expired: 'Expirada',
      converted: 'Convertida',
    },
  },
  en: {
    companySection: 'Company details',
    quoteSection: 'Quotation summary',
    quoteCode: 'Code',
    quoteDate: 'Date',
    quoteValidity: 'Valid until',
    quoteStatus: 'Status',
    warehouse: 'Warehouse',
    clientCode: 'Code',
    clientEmail: 'Email',
    clientPhone: 'Phone',
    clientTaxId: 'Tax ID',
    clientAddress: 'Address',
    legalName: 'Legal name',
    taxId: 'Tax ID',
    phone: 'Phone',
    email: 'Email',
    unit: 'Unit',
    lineTax: 'Tax',
    productCode: 'Code',
    summary: 'Summary',
    discountTotal: 'Discount',
    siteQrLabel: 'Website',
    generatedBy: 'Document generated from Nitro',
    notAvailable: '—',
    statusMap: {
      draft: 'Draft',
      sent: 'Sent',
      accepted: 'Accepted',
      rejected: 'Rejected',
      expired: 'Expired',
      converted: 'Converted',
    },
  },
  zh: {
    companySection: '公司信息',
    quoteSection: '报价摘要',
    quoteCode: '单号',
    quoteDate: '日期',
    quoteValidity: '有效期',
    quoteStatus: '状态',
    warehouse: '仓库',
    clientCode: '编码',
    clientEmail: '邮箱',
    clientPhone: '电话',
    clientTaxId: '税号',
    clientAddress: '地址',
    legalName: '法定名称',
    taxId: '税号',
    phone: '电话',
    email: '邮箱',
    unit: '单位',
    lineTax: '税额',
    productCode: '编码',
    summary: '汇总',
    discountTotal: '折扣',
    siteQrLabel: '网站',
    generatedBy: '由 Nitro 自动生成',
    notAvailable: '—',
    statusMap: {
      draft: '草稿',
      sent: '已发送',
      accepted: '已接受',
      rejected: '已拒绝',
      expired: '已过期',
      converted: '已转换',
    },
  },
};

export class QuotationPDFService {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin = 16;
  private currentY = 16;
  private locale: SupportedLocale = 'es';
  private companySettings: CompanySettings | null = null;

  constructor(locale?: string) {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.locale = this.resolveLocale(locale);
  }

  private resolveLocale(locale?: string): SupportedLocale {
    const normalized = (locale || 'es').split('-')[0].toLowerCase();
    if (normalized === 'en' || normalized === 'zh') {
      return normalized;
    }

    return 'es';
  }

  private get copy(): QuotationPdfCopy {
    return COPY[this.locale];
  }

  private resetDocument(): void {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.currentY = 16;
  }

  private getSafeText(value: unknown, fallback: string = this.copy.notAvailable): string {
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
    options?: Parameters<jsPDF['text']>[3],
  ): void {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return;
    }

    this.doc.text(this.getSafeText(value), x, y, options);
  }

  private async loadCompanySettings(): Promise<void> {
    try {
      this.companySettings = await companySettingsService.get();
    } catch {
      this.companySettings = null;
    }
  }

  private getLogoFullUrl(logoUrl: string | null): string | null {
    if (!logoUrl) return null;
    if (logoUrl.startsWith('http')) return logoUrl;

    const baseClean = API_BASE_URL.replace(/\/$/, '');
    const path = logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`;
    return `${baseClean}${path}`;
  }

  private async addLogo(): Promise<number> {
    if (!this.companySettings?.logoUrl) {
      return 0;
    }

    try {
      const logoUrl = this.getLogoFullUrl(this.companySettings.logoUrl);
      if (!logoUrl) {
        return 0;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      return await new Promise<number>((resolve) => {
        img.onload = () => {
          try {
            const maxWidth = 34;
            const maxHeight = 22;
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }

            const x = this.pageWidth - this.margin - width;
            const y = this.currentY;
            this.doc.addImage(img, 'PNG', x, y, width, height);
            resolve(height);
          } catch {
            resolve(0);
          }
        };
        img.onerror = () => resolve(0);
        img.src = logoUrl;
      });
    } catch {
      return 0;
    }
  }

  private formatCurrency(value: number, currencyCode?: string): string {
    const code = currencyCode || 'MXN';
    const localeMap: Record<SupportedLocale, string> = {
      es: 'es-MX',
      en: 'en-US',
      zh: 'zh-CN',
    };

    return new Intl.NumberFormat(localeMap[this.locale], {
      style: 'currency',
      currency: code,
    }).format(Number(value || 0));
  }

  private formatDate(value?: string | null): string {
    if (!value) {
      return this.copy.notAvailable;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return this.getSafeText(value);
    }

    const localeMap: Record<SupportedLocale, string> = {
      es: 'es-MX',
      en: 'en-US',
      zh: 'zh-CN',
    };

    return parsed.toLocaleDateString(localeMap[this.locale], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private getStatusLabel(status: QuotationStatus): string {
    return this.copy.statusMap[status] || status.toUpperCase();
  }

  private lineValue(label: string, value: unknown): string {
    return `${label}: ${this.getSafeText(value)}`;
  }

  private async loadQRCode(): Promise<string | null> {
    const qrUrl = this.companySettings?.website?.trim() || DEFAULT_WEBSITE_URL;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrUrl)}`;

    try {
      const response = await fetch(qrApiUrl);
      if (!response.ok) {
        return null;
      }

      const blob = await response.blob();
      return await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  private async addHeader(quotation: Quotation, translations: PDFTranslations): Promise<void> {
    const topY = this.currentY;
    const usableW = this.pageWidth - this.margin * 2;
    const colW = usableW / 3;
    const leftX   = this.margin;
    const centerX = this.margin + colW;
    const rightEnd = this.pageWidth - this.margin;

    // ── Logo centrado ──────────────────────────────────────────────────────────
    if (this.companySettings?.logoUrl) {
      try {
        const logoUrl = this.getLogoFullUrl(this.companySettings.logoUrl);
        if (logoUrl) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve) => {
            img.onload = () => {
              try {
                const maxW = 36, maxH = 24;
                let w = img.width, h = img.height;
                if (w > maxW) { h = h * maxW / w; w = maxW; }
                if (h > maxH) { w = w * maxH / h; h = maxH; }
                this.doc.addImage(img, 'PNG', centerX + (colW - w) / 2, topY, w, h);
              } catch { /* skip */ }
              resolve();
            };
            img.onerror = () => resolve();
            img.src = logoUrl;
          });
        }
      } catch { /* skip */ }
    }

    // ── Empresa (izquierda) ────────────────────────────────────────────────────
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14);
    this.doc.setTextColor(17, 24, 39);
    this.drawText(this.companySettings?.name || this.companySettings?.legalName || 'Nitro', leftX, topY);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8);
    this.doc.setTextColor(75, 85, 99);
    let companyY = topY + 6;
    const companyLines = [
      this.companySettings?.legalName && this.companySettings.legalName !== this.companySettings?.name
        ? this.lineValue(this.copy.legalName, this.companySettings.legalName) : null,
      this.companySettings?.taxId ? this.lineValue(this.copy.taxId, this.companySettings.taxId) : null,
      this.companySettings?.address,
      this.companySettings?.phone ? this.lineValue(this.copy.phone, this.companySettings.phone) : null,
      this.companySettings?.email ? this.lineValue(this.copy.email, this.companySettings.email) : null,
    ].filter(Boolean) as string[];
    for (const line of companyLines) {
      const wrapped = this.doc.splitTextToSize(line, colW - 4);
      this.doc.text(wrapped, leftX, companyY);
      companyY += wrapped.length * 4;
    }

    // ── Título + metadatos (derecha) ───────────────────────────────────────────
    this.doc.setTextColor(17, 24, 39);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(18);
    this.drawText(translations.title.toUpperCase(), rightEnd, topY, { align: 'right' });

    let metaY = topY + 10;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.setTextColor(55, 65, 81);
    const metaLines = [
      `${translations.code}: ${quotation.code}`,
      `${translations.date}: ${this.formatDate(quotation.date)}`,
      `${translations.validUntil}: ${this.formatDate(quotation.valid_until)}`,
      `${translations.status}: ${this.getStatusLabel(quotation.status)}`,
      quotation.warehouse?.name ? `${translations.warehouse}: ${quotation.warehouse.name}` : null,
    ].filter(Boolean) as string[];
    for (const line of metaLines) {
      this.drawText(line, rightEnd, metaY, { align: 'right' });
      metaY += 5;
    }

    this.currentY = Math.max(companyY, metaY) + 6;
    this.doc.setDrawColor(209, 213, 219);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 8;
    this.doc.setTextColor(17, 24, 39);
  }

  private addInfoCards(quotation: Quotation): void {
    const startY = this.currentY;
    const gap = 8;
    const boxWidth = (this.pageWidth - this.margin * 2 - gap) / 2;
    const leftX = this.margin;
    const rightX = this.margin + boxWidth + gap;

    const clientLines = [
      quotation.client?.name,
      this.lineValue(this.copy.clientCode, quotation.client?.code),
      quotation.client?.email
        ? this.lineValue(this.copy.clientEmail, quotation.client.email)
        : null,
      quotation.client?.phone
        ? this.lineValue(this.copy.clientPhone, quotation.client.phone)
        : null,
      quotation.client?.tax_document
        ? this.lineValue(this.copy.clientTaxId, quotation.client.tax_document)
        : null,
      quotation.client?.address
        ? this.lineValue(this.copy.clientAddress, quotation.client.address)
        : null,
    ].filter(Boolean) as string[];

    const quoteLines = [
      this.lineValue(this.copy.quoteCode, quotation.code),
      this.lineValue(this.copy.quoteDate, this.formatDate(quotation.date)),
      this.lineValue(
        this.copy.quoteValidity,
        this.formatDate(quotation.valid_until),
      ),
      this.lineValue(this.copy.quoteStatus, this.getStatusLabel(quotation.status)),
      quotation.warehouse?.name
        ? this.lineValue(this.copy.warehouse, quotation.warehouse.name)
        : null,
    ].filter(Boolean) as string[];

    const leftHeight = this.drawInfoCard(
      leftX,
      startY,
      boxWidth,
      quotation.client?.name || this.copy.notAvailable,
      clientLines,
    );

    const rightHeight = this.drawInfoCard(
      rightX,
      startY,
      boxWidth,
      this.copy.quoteSection,
      quoteLines,
    );

    this.currentY = startY + Math.max(leftHeight, rightHeight) + 10;
  }

  private drawInfoCard(
    x: number,
    y: number,
    width: number,
    title: string,
    lines: string[],
  ): number {
    const minHeight = 34;
    const wrappedLines = lines.map((line) => this.doc.splitTextToSize(line, width - 10));
    const linesHeight = wrappedLines.reduce((sum, line) => sum + line.length * 4, 0);
    const finalHeight = Math.max(minHeight, 18 + linesHeight + 10);
    let cursorY = y + 14;

    this.doc.setFillColor(248, 250, 252);
    this.doc.setDrawColor(226, 232, 240);
    this.doc.rect(x, y, width, finalHeight, 'FD');

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(10);
    this.doc.setTextColor(15, 23, 42);
    this.drawText(title, x + 5, y + 7);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8.5);
    this.doc.setTextColor(71, 85, 105);

    for (const wrapped of wrappedLines) {
      this.doc.text(wrapped, x + 5, cursorY);
      cursorY += wrapped.length * 4;
    }

    return finalHeight;
  }

  private addProductsTable(
    details: QuotationDetail[],
    currencyCode: string,
    translations: PDFTranslations,
  ): {
    discountTotal: number;
  } {
    const head = [[
      this.copy.productCode,
      translations.product,
      translations.quantity,
      translations.price,
      translations.discount,
      this.copy.lineTax,
      translations.subtotal,
    ]];

    let discountTotal = 0;

    const body = details.map((detail) => {
      const quantity = Number(detail.quantity || 0);
      const price = Number(detail.price || 0);
      const subtotal = Number(detail.subtotal || 0);
      const discountAmount = Number(detail.discount_amount || 0);
      const discountPercentage = Number(detail.discount_percentage || 0);
      const taxRate = Number(detail.product.tax?.value || 0);
      const taxAmount = subtotal * (taxRate / 100);

      discountTotal +=
        discountAmount > 0 ? discountAmount : (quantity * price * discountPercentage) / 100;

      return [
        this.getSafeText((detail.product as { code?: string }).code),
        this.getSafeText(detail.product.name),
        `${quantity.toFixed(2)} ${this.getSafeText(detail.product.measurement_unit?.code)}`,
        this.formatCurrency(price, currencyCode),
        discountAmount > 0
          ? this.formatCurrency(discountAmount, currencyCode)
          : discountPercentage > 0
            ? `-${discountPercentage.toFixed(2)}%`
            : this.copy.notAvailable,
        taxRate > 0
          ? `${taxRate.toFixed(2)}%`
          : this.copy.notAvailable,
        this.formatCurrency(subtotal, currencyCode),
      ];
    });

    autoTable(this.doc, {
      startY: this.currentY,
      head,
      body,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
        overflow: 'linebreak',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        textColor: [31, 41, 55],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 22, halign: 'center' },
        1: { cellWidth: 'auto', halign: 'left' },
        2: { cellWidth: 24, halign: 'center' },
        3: { cellWidth: 24, halign: 'right' },
        4: { cellWidth: 22, halign: 'right' },
        5: { cellWidth: 16, halign: 'right' },
        6: { cellWidth: 26, halign: 'right' },
      },
      margin: { left: this.margin, right: this.margin },
      didParseCell: (hookData) => {
        if (hookData.section === 'body' && hookData.column.index === 1) {
          hookData.cell.styles.fontStyle = 'bold';
        }
      },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 8;
    return { discountTotal };
  }

  private addSummary(
    quotation: Quotation,
    currencyCode: string,
    discountTotal: number,
    translations: PDFTranslations,
  ): void {
    const boxWidth = 85;
    const x = this.pageWidth - this.margin - boxWidth;
    const y = this.currentY;
    const boxHeight = 52;

    this.doc.setFillColor(248, 250, 252);
    this.doc.setDrawColor(226, 232, 240);
    this.doc.rect(x, y, boxWidth, boxHeight, 'FD');

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(10);
    this.drawText(this.copy.summary, x + 5, y + 7);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);

    const rows = [
      {
        label: translations.subtotal,
        value: this.formatCurrency(Number(quotation.subtotal || 0), currencyCode),
      },
      { label: this.copy.discountTotal, value: discountTotal > 0 ? this.formatCurrency(discountTotal, currencyCode) : this.copy.notAvailable },
      {
        label: translations.tax,
        value: this.formatCurrency(Number(quotation.tax || 0), currencyCode),
      },
    ];

    let cursorY = y + 14;
    for (const row of rows) {
      this.drawText(row.label, x + 5, cursorY);
      this.drawText(row.value, x + boxWidth - 5, cursorY, { align: 'right' });
      cursorY += 6;
    }

    this.doc.setDrawColor(203, 213, 225);
    this.doc.line(x + 5, cursorY - 2, x + boxWidth - 5, cursorY - 2);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(11);
    this.drawText(translations.total, x + 5, cursorY + 4);
    this.drawText(
      this.formatCurrency(Number(quotation.total || 0), currencyCode),
      x + boxWidth - 5,
      cursorY + 4,
      { align: 'right' },
    );

    this.currentY = y + boxHeight + 4;
  }

  private addNotes(quotation: Quotation, translations: PDFTranslations): void {
    if (!quotation.notes) {
      return;
    }

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(10);
    this.drawText(translations.notes, this.margin, this.currentY);
    this.currentY += 6;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8.5);
    this.doc.setTextColor(71, 85, 105);
    const lines = this.doc.splitTextToSize(quotation.notes, this.pageWidth - this.margin * 2);
    this.doc.text(lines, this.margin, this.currentY);
    this.currentY += lines.length * 4 + 4;
    this.doc.setTextColor(17, 24, 39);
  }

  private addFooter(translations: PDFTranslations, qrBase64?: string | null): void {
    const footerY = this.pageHeight - 24;

    if (qrBase64) {
      try {
        this.doc.addImage(qrBase64, 'PNG', this.margin, footerY - 12, 18, 18);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(7);
        this.doc.setTextColor(100, 116, 139);
        this.drawText(this.copy.siteQrLabel, this.margin + 9, footerY + 9, {
          align: 'center',
        });
      } catch {
        // ignore QR rendering failures
      }
    }

    this.doc.setFont('helvetica', 'italic');
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 116, 139);
    this.drawText(translations.footer || this.copy.generatedBy, this.pageWidth / 2, footerY + 2, {
      align: 'center',
    });
    this.drawText(
      `${translations.page} ${this.doc.getCurrentPageInfo().pageNumber}`,
      this.pageWidth / 2,
      footerY + 7,
      { align: 'center' },
    );
    this.doc.setTextColor(17, 24, 39);
  }

  public async generatePDF(
    quotation: Quotation,
    details: QuotationDetail[],
    translations: PDFTranslations,
  ): Promise<void> {
    this.resetDocument();
    await this.loadCompanySettings();
    const qrBase64 = await this.loadQRCode();
    const currencyCode = quotation.warehouse?.currency?.code || 'MXN';

    await this.addHeader(quotation, translations);
    this.addInfoCards(quotation);
    const { discountTotal } = this.addProductsTable(details, currencyCode, translations);
    this.addSummary(quotation, currencyCode, discountTotal, translations);
    this.addNotes(quotation, translations);
    this.addFooter(translations, qrBase64);

    this.doc.save(`cotizacion-${quotation.code}.pdf`);
  }

  public async openPDF(
    quotation: Quotation,
    details: QuotationDetail[],
    translations: PDFTranslations,
  ): Promise<void> {
    this.resetDocument();
    await this.loadCompanySettings();
    const qrBase64 = await this.loadQRCode();
    const currencyCode = quotation.warehouse?.currency?.code || 'MXN';

    await this.addHeader(quotation, translations);
    this.addInfoCards(quotation);
    const { discountTotal } = this.addProductsTable(details, currencyCode, translations);
    this.addSummary(quotation, currencyCode, discountTotal, translations);
    this.addNotes(quotation, translations);
    this.addFooter(translations, qrBase64);

    const pdfBlob = this.doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  }
}

export const quotationPDFService = new QuotationPDFService();
