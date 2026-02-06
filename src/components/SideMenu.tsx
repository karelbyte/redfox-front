"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePermissions } from "@/hooks/usePermissions";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  howCan?: string[];
  subItems?: {
    name: string;
    path: string;
    icon: React.ReactNode;
    howCan?: string[];
  }[];
}

const EXPANDED_MENU_STORAGE_KEY = "nitro-expanded-menu";
const SIDEBAR_COLLAPSED_STORAGE_KEY = "nitro-sidebar-collapsed";

export function SideMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("navigation");
  const { can } = usePermissions();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredCollapsedItem, setHoveredCollapsedItem] = useState<string | null>(null);
  const collapsePopoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (collapsePopoverTimeoutRef.current) {
        clearTimeout(collapsePopoverTimeoutRef.current);
      }
    };
  }, []);

  // Load expanded menu and collapsed state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(EXPANDED_MENU_STORAGE_KEY);
        if (stored) {
          setExpandedMenu(stored);
        }
        const storedCollapsed = localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
        if (storedCollapsed === "true") {
          setCollapsed(true);
        }
      } catch (error) {
        console.warn("Error reading sidebar state from localStorage:", error);
      }
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        try {
          if (next) {
            localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, "true");
          } else {
            localStorage.removeItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
          }
        } catch (error) {
          console.warn("Error saving sidebar collapsed state:", error);
        }
      }
      return next;
    });
  }, []);

  const toggleSubmenu = (path: string) => {
    const newExpandedMenu = expandedMenu === path ? null : path;
    setExpandedMenu(newExpandedMenu);

    // Save to localStorage
    if (typeof window !== "undefined") {
      try {
        if (newExpandedMenu) {
          localStorage.setItem(EXPANDED_MENU_STORAGE_KEY, newExpandedMenu);
        } else {
          localStorage.removeItem(EXPANDED_MENU_STORAGE_KEY);
        }
      } catch (error) {
        console.warn("Error saving expanded menu to localStorage:", error);
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
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(EXPANDED_MENU_STORAGE_KEY, item.path);
          } catch (error) {
            console.warn("Error saving expanded menu to localStorage:", error);
          }
        }

        // Navigate to the first submenu if we're not already on a submenu of this item
        const isOnSubmenuOfThisItem = item.subItems.some(
          (subItem) => pathname === subItem.path
        );
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
  const getLocalizedPath = useCallback((path: string) => `/${locale}${path}`, [locale]);

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        name: t("dashboard"),
        path: getLocalizedPath("/dashboard"),
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        ),
      },
      {
        name: t("entities"),
        path: getLocalizedPath("/dashboard/entidades"),
        howCan: ["client_module_view", "provider_module_view"],
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        ),
        subItems: [
          {
            name: t("clients"),
            path: getLocalizedPath("/dashboard/clientes"),
            howCan: ["client_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            ),
          },
          {
            name: t("providers"),
            path: getLocalizedPath("/dashboard/proveedores"),
            howCan: ["provider_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            ),
          },
        ],
      },
      {
        name: t("products"),
        path: getLocalizedPath("/dashboard/productos"),
        howCan: ["product_module_view", "category_module_view", "brand_module_view", "tax_module_view", "currency_module_view", "measurement_unit_module_view"],
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        ),
        subItems: [
          {
            name: t("addProduct"),
            path: getLocalizedPath("/dashboard/productos/agregar-producto"),
            howCan: ["product_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            ),
          },
          {
            name: t("productList"),
            path: getLocalizedPath("/dashboard/productos/lista-de-productos"),
            howCan: ["product_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            ),
          },
          {
            name: t("measurementUnits"),
            path: getLocalizedPath("/dashboard/productos/unidades-medida"),
            howCan: ["measurement_unit_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                />
              </svg>
            ),
          },
          {
            name: t("categories"),
            path: getLocalizedPath("/dashboard/productos/categorias"),
            howCan: ["category_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            ),
          },
          {
            name: t("brands"),
            path: getLocalizedPath("/dashboard/productos/marcas"),
            howCan: ["brand_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            ),
          },
          {
            name: t("taxes"),
            path: getLocalizedPath("/dashboard/productos/impuestos"),
            howCan: ["tax_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            ),
          },
          {
            name: t("currencies"),
            path: getLocalizedPath("/dashboard/productos/monedas"),
            howCan: ["currency_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m-2.599-3.801C9.08 13.598 8 13.198 8 12.5v-.5"
                />
              </svg>
            ),
          },
        ],
      },
      {
        name: t("warehouses"),
        path: getLocalizedPath("/dashboard/almacenes"),
        howCan: ["warehouse_module_view"],
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        ),
        subItems: [
          {
            name: t("addWarehouse"),
            path: getLocalizedPath("/dashboard/almacenes/agregar-almacen"),
            howCan: ["warehouse_create"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            ),
          },
          {
            name: t("warehouseList"),
            path: getLocalizedPath("/dashboard/almacenes/lista-de-almacenes"),
            howCan: ["warehouse_read"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            ),
          },
          {
            name: t("warehouseAdjustments"),
            path: getLocalizedPath("/dashboard/almacenes/ajustes-de-almacen"),
            howCan: ["warehouse_adjustment_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            ),
          },
          {
            name: t("returns"),
            path: getLocalizedPath("/dashboard/almacenes/devoluciones"),
            howCan: ["return_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7v4a2 2 0 01-2 2H7a2 2 0 01-2-2V7m0 0V5a2 2 0 012-2h10a2 2 0 012 2v2m-2 4v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"
                />
              </svg>
            ),
          },
        ],
      },
      {
        name: t("inventory"),
        path: getLocalizedPath("/dashboard/inventarios"),
        howCan: ["inventory_module_view"],
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        ),
      },
      {
        name: t("receptions"),
        path: getLocalizedPath("/dashboard/recepciones"),
        howCan: ["reception_module_view"],
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        ),
        subItems: [
          {
            name: t("createReception"),
            path: getLocalizedPath("/dashboard/recepciones/crear-recepcion"),
            howCan: ["reception_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            ),
          },
          {
            name: t("receptionList"),
            path: getLocalizedPath(
              "/dashboard/recepciones/lista-de-recepciones"
            ),
            howCan: ["reception_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            ),
          },
        ],
      },
      {
        name: t("quotations"),
        path: getLocalizedPath("/dashboard/cotizaciones"),
        howCan: ["quotation_module_view"],
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        ),
        subItems: [
          {
            name: t("createQuotation"),
            path: getLocalizedPath("/dashboard/cotizaciones/crear-cotizacion"),
            howCan: ["quotation_create"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            ),
          },
          {
            name: t("quotationList"),
            path: getLocalizedPath("/dashboard/cotizaciones/lista-de-cotizaciones"),
            howCan: ["quotation_read"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            ),
          },
        ],
      },
      {
        name: t("purchaseOrders"),
        path: getLocalizedPath("/dashboard/ordenes-de-compra"),
        howCan: ["purchase_order_module_view"],
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        ),
        subItems: [
          {
            name: t("createPurchaseOrder"),
            path: getLocalizedPath("/dashboard/ordenes-de-compra/crear-orden-compra"),
            howCan: ["purchase_order_create"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            ),
          },
          {
            name: t("purchaseOrderList"),
            path: getLocalizedPath("/dashboard/ordenes-de-compra"),
            howCan: ["purchase_order_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            ),
          },
        ],
      },
      {
        name: t("sales"),
        path: getLocalizedPath("/dashboard/ventas"),
        howCan: ["withdrawal_module_view"],
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        ),
        subItems: [
          {
            name: t("addSale"),
            path: getLocalizedPath("/dashboard/ventas/agregar-venta"),
            howCan: ["withdrawal_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            ),
          },
          {
            name: t("cashRegister"),
            path: getLocalizedPath("/dashboard/ventas/caja"),
            howCan: ["withdrawal_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            ),
          },
          {
            name: t("pos"),
            path: getLocalizedPath("/pos"),
            howCan: ["withdrawal_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            ),
          },
          {
            name: t("salesList"),
            path: getLocalizedPath("/dashboard/ventas"),
            howCan: ["withdrawal_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            ),
          },
        ],
      },
      {
        name: t("invoices"),
        path: getLocalizedPath("/dashboard/facturas"),
        howCan: ["invoice_module_view"],
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        ),
        subItems: [
          {
            name: t("createInvoice"),
            path: getLocalizedPath("/dashboard/facturas/crear-factura"),
            howCan: ["invoice_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            ),
          },
          {
            name: t("invoiceList"),
            path: getLocalizedPath("/dashboard/facturas"),
            howCan: ["invoice_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            ),
          },
        ],
      },
      {
        name: t("finance"),
        path: getLocalizedPath("/dashboard/finanzas"),
        howCan: ["expense_module_view", "account_receivable_module_view"],
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m-2.599-3.801C9.08 13.598 8 13.198 8 12.5v-.5"
            />
          </svg>
        ),
        subItems: [
          {
            name: t("expenses"),
            path: getLocalizedPath("/dashboard/finanzas/gastos"),
            howCan: ["expense_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            ),
          },
          {
            name: t("accountsReceivable"),
            path: getLocalizedPath("/dashboard/finanzas/cuentas-por-cobrar"),
            howCan: ["account_receivable_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            ),
          },
          {
            name: t("accountsPayable"),
            path: getLocalizedPath("/dashboard/finanzas/cuentas-por-pagar"),
            howCan: ["account_payable_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            ),
          },
          {
            name: t("cashFlow"),
            path: getLocalizedPath("/dashboard/finanzas/flujo-de-caja"),
            howCan: ["cash_flow_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            ),
          },
        ],
      },
      {
        name: t("settings"),
        path: getLocalizedPath("/dashboard/configuracion"),
        howCan: ["role_module_view", "user_module_view", "system_module_view"],
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        ),
        subItems: [
          {
            name: t("companySettings"),
            path: getLocalizedPath("/dashboard/configuracion/generales-empresa"),
            howCan: ["all"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            ),
          },
          {
            name: t("roles"),
            path: getLocalizedPath("/dashboard/configuracion/roles"),
            howCan: ["role_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            ),
          },
          {
            name: t("users"),
            path: getLocalizedPath("/dashboard/configuracion/usuarios"),
            howCan: ["user_module_view"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ),
          },
          {
            name: t("emailConfig"),
            path: getLocalizedPath("/dashboard/configuracion/correo"),
            howCan: ["all"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            ),
          },
          {
            name: t("paymentGateway"),
            path: getLocalizedPath("/dashboard/configuracion/pasarela-pago"),
            howCan: ["all"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            ),
          },
          {
            name: t("backup"),
            path: getLocalizedPath("/dashboard/configuracion/respaldo"),
            howCan: ["all"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
            ),
          },
          {
            name: t("certificationPacks"),
            path: getLocalizedPath("/dashboard/configuracion/packs-sat"),
            howCan: ["all"],
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            ),
          },
        ],
      },
    ],
    [t, getLocalizedPath]
  );

  // Auto-expand menu when on a submenu page
  useEffect(() => {
    const currentMenuItem = menuItems.find((item) =>
      item.subItems?.some((subItem) => pathname === subItem.path)
    );

    if (currentMenuItem && expandedMenu !== currentMenuItem.path) {
      setExpandedMenu(currentMenuItem.path);
      // Save to localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(EXPANDED_MENU_STORAGE_KEY, currentMenuItem.path);
        } catch (error) {
          console.warn("Error saving expanded menu to localStorage:", error);
        }
      }
    }
  }, [pathname, expandedMenu, menuItems]);

  // Función para verificar si un elemento del menú debe mostrarse
  const shouldShowMenuItem = (item: MenuItem): boolean => {
    // Si no tiene permisos definidos, siempre se muestra
    if (!item.howCan || item.howCan.length === 0) {
      return true;
    }
    
    // Verificar si el usuario tiene al menos uno de los permisos requeridos
    return can(item.howCan);
  };

  // Función para verificar si un subelemento debe mostrarse
  const shouldShowSubItem = (subItem: { name: string; path: string; icon: React.ReactNode; howCan?: string[] }): boolean => {
    // Si no tiene permisos definidos, siempre se muestra
    if (!subItem.howCan || subItem.howCan.length === 0) {
      return true;
    }
    
    // Verificar si el usuario tiene al menos uno de los permisos requeridos
    return can(subItem.howCan);
  };

  // Filtrar elementos del menú basándose en permisos
  const filteredMenuItems = menuItems.filter(shouldShowMenuItem);

  return (
    <aside
      className={`relative flex-shrink-0 bg-white border-r h-full transition-[width] duration-200 ${collapsed ? "w-20" : "w-64"}`}
      style={{ borderColor: `rgb(var(--color-primary-100))` }}
    >
      <button
        type="button"
        onClick={toggleCollapsed}
        className="absolute -right-3 top-4 z-10 p-1 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center"
        title={collapsed ? t("expandMenu") : t("collapseMenu")}
        aria-label={collapsed ? t("expandMenu") : t("collapseMenu")}
      >
        {collapsed ? (
          <ChevronRightIcon className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
        )}
      </button>
      <nav className="h-full flex flex-col pt-10 pb-4 px-4">
        <div className={`space-y-1 flex-1 min-h-0 ${collapsed ? "overflow-visible" : "overflow-y-auto"}`}>
          {filteredMenuItems.map((item) => {
            const isActive = Boolean(
              pathname === item.path ||
              item.subItems?.some((subItem) => pathname === subItem.path)
            );
            const isExpanded = expandedMenu === item.path;

            // Filtrar subelementos basándose en permisos
            const filteredSubItems = item.subItems?.filter(shouldShowSubItem) || [];
            const hrefWhenCollapsed = item.subItems && filteredSubItems.length > 0
              ? filteredSubItems[0].path
              : item.path;

            const iconContent = (
              <span
                className={collapsed ? "flex items-center justify-center" : "mr-3"}
                style={{
                  color: isActive
                    ? `rgb(var(--color-primary-500))`
                    : "#9ca3af",
                }}
              >
                {item.icon}
              </span>
            );

            const itemClassName = collapsed
              ? "w-full flex items-center justify-center px-2 py-3 rounded-lg transition-colors"
              : "w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors";
            const itemStyle = {
              backgroundColor: isActive ? `rgb(var(--color-primary-50))` : "transparent",
              color: isActive ? `rgb(var(--color-primary-600))` : "#4b5563",
            };
            const itemHover = (e: React.MouseEvent<HTMLElement>, active: boolean) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = `rgb(var(--color-primary-50))`;
                e.currentTarget.style.color = `rgb(var(--color-primary-600))`;
              }
            };
            const itemHoverLeave = (e: React.MouseEvent<HTMLElement>, active: boolean) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#4b5563";
              }
            };

            if (collapsed) {
              const showPopover = hoveredCollapsedItem === item.path;
              const options = filteredSubItems.length > 0
                ? filteredSubItems
                : [{ name: item.name, path: item.path, icon: item.icon }];
              const handleCollapsedEnter = () => {
                if (collapsePopoverTimeoutRef.current) {
                  clearTimeout(collapsePopoverTimeoutRef.current);
                  collapsePopoverTimeoutRef.current = null;
                }
                setHoveredCollapsedItem(item.path);
              };
              const handleCollapsedLeave = () => {
                collapsePopoverTimeoutRef.current = setTimeout(() => {
                  setHoveredCollapsedItem(null);
                  collapsePopoverTimeoutRef.current = null;
                }, 120);
              };
              return (
                <div
                  key={item.path}
                  className="relative"
                  onMouseEnter={handleCollapsedEnter}
                  onMouseLeave={handleCollapsedLeave}
                >
                  {filteredSubItems.length > 0 ? (
                    <div
                      className={itemClassName}
                      style={itemStyle}
                      onMouseEnter={(e) => itemHover(e, isActive)}
                      onMouseLeave={(e) => itemHoverLeave(e, isActive)}
                    >
                      {iconContent}
                    </div>
                  ) : (
                    <Link
                      href={item.path}
                      className={itemClassName}
                      style={itemStyle}
                      onMouseEnter={(e) => itemHover(e, isActive)}
                      onMouseLeave={(e) => itemHoverLeave(e, isActive)}
                    >
                      {iconContent}
                    </Link>
                  )}
                  {showPopover && (
                    <div
                      className="absolute left-full top-0 z-50 py-1 min-w-[180px] bg-white rounded-lg shadow-lg border border-gray-200 -ml-px"
                      style={{ borderColor: "rgb(var(--color-primary-100))" }}
                      role="menu"
                    >
                      {options.map((opt) => (
                        <Link
                          key={opt.path}
                          href={opt.path}
                          className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors mx-1"
                          style={{
                            backgroundColor:
                              pathname === opt.path
                                ? "rgb(var(--color-primary-50))"
                                : "transparent",
                            color:
                              pathname === opt.path
                                ? "rgb(var(--color-primary-600))"
                                : "#4b5563",
                          }}
                          onMouseEnter={(e) => {
                            if (pathname !== opt.path) {
                              e.currentTarget.style.backgroundColor =
                                "rgb(var(--color-primary-50))";
                              e.currentTarget.style.color =
                                "rgb(var(--color-primary-600))";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (pathname !== opt.path) {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                              e.currentTarget.style.color = "#4b5563";
                            }
                          }}
                          role="menuitem"
                        >
                          <span
                            className="mr-3 shrink-0"
                            style={{
                              color:
                                pathname === opt.path
                                  ? "rgb(var(--color-primary-500))"
                                  : "#9ca3af",
                            }}
                          >
                            {opt.icon}
                          </span>
                          {opt.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={item.path}>
                {item.subItems ? (
                  <button
                    onClick={() => handleMenuClick(item)}
                    className={itemClassName}
                    style={itemStyle}
                    onMouseEnter={(e) => itemHover(e, isActive)}
                    onMouseLeave={(e) => itemHoverLeave(e, isActive)}
                  >
                    {iconContent}
                    {item.name}
                    <svg
                      className={`ml-auto w-4 h-4 transform transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                ) : (
                  <Link
                    href={item.path}
                    className={itemClassName}
                    style={itemStyle}
                    onMouseEnter={(e) => itemHover(e, isActive)}
                    onMouseLeave={(e) => itemHoverLeave(e, isActive)}
                  >
                    {iconContent}
                    {item.name}
                  </Link>
                )}
                {item.subItems && isExpanded && filteredSubItems.length > 0 && (
                  <div className="ml-4 mt-1 space-y-1">
                    {filteredSubItems.map((subItem) => (
                      <Link
                        key={subItem.path}
                        href={subItem.path}
                        className="block px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                        style={{
                          backgroundColor:
                            pathname === subItem.path
                              ? `rgb(var(--color-primary-50))`
                              : "transparent",
                          color:
                            pathname === subItem.path
                              ? `rgb(var(--color-primary-600))`
                              : "#4b5563",
                        }}
                        onMouseEnter={(e) => {
                          if (pathname !== subItem.path) {
                            e.currentTarget.style.backgroundColor = `rgb(var(--color-primary-50))`;
                            e.currentTarget.style.color = `rgb(var(--color-primary-600))`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (pathname !== subItem.path) {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                            e.currentTarget.style.color = "#4b5563";
                          }
                        }}
                      >
                        <div className="flex items-center">
                          <span
                            className="mr-3"
                            style={{
                              color:
                                pathname === subItem.path
                                  ? `rgb(var(--color-primary-500))`
                                  : "#9ca3af",
                            }}
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
