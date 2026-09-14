"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  Plus,
  ChevronDown,
  LogOut,
  User,
  Settings as SettingsIcon,
} from "lucide-react";
import { cn, relativeTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { notifications as allNotifications, currentUser } from "@/mock";
import { logout } from "@/app/login/actions";
import { NAV_ITEMS } from "./nav";

function pageTitle(pathname: string): string {
  if (pathname === "/") return "Dashboard";
  const seg = "/" + pathname.split("/")[1];
  const match = NAV_ITEMS.find((n) => n.href === seg);
  if (pathname.includes("/new")) return `New ${match?.label.replace(/s$/, "") ?? ""}`;
  if (pathname.split("/").length > 2)
    return `${match?.label.replace(/s$/, "") ?? "Record"} Details`;
  return match?.label ?? "MyTechz CRM";
}

export function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifs, setNotifs] = useState(allNotifications);
  const menuRef = useRef<HTMLDivElement>(null);

  const unread = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const showQuickAction = !pathname.startsWith("/leads/new");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <button
        onClick={onOpenSidebar}
        className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="text-base font-semibold text-ink-900">
        {pageTitle(pathname)}
      </h1>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex h-9 items-center gap-2 rounded-lg border border-ink-300 bg-white px-2.5 text-sm text-ink-400 hover:bg-ink-50 sm:w-64 sm:justify-start"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search…</span>
          <kbd className="ml-auto hidden rounded border border-ink-200 bg-ink-50 px-1.5 text-[10px] sm:inline">
            ⌘K
          </kbd>
        </button>

        <div className="relative" ref={menuRef}>
          <div className="flex items-center gap-1.5">
            {/* Notifications */}
            <button
              onClick={() => {
                setNotifOpen((v) => !v);
                setProfileOpen(false);
              }}
              className="relative rounded-lg p-2 text-ink-500 hover:bg-ink-100"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                  {unread}
                </span>
              )}
            </button>

            {/* Profile */}
            <button
              onClick={() => {
                setProfileOpen((v) => !v);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg p-1 pl-1.5 hover:bg-ink-100"
            >
              <Avatar
                name={currentUser.name}
                color={currentUser.avatarColor}
                size="xs"
              />
              <span className="hidden text-sm font-medium text-ink-700 sm:inline">
                {currentUser.name.split(" ")[0]}
              </span>
              <ChevronDown className="hidden h-4 w-4 text-ink-400 sm:inline" />
            </button>
          </div>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-ink-200 px-4 py-2.5">
                <span className="text-sm font-semibold text-ink-900">
                  Notifications
                </span>
                <button
                  onClick={() =>
                    setNotifs((ns) => ns.map((n) => ({ ...n, read: true })))
                  }
                  className="text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 divide-y divide-ink-100 overflow-y-auto">
                {notifs.map((n) => (
                  <button
                    key={n.id}
                    onClick={() =>
                      setNotifs((ns) =>
                        ns.map((x) =>
                          x.id === n.id ? { ...x, read: true } : x,
                        ),
                      )
                    }
                    className="flex w-full gap-3 px-4 py-3 text-left hover:bg-ink-50"
                  >
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        n.read ? "bg-transparent" : "bg-brand-500",
                      )}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink-800">
                        {n.title}
                      </span>
                      <span className="block text-xs text-ink-500">
                        {n.description}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-ink-400">
                        {relativeTime(n.time)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {profileOpen && (
            <div className="absolute right-0 top-12 w-60 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-xl">
              <div className="flex items-center gap-3 border-b border-ink-200 px-4 py-3">
                <Avatar
                  name={currentUser.name}
                  color={currentUser.avatarColor}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-900">
                    {currentUser.name}
                  </p>
                  <p className="truncate text-xs text-ink-500">
                    {currentUser.email}
                  </p>
                </div>
              </div>
              <div className="p-1.5">
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-600 hover:bg-ink-50"
                >
                  <User className="h-4 w-4 text-ink-400" /> My profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-600 hover:bg-ink-50"
                >
                  <SettingsIcon className="h-4 w-4 text-ink-400" /> Settings
                </Link>
                <div className="my-1 border-t border-ink-100" />
                <button
                  onClick={() => logout()}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>

        {showQuickAction && (
          <Link
            href="/leads/new"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Lead</span>
          </Link>
        )}
      </div>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
