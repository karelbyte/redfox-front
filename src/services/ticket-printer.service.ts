import { Sale, SaleDetail } from '@/types/sale';
import { Client } from '@/types/client';

export interface TicketData {
  sale: Sale;
  saleDetails: SaleDetail[];
  client: Client | null;
  cashierName?: string;
  paymentMethod: 'cash' | 'card';
  cashAmount?: number;
  change?: number;
}

export class TicketPrinterService {
  private readonly LINE_WIDTH = 32; // Ancho típico para impresoras de 70mm
  private readonly BUSINESS_NAME = 'NITRO STORE';
  private readonly BUSINESS_ADDRESS = 'Av. Principal #123';
  private readonly BUSINESS_PHONE = '+1 234 567 8900';
  private readonly BUSINESS_TAX_ID = 'TAX-123456789';

  /**
   * Genera el contenido del ticket en formato texto
   */
  generateTicketContent(data: TicketData): string {
    const lines: string[] = [];
    
    // Encabezado
    lines.push(this.centerText(this.BUSINESS_NAME));
    lines.push(this.centerText(this.BUSINESS_ADDRESS));
    lines.push(this.centerText(this.BUSINESS_PHONE));
    lines.push(this.centerText(`Tax ID: ${this.BUSINESS_TAX_ID}`));
    lines.push('');
    lines.push(this.repeatChar('-', this.LINE_WIDTH));
    
    // Información de la venta
    lines.push(`Ticket: ${data.sale.code}`);
    lines.push(`Date: ${new Date(data.sale.created_at).toLocaleString()}`);
    lines.push(`Cashier: ${data.cashierName || 'POS System'}`);
    lines.push(`Client: ${data.client?.name || 'Walk-in Customer'}`);
    lines.push('');
    lines.push(this.repeatChar('-', this.LINE_WIDTH));
    
    // Productos
    lines.push('PRODUCTS:');
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
      
      // Nombre del producto (truncado si es muy largo)
      const nameLine = this.truncateText(productName, this.LINE_WIDTH - 15);
      lines.push(nameLine);
      
      // Cantidad y precio
      const quantityPriceLine = `${quantity} x $${price.toFixed(2)} = $${itemTotal.toFixed(2)}`;
      lines.push(this.padLeft(quantityPriceLine, this.LINE_WIDTH));
      lines.push('');
    });
    
    lines.push(this.repeatChar('-', this.LINE_WIDTH));
    
    // Totales
    const total = subtotal + totalTax;
    
    lines.push(this.formatLine('Subtotal:', `$${subtotal.toFixed(2)}`));
    lines.push(this.formatLine('Tax:', `$${totalTax.toFixed(2)}`));
    lines.push(this.formatLine('TOTAL:', `$${total.toFixed(2)}`));
    lines.push('');
    
    // Información de pago
    lines.push(`Payment Method: ${data.paymentMethod.toUpperCase()}`);
    if (data.paymentMethod === 'cash' && data.cashAmount) {
      lines.push(this.formatLine('Cash Received:', `$${data.cashAmount.toFixed(2)}`));
      if (data.change !== undefined) {
        lines.push(this.formatLine('Change:', `$${data.change.toFixed(2)}`));
      }
    }
    lines.push('');
    
    // Pie de página
    lines.push(this.repeatChar('-', this.LINE_WIDTH));
    lines.push(this.centerText('Thank you for your purchase!'));
    lines.push(this.centerText('Please come back soon'));
    lines.push('');
    lines.push(this.centerText('Powered by RedFox POS'));
    lines.push('');
    lines.push(this.centerText(new Date().toLocaleDateString()));
    lines.push('');
    lines.push(''); // Espacio extra para cortar el ticket
    
    return lines.join('\n');
  }

  /**
   * Imprime el ticket usando la API de impresión del navegador
   */
  async printTicket(data: TicketData): Promise<void> {
    try {
      const ticketContent = this.generateTicketContent(data);
      
      // Crear una ventana de impresión
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('No se pudo abrir la ventana de impresión');
      }

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
          <div class="ticket-content">${ticketContent}</div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Esperar a que se cargue el contenido
      await new Promise(resolve => {
        printWindow.onload = resolve;
      });

      // Imprimir
      printWindow.print();
      
      // Cerrar la ventana después de un breve delay
      setTimeout(() => {
        printWindow.close();
      }, 1000);

    } catch (error) {
      console.error('Error printing ticket:', error);
      throw new Error('No se pudo imprimir el ticket');
    }
  }

  /**
   * Descarga el ticket como archivo de texto
   */
  downloadTicket(data: TicketData): void {
    const ticketContent = this.generateTicketContent(data);
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