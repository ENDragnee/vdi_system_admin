import { Sidebar } from '@/components/admin/sidebar';
import { protectRoute } from '@/lib/role-guard';

export default async function FacultyLayout({ children }: { children: React.ReactNode }) {
  // Server-side check
  await protectRoute("FACULTY");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/10">
        {children}
      </main>
    </div>
  );
}
