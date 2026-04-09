import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PurchaseOrder, PurchaseOrderDetail } from '@/types/purchase-order';
import { companySettingsService } from '@/services/company-settings.service';
import type { CompanySettings } from '@/types/company-settings';
import { API_BASE_URL } from '@/lib/config';

export interface POPDFTranslations {
  title: string;
  code: string;
  date: string;
  provider: string;
  warehouse: string;
  document: string;
  deliveryDate: string;
  status: string;
  product: string;
  sku: string;
  quantity: string;
  price: string;
  subtotal: string;
  total: string;
  footer: string;
  notes: string;
  page: string;
}

const STATUS_COLORS: Record<string, [number, number, number]> = {
  PENDING:   [234, 179,   8],
  APPROVED:  [ 34, 197,  94],
  REJECTED:  [239,  68,  68],
  CANCELLED: [107, 114, 128],
  COMPLETED: [ 59, 130, 246],
};

export class PurchaseOrderPDFService {
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

  private getSafeText(value: unknown, fallback = '—'): string {
    if (typeof value === 'string') return value.trim() || fallback;
    if (typeof value === 'number') return Number.isFinite(value) ? String(value) : fallback;
    if (value === null || value === undefined) return fallback;
    return String(value).trim() || fallback;
  }

  private drawText(value: unknown, x: number, y: number, options?: Parameters<jsPDF['text']>[3]): void {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    this.doc.text(this.getSafeText(value), x, y, options);
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  }

  private formatDate(date: string): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) return this.getSafeText(date);
    return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  private async loadCompanySettings(): Promise<void> {
    try { this.companySettings = await companySettingsService.get(); }
    catch { this.companySettings = null; }
  }

  private getLogoFullUrl(logoUrl: string | null): string | null {
    if (!logoUrl) return null;
    if (logoUrl.startsWith('http')) return logoUrl;
    return `${API_BASE_URL.replace(/\/$/, '')}${logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`}`;
  }

  private async addLogo(): Promise<void> {
    if (!this.companySettings?.logoUrl) return;
    const logoUrl = this.getLogoFullUrl(this.companySettings.logoUrl);
    if (!logoUrl) return;
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve) => {
        img.onload = () => {
          try {
            const maxW = 40, maxH = 25;
            let w = img.width, h = img.height;
            if (w > maxW) { h = h * maxW / w; w = maxW; }
            if (h > maxH) { w = w * maxH / h; h = maxH; }
            this.doc.addImage(img, 'JPEG', this.pageWidth - this.margin - w, this.currentY, w, h);
          } catch { /* skip */ }
          resolve();
        };
        img.onerror = () => resolve();
        img.src = logoUrl;
      });
    } catch { /* skip */ }
  }

  private async addHeader(po: PurchaseOrder, t: POPDFTranslations): Promise<void> {
    await this.addLogo();

    // Datos de empresa
    if (this.companySettings) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      if (this.companySettings.name) {
        this.drawText(this.companySettings.name, this.margin, this.currentY);
        this.currentY += 6;
      }
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100, 100, 100);
      if (this.companySettings.address) { this.drawText(this.companySettings.address, this.margin, this.currentY); this.currentY += 4; }
      if (this.companySettings.phone)   { this.drawText(`Tel: ${this.companySettings.phone}`, this.margin, this.currentY); this.currentY += 4; }
      if (this.companySettings.taxId)   { this.drawText(`RFC: ${this.companySettings.taxId}`, this.margin, this.currentY); this.currentY += 4; }
      this.doc.setTextColor(0, 0, 0);
      this.currentY += 8;
    }

    // Título
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.drawText(this.getSafeText(t.title, 'ORDEN DE COMPRA').toUpperCase(), this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 12;

    // Datos en dos columnas
    this.doc.setFontSize(9);
    const L = this.margin;
    const R = this.pageWidth / 2 + 10;

    const row = (label: string, val: string, col: 'L' | 'R') => {
      const x = col === 'L' ? L : R;
      this.doc.setFont('helvetica', 'bold');
      this.drawText(`${label}:`, x, this.currentY);
      this.doc.setFont('helvetica', 'normal');
      this.drawText(val, x + 28, this.currentY);
    };

    row(t.code, po.code, 'L');
    row(t.date, this.formatDate(po.date), 'R');
    this.currentY += 6;

    row(t.deliveryDate, po.expected_delivery_date ? this.formatDate(po.expected_delivery_date) : '—', 'L');
    row(t.document, this.getSafeText(po.document), 'R');
    this.currentY += 6;

    // Estado con color
    const statusColor = STATUS_COLORS[po.status] || [107, 114, 128];
    this.doc.setFont('helvetica', 'bold');
    this.drawText(`${t.status}:`, L, this.currentY);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...statusColor);
    this.drawText(po.status, L + 28, this.currentY);
    this.doc.setTextColor(0, 0, 0);
    this.currentY += 12;
  }

  private addProviderInfo(po: PurchaseOrder, t: POPDFTranslations): void {
    // Banda gris igual que el bloque de cliente en ventas
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(this.margin, this.currentY - 4, this.pageWidth - 2 * this.margin, 22, 'F');

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.drawText(`${t.provider}:`, this.margin + 5, this.currentY);
    this.currentY += 6;

    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.drawText(po.provider?.name, this.margin + 5, this.currentY);

    if (po.warehouse?.name) {
      this.doc.setFont('helvetica', 'bold');
      this.drawText(`${t.warehouse}:`, this.pageWidth / 2, this.currentY);
      this.doc.setFont('helvetica', 'normal');
      this.drawText(po.warehouse.name, this.pageWidth / 2 + 28, this.currentY);
    }
    this.currentY += 14;
  }

  private addProductsTable(details: PurchaseOrderDetail[], t: POPDFTranslations): void {
    const tableData = details.map(d => {
      const qty   = Number(d.quantity);
      const price = Number(d.price);
      const sub   = qty * price;
      return [
        this.getSafeText(d.product?.name),
        this.getSafeText(d.product?.sku),
        `${qty} ${d.product?.measurement_unit?.code || ''}`,
        this.formatCurrency(price),
        this.formatCurrency(sub),
      ];
    });

    autoTable(this.doc, {
      startY: this.currentY,
      head: [[t.product, t.sku, t.quantity, t.price, t.subtotal]],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center',
      },
      bodyStyles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 'auto', halign: 'left', overflow: 'linebreak' },
        1: { cellWidth: 22, halign: 'center' },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 28, halign: 'right' },
        4: { cellWidth: 28, halign: 'right' },
      },
      margin: { left: this.margin, right: this.margin },
      tableWidth: 'auto',
      styles: { overflow: 'linebreak' },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 6;
  }

  private addTotal(details: PurchaseOrderDetail[], t: POPDFTranslations): void {
    const total = details.reduce((s, d) => s + Number(d.quantity) * Number(d.price), 0);
    const rightX = this.pageWidth - this.margin;
    const labelX = rightX - 45;

    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(labelX - 10, this.currentY - 2, rightX, this.currentY - 2);

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.drawText(`${t.total}:`, labelX, this.currentY + 2, { align: 'right' });
    this.drawText(this.formatCurrency(total), rightX, this.currentY + 2, { align: 'right' });
    this.currentY += 12;
  }

  private addNotes(po: PurchaseOrder, t: POPDFTranslations): void {
    if (!po.notes?.trim()) return;
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.drawText(`${t.notes}:`, this.margin, this.currentY);
    this.currentY += 5;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(80, 80, 80);
    const lines = this.doc.splitTextToSize(po.notes, this.pageWidth - 2 * this.margin);
    this.doc.text(lines, this.margin, this.currentY);
    this.doc.setTextColor(0, 0, 0);
    this.currentY += lines.length * 5 + 6;
  }

  private addFooter(t: POPDFTranslations): void {
    const footerY = this.pageHeight - 20;
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    this.doc.setFont('helvetica', 'italic');
    const footerText = t.footer || 'Documento generado automáticamente';
    if (footerText) this.drawText(footerText, this.pageWidth / 2, footerY, { align: 'center' });
    this.drawText(
      `${this.getSafeText(t.page, 'Página')} ${this.doc.getCurrentPageInfo().pageNumber}`,
      this.pageWidth / 2, footerY + 5, { align: 'center' }
    );
    this.doc.setTextColor(0, 0, 0);
  }

  public async generatePDF(po: PurchaseOrder, details: PurchaseOrderDetail[], t: POPDFTranslations): Promise<void> {
    this.resetDocument();
    await this.loadCompanySettings();
    await this.addHeader(po, t);
    this.addProviderInfo(po, t);
    this.addProductsTable(details, t);
    this.addTotal(details, t);
    this.addNotes(po, t);
    this.addFooter(t);
    this.doc.save(`orden-compra-${po.code}.pdf`);
  }

  public async openPDF(po: PurchaseOrder, details: PurchaseOrderDetail[], t: POPDFTranslations): Promise<void> {
    this.resetDocument();
    await this.loadCompanySettings();
    await this.addHeader(po, t);
    this.addProviderInfo(po, t);
    this.addProductsTable(details, t);
    this.addTotal(details, t);
    this.addNotes(po, t);
    this.addFooter(t);
    const url = URL.createObjectURL(this.doc.output('blob'));
    window.open(url, '_blank');
  }
}

export const purchaseOrderPDFService = new PurchaseOrderPDFService();
