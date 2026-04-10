'use client';

import { ThemeSelectorCompact } from '@/components/ThemeSelector';

interface AuthThemeSelectorProps {
  className?: string;
}

export default function AuthThemeSelector({ className = '' }: AuthThemeSelectorProps) {
  return (
    <div className={`absolute top-4 right-4 z-10 rounded-full border border-gray-200 bg-white/90 px-3 py-2 shadow-sm backdrop-blur ${className}`}>
      <ThemeSelectorCompact className="space-x-1.5" />
    </div>
  );
}
