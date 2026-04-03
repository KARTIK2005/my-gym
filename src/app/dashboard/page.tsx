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
  Edit2
} from "lucide-react";
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
          setStreak(calculateStreak(workData.map(w => w.date)));
      }
      setLoading(false);
    }
    fetchData();
  }, [user]);

  const calculateStreak = (dates: string[]) => {
    if (dates.length === 0) return 0;
    const uniqueDates = Array.from(new Set(dates)).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let currentStreak = 0;
    let today = new Date(); today.setHours(0, 0, 0, 0);
    let lastWorkoutDate = new Date(uniqueDates[0]); lastWorkoutDate.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(today.getTime() - lastWorkoutDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 1) return 0;
    for (let i = 0; i < uniqueDates.length; i++) {
        const d1 = new Date(uniqueDates[i]); d1.setHours(0, 0, 0, 0);
        if (i === 0) { currentStreak = 1; continue; }
        const d2 = new Date(uniqueDates[i-1]); d2.setHours(0, 0, 0, 0);
        const diff = Math.abs(d2.getTime() - d1.getTime());
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days === 1) currentStreak++; else break;
    }
    return currentStreak;
  };

  const stats = [
    { label: "Current Weight", value: profile?.weight ? `${profile.weight} kg` : "0 kg", icon: Scale, color: "text-blue-400" },
    { label: "Workout Streak", value: `${streak} Days`, icon: Flame, color: "text-orange-500" },
    { label: "BMI", value: profile?.bmi?.toFixed(1) || "0.0", icon: Activity, color: "text-primary" },
    { label: "Total Sessions", value: recentWorkouts.length.toString(), icon: Target, color: "text-purple-400" },
  ];

  return (
    <div className="space-y-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white leading-tight">WELCOME BACK,<br /><span className="text-primary italic"> {user?.firstName?.toUpperCase() || "CHAMP"}</span></h1>
          <p className="text-muted mt-2 font-medium">Your persistence is paying off. Keep pushing.</p>
        </div>
        <div className="flex gap-4">
            <Link href="/onboarding"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl flex items-center gap-3 group hover:bg-white/10 transition-all font-black uppercase text-xs tracking-widest leading-none"><Edit2 className="w-4 h-4" /> UPDATE RECORD</motion.button></Link>
            <Link href="/log"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-8 py-4 bg-primary text-black font-black rounded-2xl shadow-[0_10px_30px_rgba(196,251,109,0.3)] flex items-center gap-3 group uppercase text-xs tracking-widest leading-none">START WORKOUT <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></motion.button></Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} className="glass rounded-[32px] p-6 group hover:border-primary/20 transition-all duration-500 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className={cn("p-3 rounded-2xl bg-secondary/50", stat.color)}><stat.icon className="w-6 h-6" /></div>
              <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">{stat.label}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-white">{stat.value}</span>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full uppercase tracking-widest leading-none">Live Sync</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="xl:col-span-2 glass rounded-[32px] p-8 shadow-2xl relative overflow-hidden h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-3 italic"><TrendingUp className="text-primary w-6 h-6" /> WEEKLY OVERVIEW</h2>
              <p className="text-muted text-sm mt-1">Total workouts completed this week</p>
            </div>
          </div>
          <div className="h-[250px] w-full min-h-[250px] relative">
            {isMounted && (
                <ResponsiveContainer width="100%" height={250} debounce={50}>
                    <AreaChart data={recentWorkouts.slice(0, 7).reverse().map(w => ({ name: new Date(w.date).toLocaleDateString('en-US', {weekday: 'short'}), count: 1 }))} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs><linearGradient id="colorStreak" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#c4fb6d" stopOpacity={0.3}/><stop offset="95%" stopColor="#c4fb6d" stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12, fontWeight: 600 }} dy={10}/>
                        <YAxis hide />
                        <Tooltip contentStyle={{ backgroundColor: '#121212', border: '1px solid #222', borderRadius: '12px' }} itemStyle={{ color: '#c4fb6d' }}/>
                        <Area type="monotone" dataKey="count" stroke="#c4fb6d" strokeWidth={4} fillOpacity={1} fill="url(#colorStreak)" />
                    </AreaChart>
                </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-[32px] p-8 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-8"><h2 className="text-2xl font-black text-white italic">HISTORY</h2><Link href="/history" className="text-primary text-[10px] font-black hover:underline underline-offset-4 tracking-[0.2em] uppercase leading-none">VIEW ALL</Link></div>
          {recentWorkouts.length > 0 ? (
              <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
                  {recentWorkouts.slice(0, 5).map((w, i) => (
                      <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-primary/20 transition-all">
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary"><TrendingUp className="w-5 h-5" /></div>
                              <div><p className="text-sm font-bold text-white uppercase">{new Date(w.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p><p className="text-[10px] text-muted font-black tracking-widest uppercase leading-none">COMPLETED</p></div>
                          </div>
                      </div>
                  ))}
              </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/5 rounded-3xl">
                <div className="w-16 h-16 bg-secondary/30 rounded-full flex items-center justify-center mb-6"><Plus className="w-8 h-8 text-muted" /></div>
                <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide leading-normal">Ready to lift?</h3>
                <Link href="/log"><button className="text-primary text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-primary/20 hover:border-primary pb-1 mt-4 transition-all leading-none">EXPLORE LOGBOOK</button></Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
