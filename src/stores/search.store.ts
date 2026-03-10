import { create } from 'zustand';

interface SearchState {
  search_client: string;
  search_product: string;
  search_provider: string;
  search_invoice: string;
  search_purchase_order: string;
  search_expense: string;
  search_account_receivable: string;
  
  // Actions
  setSearchClient: (value: string) => void;
  setSearchProduct: (value: string) => void;
  setSearchProvider: (value: string) => void;
  setSearchInvoice: (value: string) => void;
  setSearchPurchaseOrder: (value: string) => void;
  setSearchExpense: (value: string) => void;
  setSearchAccountReceivable: (value: string) => void;
  
  // Clear all
  clearAllSearches: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  search_client: '',
  search_product: '',
  search_provider: '',
  search_invoice: '',
  search_purchase_order: '',
  search_expense: '',
  search_account_receivable: '',
  
  setSearchClient: (value: string) => set({ search_client: value }),
  setSearchProduct: (value: string) => set({ search_product: value }),
  setSearchProvider: (value: string) => set({ search_provider: value }),
  setSearchInvoice: (value: string) => set({ search_invoice: value }),
  setSearchPurchaseOrder: (value: string) => set({ search_purchase_order: value }),
  setSearchExpense: (value: string) => set({ search_expense: value }),
  setSearchAccountReceivable: (value: string) => set({ search_account_receivable: value }),
  
  clearAllSearches: () => set({
    search_client: '',
    search_product: '',
    search_provider: '',
    search_invoice: '',
    search_purchase_order: '',
    search_expense: '',
    search_account_receivable: '',
  }),
}));
