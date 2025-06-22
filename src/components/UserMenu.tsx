"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { ThemeSelectorCompact } from "@/components/ThemeSelector";
import { LanguageSelectorCompact } from "@/components/LanguageSelectorCompact";

import { useTranslations } from "next-intl";

const USER_MENU_STORAGE_KEY = 'nitro-user-menu-open';

export function UserMenu() {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const t = useTranslations('common');

  // Load menu state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(USER_MENU_STORAGE_KEY);
        if (stored === 'true') {
          setIsMenuOpen(true);
        }
      } catch (error) {
        console.warn('Error reading user menu state from localStorage:', error);
      }
    }
  }, []);

  // Cerrar el menú cuando se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        // Save to localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(USER_MENU_STORAGE_KEY, 'false');
          } catch (error) {
            console.warn('Error saving user menu state to localStorage:', error);
          }
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuToggle = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(USER_MENU_STORAGE_KEY, newState.toString());
      } catch (error) {
        console.warn('Error saving user menu state to localStorage:', error);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    // El logout ya maneja la redirección con locale, así que no necesitamos hacer nada aquí
  };

  return (
    <div className="flex items-center">
      <div className="relative" ref={menuRef}>
        <button
          onClick={handleMenuToggle}
          className="flex items-center space-x-3 focus:outline-none"
        >
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `rgb(var(--color-primary-100))` }}
          >
            <span
              className="font-medium"
              style={{ color: `rgb(var(--color-primary-500))` }}
            >
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-900">
              {user?.name || t('userMenu.user')}
            </p>
            <p className="text-xs text-gray-500">
              {user?.roles?.[0]?.description || t('userMenu.role')}
            </p>
          </div>
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform ${
              isMenuOpen ? "transform rotate-180" : ""
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Menú desplegable */}
        {isMenuOpen && (
          <div className="absolute right-0 z-50 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div className="p-4 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {user?.name}
              </p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p
                className="text-xs mt-1"
                style={{ color: `rgb(var(--color-primary-500))` }}
              >
                {user?.roles?.[0]?.description}
              </p>
            </div>

            {/* Selector de idioma */}
            <div className="p-4 border-b border-gray-100">
              <p className="text-xs text-gray-600 mb-2">
                {t('userMenu.selectLanguage')}
              </p>
              <LanguageSelectorCompact />
            </div>

            {/* Selector de temas */}
            <div className="p-4 border-b border-gray-100">
              <p className="text-xs text-gray-600 mb-2">
                {t('userMenu.selectTheme')}
              </p>
              <ThemeSelectorCompact />
            </div>

            <div className="py-1" role="menu">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 transition-colors"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `rgb(var(--color-primary-50))`;
                  e.currentTarget.style.color = `rgb(var(--color-primary-600))`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#374151";
                }}
                role="menuitem"
              >
                {t('actions.logout')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 