import { Sale, SaleDetail } from '@/types/sale';
import { Client } from '@/types/client';
import { companySettingsService } from '@/services/company-settings.service';
import type { CompanySettings } from '@/types/company-settings';

export interface TicketData {
  sale: Sale;
  saleDetails: SaleDetail[];
  client: Client | null;
  cashierName?: string;
  paymentMethod: 'cash' | 'card';
  cashAmount?: number;
  change?: number;
  locale?: string;
  labels?: {
    ticket: string;
    date: string;
    cashier: string;
    client: string;
    products: string;
    subtotal: string;
    tax: string;
    total: string;
    paymentMethod: string;
    cashReceived: string;
    change: string;
    thanks: string;
    comeBack: string;
    powered: string;
    walkIn: string;
    posSystem: string;
  };
}

export class TicketPrinterService {
  private readonly LINE_WIDTH = 32;

  private companySettingsCache: {
    value: CompanySettings | null;
    fetchedAt: number;
    pending?: Promise<CompanySettings | null>;
  } | null = null;

  private readonly COMPANY_SETTINGS_TTL_MS = 5 * 60 * 1000; // 5 min

  /** URL absoluta del logo para que cargue en la ventana de impresión (about:blank). */
  private getLogoFullUrl(logoUrl: string | null): string | null {
    if (!logoUrl) return null;
    if (logoUrl.startsWith('http')) return logoUrl;
    const base =
      (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_URL_API) ||
      'https://nitro-api-app-production.up.railway.app';
    const baseClean = base.replace(/\/$/, '');
    const path = logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`;
    return `${baseClean}${path}`;
  }

  private async getCompanySettingsCached(): Promise<CompanySettings | null> {
    const now = Date.now();

    if (
      this.companySettingsCache?.value &&
      now - this.companySettingsCache.fetchedAt < this.COMPANY_SETTINGS_TTL_MS
    ) {
      return this.companySettingsCache.value;
    }

    if (this.companySettingsCache?.pending) {
      return this.companySettingsCache.pending;
    }

    const pending = (async () => {
      try {
        const settings = await companySettingsService.get();
        this.companySettingsCache = { value: settings, fetchedAt: Date.now() };
        return settings;
      } catch {
        // No bloquear impresión si falla el fetch
        this.companySettingsCache = { value: null, fetchedAt: Date.now() };
        return null;
      } finally {
        if (this.companySettingsCache) {
          delete this.companySettingsCache.pending;
        }
      }
    })();

    this.companySettingsCache = {
      value: this.companySettingsCache?.value ?? null,
      fetchedAt: this.companySettingsCache?.fetchedAt ?? 0,
      pending,
    };

    return pending;
  }

  private buildBusinessHeaderLines(
    settings: CompanySettings | null,
    locale: string,
  ): string[] {
    const lines: string[] = [];
    const name = settings?.name || settings?.legalName || '';
    const address = settings?.address || '';
    const phone = settings?.phone || '';
    const taxId = settings?.taxId || '';

    if (name) lines.push(this.centerText(name));
    if (address) lines.push(this.centerText(address));
    if (phone) lines.push(this.centerText(phone));

    if (taxId) {
      const taxLabel = locale.startsWith('es') ? 'RFC' : 'Tax ID';
      lines.push(this.centerText(`${taxLabel}: ${taxId}`));
    }

    return lines;
  }

  async generateTicketContent(data: TicketData): Promise<string> {
    const locale = data.locale || 'en';
    const companySettings = await this.getCompanySettingsCached();

    const labels =
      data.labels ??
      {
        ticket: 'Ticket',
        date: 'Date',
        cashier: 'Cashier',
        client: 'Client',
        products: 'PRODUCTS:',
        subtotal: 'Subtotal:',
        tax: 'Tax:',
        total: 'TOTAL:',
        paymentMethod: 'Payment Method:',
        cashReceived: 'Cash Received:',
        change: 'Change:',
        thanks: 'Thank you for your purchase!',
        comeBack: 'Please come back soon',
        powered: 'Powered by RedFox POS',
        walkIn: 'Walk-in Customer',
        posSystem: 'POS System',
      };

    const lines: string[] = [];
    
    const headerLines = this.buildBusinessHeaderLines(companySettings, locale);
    lines.push(...headerLines);
    lines.push('');
    lines.push(this.repeatChar('-', this.LINE_WIDTH));
    
    lines.push(`${labels.ticket}: ${data.sale.code}`);
    lines.push(
      `${labels.date}: ${new Date(data.sale.created_at).toLocaleString(locale)}`
    );
    lines.push(
      `${labels.cashier}: ${data.cashierName || labels.posSystem}`
    );
    lines.push(
      `${labels.client}: ${data.client?.name || labels.walkIn}`
    );
    lines.push('');
    lines.push(this.repeatChar('-', this.LINE_WIDTH));
    
    lines.push(labels.products);
    lines.push('');
    
    let subtotal = 0;
    let totalTax = 0;
    
    data.saleDetails.forEach((detail) => {
      const productName = detail.product.name;
      const quantity = Number(detail.quantity);
      const price = Number(detail.price);
      const itemTotal = Number(quantity) * Number(price);
      const itemTax = itemTotal * (Number(detail.product.tax.value) / 100);
      
      subtotal += itemTotal;
      totalTax += itemTax;
      
      const nameLine = this.truncateText(productName, this.LINE_WIDTH - 15);
      lines.push(nameLine);
      
      const quantityPriceLine = `${quantity} x $${price.toFixed(2)} = $${itemTotal.toFixed(2)}`;
      lines.push(this.padLeft(quantityPriceLine, this.LINE_WIDTH));
      lines.push('');
    });
    
    lines.push(this.repeatChar('-', this.LINE_WIDTH));
    
    const total = subtotal + totalTax;
    
    lines.push(this.formatLine(labels.subtotal, `$${subtotal.toFixed(2)}`));
    lines.push(this.formatLine(labels.tax, `$${totalTax.toFixed(2)}`));
    lines.push(this.formatLine(labels.total, `$${total.toFixed(2)}`));
    lines.push('');
    
    lines.push(`${labels.paymentMethod} ${data.paymentMethod.toUpperCase()}`);
    if (data.paymentMethod === 'cash' && data.cashAmount) {
      lines.push(this.formatLine(labels.cashReceived, `$${data.cashAmount.toFixed(2)}`));
      if (data.change !== undefined) {
        lines.push(this.formatLine(labels.change, `$${data.change.toFixed(2)}`));
      }
    }
    lines.push('');
    
    lines.push(this.repeatChar('-', this.LINE_WIDTH));
    lines.push(this.centerText(labels.thanks));
    lines.push(this.centerText(labels.comeBack));
    lines.push('');
    lines.push(this.centerText(labels.powered));
    lines.push('');
    lines.push(this.centerText(new Date().toLocaleDateString(locale)));
    lines.push('');
    lines.push('');
    
    return lines.join('\n');
  }

  /**
   * Imprime el ticket usando la API de impresión del navegador
   */
  async printTicket(data: TicketData): Promise<void> {
    try {
      const ticketContent = await this.generateTicketContent(data);
      const companySettings = await this.getCompanySettingsCached();

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        // Código de error genérico; el mensaje visible lo maneja el i18n del caller
        throw new Error('TICKET_PRINT_WINDOW_ERROR');
      }

      const logoFullUrl = this.getLogoFullUrl(companySettings?.logoUrl ?? null);
      const logoHtml =
        logoFullUrl
          ? `<div style="display:block;margin-bottom:8px;position:relative;width:100%;height:20mm;"><img src="${logoFullUrl}" style="display:block;position:absolute;right:25mm;width:30mm;height:20mm;object-fit:contain;object-position:center;" alt="" /></div>`
          : '';

      // Crear el contenido HTML para imprimir
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ticket - ${data.sale.code}</title>
          <style>
            @media print {
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.2;
                margin: 0;
                padding: 10px;
                width: 70mm;
                max-width: 70mm;
              }
              .ticket-content {
                white-space: pre-wrap;
                word-wrap: break-word;
                width: 100%;
                max-width: 70mm;
              }
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.2;
              margin: 0;
              padding: 10px;
              width: 70mm;
              max-width: 70mm;
            }
            .ticket-content {
              white-space: pre-wrap;
              word-wrap: break-word;
              width: 100%;
              max-width: 70mm;
            }
          </style>
        </head>
        <body>
          <div class="ticket-content">${logoHtml}<pre>${ticketContent}</pre></div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      await new Promise<void>(resolve => {
        printWindow.onload = () => resolve();
      });

      // Dar tiempo a que el logo (img) termine de cargar antes de imprimir
      if (logoFullUrl) {
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      printWindow.print();
      
      // Cerrar la ventana después de un breve delay
      setTimeout(() => {
        printWindow.close();
      }, 1000);

    } catch (error) {
      console.error('Error printing ticket:', error);
      // Código de error genérico; el mensaje visible lo maneja el i18n del caller
      throw new Error('TICKET_PRINT_ERROR');
    }
  }

  /**
   * Descarga el ticket como archivo de texto
   */
  async downloadTicket(data: TicketData): Promise<void> {
    const ticketContent = await this.generateTicketContent(data);
    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${data.sale.code}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Métodos auxiliares
  private centerText(text: string): string {
    const padding = Math.max(0, Math.floor((this.LINE_WIDTH - text.length) / 2));
    return ' '.repeat(padding) + text;
  }

  private padLeft(text: string, width: number): string {
    return text.padStart(width);
  }

  private repeatChar(char: string, count: number): string {
    return char.repeat(count);
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }

  private formatLine(label: string, value: string): string {
    const labelWidth = 15; // Ancho fijo para las etiquetas
    const paddedLabel = label.padEnd(labelWidth);
    const paddedValue = value.padStart(this.LINE_WIDTH - labelWidth);
    return paddedLabel + paddedValue;
  }
}

export const ticketPrinterService = new TicketPrinterService(); 