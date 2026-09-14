"use client";

import { usePathname, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/context/AuthContext";
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
  const { user } = useAuth();
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

  const handleMenuClick = (item: MenuItem) => {
    if (item.subItems) {
      if (expandedMenu !== item.path) {
        setExpandedMenu(item.path);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(EXPANDED_MENU_STORAGE_KEY, item.path);
          } catch (error) {
            console.warn("Error saving expanded menu to localStorage:", error);
          }
        }

        const isOnSubmenuOfThisItem = item.subItems.some(
          (subItem) => pathname === subItem.path
        );
        if (!isOnSubmenuOfThisItem && item.subItems.length > 0) {
          router.push(item.subItems[0].path);
        }
      } else {
        toggleSubmenu(item.path);
      }
    }
  };

  const getLocalizedPath = useCallback((path: string) => `/${tenant}/${locale}${path}`, [tenant, locale]);

  const hrTranslations: Record<string, Record<string, string>> = {
    es: {
      hr: "Recursos Humanos",
      employees: "Empleados",
      departments: "Departamentos",
      positions: "Puestos",
      attendance: "Asistencia",
      leave: "Ausencias",
      payroll: "Nómina",
      documents: "Documentos",
    },
    en: {
      hr: "Human Resources",
      employees: "Employees",
      departments: "Departments",
      positions: "Positions",
      attendance: "Attendance",
      leave: "Leave",
      payroll: "Payroll",
      documents: "Documents",
    },
    zh: {
      hr: "人力资源",
      employees: "员工",
      departments: "部门",
      positions: "职位",
      attendance: "出勤",
      leave: "请假",
      payroll: "工资单",
      documents: "文档",
    }
  };

  const tHr = (key: string) => {
    return hrTranslations[locale]?.[key] || key;
  };

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
                  d="M21 8v11a2 2 0 01-2 2H5a2 2 0 01-2-2V8m18 0l-3-4H6L3 8m18 0H3m9 5v6m3-3H9"
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
                  d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
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
                  d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
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
                  d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
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
                  d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.25 2.25 0 0 0-1.813-.906H14.25M16.5 18.75h-2.25m0-11.25V18.75m0-11.25H8.25m0 11.25V7.5"
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
                  d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3"
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
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
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
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
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
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 18 4.5h-2.25a2.25 2.25 0 0 0-2.25-2.25H10.5A2.25 2.25 0 0 0 8.25 4.5H6a2.25 2.25 0 0 0-2.25 2.25v12.75A2.25 2.25 0 0 0 6 21h2.25m3.375-19.125h1.5a1.125 1.125 0 0 1 1.125 1.125v1.5a1.125 1.125 0 0 1-1.125 1.125h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a1.125 1.125 0 0 1 1.125-1.125Z"
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
                  d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 19.5m9.75-9.75c0 .621-.504 1.125-1.125 1.125H12.75a1.125 1.125 0 01-1.125-1.125m9.75 0V9.375c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5M12.75 9.75h-7.5A1.125 1.125 0 014.125 8.625m0 0V8.25a1.125 1.125 0 011.125-1.125h13.5A1.125 1.125 0 0120.625 8.25v.375m-16.5 0h16.5"
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
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
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
            name: t("cashRegisters"),
            translationKey: "cashRegisters",
            path: getLocalizedPath("/dashboard/ventas/cajas"),
            howCan: ["cash_registers_create", "cash_registers_update", "cash_registers_delete"],
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
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
                  d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75h-.75M3.75 15H3a.75.75 0 00-.75-.75V6M3.75 15h16.5"
                />
              </svg>
            ),
          },
          {
            name: locale === 'en' ? 'Shipments' : locale === 'zh' ? '物流 / 发货' : 'Logística / Envíos',
            translationKey: "shipments",
            path: getLocalizedPath("/dashboard/ventas/envios"),
            howCan: ["shipment_module_view"],
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
                  d="M9 14.25l6-6m4.5-3.493V21a.75.75 0 01-1.5 0V7.167M4.879 17.121a3 3 0 114.242 4.242 3 3 0 01-4.242-4.242zm10-10a3 3 0 114.242 4.242 3 3 0 01-4.242-4.242zM3.375 3.75h17.25c.621 0 1.125.504 1.125 1.125v15c0 .621-.504 1.125-1.125 1.125H3.375c-.621 0-1.125-.504-1.125-1.125v-15c0-.621.504-1.125 1.125-1.125z"
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
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
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
        name: tHr("hr"),
        translationKey: "hr",
        path: getLocalizedPath("/dashboard/rrhh"),
        howCan: [
          "hr_employee_view",
          "hr_department_view",
          "hr_position_view",
          "hr_attendance_view",
          "hr_leave_request_view",
          "hr_payroll_view",
          "hr_document_view",
        ],
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        ),
        subItems: [
          {
            name: tHr("employees"),
            translationKey: "employees",
            path: getLocalizedPath("/dashboard/rrhh/empleados"),
            howCan: ["hr_employee_view"],
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
            name: tHr("departments"),
            translationKey: "departments",
            path: getLocalizedPath("/dashboard/rrhh/departamentos"),
            howCan: ["hr_department_view"],
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
            name: tHr("positions"),
            translationKey: "positions",
            path: getLocalizedPath("/dashboard/rrhh/puestos"),
            howCan: ["hr_position_view"],
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
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            ),
          },
          {
            name: tHr("attendance"),
            translationKey: "attendance",
            path: getLocalizedPath("/dashboard/rrhh/asistencia"),
            howCan: ["hr_attendance_view"],
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
          },
          {
            name: tHr("leave"),
            translationKey: "leave",
            path: getLocalizedPath("/dashboard/rrhh/ausencias"),
            howCan: ["hr_leave_request_view"],
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            ),
          },
          {
            name: tHr("payroll"),
            translationKey: "payroll",
            path: getLocalizedPath("/dashboard/rrhh/nomina"),
            howCan: ["hr_payroll_view"],
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
          },
          {
            name: tHr("documents"),
            translationKey: "documents",
            path: getLocalizedPath("/dashboard/rrhh/documentos"),
            howCan: ["hr_document_view"],
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
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
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
          ...(user?.admin ? [{
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
          }] : []),
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
            name: t("webhooks"),
            translationKey: "webhooks",
            path: getLocalizedPath("/dashboard/configuracion/webhooks"),
            howCan: ["webhooks_module_view"],
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
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
            name: t("documentSeries"),
            translationKey: "documentSeries",
            path: getLocalizedPath("/dashboard/configuracion/series-comprobantes"),
            howCan: ["certification_pack_module_view"],
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 7h10M7 11h10M7 15h6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
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

  // Al navegar se despliega el menú al que pertenece la ruta, pero solo una
  // vez por ruta: si dependiera de `expandedMenu`, cerrar el menú estando en
  // una de sus páginas volvería a ejecutar este efecto y lo reabriría al
  // instante, impidiendo cerrarlo.
  const autoExpandedForPath = useRef<string | null>(null);

  useEffect(() => {
    if (autoExpandedForPath.current === pathname) {
      return;
    }

    autoExpandedForPath.current = pathname;

    const currentMenuItem = menuItems.find((item) =>
      item.subItems?.some((subItem) => pathname === subItem.path)
    );

    if (!currentMenuItem) {
      return;
    }

    setExpandedMenu(currentMenuItem.path);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(EXPANDED_MENU_STORAGE_KEY, currentMenuItem.path);
      } catch (error) {
        console.warn("Error saving expanded menu to localStorage:", error);
      }
    }
  }, [pathname, menuItems]);

  const shouldShowMenuItem = (item: MenuItem): boolean => {
    if (!item.howCan || item.howCan.length === 0) {
      return true;
    }

    return can(item.howCan);
  };

  const shouldShowSubItem = (subItem: { name: string; path: string; icon: React.ReactNode; howCan?: string[] }): boolean => {
    if (!subItem.howCan || subItem.howCan.length === 0) {
      return true;
    }

    return can(subItem.howCan);
  };

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

                const trigger = e.currentTarget;
                const triggerRect = trigger.getBoundingClientRect();
                const viewportHeight = window.innerHeight;

                const estimatedPopoverHeight = options.length * 40 + 16;

                const spaceBelow = viewportHeight - triggerRect.bottom;
                const spaceAbove = triggerRect.top;

                if (spaceBelow < estimatedPopoverHeight && spaceAbove > spaceBelow) {
                  setPopoverPosition({ bottom: 0 });
                } else if (spaceBelow < estimatedPopoverHeight) {
                  const maxTop = Math.max(0, viewportHeight - estimatedPopoverHeight - triggerRect.top - 20);
                  setPopoverPosition({ top: -Math.abs(triggerRect.bottom - viewportHeight + 20) });
                } else {
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
