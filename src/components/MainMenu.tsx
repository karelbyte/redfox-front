"use client";

import { useTheme } from "@/context/ThemeContext";
import { UserMenu } from "@/components/UserMenu";
import NotificationBell from "@/components/Notifications/NotificationBell";
import GlobalSearchModal from "@/components/GlobalSearch/GlobalSearchModal";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

export function MainMenu() {
  const { currentTheme } = useTheme();
  const { isSearchOpen, openSearch, closeSearch } = useGlobalSearch();
  const t = useTranslations('globalSearch');

  const getImageUrl = (): string => {
    switch (currentTheme) {
      case "blue":
        return "/nitrob.png";
      case "red":
        return "/nitro.png";
      case "green-gray":
        return "/nitrog.png";
      case "gray":
        return "/nitrogy.png";
      case "brown":
        return "/nitrobw.png";
      default:
        return "/nitro.png";
    }
  };

  return (
    <>
      <nav
        className="bg-white border-b"
        style={{ borderColor: `rgb(var(--color-primary-100))` }}
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo y nombre de la app */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img src={getImageUrl()} alt="Nitro" className="h-8 w-auto" />
              </div>
            </div>

            {/* Search, Notifications and User Menu */}
            <div className="flex items-center space-x-4">
              {/* Global Search Button */}
              <button
                onClick={openSearch}
                className="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                title={`${t('searchPlaceholder')} (⌘K)`}
              >
                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{t('search')}</span>
                <span className="hidden sm:inline ml-2 text-xs text-gray-400">⌘K</span>
              </button>
              
              <NotificationBell />
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      <GlobalSearchModal isOpen={isSearchOpen} onClose={closeSearch} />
    </>
  );
}
