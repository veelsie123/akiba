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
      className={`overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 ${className}`}
    >
      <div className="flex items-center">
        <div className="rounded-md bg-indigo-50 p-3">
          <Icon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              {trend && (
                <div
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend.isUp ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trend.isUp ? "↑" : "↓"}
                  <span className="sr-only">{trend.isUp ? "Increased" : "Decreased"} by</span>
                  {trend.value}
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
}
