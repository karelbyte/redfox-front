import { create } from 'zustand';

interface SearchState {
  search_client: string;
  search_product: string;
  search_provider: string;
  search_invoice: string;
  search_purchase_order: string;
  search_expense: string;
  search_account_receivable: string;
  search_employees: string;
  search_departments: string;
  search_positions: string;
  search_attendance: string;
  search_leave_request: string;
  search_document: string;
  search_payroll: string;
  
  setSearchClient: (value: string) => void;
  setSearchProduct: (value: string) => void;
  setSearchProvider: (value: string) => void;
  setSearchInvoice: (value: string) => void;
  setSearchPurchaseOrder: (value: string) => void;
  setSearchExpense: (value: string) => void;
  setSearchAccountReceivable: (value: string) => void;
  setSearchEmployees: (value: string) => void;
  setSearchDepartments: (value: string) => void;
  setSearchPositions: (value: string) => void;
  setSearchAttendance: (value: string) => void;
  setSearchLeaveRequest: (value: string) => void;
  setSearchDocument: (value: string) => void;
  setSearchPayroll: (value: string) => void;
  
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
  search_employees: '',
  search_departments: '',
  search_positions: '',
  search_attendance: '',
  search_leave_request: '',
  search_document: '',
  search_payroll: '',
  
  setSearchClient: (value: string) => set({ search_client: value }),
  setSearchProduct: (value: string) => set({ search_product: value }),
  setSearchProvider: (value: string) => set({ search_provider: value }),
  setSearchInvoice: (value: string) => set({ search_invoice: value }),
  setSearchPurchaseOrder: (value: string) => set({ search_purchase_order: value }),
  setSearchExpense: (value: string) => set({ search_expense: value }),
  setSearchAccountReceivable: (value: string) => set({ search_account_receivable: value }),
  setSearchEmployees: (value: string) => set({ search_employees: value }),
  setSearchDepartments: (value: string) => set({ search_departments: value }),
  setSearchPositions: (value: string) => set({ search_positions: value }),
  setSearchAttendance: (value: string) => set({ search_attendance: value }),
  setSearchLeaveRequest: (value: string) => set({ search_leave_request: value }),
  setSearchDocument: (value: string) => set({ search_document: value }),
  setSearchPayroll: (value: string) => set({ search_payroll: value }),
  
  clearAllSearches: () => set({
    search_client: '',
    search_product: '',
    search_provider: '',
    search_invoice: '',
    search_purchase_order: '',
    search_expense: '',
    search_account_receivable: '',
    search_employees: '',
    search_departments: '',
    search_positions: '',
    search_attendance: '',
    search_leave_request: '',
    search_document: '',
    search_payroll: '',
  }),
}));
