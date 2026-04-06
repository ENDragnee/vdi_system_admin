import { Sidebar } from '@/components/admin/sidebar';
import SessionProviderWrapper from '@/provider/session-provider'; // Assuming this is your wrapper

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProviderWrapper>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </SessionProviderWrapper>
  );
}
