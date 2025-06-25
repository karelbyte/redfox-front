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
  addToCart: (product: InventoryProduct) => void;
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
    this.loadFromStorage();
  }

  static getInstance(): CartStateManager {
    if (!CartStateManager.instance) {
      CartStateManager.instance = new CartStateManager();
    }
    return CartStateManager.instance;
  }

  private loadFromStorage() {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        this.cart = JSON.parse(savedCart);
      }
      
      const savedClient = localStorage.getItem('pos_selected_client');
      if (savedClient) {
        this.selectedClient = savedClient;
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem('pos_selected_client');
    }
  }

  private saveToStorage() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cart));
    localStorage.setItem('pos_selected_client', this.selectedClient);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.cart], this.selectedClient));
  }

  subscribe(listener: (cart: CartItem[], selectedClient: string) => void) {
    this.listeners.add(listener);
    // Notificar inmediatamente con el estado actual
    listener([...this.cart], this.selectedClient);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  setSelectedClient(clientId: string) {
    this.selectedClient = clientId;
    this.saveToStorage();
    this.notifyListeners();
  }

  getSelectedClient(): string {
    return this.selectedClient;
  }

  addToCart(product: InventoryProduct) {
    const existingItem = this.cart.find(item => item.product.id === product.id);
    const productPrice = typeof product.price === 'string' ? parseFloat(product.price) : (typeof product.price === 'number' ? product.price : 0);
    
    if (existingItem) {
      this.cart = this.cart.map(item =>
        item.product.id === product.id
          ? { 
              ...item, 
              quantity: item.quantity + 1, 
              subtotal: (item.quantity + 1) * productPrice 
            }
          : item
      );
    } else {
      const newItem: CartItem = {
        product,
        quantity: 1,
        price: productPrice,
        subtotal: productPrice
      };
      this.cart = [...this.cart, newItem];
    }
    
    this.saveToStorage();
    this.notifyListeners();
  }

  updateQuantity(productId: string, quantity: number) {
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
  }

  updatePrice(productId: string, price: number) {
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
  }

  removeFromCart(productId: string) {
    this.cart = this.cart.filter(item => item.product.id !== productId);
    this.saveToStorage();
    this.notifyListeners();
  }

  clearCart() {
    this.cart = [];
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem('pos_selected_client');
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
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const cartManager = CartStateManager.getInstance();

  useEffect(() => {
    const unsubscribe = cartManager.subscribe((newCart, newSelectedClient) => {
      setCart(newCart);
      setSelectedClient(newSelectedClient);
    });
    return unsubscribe;
  }, []);

  const value: CartContextType = {
    cart,
    selectedClient,
    addToCart: (product) => cartManager.addToCart(product),
    updateQuantity: (productId, quantity) => cartManager.updateQuantity(productId, quantity),
    updatePrice: (productId, price) => cartManager.updatePrice(productId, price),
    removeFromCart: (productId) => cartManager.removeFromCart(productId),
    clearCart: () => cartManager.clearCart(),
    setSelectedClient: (clientId) => cartManager.setSelectedClient(clientId),
    getTotal: () => cartManager.getTotal(),
    getTotalQuantity: () => cartManager.getTotalQuantity()
  };

  return (
    <CartContext.Provider value={value}>
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