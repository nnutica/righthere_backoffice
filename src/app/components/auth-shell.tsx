"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/libs/client";
import { touchUserLastActive } from "@/libs/users";
import Sidebar from "@/app/components/sidebar";
import Topbar from "@/app/components/topbar";
import { Skeleton } from "@/components/ui/skeleton";

interface AuthShellProps {
  children: React.ReactNode;
}

export default function AuthShell({ children }: AuthShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (pathname === "/login") {
      setChecking(false);
      return;
    }

    setChecking(true);
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setChecking(false);
      if (!nextUser) {
        router.replace("/login");
      } else {
        touchUserLastActive(nextUser.uid, nextUser.email).catch((error) =>
          console.error("Failed to update lastActiveAt", error)
        );
      }
    });

    return () => unsub();
  }, [pathname, router]);

  const userEmail = useMemo(() => user?.email ?? "admin@righthere.ai", [user]);

  if (pathname === "/login") {
    return <div className="min-h-screen">{children}</div>;
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-background px-6 py-10">
        <div className="mx-auto max-w-5xl space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background text-slate-100">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar email={userEmail} />
        <main className="flex-1 px-6 pb-12 pt-6">{children}</main>
      </div>
    </div>
  );
}

