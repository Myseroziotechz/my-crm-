"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeft, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { NAV_ITEMS } from "./nav";

interface Props {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar({ collapsed, onToggleCollapse, onNavigate }: Props) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-ink-900 text-ink-300">
      {/* Brand */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-white/10",
          collapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2.5 overflow-hidden"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Zap className="h-5 w-5" fill="currentColor" />
          </span>
          {!collapsed && (
            <span className="whitespace-nowrap text-sm font-semibold text-white">
              {APP_NAME}
            </span>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            className="hidden rounded-md p-1.5 text-ink-400 hover:bg-white/10 hover:text-white lg:block"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={onToggleCollapse}
          className="mx-auto mt-3 hidden rounded-md p-1.5 text-ink-400 hover:bg-white/10 hover:text-white lg:block"
          aria-label="Expand sidebar"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                collapsed && "justify-center px-0",
                active
                  ? "bg-brand-600 text-white"
                  : "text-ink-300 hover:bg-white/10 hover:text-white",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className={cn(
          "border-t border-white/10 p-3 text-[11px] text-ink-500",
          collapsed && "text-center",
        )}
      >
        {collapsed ? "v1.0" : "MyTechz CRM · v1.0 (frontend preview)"}
      </div>
    </div>
  );
}
