"use client";

import { useTheme } from "@/context/ThemeContext";
import { UserMenu } from "@/components/UserMenu";
import NotificationBell from "@/components/Notifications/NotificationBell";

export function MainMenu() {
  const { currentTheme } = useTheme();

  const getImageUrl = () => {
    if (currentTheme === "blue") {
      return "/nitrob.png";
    } else if (currentTheme === "red") {
      return "/nitro.png";
    } else if (currentTheme === "green-gray") {
      return "/nitrog.png";
    }
    else if (currentTheme === "gray") {
      return "/nitrogy.png";
    }
    else if (currentTheme === "brown") {
      return "/nitrobw.png";
    }
  };

  return (
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

          {/* Notifications and User Menu */}
          <div className="flex items-center space-x-4">
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
