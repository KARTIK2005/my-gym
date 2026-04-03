"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Bell, Search } from "lucide-react";

export function Header() {
  const { user } = useUser();

  return (
    <header className="h-16 md:h-20 bg-background/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40 px-4 md:px-10 flex items-center justify-between gap-4">
      {/* Mobile Logo Branding */}
      <div className="lg:hidden flex items-center gap-2">
         <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-black font-black text-sm shadow-[0_0_15px_var(--primary)]">
            MG
          </div>
          <span className="text-xl font-black text-white italic tracking-tighter uppercase">MYGYM</span>
      </div>

      <div className="flex-1 max-w-sm hidden sm:block">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search exercises..."
            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-10 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all duration-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <button className="relative p-2 text-muted hover:text-primary transition-all duration-300 hover:scale-110">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_var(--primary)]" />
        </button>

        <div className="h-6 md:h-10 w-[1px] bg-white/10 mx-1 md:mx-2" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:flex flex-col justify-center">
            <span className="text-sm font-bold text-white leading-none">
              {user?.username || user?.firstName || "Partner"}
            </span>
            <span className="text-[10px] text-primary uppercase tracking-[0.2em] font-black mt-1">
              ELITE
            </span>
          </div>
          <div className="p-0.5 rounded-xl bg-gradient-to-br from-primary to-primary/20 shadow-lg shadow-primary/5">
            <UserButton
               appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8 md:w-10 md:h-10 rounded-xl",
                },
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
