"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert, Loader2 } from "lucide-react";
import { ApiError, fetchCurrentUser, getAccessToken, getStoredSession } from "@/lib/api";

const STAFF_ROLES = new Set(["ATTENDANT", "ANALYST", "MANAGER", "ADMIN"]);

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"checking" | "allowed" | "blocked">("checking");
  const [error, setError] = useState("");
  const latestPathnameRef = useRef(pathname);

  useEffect(() => {
    latestPathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    let active = true;

    const redirectToLogin = () => {
      const params = new URLSearchParams({
        redirect: latestPathnameRef.current,
        mode: "admin",
      });
      router.replace(`/auth?${params.toString()}`);
    };

    const check = async (background = false) => {
      if (!getAccessToken()) {
        redirectToLogin();
        return;
      }

      const storedUser = getStoredSession()?.user ?? null;
      const hasStoredStaffSession = storedUser && STAFF_ROLES.has(String(storedUser.role));

      if (hasStoredStaffSession && !background) {
        setStatus("allowed");
      }

      try {
        const user = await fetchCurrentUser();
        if (!active) return;

        if (!user || !STAFF_ROLES.has(String(user.role))) {
          setError("Seu usuário não possui acesso ao painel administrativo.");
          setStatus("blocked");
          return;
        }

        setStatus("allowed");
      } catch (err) {
        if (!active) return;

        if (err instanceof ApiError && err.status === 401) {
          redirectToLogin();
          return;
        }

        if (hasStoredStaffSession) {
          setStatus("allowed");
          return;
        }

        setError("Não foi possível validar a sua sessão com a API.");
        setStatus("blocked");
      }
    };

    check();

    const handleFocus = () => {
      check(true);
    };

    const handleStorage = () => {
      if (!getAccessToken()) {
        redirectToLogin();
        return;
      }

      const storedUser = getStoredSession()?.user ?? null;
      if (storedUser && STAFF_ROLES.has(String(storedUser.role))) {
        setStatus("allowed");
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);

    return () => {
      active = false;
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
    };
  }, [router]);

  if (status === "allowed") {
    return <>{children}</>;
  }

  if (status === "blocked") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md bg-white border border-red-100 rounded-2xl shadow-sm p-8 text-center">
          <ShieldAlert size={40} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-xl font-semibold text-gray-800">Acesso indisponível</h1>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center text-gray-500">
        <Loader2 size={32} className="animate-spin mx-auto mb-3 text-blue-600" />
        <p>Validando acesso administrativo...</p>
      </div>
    </div>
  );
}
