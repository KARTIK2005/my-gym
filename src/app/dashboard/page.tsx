"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { 
  Flame, 
  Target, 
  TrendingUp, 
  ArrowRight,
  Plus,
  Scale,
  Activity,
  Edit2,
  CheckCircle2,
  XCircle,
  Calendar
} from "lucide-react";
import { calculateSmartStreak, getWeeklyStatus, DAYS_OF_WEEK } from "@/lib/streak-utils";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import Link from "next/link";

// DYNAMIC IMPORTS
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then((mod) => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then((mod) => mod.Area), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });

export default function Dashboard() {
  const { user } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [weeklyStatus, setWeeklyStatus] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    async function fetchData() {
      if (!user) return;
      const { data: profData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profData) setProfile(profData);
      
      const { data: workData } = await supabase.from("workouts").select("date").eq("user_id", user.id).order("date", { ascending: false });
      if (workData) {
          setRecentWorkouts(workData);
          const workoutDates = workData.map(w => w.date);
          const schedule = profData?.workout_days || [];
          const createdAt = profData?.created_at;
          setStreak(calculateSmartStreak(workoutDates, schedule, createdAt));
          setWeeklyStatus(getWeeklyStatus(workoutDates, schedule, createdAt));
      }
      setLoading(false);
    }
    fetchData();
  }, [user]);


  const stats = [
    { label: "Current Weight", value: profile?.weight ? `${profile.weight} kg` : "0 kg", icon: Scale, color: "text-blue-400" },
    { label: "Workout Streak", value: `${streak} Days`, icon: Flame, color: "text-orange-500" },
    { label: "BMI", value: profile?.bmi?.toFixed(1) || "0.0", icon: Activity, color: "text-primary" },
    { label: "Total Sessions", value: recentWorkouts.length.toString(), icon: Target, color: "text-purple-400" },
  ];

  return (
    <div className="space-y-6 md:space-y-10 px-4 md:px-0">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight uppercase">WELCOME BACK,<br /><span className="text-primary italic"> {user?.firstName?.toUpperCase() || "CHAMP"}</span></h1>
          {profile?.workout_days?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {streak > 0 ? (
                <span className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                  <Flame className="w-3 h-3" /> You're on track!
                </span>
              ) : (
                <span className="text-orange-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 bg-orange-400/10 px-3 py-1.5 rounded-full border border-orange-400/20">
                  <Activity className="w-3 h-3" /> Let's start the streak!
                </span>
              )}
               {weeklyStatus.some(s => s.status === 'missed') && (
                <span className="text-red-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 bg-red-400/10 px-3 py-1.5 rounded-full border border-red-400/20">
                  ⚠️ Missed a day
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-4 w-full md:w-auto">
            <Link href="/onboarding" className="flex-1 md:flex-none"><motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full px-6 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-3 group hover:bg-white/10 transition-all font-black uppercase text-[10px] tracking-widest leading-none"><Edit2 className="w-4 h-4" /> UPDATE RECORD</motion.button></Link>
            <Link href="/log" className="flex-1 md:flex-none"><motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full px-6 py-4 bg-primary text-black font-black rounded-2xl shadow-[0_10px_30px_rgba(196,251,109,0.3)] flex items-center justify-center gap-3 group uppercase text-[10px] tracking-widest leading-none text-center">START WORKOUT <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></motion.button></Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} className="glass rounded-[24px] md:rounded-[32px] p-4 md:p-6 group hover:border-primary/20 transition-all duration-500 shadow-xl border border-white/5">
            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
              <div className={cn("p-2 md:p-3 rounded-xl md:rounded-2xl bg-secondary/50", stat.color)}><stat.icon className="w-5 h-5 md:w-6 md:h-6" /></div>
              <span className="text-[8px] md:text-[10px] font-black text-muted uppercase tracking-[0.2em]">{stat.label}</span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xl md:text-3xl font-black text-white truncate">{stat.value}</span>
              <span className="hidden sm:inline-block text-[8px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full uppercase tracking-widest leading-none">Live</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col gap-6 md:gap-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-2xl relative overflow-hidden border border-white/5">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
             <div>
              <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-3 italic"><Calendar className="text-primary w-5 h-5 md:w-6 md:h-6" /> WEEKLY SCHEDULE</h2>
              <p className="text-muted text-[10px] md:text-sm mt-1">Consistency is the only shortcut to greatness.</p>
            </div>
            {(!profile?.workout_days || profile.workout_days.length === 0) ? (
                <Link href="/onboarding">
                    <button className="text-primary text-[10px] font-black uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 hover:bg-primary/20 transition-all font-black">Set Schedule</button>
                </Link>
            ) : (
              <Link href="/onboarding">
                  <button className="text-muted text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all flex items-center gap-2 group">
                      <Edit2 className="w-3 h-3 group-hover:scale-125 transition-all text-primary" /> EDIT SCHEDULE
                  </button>
              </Link>
            )}
          </div>
          
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 md:gap-4">
             {weeklyStatus.length > 0 ? weeklyStatus.map((day, i) => (
                <div key={i} className={cn(
                    "flex flex-col items-center gap-2 md:gap-3 p-3 md:p-4 rounded-[20px] md:rounded-2xl border transition-all",
                    day.isCompleted ? "bg-primary/10 border-primary/20 scale-[1.02] shadow-[0_0_20px_rgba(196,251,109,0.1)]" : 
                    day.status === 'missed' ? "bg-red-400/10 border-red-400/20" :
                    day.isScheduled ? "bg-white/5 border-white/10" : "bg-transparent border-transparent opacity-40"
                )}>
                    <span className={cn(
                        "text-[8px] md:text-[10px] font-black uppercase tracking-widest",
                        day.isCompleted ? "text-primary" : 
                        day.status === 'missed' ? "text-red-400" : "text-muted"
                    )}>{day.day}</span>
                    
                    <div className={cn(
                        "w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all",
                        day.isCompleted ? "bg-primary text-black" : 
                        day.status === 'missed' ? "bg-red-400/20 text-red-400" :
                        day.isScheduled ? "bg-secondary text-muted" : "bg-secondary/20 text-muted/30"
                    )}>
                        {day.isCompleted ? <CheckCircle2 className="w-4 h-4 md:w-6 md:h-6" /> : 
                         day.status === 'missed' ? <XCircle className="w-4 h-4 md:w-6 md:h-6" /> :
                         day.isScheduled ? <Flame className="w-4 h-4 md:w-5 md:h-5" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </div>
                </div>
             )) : (
                 DAYS_OF_WEEK.map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-white/5 bg-white/5 opacity-20">
                        <span className="text-[8px] font-black uppercase text-muted tracking-widest">{day}</span>
                        <div className="w-8 h-8 rounded-xl bg-secondary" />
                    </div>
                 ))
             )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
