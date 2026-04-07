import { Sidebar } from '@/components/admin/sidebar';
import { protectRoute } from '@/lib/role-guard';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side check
  await protectRoute("ADMIN");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
