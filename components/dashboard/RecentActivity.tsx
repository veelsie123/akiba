"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Activity } from "lucide-react";

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
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white/90 shadow-[0_12px_35px_-20px_rgba(15,23,42,0.45)] backdrop-blur" ref={listRef}>
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">Latest actions across the firm</p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Updated now
          </div>
        </div>
      </div>

      <div className="p-6">
        <ul role="list" className="space-y-4">
          {items.length > 0 ? (
            items.map((item) => (
              <li key={item.id} className="activity-item rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.description}</p>
                    <time dateTime={item.timestamp} className="mt-2 block text-xs text-slate-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </time>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
              {emptyMessage}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
