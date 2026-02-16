'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InventoryProduct } from '@/services/inventory.service';

interface CartItem {
  product: InventoryProduct;
  quantity: number;
  price: number;
  subtotal: number;
}

interface CartContextType {
  cart: CartItem[];
  selectedClient: string;
  addToCart: (product: InventoryProduct, quantity?: number, price?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updatePrice: (productId: string, price: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setSelectedClient: (clientId: string) => void;
  getTotal: () => number;
  getTotalQuantity: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'pos_cart';

// Singleton para el estado del carrito
class CartStateManager {
  private static instance: CartStateManager;
  private cart: CartItem[] = [];
  private selectedClient: string = '';
  private listeners: Set<(cart: CartItem[], selectedClient: string) => void> = new Set();

  private constructor() {
    // Solo cargar desde localStorage en el cliente
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  static getInstance(): CartStateManager {
    if (typeof window === 'undefined') {
      // En SSR, crear una instancia temporal sin localStorage
      return new CartStateManager();
    }
    
    if (!CartStateManager.instance) {
      CartStateManager.instance = new CartStateManager();
    }
    return CartStateManager.instance;
  }

  private loadFromStorage() {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;

    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        try {
          this.cart = JSON.parse(savedCart);
        } catch (parseError) {
          console.error('Error parsing cart from localStorage, clearing cart:', parseError);
          localStorage.removeItem(CART_STORAGE_KEY);
          this.cart = [];
        }
      }
      
      const savedClient = localStorage.getItem('pos_selected_client');
      if (savedClient) {
        this.selectedClient = savedClient;
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(CART_STORAGE_KEY);
          localStorage.removeItem('pos_selected_client');
        } catch (cleanupError) {
          console.warn('Error cleaning up localStorage:', cleanupError);
        }
      }
      this.cart = [];
      this.selectedClient = '';
    }
  }

  private saveToStorage() {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cart));
      localStorage.setItem('pos_selected_client', this.selectedClient);
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  private notifyListeners() {
    // Solo notificar en el cliente
    if (typeof window !== 'undefined') {
      this.listeners.forEach(listener => listener([...this.cart], this.selectedClient));
    }
  }

  subscribe(listener: (cart: CartItem[], selectedClient: string) => void) {
    this.listeners.add(listener);
    // Notificar inmediatamente con el estado actual solo en el cliente
    if (typeof window !== 'undefined') {
      listener([...this.cart], this.selectedClient);
    }
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  setSelectedClient(clientId: string) {
    try {
      this.selectedClient = clientId;
      this.saveToStorage();
      this.notifyListeners();
    } catch (error) {
      console.error('Error setting selected client:', error);
    }
  }

  getSelectedClient(): string {
    try {
      return this.selectedClient;
    } catch (error) {
      console.error('Error getting selected client:', error);
      return '';
    }
  }

  addToCart(product: InventoryProduct, quantity: number = 1, price?: number) {
    try {
      const existingItem = this.cart.find(item => item.product.id === product.id);
      
      // Determinar el precio a usar: precio pasado, precio base del producto, o precio del inventario
      let productPrice: number;
      if (price !== undefined) {
        productPrice = price;
      } else if (product.product.base_price !== undefined) {
        productPrice = product.product.base_price;
      } else {
        productPrice = typeof product.price === 'string' ? parseFloat(product.price) : (typeof product.price === 'number' ? product.price : 0);
      }
      
      if (existingItem) {
        this.cart = this.cart.map(item =>
          item.product.id === product.id
            ? { 
                ...item, 
                quantity: item.quantity + quantity, 
                price: productPrice,
                subtotal: (item.quantity + quantity) * productPrice 
              }
            : item
        );
      } else {
        const newItem: CartItem = {
          product,
          quantity,
          price: productPrice,
          subtotal: quantity * productPrice
        };
        this.cart = [...this.cart, newItem];
      }
      
      this.saveToStorage();
      this.notifyListeners();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }

  updateQuantity(productId: string, quantity: number) {
    try {
      if (quantity <= 0) {
        this.removeFromCart(productId);
        return;
      }

      this.cart = this.cart.map(item =>
        item.product.id === productId
          ? { 
              ...item, 
              quantity, 
              subtotal: quantity * (typeof item.price === 'string' ? parseFloat(item.price) : (typeof item.price === 'number' ? item.price : 0)) 
            }
          : item
      );
      
      this.saveToStorage();
      this.notifyListeners();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }

  updatePrice(productId: string, price: number) {
    try {
      const validPrice = typeof price === 'number' ? price : 0;
      this.cart = this.cart.map(item =>
        item.product.id === productId
          ? { 
              ...item, 
              price: validPrice, 
              subtotal: item.quantity * validPrice 
            }
          : item
      );
      
      this.saveToStorage();
      this.notifyListeners();
    } catch (error) {
      console.error('Error updating price:', error);
    }
  }

  removeFromCart(productId: string) {
    try {
      this.cart = this.cart.filter(item => item.product.id !== productId);
      this.saveToStorage();
      this.notifyListeners();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  }

  clearCart() {
    this.cart = [];
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.removeItem('pos_selected_client');
      } catch (error) {
        console.warn('Error clearing localStorage:', error);
      }
    }
    this.notifyListeners();
  }

  getTotal(): number {
    try {
      const total = this.cart.reduce((total, item) => {
        const subtotal = typeof item.subtotal === 'number' ? item.subtotal : 0;
        return total + subtotal;
      }, 0);
      return typeof total === 'number' ? total : 0;
    } catch (error) {
      console.error('Error calculating total:', error);
      return 0;
    }
  }

  getTotalQuantity(): number {
    try {
      return this.cart.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error('Error calculating total quantity:', error);
      return 0;
    }
  }
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const cartManager = CartStateManager.getInstance();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const unsubscribe = cartManager.subscribe((newCart, newSelectedClient) => {
      setCart(newCart);
      setSelectedClient(newSelectedClient);
    });
    return unsubscribe;
  }, [cartManager, isClient]);

  const contextValue: CartContextType = {
    cart,
    selectedClient,
    addToCart: (product: InventoryProduct, quantity?: number, price?: number) => {
      if (!isClient) return;
      cartManager.addToCart(product, quantity, price);
    },
    updateQuantity: (productId: string, quantity: number) => {
      if (!isClient) return;
      cartManager.updateQuantity(productId, quantity);
    },
    updatePrice: (productId: string, price: number) => {
      if (!isClient) return;
      cartManager.updatePrice(productId, price);
    },
    removeFromCart: (productId: string) => {
      if (!isClient) return;
      cartManager.removeFromCart(productId);
    },
    clearCart: () => {
      if (!isClient) return;
      cartManager.clearCart();
    },
    setSelectedClient: (clientId: string) => {
      if (!isClient) return;
      cartManager.setSelectedClient(clientId);
    },
    getTotal: () => {
      if (!isClient) return 0;
      return cartManager.getTotal();
    },
    getTotalQuantity: () => {
      if (!isClient) return 0;
      return cartManager.getTotalQuantity();
    },
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 