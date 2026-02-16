'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { saleService } from '@/services/sales.service';
import { clientsService } from '@/services/clients.service';
import { inventoryService, InventoryProduct } from '@/services/inventory.service';
import { cashRegisterService } from '@/services/cash-register.service';
import { ticketPrinterService } from '@/services/ticket-printer.service';
import { toastService } from '@/services/toast.service';
import { SaleFormData } from '@/types/sale';
import { Client } from '@/types/client';
import { CashRegister } from '@/types/cash-register';
import Drawer from '@/components/Drawer/Drawer';
import ClientForm from '@/components/Client/ClientForm';
import { ClientFormRef } from '@/components/Client/ClientForm';
import POSCart from '@/components/POS/POSCart';
import ProductsGrid from '@/components/POS/ProductsGrid';
import PaymentModal from '@/components/POS/PaymentModal';
import CashRegisterModal from '@/components/POS/CashRegisterModal';
import CashDrawerModal from '@/components/POS/CashDrawerModal';
import CashBalance from '@/components/POS/CashBalance';
import { useCart } from '@/context/CartContext';

export default function POSPage() {
  const t = useTranslations('pages.pos');
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<InventoryProduct[]>([]);
  const [showClientDrawer, setShowClientDrawer] = useState(false);
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [isClientFormValid, setIsClientFormValid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentCashRegister, setCurrentCashRegister] = useState<CashRegister | null>(null);
  const [showCashRegisterModal, setShowCashRegisterModal] = useState(false);
  const [showCashDrawerModal, setShowCashDrawerModal] = useState(false);
  const [showCashBalanceDrawer, setShowCashBalanceDrawer] = useState(false);
  const [cashLoading, setCashLoading] = useState(false);
  const clientFormRef = useRef<ClientFormRef>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialFetchDone = useRef(false);

  // Hook para manejar el carrito con persistencia
  const { cart, addToCart, clearCart, getTotal, selectedClient } = useCart();

  const handleAddToCart = (product: InventoryProduct) => {
    addToCart(product);
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchProducts();
      fetchClients();
      fetchCurrentCashRegister();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search effect
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      if (searchTerm.trim()) {
        searchProducts(searchTerm);
      } else {
        fetchProducts();
      }
    }, 500); // 500ms delay

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const response = await inventoryService.getInventoryProducts(1);
      setFilteredProducts(response.data || []);
    } catch {
      toastService.error(t('messages.errorLoadingProducts'));
    } finally {
      setLoadingProducts(false);
    }
  }, [t]);

  const searchProducts = useCallback(async (term: string) => {
    try {
      setLoadingProducts(true);
      const response = await inventoryService.getInventoryProducts(1, term);
      setFilteredProducts(response.data || []);
    } catch {
      toastService.error(t('messages.errorSearchingProducts'));
    } finally {
      setLoadingProducts(false);
    }
  }, [t]);

  const fetchClients = useCallback(async () => {
    try {
      const response = await clientsService.getClients();
      setClients(response.data || []);
    } catch {
      toastService.error(t('messages.errorLoadingClients'));
    } finally {
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCurrentCashRegister = useCallback(async () => {
    try {
      const cashRegister = await cashRegisterService.getCurrentCashRegister();
      setCurrentCashRegister(cashRegister);
      
      // Si no hay caja abierta, mostrar toast informativo
      if (!cashRegister) {
        toastService.info(t('messages.noCashRegisterInfo'));
      }
    } catch {
      // No mostrar error si no hay caja activa
    }
  }, [t]);

  const handleInitializeCash = () => {
    setShowCashRegisterModal(true);
  };

  const handleCashDrawer = () => {
    setShowCashDrawerModal(true);
  };

  const handleOpenCashBalance = () => {
    setShowCashBalanceDrawer(true);
  };

  const handleCashRegisterConfirm = async (initialAmount: number, selectedCashRegister?: CashRegister) => {
    try {
      setCashLoading(true);
      
      if (currentCashRegister) {
        // Actualizar balance existente
        await cashRegisterService.updateCashRegister(currentCashRegister.id, {
          current_amount: initialAmount
        });
        toastService.success(t('messages.cashRegisterUpdated'));
      } else if (selectedCashRegister) {
        // Abrir caja existente seleccionada
        await cashRegisterService.openCashRegister(initialAmount, selectedCashRegister.name, selectedCashRegister.description);
        toastService.success(t('messages.cashRegisterOpened'));
      } else {
        // Crear y abrir nueva caja
        await cashRegisterService.openCashRegister(initialAmount, 'Caja Principal', 'Caja principal del POS');
        toastService.success(t('messages.cashRegisterInitialized'));
      }
      
      await fetchCurrentCashRegister();
      setShowCashRegisterModal(false);
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorProcessing'));
      }
    } finally {
      setCashLoading(false);
    }
  };

  const handleCashDrawerConfirm = async (data: { type: 'closing' | 'adjustment'; amount: number; description: string }) => {
    try {
      setCashLoading(true);
      
      if (!currentCashRegister) {
        toastService.error(t('messages.noCashRegister'));
        return;
      }

      // Crear transacción de caja
      await cashRegisterService.createCashTransaction({
        cash_register_id: currentCashRegister.id,
        type: data.type === 'closing' ? 'adjustment' : 'adjustment',
        amount: data.amount,
        description: data.description,
        reference: `${data.type.toUpperCase()}-${Date.now()}`,
        payment_method: 'cash'
      });

      // Si es cierre, cerrar la caja
      if (data.type === 'closing') {
        await cashRegisterService.closeCashRegister(currentCashRegister.id, data.amount, data.description);
        toastService.success(t('messages.cashRegisterClosed'));
      } else {
        toastService.success(t('messages.cashDrawerCompleted'));
      }
      
      await fetchCurrentCashRegister();
      setShowCashDrawerModal(false);
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorProcessing'));
      }
    } finally {
      setCashLoading(false);
    }
  };

  const getChange = () => {
    try {
      const total = getTotal();
      const cash = typeof cashAmount === 'number' ? cashAmount : 0;
      return cash - total;
    } catch (error) {
      console.error('Error calculating change:', error);
      return 0;
    }
  };

  const handleDownloadTicket = async () => {
    if (cart.length === 0) {
      toastService.error(t('messages.emptyCart'));
      return;
    }

    if (!selectedClient) {
      toastService.error(t('messages.selectClient'));
      return;
    }

    try {
      // Crear una venta temporal para generar el ticket
      const saleData: SaleFormData = {
        code: `TEMP-${Date.now()}`,
        destination: 'Venta POS',
        client_id: selectedClient,
        type: 'POS',
        amount: getTotal()
      };

      const sale = await saleService.createSale(saleData);

      for (const item of cart) {
        await saleService.addProductToSale(sale.id, {
          product_id: item.product.product.id,
          quantity: item.quantity,
          price: item.price,
          warehouse_id: item.product.warehouse.id
        });
      }

      await saleService.closeSale(sale.id);

      // Obtener los detalles de la venta para el ticket
      const saleDetails = await saleService.getSaleDetails(sale.id);
      
      // Obtener información del cliente
      const selectedClientData = clients.find(client => client.id === selectedClient);
      
      // Generar y descargar el ticket
      const ticketData = {
        sale: sale,
        saleDetails: saleDetails.data || [],
        client: selectedClientData || null,
        cashierName: 'POS System',
        paymentMethod: paymentMethod,
        cashAmount: paymentMethod === 'cash' ? cashAmount : undefined,
        change: paymentMethod === 'cash' ? getChange() : undefined,
        locale,
        labels: {
          ticket: t('ticket.ticket', { default: 'Ticket' }),
          date: t('ticket.date', { default: 'Date' }),
          cashier: t('ticket.cashier', { default: 'Cashier' }),
          client: t('ticket.client', { default: 'Client' }),
          products: t('ticket.products', { default: 'PRODUCTS:' }),
          subtotal: t('ticket.subtotal', { default: 'Subtotal:' }),
          tax: t('ticket.tax', { default: 'Tax:' }),
          total: t('ticket.total', { default: 'TOTAL:' }),
          paymentMethod: t('ticket.paymentMethod', { default: 'Payment Method:' }),
          cashReceived: t('ticket.cashReceived', { default: 'Cash Received:' }),
          change: t('ticket.change', { default: 'Change:' }),
          thanks: t('ticket.thanks', { default: 'Thank you for your purchase!' }),
          comeBack: t('ticket.comeBack', { default: 'Please come back soon' }),
          powered: t('ticket.powered', { default: 'Powered by RedFox POS' }),
          walkIn: t('ticket.walkIn', { default: 'Walk-in Customer' }),
          posSystem: t('ticket.posSystem', { default: 'POS System' }),
        },
      };
      
      await ticketPrinterService.downloadTicket(ticketData);
      toastService.success(t('messages.ticketDownloaded'));

      // Eliminar la venta temporal
      await saleService.deleteSale(sale.id);
      
    } catch (error) {
      console.error('Error downloading ticket:', error);
      toastService.error(t('messages.ticketDownloadError'));
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toastService.error(t('messages.emptyCart'));
      return;
    }

    if (!selectedClient) {
      toastService.error(t('messages.selectClient'));
      return;
    }

    if (paymentMethod === 'cash' && cashAmount < getTotal()) {
      toastService.error(t('messages.insufficientCash'));
      return;
    }

    try {
      setLoading(true);
      
      const saleData: SaleFormData = {
        code: `POS-${Date.now()}`,
        destination: 'Venta POS',
        client_id: selectedClient,
        type: 'POS',
        amount: getTotal()
      };

      const sale = await saleService.createSale(saleData);

      for (const item of cart) {
        await saleService.addProductToSale(sale.id, {
          product_id: item.product.product.id,
          quantity: item.quantity,
          price: item.price,
          warehouse_id: item.product.warehouse.id
        });
      }

      await saleService.closeSale(sale.id);

      // Obtener los detalles de la venta para el ticket
      const saleDetails = await saleService.getSaleDetails(sale.id);
      
      // Obtener información del cliente
      const selectedClientData = clients.find(client => client.id === selectedClient);
      
      // Generar e imprimir el ticket
      try {
        const ticketData = {
          sale: sale,
          saleDetails: saleDetails.data || [],
          client: selectedClientData || null,
          cashierName: 'POS System', // Se puede obtener del contexto de usuario
          paymentMethod: paymentMethod,
          cashAmount: paymentMethod === 'cash' ? cashAmount : undefined,
          change: paymentMethod === 'cash' ? getChange() : undefined,
          locale,
          labels: {
            ticket: t('ticket.ticket', { default: 'Ticket' }),
            date: t('ticket.date', { default: 'Date' }),
            cashier: t('ticket.cashier', { default: 'Cashier' }),
            client: t('ticket.client', { default: 'Client' }),
            products: t('ticket.products', { default: 'PRODUCTS:' }),
            subtotal: t('ticket.subtotal', { default: 'Subtotal:' }),
            tax: t('ticket.tax', { default: 'Tax:' }),
            total: t('ticket.total', { default: 'TOTAL:' }),
            paymentMethod: t('ticket.paymentMethod', { default: 'Payment Method:' }),
            cashReceived: t('ticket.cashReceived', { default: 'Cash Received:' }),
            change: t('ticket.change', { default: 'Change:' }),
            thanks: t('ticket.thanks', { default: 'Thank you for your purchase!' }),
            comeBack: t('ticket.comeBack', { default: 'Please come back soon' }),
            powered: t('ticket.powered', { default: 'Powered by RedFox POS' }),
            walkIn: t('ticket.walkIn', { default: 'Walk-in Customer' }),
            posSystem: t('ticket.posSystem', { default: 'POS System' }),
          },
        };
        
        await ticketPrinterService.printTicket(ticketData);
        toastService.success(t('messages.ticketPrinted'));
      } catch (error) {
        console.error('Error printing ticket:', error);
        // No fallar la venta si hay error en la impresión
        toastService.warning(t('messages.ticketPrintError'));
      }

      // Registrar transacción de caja según el método de pago
      if (currentCashRegister && currentCashRegister.status === 'open') {
        try {
          const transactionType: 'sale' | 'adjustment' = 'sale';
          let transactionDescription = '';
          let transactionPaymentMethod: 'cash' | 'card' | 'mixed' = 'cash';

          if (paymentMethod === 'cash') {
            transactionDescription = `Venta POS en Efectivo - ${sale.code}`;
            transactionPaymentMethod = 'cash';
          } else if (paymentMethod === 'card') {
            transactionDescription = `Venta POS con Tarjeta - ${sale.code}`;
            transactionPaymentMethod = 'card';
          }

          await cashRegisterService.createCashTransaction({
            cash_register_id: currentCashRegister.id,
            type: transactionType,
            amount: getTotal(),
            description: transactionDescription,
            reference: sale.code,
            payment_method: transactionPaymentMethod,
            sale_id: sale.id
          });

          // Actualizar el balance de la caja
          console.log('💰 Fetching updated cash register...');
          await fetchCurrentCashRegister();
          console.log('💰 Cash register updated successfully');
        } catch (error) {
          console.error('❌ Error registering cash transaction:', error);
          // No fallar la venta si hay error en la transacción de caja
        }
      }

      toastService.success(t('messages.saleCompleted'));
      clearCart();
      setPaymentMethod('cash');
      setCashAmount(0);
      setShowPaymentModal(false);
      
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorProcessing'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPaymentModal = () => {
    if (cart.length === 0) {
      toastService.error(t('messages.emptyCart'));
      return;
    }

    if (!selectedClient) {
      toastService.error(t('messages.selectClient'));
      return;
    }

    setShowPaymentModal(true);
  };

  // Handlers para el drawer de clientes
  const handleClientDrawerClose = () => {
    setShowClientDrawer(false);
    setIsSavingClient(false);
  };

  const handleClientFormSuccess = () => {
    handleClientDrawerClose();
    fetchClients();
  };

  const handleClientSave = () => {
    if (clientFormRef.current) {
      clientFormRef.current.submit();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Panel izquierdo - Carrito */}
          <div className="lg:col-span-4">
            <POSCart
              clients={clients}
              onAddClient={() => setShowClientDrawer(true)}
              onCheckout={handleOpenPaymentModal}
              currentCashRegister={currentCashRegister}
              onInitializeCash={handleInitializeCash}
              onCashDrawer={handleCashDrawer}
              onOpenCashBalance={handleOpenCashBalance}
              loading={cashLoading}
            />
          </div>

          {/* Panel derecho - Productos */}
          <div className="lg:col-span-2">
            <ProductsGrid
              products={filteredProducts}
              searchTerm={searchTerm}
              onSearch={setSearchTerm}
              onAddToCart={handleAddToCart}
              loading={loadingProducts}
            />
          </div>
        </div>
      </div>

      {/* Drawer para crear clientes */}
      <Drawer
        id="client-drawer"
        isOpen={showClientDrawer}
        onClose={handleClientDrawerClose}
        title={t('cart.createNewClient')}
        onSave={handleClientSave}
        isSaving={isSavingClient}
        isFormValid={isClientFormValid}
      >
        <ClientForm
          ref={clientFormRef}
          client={null}
          onClose={handleClientDrawerClose}
          onSuccess={handleClientFormSuccess}
          onSavingChange={setIsSavingClient}
          onValidChange={setIsClientFormValid}
        />
      </Drawer>

      {/* Drawer del balance de caja */}
      <Drawer
        id="cash-balance-drawer"
        isOpen={showCashBalanceDrawer}
        onClose={() => setShowCashBalanceDrawer(false)}
        title={t('cashBalance.title')}
      >
        <CashBalance
          currentCashRegister={currentCashRegister}
          onInitializeCash={handleInitializeCash}
          onCashDrawer={handleCashDrawer}
          loading={cashLoading}
          isOpen={showCashBalanceDrawer}
        />
      </Drawer>

      {/* Modal de pago */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handleCheckout}
        total={getTotal()}
        paymentMethod={paymentMethod}
        cashAmount={cashAmount}
        loading={loading}
        onPaymentMethodChange={setPaymentMethod}
        onCashAmountChange={setCashAmount}
        getChange={getChange}
        onDownloadTicket={handleDownloadTicket}
      />

      {/* Modal de inicialización de caja */}
      <CashRegisterModal
        isOpen={showCashRegisterModal}
        onClose={() => setShowCashRegisterModal(false)}
        onConfirm={handleCashRegisterConfirm}
        loading={cashLoading}
        currentCashRegister={currentCashRegister}
      />

      {/* Modal de corte de caja */}
      <CashDrawerModal
        isOpen={showCashDrawerModal}
        onClose={() => setShowCashDrawerModal(false)}
        onConfirm={handleCashDrawerConfirm}
        loading={cashLoading}
        currentCashRegister={currentCashRegister}
      />
    </div>
  );
} 