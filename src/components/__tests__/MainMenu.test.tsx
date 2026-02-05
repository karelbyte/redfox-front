import { render, screen, fireEvent } from '@testing-library/react';
import { MainMenu } from '../MainMenu';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/dashboard',
}));

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

const mockThemeContext = {
  theme: 'light' as const,
  toggleTheme: jest.fn(),
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      <ThemeContext.Provider value={mockThemeContext}>
        {component}
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
};

describe('MainMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders main menu items', () => {
    renderWithProviders(<MainMenu />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Clients')).toBeInTheDocument();
    expect(screen.getByText('Inventory')).toBeInTheDocument();
    expect(screen.getByText('Sales')).toBeInTheDocument();
  });

  it('highlights active menu item', () => {
    renderWithProviders(<MainMenu />);

    const dashboardItem = screen.getByText('Dashboard').closest('a');
    expect(dashboardItem).toHaveClass('bg-blue-100'); // Active state class
  });

  it('navigates to correct route when menu item is clicked', () => {
    renderWithProviders(<MainMenu />);

    const productsLink = screen.getByText('Products');
    fireEvent.click(productsLink);

    expect(mockPush).toHaveBeenCalledWith('/products');
  });

  it('shows admin-only menu items for admin users', () => {
    renderWithProviders(<MainMenu />);

    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('hides admin-only menu items for non-admin users', () => {
    const nonAdminContext = {
      ...mockAuthContext,
      user: { ...mockUser, roles: ['user'] },
    };

    render(
      <AuthContext.Provider value={nonAdminContext}>
        <ThemeContext.Provider value={mockThemeContext}>
          <MainMenu />
        </ThemeContext.Provider>
      </AuthContext.Provider>
    );

    expect(screen.queryByText('Users')).not.toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('shows correct icons for menu items', () => {
    renderWithProviders(<MainMenu />);

    // Check that icons are rendered (assuming they have specific test IDs or classes)
    const dashboardIcon = screen.getByTestId('dashboard-icon');
    const productsIcon = screen.getByTestId('products-icon');

    expect(dashboardIcon).toBeInTheDocument();
    expect(productsIcon).toBeInTheDocument();
  });

  it('collapses menu when collapse button is clicked', () => {
    renderWithProviders(<MainMenu />);

    const collapseButton = screen.getByRole('button', { name: /collapse menu/i });
    fireEvent.click(collapseButton);

    // Check that menu text is hidden in collapsed state
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    
    // But icons should still be visible
    expect(screen.getByTestId('dashboard-icon')).toBeInTheDocument();
  });

  it('expands menu when expand button is clicked', () => {
    renderWithProviders(<MainMenu />);

    // First collapse the menu
    const collapseButton = screen.getByRole('button', { name: /collapse menu/i });
    fireEvent.click(collapseButton);

    // Then expand it
    const expandButton = screen.getByRole('button', { name: /expand menu/i });
    fireEvent.click(expandButton);

    // Menu text should be visible again
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  it('shows notification badge when there are notifications', () => {
    const contextWithNotifications = {
      ...mockAuthContext,
      user: { ...mockUser, unreadNotifications: 3 },
    };

    render(
      <AuthContext.Provider value={contextWithNotifications}>
        <ThemeContext.Provider value={mockThemeContext}>
          <MainMenu />
        </ThemeContext.Provider>
      </AuthContext.Provider>
    );

    const notificationBadge = screen.getByText('3');
    expect(notificationBadge).toBeInTheDocument();
    expect(notificationBadge).toHaveClass('bg-red-500'); // Notification badge styling
  });

  it('applies correct theme classes', () => {
    const darkThemeContext = {
      theme: 'dark' as const,
      toggleTheme: jest.fn(),
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ThemeContext.Provider value={darkThemeContext}>
          <MainMenu />
        </ThemeContext.Provider>
      </AuthContext.Provider>
    );

    const menuContainer = screen.getByRole('navigation');
    expect(menuContainer).toHaveClass('bg-gray-800'); // Dark theme class
  });
});