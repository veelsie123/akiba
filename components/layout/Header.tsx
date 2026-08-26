"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChartBarStacked, UserCircle } from "lucide-react";
import NotificationBell from "@/app/dashboard/notifications/NotificationBell";
import GlobalSearch from "@/app/dashboard/search/GlobalSearch";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ setSidebarOpen }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <header className="border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button type="button" className="rounded-xl border border-slate-200 p-2 text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <span className="sr-only">Open sidebar</span>
            <ChartBarStacked className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600 sm:block">
            Practice HQ
          </div>
          <GlobalSearch />
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />

          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
              <UserCircle className="h-8 w-8 text-slate-400" />
              <span className="hidden sm:inline">{session?.user?.name}</span>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl border border-slate-200 bg-white py-1 shadow-lg focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleSignOut}
                      className={classNames(active ? "bg-slate-100" : "", "block w-full px-4 py-2 text-left text-sm text-slate-700")}
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
}
