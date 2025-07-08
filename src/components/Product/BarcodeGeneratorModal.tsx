'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Barcode from 'react-barcode';
import { Input, Btn } from '@/components/atoms';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface BarcodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  productCode: string;
  productName: string;
}

export default function BarcodeGeneratorModal({
  isOpen,
  onClose,
  productCode,
  productName,
}: BarcodeGeneratorModalProps) {
  const t = useTranslations('pages.products.barcodeGenerator');
  const [quantity, setQuantity] = useState(1);
  const [generatedBarcodes, setGeneratedBarcodes] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleGenerate = () => {
    setGeneratedBarcodes(true);
  };

  const handleClose = () => {
    setGeneratedBarcodes(false);
    setQuantity(1);
    onClose();
  };

  const handlePrint = () => {
    if (printRef.current) {
      // Generar el SVG del código de barras
      const barcodeSVG = printRef.current.querySelector('svg')?.outerHTML || '';
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Códigos de Barras - ${productName}</title>
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  font-family: Arial, sans-serif;
                  background: white;
                }
                .barcode-grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                  gap: 10px;
                }
                .barcode-item {
                  border: 1px solid #ccc;
                  padding: 10px;
                  text-align: center;
                  page-break-inside: avoid;
                  width: 200px;
                  margin: 0 auto;
                }
                .product-name {
                  font-size: 12px;
                  font-weight: bold;
                  margin-bottom: 5px;
                  color: black;
                }
                .barcode-code {
                  font-size: 10px;
                  font-family: monospace;
                  margin-top: 5px;
                  color: black;
                }
                .barcode-svg {
                  margin: 5px 0;
                  max-width: 100%;
                  overflow: hidden;
                }
                .barcode-svg svg {
                  max-width: 100%;
                  height: auto;
                }
                @media print {
                  .barcode-item {
                    margin: 5px;
                  }
                }
              </style>
            </head>
            <body>
              <div class="barcode-grid">
                ${Array.from({ length: quantity }, () => `
                  <div class="barcode-item">
                    <div class="product-name">${productName}</div>
                    <div class="barcode-svg">${barcodeSVG}</div>
                    <div class="barcode-code">${productCode}</div>
                  </div>
                `).join('')}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  const renderBarcodes = () => {
    const barcodes = [];
    for (let i = 0; i < quantity; i++) {
      barcodes.push(
        <div key={i} className="flex flex-col items-center p-4 border border-gray-200 rounded-lg bg-white w-full max-w-xs">
          <div className="text-sm font-medium text-gray-900 mb-2 text-center">
            {productName}
          </div>
          <div className="mb-2 w-full flex justify-center overflow-hidden">
            <Barcode
              value={productCode}
              width={1}
              height={30}
              fontSize={10}
              margin={0}
              displayValue={false}
            />
          </div>
          <div className="text-xs text-gray-600 font-mono">
            {productCode}
          </div>
        </div>
      );
    }
    return barcodes;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500"
              onClick={handleClose}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
                {t('title')}
              </h3>

              {!generatedBarcodes ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>{t('productInfo')}:</strong> {productName}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>{t('productCode')}:</strong> {productCode}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('quantityLabel')}
                    </label>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      max="100"
                      className="w-32"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('quantityHelp')}
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Btn variant="ghost" onClick={handleClose}>
                      {t('cancel')}
                    </Btn>
                    <Btn onClick={handleGenerate}>
                      {t('generate')}
                    </Btn>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium text-gray-900">
                      {t('generatedTitle')} ({quantity} {t('barcodes')})
                    </h4>
                    <div className="flex space-x-2">
                      <Btn variant="ghost" onClick={handlePrint}>
                        {t('print')}
                      </Btn>
                      <Btn variant="ghost" onClick={() => setGeneratedBarcodes(false)}>
                        {t('back')}
                      </Btn>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                    {renderBarcodes()}
                  </div>
                  
                  {/* Contenedor oculto para obtener el SVG */}
                  <div ref={printRef} className="hidden">
                    <Barcode
                      value={productCode}
                      width={1}
                      height={30}
                      fontSize={10}
                      margin={0}
                      displayValue={false}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 