'use client';

import { MainMenu } from '@/components/MainMenu';
import { SideMenu } from '@/components/SideMenu';
import OfflineIndicator from '@/components/OfflineIndicator';
import FailedOperationsPanel from '@/components/Offline/FailedOperationsPanel';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainMenu />
      <OfflineIndicator />
      <FailedOperationsPanel />
      <div className="flex h-[calc(100vh-4.2rem)]">
        <SideMenu />
        <div className="flex-1 overflow-hidden">
          <main className="h-full overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 