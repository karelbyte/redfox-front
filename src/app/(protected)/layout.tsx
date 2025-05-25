'use client';

import { MainMenu } from '@/components/MainMenu';
import { SideMenu } from '@/components/SideMenu';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <MainMenu />
        <div className="flex h-[calc(100vh-4rem)]">
          <SideMenu />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
} 