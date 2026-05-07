"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Bars3Icon, UserCircleIcon } from "@heroicons/react/24/outline";
import NotificationBell from "@/components/notifications/NotificationBell";
import GlobalSearch from "@/components/search/GlobalSearch";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ setSidebarOpen }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  if (!mounted) {
    return (
      <header className="bg-white shadow-sm">
        <div className="flex h-16 justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button
              type="button"
              className="text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="flex h-16 justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          {/* Global Search */}
          <GlobalSearch />
        </div>
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <NotificationBell />
          
          {/* User Menu */}
          <Menu as="div" className="relative ml-3">
            <div>
              <Menu.Button className="flex items-center text-sm focus:outline-none">
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                <span className="ml-2 text-gray-700">{session?.user?.name}</span>
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleSignOut}
                      className={classNames(
                        active ? 'bg-gray-100' : '',
                        'block w-full px-4 py-2 text-left text-sm text-gray-700'
                      )}
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