import type { AbstractIntlMessages } from 'next-intl';

// Tipos para las traducciones
export interface TranslationMessages extends AbstractIntlMessages {
  common: {
    actions: {
      save: string;
      cancel: string;
      delete: string;
      edit: string;
      create: string;
      update: string;
      close: string;
      back: string;
      add: string;
      view: string;
      search: string;
      clear: string;
      confirm: string;
      loading: string;
      saving: string;
      deleting: string;
    };
    status: {
      active: string;
      inactive: string;
      open: string;
      closed: string;
      opened: string;
      closed_female: string;
    };
    messages: {
      confirmDelete: string;
      confirmClose: string;
      noData: string;
      noResults: string;
      errorLoading: string;
      successCreated: string;
      successUpdated: string;
      successDeleted: string;
      successClosed: string;
    };
    labels: {
      code: string;
      name: string;
      description: string;
      date: string;
      amount: string;
      price: string;
      quantity: string;
      status: string;
      actions: string;
      select: string;
      searchPlaceholder: string;
      noDataMessage: string;
      noResultsMessage: string;
    };
  };
  navigation: {
    dashboard: string;
    warehouses: string;
    products: string;
    categories: string;
    brands: string;
    taxes: string;
    currencies: string;
    measurementUnits: string;
    providers: string;
    clients: string;
    inventory: string;
    purchases: string;
    receptions: string;
    warehouseOpenings: string;
  };
  pages: {
    dashboard: {
      title: string;
      description: string;
    };
    warehouses: {
      title: string;
      newWarehouse: string;
      editWarehouse: string;
      deleteWarehouse: string;
      warehouseInfo: string;
      warehouseDetails: string;
    };
    products: {
      title: string;
      newProduct: string;
      editProduct: string;
      deleteProduct: string;
      addProduct: string;
      productDetails: string;
      productType: string;
      measurementUnit: string;
      tax: string;
      brand: string;
      category: string;
    };
    categories: {
      title: string;
      newCategory: string;
      editCategory: string;
      deleteCategory: string;
    };
    brands: {
      title: string;
      newBrand: string;
      editBrand: string;
      deleteBrand: string;
    };
    taxes: {
      title: string;
      newTax: string;
      editTax: string;
      deleteTax: string;
      taxType: string;
    };
    currencies: {
      title: string;
      newCurrency: string;
      editCurrency: string;
      deleteCurrency: string;
      currencyCode: string;
      currencyName: string;
    };
    measurementUnits: {
      title: string;
      newUnit: string;
      editUnit: string;
      deleteUnit: string;
      unitCode: string;
      unitDescription: string;
    };
    providers: {
      title: string;
      newProvider: string;
      editProvider: string;
      deleteProvider: string;
      providerInfo: string;
    };
    clients: {
      title: string;
      newClient: string;
      editClient: string;
      deleteClient: string;
      clientInfo: string;
    };
    inventory: {
      title: string;
      selectWarehouse: string;
      warehouseInventory: string;
      noClosedWarehouses: string;
      noClosedWarehousesDesc: string;
      productsInInventory: string;
      noProductsInInventory: string;
      productHistory: string;
      operationTypes: {
        WAREHOUSE_OPENING: string;
        RECEPTION: string;
        PURCHASE: string;
        TRANSFER_IN: string;
        ADJUSTMENT_IN: string;
        RETURN_IN: string;
        SALE: string;
        WITHDRAWAL: string;
        TRANSFER_OUT: string;
        ADJUSTMENT_OUT: string;
        DETERIORATION: string;
        RETURN_OUT: string;
        DAMAGE: string;
      };
    };
    warehouseOpenings: {
      title: string;
      newOpening: string;
      editOpening: string;
      deleteOpening: string;
      warehouse: string;
      currency: string;
      totalProducts: string;
      openingClosedSuccessfully: string;
      transferredProducts: string;
      totalQuantity: string;
      closingDate: string;
    };
    receptions: {
      title: string;
      newReception: string;
      editReception: string;
      deleteReception: string;
      closeReception: string;
      receptionDetails: string;
      receptionInfo: string;
      provider: string;
      document: string;
      generalInfo: string;
      receptionProducts: string;
      noProducts: string;
      noProductsDesc: string;
      noProductsClosedDesc: string;
      addProduct: string;
    };
    login: {
      title: string;
      email: string;
      password: string;
      loginButton: string;
      loggingIn: string;
      forgotPassword: string;
    };
    construction: {
      title: string;
      description: string;
      backToList: string;
    };
  };
  forms: {
    validation: {
      required: string;
      email: string;
      minLength: string;
      maxLength: string;
      numeric: string;
      positive: string;
    };
    placeholders: {
      enterCode: string;
      enterName: string;
      enterDescription: string;
      enterEmail: string;
      enterPassword: string;
      selectOption: string;
    };
  };
  modals: {
    delete: {
      title: string;
      message: string;
    };
    close: {
      title: string;
      message: string;
    };
  };
  pagination: {
    previous: string;
    next: string;
    showing: string;
    page: string;
  };
}

// Tipos para los parámetros de traducción
export interface TranslationParams {
  item?: string;
  name?: string;
  count?: number;
  min?: number;
  max?: number;
  term?: string;
  from?: number;
  to?: number;
  total?: number;
  page?: number;
} 