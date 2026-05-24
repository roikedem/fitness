"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Dumbbell, History } from "lucide-react";

const tabs = [
  { href: "/", label: "היום", icon: CalendarDays },
  { href: "/workouts", label: "אימונים", icon: Dumbbell },
  { href: "/history", label: "היסטוריה", icon: History },
];

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/workout/")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex z-40">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
