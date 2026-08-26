"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isUp: boolean;
  };
  className?: string;
}

export default function StatCard({ title, value, icon: Icon, trend, className = "" }: StatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(cardRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
    });
  }, { scope: cardRef });

  return (
    <div
      ref={cardRef}
      className={`group rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_35px_-20px_rgba(15,23,42,0.45)] backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_-20px_rgba(15,23,42,0.5)] ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        {trend && (
          <div
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              trend.isUp ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            }`}
          >
            {trend.isUp ? "↑" : "↓"}
            {trend.value}
          </div>
        )}
      </div>

      <div className="mt-6">
        <p className="truncate text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      </div>
    </div>
  );
}
