"use client";

import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { UserMenu } from "@/components/UserMenu";
import NotificationBell from "@/components/Notifications/NotificationBell";
import GlobalSearchModal from "@/components/GlobalSearch/GlobalSearchModal";
import SupportModal from "@/components/Support/SupportModal";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { MagnifyingGlassIcon, ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";
import { useTranslations, useLocale } from "next-intl";
import { TrialBanner } from "@/components/Subscription/TrialBanner";
import Tooltip from "@/components/atoms/Tooltip";

export function MainMenu() {
  const { currentTheme } = useTheme();
  const { isSearchOpen, openSearch, closeSearch } = useGlobalSearch();
  const [supportOpen, setSupportOpen] = useState(false);
  const t = useTranslations('globalSearch');
  const locale = useLocale();
  const supportTitle = locale === 'en' ? 'Contact Support' : 'Contactar Soporte';
  const searchTitle = `${t('searchPlaceholder')} (⌘K)`;

  const getImageUrl = (): string => {
    switch (currentTheme) {
      case "blue":   return "/nitrob.png";
      case "red":    return "/nitro.png";
      case "green-gray": return "/nitrog.png";
      case "gray":   return "/nitrogy.png";
      case "brown":  return "/nitrobw.png";
      default:       return "/nitro.png";
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
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img src={getImageUrl()} alt="Nitro" className="h-8 w-auto" />
              </div>
            </div>

            <div className="flex items-center flex-1 justify-center px-4">
              <TrialBanner />
            </div>

            <div className="flex items-center space-x-2">
              {/* Global Search */}
              <Tooltip content={searchTitle} placement="bottom">
                <button
                  onClick={openSearch}
                  className="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{t('search')}</span>
                  <span className="hidden sm:inline ml-2 text-xs text-gray-400">⌘K</span>
                </button>
              </Tooltip>

              {/* Soporte */}
              <Tooltip content={supportTitle} placement="bottom">
                <button
                  onClick={() => setSupportOpen(true)}
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                >
                  <ChatBubbleLeftEllipsisIcon className="h-5 w-5" />
                </button>
              </Tooltip>

              <NotificationBell />
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      <GlobalSearchModal isOpen={isSearchOpen} onClose={closeSearch} />
      <SupportModal isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
    </>
  );
}
