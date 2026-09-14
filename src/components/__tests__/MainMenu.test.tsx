import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@/context/ThemeContext';
import { MainMenu } from '../MainMenu';

// MainMenu es la barra superior: este test verifica su propio comportamiento,
// no el de los bloques que aloja, así que esos se sustituyen por marcadores.
jest.mock('@/components/UserMenu', () => ({
  UserMenu: () => <div data-testid="user-menu" />,
}));

jest.mock('@/components/Notifications/NotificationBell', () => ({
  __esModule: true,
  default: () => <div data-testid="notification-bell" />,
}));

jest.mock('@/components/Subscription/TrialBanner', () => ({
  TrialBanner: () => <div data-testid="trial-banner" />,
}));

jest.mock('@/components/GlobalSearch/GlobalSearchModal', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="search-modal" /> : null,
}));

jest.mock('@/components/Support/SupportModal', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="support-modal" /> : null,
}));

const mockFavorites = jest.fn();
jest.mock('@/hooks/useFavorites', () => ({
  useFavorites: () => mockFavorites(),
}));

function renderMainMenu() {
  return render(
    <ThemeProvider>
      <MainMenu />
    </ThemeProvider>,
  );
}

describe('MainMenu', () => {
  beforeEach(() => {
    localStorage.clear();
    mockFavorites.mockReturnValue({ favorites: [], toggle: jest.fn() });
  });

  it('muestra el logotipo y los bloques de la barra', () => {
    renderMainMenu();

    expect(screen.getByAltText('Nitro')).toBeInTheDocument();
    expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
  });

  it('usa el logotipo del tema activo', () => {
    localStorage.setItem('nitro-theme', 'blue');

    renderMainMenu();

    expect(screen.getByAltText('Nitro')).toHaveAttribute('src', '/nitrob.png');
  });

  it('abre la búsqueda global al pulsar su botón', () => {
    renderMainMenu();

    expect(screen.queryByTestId('search-modal')).not.toBeInTheDocument();

    // next-intl está simulado y devuelve la clave de traducción
    fireEvent.click(screen.getByText('search'));

    expect(screen.getByTestId('search-modal')).toBeInTheDocument();
  });

  it('abre el soporte al pulsar su botón', () => {
    renderMainMenu();

    expect(screen.queryByTestId('support-modal')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '' }) || screen.getAllByRole('button')[1]);

    expect(screen.getByTestId('support-modal')).toBeInTheDocument();
  });

  it('muestra el aviso de prueba cuando no hay favoritos', () => {
    renderMainMenu();

    expect(screen.getByTestId('trial-banner')).toBeInTheDocument();
  });

  describe('favoritos', () => {
    it('los muestra en lugar del aviso de prueba', () => {
      mockFavorites.mockReturnValue({
        favorites: [{ path: '/dashboard/productos', name: 'Productos' }],
        toggle: jest.fn(),
      });

      renderMainMenu();

      expect(screen.queryByTestId('trial-banner')).not.toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveAttribute('href', '/dashboard/productos');
    });

    it('permite quitar uno de favoritos', () => {
      const toggle = jest.fn();
      mockFavorites.mockReturnValue({
        favorites: [{ path: '/dashboard/productos', name: 'Productos' }],
        toggle,
      });

      renderMainMenu();

      fireEvent.click(screen.getByTitle('Quitar de favoritos'));

      expect(toggle).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/dashboard/productos' }),
      );
    });
  });
});
