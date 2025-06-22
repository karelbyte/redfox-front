'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  subItems?: {
    name: string;
    path: string;
    icon: React.ReactNode;
  }[];
}

const EXPANDED_MENU_STORAGE_KEY = 'nitro-expanded-menu';

export function SideMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('navigation');
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  // Load expanded menu state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(EXPANDED_MENU_STORAGE_KEY);
        if (stored) {
          setExpandedMenu(stored);
        }
      } catch (error) {
        console.warn('Error reading expanded menu from localStorage:', error);
      }
    }
  }, []);

  const toggleSubmenu = (path: string) => {
    const newExpandedMenu = expandedMenu === path ? null : path;
    setExpandedMenu(newExpandedMenu);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        if (newExpandedMenu) {
          localStorage.setItem(EXPANDED_MENU_STORAGE_KEY, newExpandedMenu);
        } else {
          localStorage.removeItem(EXPANDED_MENU_STORAGE_KEY);
        }
      } catch (error) {
        console.warn('Error saving expanded menu to localStorage:', error);
      }
    }
  };

  // Handle click on menu item with submenus
  const handleMenuClick = (item: MenuItem) => {
    if (item.subItems) {
      // If clicking on a different menu, expand it and close others
      if (expandedMenu !== item.path) {
        setExpandedMenu(item.path);
        // Save to localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(EXPANDED_MENU_STORAGE_KEY, item.path);
          } catch (error) {
            console.warn('Error saving expanded menu to localStorage:', error);
          }
        }
        
        // Navigate to the first submenu if we're not already on a submenu of this item
        const isOnSubmenuOfThisItem = item.subItems.some(subItem => pathname === subItem.path);
        if (!isOnSubmenuOfThisItem && item.subItems.length > 0) {
          // Navigate to the first submenu
          router.push(item.subItems[0].path);
        }
      } else {
        // If clicking on the same menu, toggle it
        toggleSubmenu(item.path);
      }
    }
  };

  // Función para construir rutas con locale
  const getLocalizedPath = (path: string) => `/${locale}${path}`;

  const menuItems: MenuItem[] = [
    {
      name: t('dashboard'),
      path: getLocalizedPath('/dashboard'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: t('entities'),
      path: getLocalizedPath('/dashboard/entidades'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      subItems: [
        {
          name: t('clients'),
          path: getLocalizedPath('/dashboard/clientes'),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
        },
        {
          name: t('providers'),
          path: getLocalizedPath('/dashboard/proveedores'),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
        },
      ],
    },
    {
      name: t('products'),
      path: getLocalizedPath('/dashboard/productos'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      subItems: [
        {
          name: t('addProduct'),
          path: getLocalizedPath('/dashboard/productos/agregar-producto'),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          ),
        },
        {
          name: t('productList'),
          path: getLocalizedPath('/dashboard/productos/lista-de-productos'),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          ),
        },
        {
          name: t('measurementUnits'),
          path: getLocalizedPath('/dashboard/productos/unidades-medida'),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          ),
        },
        {
          name: t('categories'),
          path: getLocalizedPath('/dashboard/productos/categorias'),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          ),
        },
        {
          name: t('brands'),
          path: getLocalizedPath('/dashboard/productos/marcas'),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          ),
        },
        {
          name: t('taxes'),
          path: getLocalizedPath('/dashboard/productos/impuestos'),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          name: t('currencies'),
          path: getLocalizedPath('/dashboard/productos/monedas'),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m-2.599-3.801C9.08 13.598 8 13.198 8 12.5v-.5" />
            </svg>
          ),
        },
      ],
    },
    {
      name: t('warehouses'),
      path: getLocalizedPath('/dashboard/almacenes'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      subItems: [
        {
          name: t('addWarehouse'),
          path: getLocalizedPath('/dashboard/almacenes/agregar-almacen'),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          ),
        },
        {
          name: t('warehouseList'),
          path: getLocalizedPath('/dashboard/almacenes/lista-de-almacenes'),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          ),
        },
      ],
    },
    {
      name: t('inventory'),
      path: getLocalizedPath('/dashboard/inventarios'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      name: t('receptions'),
      path: getLocalizedPath('/dashboard/recepciones'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      subItems: [
        {
          name: t('createReception'),
          path: getLocalizedPath('/dashboard/recepciones/crear-recepcion'),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          ),
        },
        {
          name: t('receptionList'),
          path: getLocalizedPath('/dashboard/recepciones/lista-de-recepciones'),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          ),
        },
      ],
    },
    {
      name: t('sales'),
      path: getLocalizedPath('/dashboard/ventas'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      subItems: [
        {
          name: t('salesList'),
          path: getLocalizedPath('/dashboard/ventas'),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          ),
        },
        {
          name: t('addSale'),
          path: getLocalizedPath('/dashboard/ventas/agregar-venta'),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          ),
        },
        {
          name: t('pos'),
          path: getLocalizedPath('/dashboard/ventas/pos'),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          ),
        },
      ],
    },
    {
      name: t('settings'),
      path: getLocalizedPath('/dashboard/configuracion'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      subItems: [
        {
          name: t('users'),
          path: getLocalizedPath('/dashboard/configuracion/usuarios'),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ),
        },
        {
          name: t('roles'),
          path: getLocalizedPath('/dashboard/configuracion/roles'),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ),
        },
        {
          name: t('emailConfig'),
          path: getLocalizedPath('/dashboard/configuracion/correo'),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          name: t('paymentGateway'),
          path: getLocalizedPath('/dashboard/configuracion/pasarela-pago'),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          ),
        },
        {
          name: t('backup'),
          path: getLocalizedPath('/dashboard/configuracion/respaldo'),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          ),
        },
      ],
    },
  ];

  // Auto-expand menu when on a submenu page
  useEffect(() => {
    const currentMenuItem = menuItems.find(item => 
      item.subItems?.some(subItem => pathname === subItem.path)
    );
    
    if (currentMenuItem && expandedMenu !== currentMenuItem.path) {
      setExpandedMenu(currentMenuItem.path);
      // Save to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(EXPANDED_MENU_STORAGE_KEY, currentMenuItem.path);
        } catch (error) {
          console.warn('Error saving expanded menu to localStorage:', error);
        }
      }
    }
  }, [pathname, expandedMenu, menuItems]);

  return (
    <aside 
      className="w-64 flex-shrink-0 bg-white border-r h-full"
      style={{ borderColor: `rgb(var(--color-primary-100))` }}
    >
      <nav className="h-full p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.subItems?.some(subItem => pathname === subItem.path));
            const isExpanded = expandedMenu === item.path;

            return (
              <div key={item.path}>
                {item.subItems ? (
                  <button
                    onClick={() => handleMenuClick(item)}
                    className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
                    style={{
                      backgroundColor: isActive ? `rgb(var(--color-primary-50))` : 'transparent',
                      color: isActive ? `rgb(var(--color-primary-600))` : '#4b5563'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = `rgb(var(--color-primary-50))`;
                        e.currentTarget.style.color = `rgb(var(--color-primary-600))`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#4b5563';
                      }
                    }}
                  >
                    <span 
                      className="mr-3"
                      style={{ color: isActive ? `rgb(var(--color-primary-500))` : '#9ca3af' }}
                    >
                      {item.icon}
                    </span>
                    {item.name}
                    <svg
                      className={`ml-auto w-4 h-4 transform transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                ) : (
                  <Link
                    href={item.path}
                    className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
                    style={{
                      backgroundColor: isActive ? `rgb(var(--color-primary-50))` : 'transparent',
                      color: isActive ? `rgb(var(--color-primary-600))` : '#4b5563'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = `rgb(var(--color-primary-50))`;
                        e.currentTarget.style.color = `rgb(var(--color-primary-600))`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#4b5563';
                      }
                    }}
                  >
                    <span 
                      className="mr-3"
                      style={{ color: isActive ? `rgb(var(--color-primary-500))` : '#9ca3af' }}
                    >
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                )}
                {item.subItems && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.path}
                        href={subItem.path}
                        className="block px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                        style={{
                          backgroundColor: pathname === subItem.path ? `rgb(var(--color-primary-50))` : 'transparent',
                          color: pathname === subItem.path ? `rgb(var(--color-primary-600))` : '#4b5563'
                        }}
                        onMouseEnter={(e) => {
                          if (pathname !== subItem.path) {
                            e.currentTarget.style.backgroundColor = `rgb(var(--color-primary-50))`;
                            e.currentTarget.style.color = `rgb(var(--color-primary-600))`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (pathname !== subItem.path) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#4b5563';
                          }
                        }}
                      >
                        <div className="flex items-center">
                          <span 
                            className="mr-3"
                            style={{ color: pathname === subItem.path ? `rgb(var(--color-primary-500))` : '#9ca3af' }}
                          >
                            {subItem.icon}
                          </span>
                          {subItem.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );
} 