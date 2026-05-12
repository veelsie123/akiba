"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type?: string;
}

interface RecentActivityProps {
  title: string;
  items: ActivityItem[];
  emptyMessage?: string;
}

export default function RecentActivity({ title, items, emptyMessage = "No recent activity." }: RecentActivityProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (items.length > 0) {
      gsap.from(".activity-item", {
        x: -20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      });
    }
  }, { scope: listRef, dependencies: [items] });

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow" ref={listRef}>
      <div className="p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">{title}</h3>
        <div className="mt-6 flow-root">
          <ul role="list" className="-my-5 divide-y divide-gray-200">
            {items.length > 0 ? (
              items.map((item) => (
                <li key={item.id} className="activity-item py-5">
                  <div className="relative focus-within:ring-2 focus-within:ring-indigo-500">
                    <h4 className="text-sm font-semibold text-gray-800">
                      <span className="absolute inset-0" aria-hidden="true" />
                      {item.title}
                    </h4>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">{item.description}</p>
                    <time
                      dateTime={item.timestamp}
                      className="mt-1 block text-xs text-gray-400"
                    >
                      {new Date(item.timestamp).toLocaleString()}
                    </time>
                  </div>
                </li>
              ))
            ) : (
              <li className="py-5 text-center text-sm text-gray-500">{emptyMessage}</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
