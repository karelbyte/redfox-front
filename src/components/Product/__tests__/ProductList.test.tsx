import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductList } from '../ProductList';
import { AuthContext } from '../../../context/AuthContext';
import * as productsService from '../../../services/products.service';

// Mock the products service
jest.mock('../../../services/products.service');
const mockedProductsService = productsService as jest.Mocked<typeof productsService>;

// Mock user context
const mockUser = {
  id: 1,
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  roles: ['admin'],
};

const mockAuthContext = {
  user: mockUser,
  login: jest.fn(),
  logout: jest.fn(),
  isLoading: false,
  isAuthenticated: true,
};

const mockProducts = {
  data: [
    {
      id: 1,
      name: 'Test Product 1',
      description: 'Test product description',
      price: 100.00,
      cost: 50.00,
      stock: 10,
      minStock: 5,
      barcode: '1234567890',
      isActive: true,
      category: { id: 1, name: 'Test Category' },
      brand: { id: 1, name: 'Test Brand' },
    },
    {
      id: 2,
      name: 'Test Product 2',
      description: 'Another test product',
      price: 150.00,
      cost: 75.00,
      stock: 5,
      minStock: 3,
      barcode: '0987654321',
      isActive: true,
      category: { id: 1, name: 'Test Category' },
      brand: { id: 1, name: 'Test Brand' },
    },
  ],
  total: 2,
  page: 1,
  limit: 10,
  totalPages: 1,
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      {component}
    </AuthContext.Provider>
  );
};

describe('ProductList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedProductsService.getProducts.mockResolvedValue(mockProducts);
  });

  it('renders product list with data', async () => {
    renderWithProviders(<ProductList />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    });

    // Check that product details are displayed
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
    expect(screen.getByText('Stock: 10')).toBeInTheDocument();
    expect(screen.getByText('Stock: 5')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    renderWithProviders(<ProductList />);

    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductList />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    // Find and interact with search input
    const searchInput = screen.getByPlaceholderText('Search products...');
    await user.type(searchInput, 'Product 1');

    // Wait for search to trigger
    await waitFor(() => {
      expect(mockedProductsService.getProducts).toHaveBeenCalledWith(
        1,
        10,
        'Product 1'
      );
    });
  });

  it('handles pagination', async () => {
    const paginatedMockProducts = {
      ...mockProducts,
      totalPages: 3,
      page: 1,
    };
    mockedProductsService.getProducts.mockResolvedValue(paginatedMockProducts);

    renderWithProviders(<ProductList />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    // Check pagination controls
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).not.toBeDisabled();

    // Click next page
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockedProductsService.getProducts).toHaveBeenCalledWith(
        2,
        10,
        ''
      );
    });
  });

  it('shows empty state when no products found', async () => {
    const emptyMockProducts = {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
    mockedProductsService.getProducts.mockResolvedValue(emptyMockProducts);

    renderWithProviders(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('No products found')).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    mockedProductsService.getProducts.mockRejectedValue(new Error('Failed to fetch products'));

    renderWithProviders(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('Error loading products')).toBeInTheDocument();
    });
  });

  it('shows low stock warning for products with low stock', async () => {
    const lowStockProducts = {
      ...mockProducts,
      data: [
        {
          ...mockProducts.data[0],
          stock: 2,
          minStock: 5,
        },
      ],
    };
    mockedProductsService.getProducts.mockResolvedValue(lowStockProducts);

    renderWithProviders(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('Low Stock')).toBeInTheDocument();
    });

    const lowStockBadge = screen.getByText('Low Stock');
    expect(lowStockBadge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('allows editing product when edit button is clicked', async () => {
    renderWithProviders(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    // Check that edit modal or form is opened
    expect(screen.getByText('Edit Product')).toBeInTheDocument();
  });

  it('allows deleting product when delete button is clicked', async () => {
    renderWithProviders(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    // Check that confirmation dialog is shown
    expect(screen.getByText('Are you sure you want to delete this product?')).toBeInTheDocument();
  });

  it('filters products by category', async () => {
    renderWithProviders(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    const categoryFilter = screen.getByRole('combobox', { name: /category/i });
    fireEvent.change(categoryFilter, { target: { value: '1' } });

    await waitFor(() => {
      expect(mockedProductsService.getProducts).toHaveBeenCalledWith(
        1,
        10,
        '',
        { categoryId: '1' }
      );
    });
  });

  it('sorts products by different criteria', async () => {
    renderWithProviders(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    const sortSelect = screen.getByRole('combobox', { name: /sort by/i });
    fireEvent.change(sortSelect, { target: { value: 'price_desc' } });

    await waitFor(() => {
      expect(mockedProductsService.getProducts).toHaveBeenCalledWith(
        1,
        10,
        '',
        { sortBy: 'price', sortOrder: 'desc' }
      );
    });
  });

  it('shows product details when product card is clicked', async () => {
    renderWithProviders(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    const productCard = screen.getByText('Test Product 1').closest('div');
    fireEvent.click(productCard!);

    // Check that product details modal is opened
    expect(screen.getByText('Product Details')).toBeInTheDocument();
    expect(screen.getByText('Test product description')).toBeInTheDocument();
  });

  it('updates stock when stock update button is clicked', async () => {
    mockedProductsService.updateProductStock = jest.fn().mockResolvedValue({
      ...mockProducts.data[0],
      stock: 15,
    });

    renderWithProviders(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    const stockUpdateButtons = screen.getAllByRole('button', { name: /update stock/i });
    fireEvent.click(stockUpdateButtons[0]);

    // Check that stock update modal is opened
    expect(screen.getByText('Update Stock')).toBeInTheDocument();
  });
});