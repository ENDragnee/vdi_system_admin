// app/unauthorized/page.tsx
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UnauthorizedPage({ searchParams }: any) {
  const isNoLab = searchParams?.error === "no_lab";

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-8 text-center bg-background">
      <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <ShieldAlert className="w-10 h-10 text-destructive" />
      </div>

      <h1 className="text-4xl font-black tracking-tighter mb-2">Access Restricted</h1>

      <p className="text-muted-foreground max-w-md mb-8">
        {isNoLab
          ? "Your faculty account is active, but you haven't been assigned to a laboratory yet. Please contact the administrator."
          : "You do not have the required permissions to view this section of the VDS platform."}
      </p>

      <div className="flex gap-4">
        <Button variant="outline" asChild>
          <Link href="/"><ArrowLeft className="w-4 h-4 mr-2" /> Back Home</Link>
        </Button>
        <Button asChild>
          <Link href="/auth/signin">Sign in with different account</Link>
        </Button>
      </div>
    </div>
  );
}
