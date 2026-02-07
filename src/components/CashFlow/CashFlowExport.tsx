"use client";

import { useTranslations } from 'next-intl';
import { CashFlowSummary as CashFlowSummaryType, CashFlowMovement } from '@/types/cash-flow';
import { jsPDF } from 'jspdf';
import type { jsPDF as jsPDFType } from 'jspdf';
import 'jspdf-autotable';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { toastService } from '@/services/toast.service';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDFType;
  }
}

interface CashFlowExportProps {
  summary: CashFlowSummaryType;
  movements: CashFlowMovement[];
  isLoading?: boolean;
}

export default function CashFlowExport({ summary, movements, isLoading }: CashFlowExportProps) {
  const t = useTranslations('cashFlow');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-MX');
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      doc.setFontSize(20);
      doc.text(t('title'), pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      doc.setFontSize(10);
      doc.text(`${t('export.generatedOn')}: ${new Date().toLocaleDateString('es-MX')}`, 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.text(t('summary.totalIncome'), 20, yPosition);
      doc.text(formatCurrency(summary.totalIncome), pageWidth - 20, yPosition, { align: 'right' });
      yPosition += 8;

      doc.text(t('summary.totalExpenses'), 20, yPosition);
      doc.text(formatCurrency(summary.totalExpenses), pageWidth - 20, yPosition, { align: 'right' });
      yPosition += 8;

      doc.text(t('summary.netCashFlow'), 20, yPosition);
      doc.text(formatCurrency(summary.netCashFlow), pageWidth - 20, yPosition, { align: 'right' });
      yPosition += 8;

      doc.text(t('summary.projectedBalance'), 20, yPosition);
      doc.text(formatCurrency(summary.projectedBalance), pageWidth - 20, yPosition, { align: 'right' });
      yPosition += 15;

      doc.setFontSize(11);
      doc.text(t('table.description'), 20, yPosition);
      yPosition += 10;

      doc.setFontSize(9);
      const tableData = movements.slice(0, 20).map((movement) => [
        formatDate(movement.date),
        t(`movements.type.${movement.type}`),
        movement.description.substring(0, 30),
        formatCurrency(movement.amount),
        formatCurrency(movement.balance),
      ]);

      doc.autoTable({
        head: [
          [
            t('table.date'),
            t('table.type'),
            t('table.description'),
            t('table.amount'),
            t('table.balance'),
          ],
        ],
        body: tableData,
        startY: yPosition,
        margin: 20,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold',
        },
      });

      doc.save(`cash-flow-${new Date().toISOString().split('T')[0]}.pdf`);
      toastService.success(t('export.success'));
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toastService.error(t('export.error'));
    }
  };

  const exportToCSV = () => {
    try {
      const headers = [
        t('table.date'),
        t('table.type'),
        t('table.description'),
        t('table.amount'),
        t('table.balance'),
      ];

      const rows = movements.map((movement) => [
        formatDate(movement.date),
        t(`movements.type.${movement.type}`),
        movement.description,
        movement.amount,
        movement.balance,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `cash-flow-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toastService.success(t('export.success'));
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toastService.error(t('export.error'));
    }
  };

  const exportToJSON = () => {
    try {
      const data = {
        generatedAt: new Date().toISOString(),
        summary,
        movements,
      };

      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `cash-flow-${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toastService.success(t('export.success'));
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      toastService.error(t('export.error'));
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={exportToPDF}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
        title="Export to PDF"
      >
        <DocumentArrowDownIcon className="w-4 h-4" />
        PDF
      </button>
      <button
        onClick={exportToCSV}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
        title="Export to CSV"
      >
        <DocumentArrowDownIcon className="w-4 h-4" />
        CSV
      </button>
      <button
        onClick={exportToJSON}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
        title="Export to JSON"
      >
        <DocumentArrowDownIcon className="w-4 h-4" />
        JSON
      </button>
    </div>
  );
}
