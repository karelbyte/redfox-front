"use client";

import { usePathname, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePermissions } from "@/hooks/usePermissions";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { useFavorites } from "@/hooks/useFavorites";

interface MenuItem {
  name: string;
  translationKey: string;
  path: string;
  icon: React.ReactNode;
  howCan?: string[];
  subItems?: {
    name: string;
    translationKey: string;
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
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations("navigation");
  const { can } = usePermissions();
  const { isFavorite, toggle } = useFavorites();

  const tenant = params?.tenant as string;

  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredCollapsedItem, setHoveredCollapsedItem] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ top?: number; bottom?: number }>({});
  const collapsePopoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popoverTriggerRef = useRef<HTMLDivElement | null>(null);

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

  // Función para construir rutas con tenant y locale
  const getLocalizedPath = useCallback((path: string) => `/${tenant}/${locale}${path}`, [tenant, locale]);

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        name: t("dashboard"),
        translationKey: "dashboard",
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
        translationKey: "entities",
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
            translationKey: "clients",
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
            translationKey: "providers",
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
        translationKey: "products",
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
            translationKey: "addProduct",
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
            translationKey: "productList",
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
            translationKey: "measurementUnits",
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
            translationKey: "categories",
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
            translationKey: "brands",
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
            translationKey: "taxes",
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
            translationKey: "currencies",
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
        translationKey: "warehouses",
        path: getLocalizedPath("/dashboard/almacenes"),
        howCan: ["warehouse_module_view"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 21V10.5M16 21V10.5M3 21h18M3 10.5l9-7.5 9 7.5M12 3v1" />
          </svg>
        ),
        subItems: [
          {
            name: t("addWarehouse"),
            translationKey: "addWarehouse",
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
            translationKey: "warehouseList",
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
            translationKey: "warehouseAdjustments",
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
            translationKey: "returns",
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
        translationKey: "inventory",
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
        translationKey: "receptions",
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
            translationKey: "createReception",
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
            translationKey: "receptionList",
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
        translationKey: "quotations",
        path: getLocalizedPath("/dashboard/cotizaciones"),
        howCan: ["quotation_module_view"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
        subItems: [
          {
            name: t("createQuotation"),
            translationKey: "createQuotation",
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
            translationKey: "quotationList",
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
        translationKey: "purchaseOrders",
        path: getLocalizedPath("/dashboard/ordenes-de-compra"),
        howCan: ["purchase_order_module_view"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-4 6h.01M13 12h.01M9 16h6" />
          </svg>
        ),
        subItems: [
          {
            name: t("createPurchaseOrder"),
            translationKey: "createPurchaseOrder",
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
            translationKey: "purchaseOrderList",
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
        translationKey: "sales",
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
            translationKey: "addSale",
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
            translationKey: "cashRegister",
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
            translationKey: "pos",
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
            translationKey: "salesList",
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
          {
            name: locale === 'en' ? 'Shipments' : locale === 'zh' ? '物流 / 发货' : 'Logística / Envíos',
            translationKey: "shipments",
            path: getLocalizedPath("/dashboard/ventas/envios"),
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
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
            ),
          },
        ],
      },
      {
        name: t("invoices"),
        translationKey: "invoices",
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        ),
        subItems: [
          {
            name: t("createInvoice"),
            translationKey: "createInvoice",
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
            translationKey: "invoiceList",
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
        translationKey: "finance",
        path: getLocalizedPath("/dashboard/finanzas"),
        howCan: ["expense_module_view", "account_receivable_module_view"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        subItems: [
          {
            name: t("expenses"),
            translationKey: "expenses",
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
            translationKey: "accountsReceivable",
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
            translationKey: "accountsPayable",
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
            translationKey: "cashFlow",
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
        name: t("whatsAppBot"),
        translationKey: "whatsAppBot",
        path: getLocalizedPath("/dashboard/configuracion/bot-whatsapp"),
        howCan: ["bot_module_view"],
        icon: (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>

        ),
      },
      {
        name: t("settings"),
        translationKey: "settings",
        path: getLocalizedPath("/dashboard/configuracion"),
        howCan: ["role_module_view", "user_module_view", "system_module_view", "bot_module_view"],
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
            translationKey: "companySettings",
            path: getLocalizedPath("/dashboard/configuracion/generales-empresa"),
            howCan: ["company_settings_module_view"],
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
            name: t("subscription"),
            translationKey: "subscription",
            path: getLocalizedPath("/dashboard/suscripcion"),
            howCan: [],
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            ),
          },
          {
            name: t("roles"),
            translationKey: "roles",
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
            translationKey: "users",
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
            translationKey: "emailConfig",
            path: getLocalizedPath("/dashboard/configuracion/correo"),
            howCan: ["email_config_module_view"],
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
            translationKey: "paymentGateway",
            path: getLocalizedPath("/dashboard/configuracion/pasarela-pago"),
            howCan: ["payment_gateway_module_view"],
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            ),
          },
          {
            name: t("backup"),
            translationKey: "backup",
            path: getLocalizedPath("/dashboard/configuracion/respaldo"),
            howCan: ["backup_module_view"],
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
            translationKey: "certificationPacks",
            path: getLocalizedPath("/dashboard/configuracion/packs-sat"),
            howCan: ["certification_pack_module_view"],
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
              </svg>
            ),
          },
          {
            name: t("auditLogs"),
            translationKey: "auditLogs",
            path: getLocalizedPath("/dashboard/configuracion/logs-auditoria"),
            howCan: ["audit_log_module_view"],
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
      className={`relative z-20 flex-shrink-0 bg-white border-r h-full transition-[width] duration-200 ${collapsed ? "w-20" : "w-64"}`}
      style={{ borderColor: `rgb(var(--color-primary-100))` }}
    >
      <button
        type="button"
        onClick={toggleCollapsed}
        className="absolute -right-3 top-4 z-10 p-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center cursor-pointer"
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
              : "group w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors";
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

              const handleCollapsedEnter = (e: React.MouseEvent<HTMLDivElement>) => {
                if (collapsePopoverTimeoutRef.current) {
                  clearTimeout(collapsePopoverTimeoutRef.current);
                  collapsePopoverTimeoutRef.current = null;
                }
                setHoveredCollapsedItem(item.path);

                // Calcular posición del popover
                const trigger = e.currentTarget;
                const triggerRect = trigger.getBoundingClientRect();
                const viewportHeight = window.innerHeight;

                // Estimar altura del popover (cada item ~40px + padding)
                const estimatedPopoverHeight = options.length * 40 + 16;

                // Verificar si se sale por abajo
                const spaceBelow = viewportHeight - triggerRect.bottom;
                const spaceAbove = triggerRect.top;

                if (spaceBelow < estimatedPopoverHeight && spaceAbove > spaceBelow) {
                  // No hay espacio abajo pero sí arriba, alinear al bottom
                  setPopoverPosition({ bottom: 0 });
                } else if (spaceBelow < estimatedPopoverHeight) {
                  // No hay espacio suficiente, calcular top para que quepa
                  const maxTop = Math.max(0, viewportHeight - estimatedPopoverHeight - triggerRect.top - 20);
                  setPopoverPosition({ top: -Math.abs(triggerRect.bottom - viewportHeight + 20) });
                } else {
                  // Hay espacio, posición normal
                  setPopoverPosition({ top: 0 });
                }
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
                  ref={popoverTriggerRef}
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
                      className="absolute left-full z-50 py-1 min-w-[220px] bg-white rounded-lg shadow-lg border border-gray-200 -ml-px"
                      style={{
                        borderColor: "rgb(var(--color-primary-100))",
                        ...(popoverPosition.top !== undefined ? { top: popoverPosition.top } : {}),
                        ...(popoverPosition.bottom !== undefined ? { bottom: popoverPosition.bottom } : {})
                      }}
                      role="menu"
                    >
                      {options.map((opt) => (
                        <div key={opt.path} className="flex items-center mx-1 group/popitem">
                          <Link
                            href={opt.path}
                            className="flex items-center flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors min-w-0"
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
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggle({ path: opt.path, name: opt.name, translationKey: (opt as any).translationKey }); }}
                            className="p-1 mr-1 rounded flex-shrink-0"
                            title={isFavorite(opt.path) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                          >
                            {isFavorite(opt.path)
                              ? <StarSolid className="h-3.5 w-3.5 text-yellow-400" />
                              : <StarIcon className="h-3.5 w-3.5 text-gray-300 hover:text-yellow-400" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={item.path}>
                {item.subItems ? (
                  <div
                    onClick={() => handleMenuClick(item)}
                    className={itemClassName + " cursor-pointer"}
                    style={itemStyle}
                    onMouseEnter={(e) => itemHover(e as any, isActive)}
                    onMouseLeave={(e) => itemHoverLeave(e as any, isActive)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleMenuClick(item)}
                  >
                    {iconContent}
                    <span className="flex-1 text-left">{item.name}</span>
                    <svg
                      className={`w-4 h-4 flex-shrink-0 transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
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
                    <span className="flex-1">{item.name}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle({ path: item.path, name: item.name, translationKey: item.translationKey }); }}
                      className="ml-1 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                      title={isFavorite(item.path) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    >
                      {isFavorite(item.path)
                        ? <StarSolid className="h-3.5 w-3.5 text-yellow-400" />
                        : <StarIcon className="h-3.5 w-3.5 text-gray-300 hover:text-yellow-400" />}
                    </button>
                  </Link>
                )}
                {item.subItems && isExpanded && filteredSubItems.length > 0 && (
                  <div className="ml-4 mt-1 space-y-1">
                    {filteredSubItems.map((subItem) => (
                      <Link
                        key={subItem.path}
                        href={subItem.path}
                        {...(subItem.translationKey === 'pos' ? { 'data-tour': 'pos' } : {})}
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
                          <span className="flex-1">{subItem.name}</span>
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle({ path: subItem.path, name: subItem.name, translationKey: subItem.translationKey }); }}
                            className="ml-1 p-0.5 rounded transition-opacity"
                            title={isFavorite(subItem.path) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                          >
                            {isFavorite(subItem.path)
                              ? <StarSolid className="h-3.5 w-3.5 text-yellow-400" />
                              : <StarIcon className="h-3.5 w-3.5 text-gray-300 hover:text-yellow-400" />}
                          </button>
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
