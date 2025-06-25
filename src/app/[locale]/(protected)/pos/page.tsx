'use client'

import { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCartIcon, 
  XMarkIcon, 
  PlusIcon, 
  MinusIcon,
  TrashIcon,
  CreditCardIcon,
  BanknotesIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { saleService } from '@/services/sales.service';
import { clientsService } from '@/services/clients.service';
import { inventoryService, InventoryProduct } from '@/services/inventory.service';
import { toastService } from '@/services/toast.service';
import { SaleFormData } from '@/types/sale';
import { Client } from '@/types/client';
import { Btn, Input, SelectWithAdd, SearchInput } from '@/components/atoms';
import Loading from '@/components/Loading/Loading';
import Drawer from '@/components/Drawer/Drawer';
import ClientForm from '@/components/Client/ClientForm';
import { ClientFormRef } from '@/components/Client/ClientForm';

interface CartItem {
  product: InventoryProduct;
  quantity: number;
  price: number;
  subtotal: number;
}

export default function POSPage() {
  const router = useRouter();
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<InventoryProduct[]>([]);
  const [showClientDrawer, setShowClientDrawer] = useState(false);
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [isClientFormValid, setIsClientFormValid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [cashAmount, setCashAmount] = useState<number>(0);
  const clientFormRef = useRef<ClientFormRef>(null);

  useEffect(() => {
    fetchProducts();
    fetchClients();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      searchProducts(searchTerm);
    } else {
      fetchProducts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await inventoryService.getInventoryProducts(1);
      setFilteredProducts(response.data || []);
    } catch {
      toastService.error('Error al cargar productos');
    } finally {
      setLoadingProducts(false);
    }
  };

  const searchProducts = async (term: string) => {
    try {
      setLoadingProducts(true);
      const response = await inventoryService.getInventoryProducts(1, term);
      setFilteredProducts(response.data || []);
    } catch {
      toastService.error('Error al buscar productos');
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const response = await clientsService.getClients();
      setClients(response.data || []);
    } catch {
      toastService.error('Error al cargar clientes');
    } finally {
      setLoadingClients(false);
    }
  };

  const addToCart = (product: InventoryProduct) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    const productPrice = typeof product.price === 'string' ? parseFloat(product.price) : (typeof product.price === 'number' ? product.price : 0);
    
    if (existingItem) {
      setCart(prev => prev.map(item =>
        item.product.id === product.id
          ? { 
              ...item, 
              quantity: item.quantity + 1, 
              subtotal: (item.quantity + 1) * (item.price || 0) 
            }
          : item
      ));
    } else {
      const newItem: CartItem = {
        product,
        quantity: 1,
        price: productPrice, // Precio del inventario
        subtotal: productPrice
      };
      setCart(prev => [...prev, newItem]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev => prev.map(item =>
      item.product.id === productId
        ? { 
            ...item, 
            quantity, 
            subtotal: quantity * (typeof item.price === 'string' ? parseFloat(item.price) : (typeof item.price === 'number' ? item.price : 0)) 
          }
        : item
    ));
  };

  const updatePrice = (productId: string, price: number) => {
    const validPrice = typeof price === 'number' ? price : 0;
    setCart(prev => prev.map(item =>
      item.product.id === productId
        ? { 
            ...item, 
            price: validPrice, 
            subtotal: item.quantity * validPrice 
          }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedClient('');
    setPaymentMethod('cash');
    setCashAmount(0);
  };

  const getTotal = () => {
    try {
      const total = cart.reduce((total, item) => {
        const subtotal = typeof item.subtotal === 'number' ? item.subtotal : 0;
        return total + subtotal;
      }, 0);
      return typeof total === 'number' ? total : 0;
    } catch (error) {
      console.error('Error calculating total:', error);
      return 0;
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

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toastService.error('El carrito está vacío');
      return;
    }

    if (!selectedClient) {
      toastService.error('Debe seleccionar un cliente');
      return;
    }

    if (paymentMethod === 'cash' && cashAmount < getTotal()) {
      toastService.error('El monto en efectivo es insuficiente');
      return;
    }

    try {
      setLoading(true);
      
      // Crear la venta
      const saleData: SaleFormData = {
        code: `POS-${Date.now()}`,
        destination: 'Venta POS',
        client_id: selectedClient,
        amount: getTotal()
      };

      const sale = await saleService.createSale(saleData);

      // Agregar productos a la venta
      for (const item of cart) {
        await saleService.addProductToSale(sale.id, {
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.price,
          warehouse_id: '1' // Almacén por defecto, se puede hacer dinámico
        });
      }

      toastService.success('Venta completada exitosamente');
      clearCart();
      
      // Opcional: redirigir a la página de detalles de la venta
      // router.push(`/${locale}/dashboard/ventas/ventas/${sale.id}`);
      
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error('Error al procesar la venta');
      }
    } finally {
      setLoading(false);
    }
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

  if (loadingProducts || loadingClients) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Btn
                variant="ghost"
                onClick={() => router.push(`/${locale}/dashboard`)}
                leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
              >
                Dashboard
              </Btn>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: `rgb(var(--color-primary-800))` }}>
                  Point of Sale (POS)
                </h1>
                <p className="text-sm text-gray-500">
                  Sistema de ventas en punto de venta
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Total:</span>
              <span className="text-2xl font-bold" style={{ color: `rgb(var(--color-primary-600))` }}>
                ${getTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel izquierdo - Productos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold mb-4">Productos</h2>
                <SearchInput
                  placeholder="Buscar productos..."
                  onSearch={setSearchTerm}
                />
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => addToCart(product)}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                          <ShoppingCartIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="font-medium text-sm truncate">{product.product.name}</h3>
                        <p className="text-xs text-gray-500">{product.product.sku}</p>
                        <p className="text-sm font-semibold mt-1">${product.price || 0}</p>
                        <p className="text-xs text-gray-400">Stock: {product.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {filteredProducts.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No se encontraron productos</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel derecho - Carrito */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Carrito</h2>
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    leftIcon={<TrashIcon className="h-4 w-4" />}
                  >
                    Limpiar
                  </Btn>
                </div>
              </div>

              <div className="p-6">
                {/* Cliente */}
                <div className="mb-6">
                  <SelectWithAdd
                    id="client"
                    label="Cliente"
                    placeholder="Seleccionar cliente"
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    options={clients.map((client) => ({
                      value: client.id,
                      label: client.name
                    }))}
                    showAddButton
                    onAddClick={() => setShowClientDrawer(true)}
                    addButtonTitle="Crear nuevo cliente"
                  />
                </div>

                {/* Items del carrito */}
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item.product.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{item.product.product.name}</h3>
                          <p className="text-xs text-gray-500">{item.product.product.sku}</p>
                        </div>
                        <Btn
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </Btn>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-gray-500">Cantidad</label>
                          <div className="flex items-center space-x-1">
                            <Btn
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            >
                              <MinusIcon className="h-3 w-3" />
                            </Btn>
                            <span className="text-sm font-medium">{item.quantity}</span>
                            <Btn
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                              <PlusIcon className="h-3 w-3" />
                            </Btn>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-xs text-gray-500">Precio</label>
                          <Input
                            type="number"
                            value={item.price}
                            onChange={(e) => updatePrice(item.product.id, parseFloat(e.target.value) || 0)}
                            className="text-sm"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        
                        <div>
                          <label className="text-xs text-gray-500">Subtotal</label>
                          <p className="text-sm font-semibold">${item.subtotal.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {cart.length === 0 && (
                    <div className="text-center py-8">
                      <ShoppingCartIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">El carrito está vacío</p>
                    </div>
                  )}
                </div>

                {/* Método de pago */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Método de Pago</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                        className="text-primary-600"
                      />
                      <BanknotesIcon className="h-5 w-5" />
                      <span>Efectivo</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                        className="text-primary-600"
                      />
                      <CreditCardIcon className="h-5 w-5" />
                      <span>Tarjeta</span>
                    </label>
                  </div>
                </div>

                {/* Efectivo recibido */}
                {paymentMethod === 'cash' && (
                  <div className="mb-6">
                    <Input
                      label="Efectivo Recibido"
                      type="number"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                    {cashAmount > 0 && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-500">Cambio: </span>
                        <span className={`font-semibold ${getChange() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${getChange().toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Total y botón de pago */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold" style={{ color: `rgb(var(--color-primary-600))` }}>
                      ${getTotal().toFixed(2)}
                    </span>
                  </div>
                  
                  <Btn
                    onClick={handleCheckout}
                    loading={loading}
                    disabled={loading || cart.length === 0}
                    className="w-full"
                  >
                    {loading ? 'Procesando...' : 'Completar Venta'}
                  </Btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer para crear clientes */}
      <Drawer
        id="client-drawer"
        isOpen={showClientDrawer}
        onClose={handleClientDrawerClose}
        title="Nuevo Cliente"
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
    </div>
  );
} 