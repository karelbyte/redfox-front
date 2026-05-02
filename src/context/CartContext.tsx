'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InventoryProduct } from '@/services/inventory.service';

interface CartItem {
  product: InventoryProduct;
  quantity: number;
  price: number;
  priceMode: string;
  subtotal: number;
  tax_amount: number;
  subtotal_no_tax: number;
}

interface CartContextType {
  cart: CartItem[];
  selectedClient: string;
  addToCart: (product: InventoryProduct, quantity?: number, price?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updatePrice: (productId: string, price: number, priceMode?: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setSelectedClient: (clientId: string) => void;
  getTotal: () => number;
  getTotalQuantity: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'pos_cart';

class CartStateManager {
  private static instance: CartStateManager;
  private cart: CartItem[] = [];
  private selectedClient: string = '';
  private listeners: Set<(cart: CartItem[], selectedClient: string) => void> = new Set();

  private constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  static getInstance(): CartStateManager {
    if (typeof window === 'undefined') {
      return new CartStateManager();
    }
    
    if (!CartStateManager.instance) {
      CartStateManager.instance = new CartStateManager();
    }
    return CartStateManager.instance;
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          this.cart = Array.isArray(parsedCart)
            ? parsedCart.map((item) => this.normalizeCartItem(item))
            : [];
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
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cart));
      localStorage.setItem('pos_selected_client', this.selectedClient);
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  private notifyListeners() {
    if (typeof window !== 'undefined') {
      this.listeners.forEach(listener => listener([...this.cart], this.selectedClient));
    }
  }

  private calculateItemTotals(product: InventoryProduct, quantity: number, price: number): { subtotal: number, tax_amount: number, subtotal_no_tax: number } {
    const subtotalNoTax = quantity * price;
    let totalTax = 0;

    if (product.product.taxes && product.product.taxes.length > 0) {
      product.product.taxes.forEach(tax => {
        if (tax.type === 'PERCENTAGE') {
          totalTax += subtotalNoTax * (tax.value / 100);
        } else if (tax.type === 'FIXED') {
          totalTax += tax.value * quantity;
        }
      });
    } 
    else if (product.product.tax) {
      const tax = product.product.tax;
      const percentage = (tax as any).percentage ?? (tax as any).value ?? 0;
      totalTax += subtotalNoTax * (percentage / 100);
    }

    return {
      subtotal_no_tax: subtotalNoTax,
      tax_amount: totalTax,
      subtotal: subtotalNoTax + totalTax
    };
  }

  private inferPriceMode(product: InventoryProduct, price: number): string {
    const normalizedPrice = typeof price === 'number' ? price : Number(price) || 0;

    if (
      product.product.base_price !== undefined &&
      Math.abs(product.product.base_price - normalizedPrice) < 0.0001
    ) {
      return 'base';
    }

    const matchingPrice = product.product.prices?.find(
      (productPrice) => Math.abs(productPrice.price - normalizedPrice) < 0.0001
    );

    if (matchingPrice) {
      return `price:${matchingPrice.id}`;
    }

    if (
      (product.product.base_price === undefined || product.product.base_price === null) &&
      Math.abs(product.price - normalizedPrice) < 0.0001
    ) {
      return 'inventory';
    }

    return 'custom';
  }

  private normalizeCartItem(item: any): CartItem {
    const numericPrice = typeof item?.price === 'number' ? item.price : parseFloat(item?.price) || 0;
    const quantity = typeof item?.quantity === 'number' ? item.quantity : parseFloat(item?.quantity) || 0;
    const totals = this.calculateItemTotals(item.product, quantity, numericPrice);

    return {
      ...item,
      quantity,
      price: numericPrice,
      priceMode:
        typeof item?.priceMode === 'string' && item.priceMode.length > 0
          ? item.priceMode
          : this.inferPriceMode(item.product, numericPrice),
      ...totals,
    };
  }

  subscribe(listener: (cart: CartItem[], selectedClient: string) => void) {
    this.listeners.add(listener);
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
      
      let productPrice: number;
      let priceMode: string;
      if (price !== undefined) {
        productPrice = price;
        priceMode = this.inferPriceMode(product, price);
      } else if (product.product.base_price !== undefined) {
        productPrice = product.product.base_price;
        priceMode = 'base';
      } else {
        productPrice = typeof product.price === 'string' ? parseFloat(product.price) : (typeof product.price === 'number' ? product.price : 0);
        priceMode = 'inventory';
      }
      
      if (existingItem) {
        this.cart = this.cart.map(item => {
          if (item.product.id === product.id) {
            const newQuantity = item.quantity + quantity;
            const totals = this.calculateItemTotals(product, newQuantity, productPrice);
            return { 
              ...item, 
              quantity: newQuantity, 
              price: productPrice,
              priceMode,
              ...totals
            };
          }
          return item;
        });
      } else {
        const totals = this.calculateItemTotals(product, quantity, productPrice);
        const newItem: CartItem = {
          product,
          quantity,
          price: productPrice,
          priceMode,
          ...totals
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

      this.cart = this.cart.map(item => {
        if (item.product.id === productId) {
          const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : (typeof item.price === 'number' ? item.price : 0);
          const totals = this.calculateItemTotals(item.product, quantity, itemPrice);
          return { 
            ...item, 
            quantity, 
            ...totals
          };
        }
        return item;
      });
      
      this.saveToStorage();
      this.notifyListeners();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }

  updatePrice(productId: string, price: number, priceMode?: string) {
    try {
      const validPrice = typeof price === 'number' ? price : 0;
      this.cart = this.cart.map(item => {
        if (item.product.id === productId) {
          const totals = this.calculateItemTotals(item.product, item.quantity, validPrice);
          return { 
            ...item, 
            price: validPrice,
            priceMode: priceMode || this.inferPriceMode(item.product, validPrice),
            ...totals
          };
        }
        return item;
      });
      
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
    updatePrice: (productId: string, price: number, priceMode?: string) => {
      if (!isClient) return;
      cartManager.updatePrice(productId, price, priceMode);
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
