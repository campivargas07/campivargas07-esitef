"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";

const NAV = [
  { href: "/admin/orders", label: "Pedidos", icon: "orders" },
  { href: "/admin/libros", label: "Libros", icon: "books" },
  { href: "/dashboard", label: "Panel alumno", icon: "student", external: true },
  { href: "/", label: "Ver tienda", icon: "store", external: true },
] as const;

function NavIcon({ type }: { type: (typeof NAV)[number]["icon"] }) {
  const paths: Record<(typeof NAV)[number]["icon"], string> = {
    orders:
      "M7 4h-2v16h14V4h-2v2H7V4zm0 4h10v2H7V8zm0 4h7v2H7v-2z",
    books:
      "M6 4h12a1 1 0 011 1v15l-7-3.5L5 20V5a1 1 0 011-1z",
    student:
      "M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0H5z",
    store:
      "M4 4h16l-1 14H5L4 4zm4 16a2 2 0 100-4 2 2 0 000 4zm8 0a2 2 0 100-4 2 2 0 000 4z",
  };
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d={paths[type]} />
    </svg>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    document.body.classList.add("admin-route");
    return () => document.body.classList.remove("admin-route");
  }, []);

  return (
    <div className="admin-app">
      <aside className="admin-sidebar" aria-label="Administración">
        <div className="admin-sidebar-brand">
          <Link href="/admin/orders">
            <span className="admin-sidebar-logo">E</span>
            <span>
              <strong>ESITEF</strong>
              <small>Admin</small>
            </span>
          </Link>
        </div>

        <nav className="admin-sidebar-nav">
          {NAV.map((item) => {
            const isExternal = "external" in item && item.external;
            const active = !isExternal && pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "is-active" : undefined}
                aria-current={active ? "page" : undefined}
                {...(isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                <NavIcon type={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <SignOutButton className="admin-signout" />
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-inner">
            <span className="admin-topbar-badge">Tienda online</span>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
