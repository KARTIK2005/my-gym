"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  Trophy, 
  Search,
  Sparkles,
  Zap
} from "lucide-react";
import dynamic from "next/dynamic";
import { 
  startOfWeek, 
  subWeeks, 
  isWithinInterval, 
  endOfWeek, 
  format,
  parseISO
} from "date-fns";

// DYNAMIC IMPORTS
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then((mod) => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then((mod) => mod.Area), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });

export default function Progress() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [chartData, setChartData] = useState<any[]>([]);
  const [weeklyFrequency, setWeeklyFrequency] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    async function fetchInitialData() {
      if (!user) return;
      
      // 1. Fetch Exercises for the PR Tracker
      const { data: exData } = await supabase
        .from("exercises")
        .select(`name, workouts!inner(user_id)`)
        .eq("workouts.user_id", user.id);
      
      if (exData) {
          const names = Array.from(new Set(exData.map((e: any) => e.name)));
          setExercises(names);
          if (names.length > 0) setSelectedExercise(names[0]);
      }

      // 2. Fetch Weekly Frequency for Sync Chart
      const sixWeeksAgo = subWeeks(new Date(), 6);
      const { data: workData } = await supabase
        .from("workouts")
        .select("date")
        .eq("user_id", user.id)
        .gte("date", format(sixWeeksAgo, 'yyyy-MM-dd'));

      if (workData) {
          const weeks = [];
          for (let i = 5; i >= 0; i--) {
              const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
              const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
              const count = workData.filter(w => {
                  const d = parseISO(w.date);
                  return isWithinInterval(d, { start: weekStart, end: weekEnd });
              }).length;
              
              weeks.push({
                  name: i === 0 ? "THIS WEEK" : `W-${i}`,
                  workouts: count
              });
          }
          setWeeklyFrequency(weeks);
      }

      setLoading(false);
    }
    fetchInitialData();
  }, [user]);

  useEffect(() => {
    async function fetchProgress() {
      if (!selectedExercise || !user) return;
      
      const { data } = await supabase
        .from("sets")
        .select(`
          weight, 
          exercises!inner(
            name, 
            workouts!inner(date, user_id)
          )
        `)
        .eq("exercises.name", selectedExercise)
        .eq("exercises.workouts.user_id", user.id);
      
      if (data) {
          const grouped = data.reduce((acc: any, curr: any) => {
              const date = curr.exercises.workouts.date;
              if (!acc[date] || curr.weight > acc[date]) acc[date] = curr.weight;
              return acc;
          }, {});
          
          const formatted = Object.keys(grouped)
            .sort()
            .map(date => ({ 
              date: date, 
              weight: grouped[date] 
            }));
            
          setChartData(formatted);
      }
    }
    fetchProgress();
  }, [selectedExercise, user]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-12 pb-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">
        <div className="space-y-2 md:space-y-4">
           <span className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-[0.3em] inline-block shadow-[0_0_10px_rgba(196,251,109,0.1)] leading-none italic">ANALYTICS ENGINE</span>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-none italic uppercase tracking-tighter">ASCEND YOUR <span className="text-primary not-italic uppercase">PEAK</span></h1>
          <p className="text-muted text-[10px] font-black uppercase tracking-[0.2em] px-1 italic">Real-time Performance Metrics & Volume Analysis</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 px-2 md:px-0">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3 glass rounded-[40px] md:rounded-[48px] p-6 md:p-10 relative overflow-hidden group shadow-2xl border-white/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 md:mb-12 relative z-10">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white italic uppercase flex items-center gap-3">
                <Target className="w-6 h-6 md:w-8 md:h-8 text-primary" /> PR <span className="text-primary not-italic">TRACKER</span>
              </h2>
              <p className="text-muted text-[10px] font-black uppercase tracking-widest mt-1">LIFETIME PROGRESSION SYNC</p>
            </div>
            <div className="relative group/search w-full md:w-64">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 select-none"><Search className="w-4 h-4 text-muted" /></div>
               <select value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)} className="w-full bg-white/5 border border-white/5 text-white text-xs md:text-sm font-black uppercase tracking-widest rounded-2xl pl-12 pr-10 py-4 focus:outline-none appearance-none cursor-pointer">
                 {exercises.length === 0 && <option>No records found</option>}
                 {exercises.map(ex => <option key={ex} value={ex} className="bg-[#121212] font-black">{ex}</option>)}
               </select>
            </div>
          </div>

          <div className="h-[400px] w-full min-h-[400px] relative z-10">
            {isMounted && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400} debounce={50}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs><linearGradient id="colorPr" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#c4fb6d" stopOpacity={0.4}/><stop offset="95%" stopColor="#c4fb6d" stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10, fontWeight: 900 }} dy={10} tickFormatter={(val) => val.split('-').slice(1).join('/')}/>
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10, fontWeight: 900 }} dx={-5}/>
                        <Tooltip contentStyle={{ backgroundColor: '#121212', border: '1px solid #222', borderRadius: '16px' }}/>
                        <Area type="monotone" dataKey="weight" stroke="#c4fb6d" strokeWidth={4} fillOpacity={1} fill="url(#colorPr)" />
                    </AreaChart>
                </ResponsiveContainer>
            ) : isMounted && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <BarChart3 className="w-10 h-10 text-white/5" />
                    <p className="text-muted font-black text-[10px] max-w-[200px] uppercase tracking-widest leading-loose">{selectedExercise ? "Requires more training volume" : "Analysis sync required"}</p>
                </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-[32px] md:rounded-[48px] p-8 md:p-10 space-y-4 md:space-y-6 flex flex-col justify-between">
              <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.2em] flex items-center gap-2 italic"><Trophy className="w-4 h-4 text-primary" /> BEST PERFORMANCE</h3>
              <div className="flex items-baseline gap-2"><span className="text-5xl md:text-7xl font-black text-white italic leading-none">{chartData.length > 0 ? Math.max(...chartData.map(d => d.weight)) : "0"}</span><span className="text-primary font-black text-lg italic uppercase leading-none">KG</span></div>
           </motion.div>
           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }} className="glass rounded-[32px] md:rounded-[48px] p-8 md:p-10 space-y-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 italic"><Sparkles className="w-4 h-4" /> WEEKLY SYNC</h3>
                <Zap className="w-4 h-4 text-white/20" />
              </div>
              <div className="h-[120px] w-full min-h-[120px] relative">
                 {isMounted && weeklyFrequency.length > 0 ? (
                     <ResponsiveContainer width="100%" height={120} debounce={50}>
                        <BarChart data={weeklyFrequency} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <XAxis dataKey="name" hide />
                            <Tooltip contentStyle={{ backgroundColor: '#121212', border: '1px solid #222', borderRadius: '12px' }} itemStyle={{ color: '#c4fb6d' }} labelStyle={{ color: '#888', fontWeight: 900, textTransform: 'uppercase', fontSize: 10 }}/>
                            <Bar dataKey="workouts" fill="#c4fb6d" radius={[6, 6, 0, 0]} />
                        </BarChart>
                     </ResponsiveContainer>
                 ) : (
                    <div className="h-full flex items-center justify-center text-center">
                        <p className="text-muted text-[8px] font-black uppercase tracking-widest">Awaiting session login...</p>
                    </div>
                 )}
              </div>
              <div className="flex justify-between items-center bg-white/5 rounded-2xl p-4 border border-white/5">
                <span className="text-[8px] font-black text-muted uppercase tracking-widest">6 WEEK CONSISTENCY</span>
                <span className="text-xs font-black text-white italic">{weeklyFrequency.reduce((a, b) => a + b.workouts, 0)} TOTAL</span>
              </div>
           </motion.div>
        </div>
      </div>
    </div>
  );
}
