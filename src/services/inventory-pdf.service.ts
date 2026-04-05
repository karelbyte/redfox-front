import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InventoryItem } from '@/types/inventory';

interface InventoryPDFTranslations {
  title: string;
  warehouse: string;
  generatedOn: string;
  page: string;
  footer: string;
  // table headers
  product: string;
  sku: string;
  brand: string;
  category: string;
  strategy: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  taxRate: string;
  subtotal: string;
  // summary
  totalProducts: string;
  totalUnits: string;
  warehouseValue: string;
  // strategy labels
  fifo: string;
  fefo: string;
  average: string;
}

export class InventoryPDFService {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin = 14;
  private currentY = 14;
  private locale: string;

  constructor(locale = 'es') {
    this.doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.locale = locale;
  }

  private fmt(value: number, currency = 'MXN'): string {
    return new Intl.NumberFormat(this.locale === 'en' ? 'en-US' : 'es-MX', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(value);
  }

  private fmtDate(d: Date): string {
    return d.toLocaleDateString(this.locale === 'en' ? 'en-US' : 'es-MX', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  /** Calcula el valor total de un item: precio × cantidad × (1 + suma de impuestos) */
  static itemValue(item: InventoryItem): number {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    const taxRate = (item.product.taxes || []).reduce((sum, t) => sum + Number(t.value || 0), 0);
    return qty * price * (1 + taxRate / 100);
  }

  /** Calcula el valor total del almacén */
  static warehouseValue(items: InventoryItem[]): number {
    return items.reduce((sum, item) => sum + InventoryPDFService.itemValue(item), 0);
  }

  private addHeader(t: InventoryPDFTranslations, warehouseName: string, currency: string) {
    // Título
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(16);
    this.doc.setTextColor(30, 30, 30);
    this.doc.text(t.title.toUpperCase(), this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 7;

    // Almacén
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor(80, 80, 80);
    this.doc.text(`${t.warehouse}: ${warehouseName}`, this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 5;

    // Fecha
    this.doc.setFontSize(8);
    this.doc.text(`${t.generatedOn}: ${this.fmtDate(new Date())}`, this.pageWidth / 2, this.currentY, { align: 'center' });
    this.doc.setTextColor(0, 0, 0);
    this.currentY += 8;

    // Línea separadora
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 6;
  }

  private strategyLabel(strategy: string, t: InventoryPDFTranslations): string {
    if (strategy === 'fifo') return t.fifo;
    if (strategy === 'fefo') return t.fefo;
    return t.average;
  }

  private addTable(items: InventoryItem[], t: InventoryPDFTranslations, currency: string) {
    const rows = items.map(item => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const taxRate = (item.product.taxes || []).reduce((sum, tx) => sum + Number(tx.value || 0), 0);
      const subtotal = qty * price * (1 + taxRate / 100);
      const brand = typeof item.product.brand === 'object' ? (item.product.brand as any)?.description || '' : '';
      const category = typeof item.product.category === 'object' ? (item.product.category as any)?.name || '' : '';
      const unit = typeof item.product.measurement_unit === 'object' ? (item.product.measurement_unit as any)?.code || '' : '';
      const strategy = this.strategyLabel(item.product.inventory_strategy || 'average', t);

      return [
        item.product.name,
        item.product.sku,
        brand,
        category,
        strategy,
        qty.toString(),
        unit,
        this.fmt(price, currency),
        taxRate > 0 ? `${taxRate}%` : '-',
        this.fmt(subtotal, currency),
      ];
    });

    autoTable(this.doc, {
      startY: this.currentY,
      head: [[
        t.product, t.sku, t.brand, t.category, t.strategy,
        t.quantity, t.unit, t.unitPrice, t.taxRate, t.subtotal,
      ]],
      body: rows,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'center',
      },
      bodyStyles: { fontSize: 7, cellPadding: 1.8 },
      columnStyles: {
        0: { cellWidth: 'auto', halign: 'left' },   // producto
        1: { cellWidth: 20, halign: 'center' },      // sku
        2: { cellWidth: 22, halign: 'left' },        // marca
        3: { cellWidth: 22, halign: 'left' },        // categoría
        4: { cellWidth: 18, halign: 'center' },      // estrategia
        5: { cellWidth: 16, halign: 'right' },       // cantidad
        6: { cellWidth: 12, halign: 'center' },      // unidad
        7: { cellWidth: 24, halign: 'right' },       // precio unitario
        8: { cellWidth: 14, halign: 'center' },      // impuesto
        9: { cellWidth: 26, halign: 'right' },       // subtotal
      },
      margin: { left: this.margin, right: this.margin },
      styles: { overflow: 'linebreak' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 6;
  }

  private addSummary(items: InventoryItem[], t: InventoryPDFTranslations, currency: string) {
    const totalUnits = items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
    const totalValue = InventoryPDFService.warehouseValue(items);

    const rightX = this.pageWidth - this.margin;
    const labelX = rightX - 70;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8.5);
    this.doc.setTextColor(60, 60, 60);

    this.doc.text(`${t.totalProducts}:`, labelX, this.currentY, { align: 'right' });
    this.doc.text(`${items.length}`, rightX, this.currentY, { align: 'right' });
    this.currentY += 5;

    this.doc.text(`${t.totalUnits}:`, labelX, this.currentY, { align: 'right' });
    this.doc.text(totalUnits.toLocaleString(), rightX, this.currentY, { align: 'right' });
    this.currentY += 5;

    // Valor total — destacado
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(10);
    this.doc.setTextColor(30, 30, 30);
    this.doc.text(`${t.warehouseValue}:`, labelX, this.currentY, { align: 'right' });
    this.doc.text(this.fmt(totalValue, currency), rightX, this.currentY, { align: 'right' });
    this.doc.setTextColor(0, 0, 0);
  }

  private addFooter(t: InventoryPDFTranslations) {
    const footerY = this.pageHeight - 10;
    this.doc.setFont('helvetica', 'italic');
    this.doc.setFontSize(7);
    this.doc.setTextColor(140, 140, 140);
    this.doc.text(t.footer, this.pageWidth / 2, footerY, { align: 'center' });
    this.doc.setTextColor(0, 0, 0);
  }

  public generate(
    items: InventoryItem[],
    warehouseName: string,
    currency: string,
    t: InventoryPDFTranslations,
    filename?: string,
  ): void {
    this.addHeader(t, warehouseName, currency);
    this.addTable(items, t, currency);
    this.addSummary(items, t, currency);
    this.addFooter(t);

    const ts = new Date().toISOString().split('T')[0];
    this.doc.save(filename || `inventario_${warehouseName.replace(/\s+/g, '_')}_${ts}.pdf`);
  }
}
