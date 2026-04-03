"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, History, PlusCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const menuItems = [
  { name: "Dash", href: "/dashboard", icon: LayoutDashboard },
  { name: "Log", href: "/log", icon: PlusCircle },
  { name: "History", href: "/history", icon: History },
  { name: "Progress", href: "/progress", icon: TrendingUp },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md">
      <div className="glass rounded-[32px] p-2 flex items-center justify-around shadow-2xl border border-white/5 backdrop-blur-2xl">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-3 rounded-2xl transition-all duration-300 relative",
                isActive ? "text-primary" : "text-muted"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-active"
                  className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={cn("w-6 h-6", isActive ? "scale-110 shadow-[0_0_15px_var(--primary)]" : "group-hover:scale-110")} />
              <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
