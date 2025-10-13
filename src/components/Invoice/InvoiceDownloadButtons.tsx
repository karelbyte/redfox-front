import { useTranslations } from 'next-intl';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { Btn } from '@/components/atoms';
import { useInvoicePDF, useInvoiceXML } from '@/hooks/useInvoiceDownloads';

interface InvoicePDFButtonProps {
  invoiceId: string;
  invoiceCode: string;
}

export const InvoicePDFButton = ({ invoiceId, invoiceCode }: InvoicePDFButtonProps) => {
  const t = useTranslations('pages.invoices');
  const { downloadPDF, isLoading } = useInvoicePDF();

  return (
    <Btn
      variant="ghost"
      size="sm"
      onClick={() => downloadPDF(invoiceId)}
      disabled={isLoading}
      leftIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
      title={isLoading ? t('actions.downloadingPDF') : t('actions.downloadPDF')}
      style={{ color: '#dc2626' }}
    />
  );
};

interface InvoiceXMLButtonProps {
  invoiceId: string;
  invoiceCode: string;
}

export const InvoiceXMLButton = ({ invoiceId, invoiceCode }: InvoiceXMLButtonProps) => {
  const t = useTranslations('pages.invoices');
  const { downloadXML, isLoading } = useInvoiceXML();

  return (
    <Btn
      variant="ghost"
      size="sm"
      onClick={() => downloadXML(invoiceId)}
      disabled={isLoading}
      leftIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
      title={isLoading ? t('actions.downloadingXML') : t('actions.downloadXML')}
      style={{ color: '#2563eb' }}
    />
  );
};
