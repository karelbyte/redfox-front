'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { saleService } from '@/services/sales.service';
import { clientsService } from '@/services/clients.service';
import { inventoryService, InventoryProduct } from '@/services/inventory.service';
import { toastService } from '@/services/toast.service';
import { SaleFormData } from '@/types/sale';
import { Client } from '@/types/client';
import Drawer from '@/components/Drawer/Drawer';
import ClientForm from '@/components/Client/ClientForm';
import { ClientFormRef } from '@/components/Client/ClientForm';
import POSCart from '@/components/POS/POSCart';
import ProductsGrid from '@/components/POS/ProductsGrid';
import PaymentModal from '@/components/POS/PaymentModal';
import { useCart } from '@/context/CartContext';

export default function POSPage() {
  const t = useTranslations('pages.pos');
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
  const clientFormRef = useRef<ClientFormRef>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hook para manejar el carrito con persistencia
  const { cart, addToCart, clearCart, getTotal, selectedClient } = useCart();

  const handleAddToCart = (product: InventoryProduct) => {
    addToCart(product);
  };

  useEffect(() => {
    fetchProducts();
    fetchClients();
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
        amount: getTotal()
      };

      const sale = await saleService.createSale(saleData);

      for (const item of cart) {
        await saleService.addProductToSale(sale.id, {
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.price,
          warehouse_id: '1'
        });
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
      />
    </div>
  );
} 