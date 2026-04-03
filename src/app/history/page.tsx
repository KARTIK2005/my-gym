"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  ChevronDown, 
  Dumbbell, 
  Clock, 
  ArrowRight,
  Activity,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  sets: {
    id: string;
    reps: number;
    weight: number;
  }[];
}

interface GroupedWorkout {
  date: string;
  exercises: Exercise[];
}

export default function WorkoutHistory() {
  const { user } = useUser();
  const [groupedWorkouts, setGroupedWorkouts] = useState<GroupedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("workouts")
          .select(`
            id,
            date,
            exercises (
              id,
              name,
              muscle_group,
              sets (
                id,
                reps,
                weight
              )
            )
          `)
          .eq("user_id", user.id)
          .order("date", { ascending: false });

        if (error) {
            console.error("Supabase History Fetch Error:", error);
            return;
        }
        
        if (data) {
            // Group workouts by date
            const grouped = data.reduce((acc: any, curr: any) => {
                const dateKey = curr.date;
                if (!acc[dateKey]) {
                    acc[dateKey] = {
                        date: dateKey,
                        exercises: []
                    };
                }
                // Flatten exercises from all workout sessions on this date
                acc[dateKey].exercises.push(...curr.exercises);
                return acc;
            }, {});

            const sortedGrouped = Object.values(grouped).sort((a: any, b: any) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
            ) as GroupedWorkout[];

            setGroupedWorkouts(sortedGrouped);
            
            if (sortedGrouped.length > 0) {
                setExpandedDates(new Set([sortedGrouped[0].date]));
            }
        }
      } catch (err) {
          console.error("Critical History Fetch Error:", err);
      } finally {
          setLoading(false);
      }
    }
    fetchHistory();
  }, [user]);

  const toggleExpand = (date: string) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) newSet.delete(date);
      else newSet.add(date);
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-xl" />
        <p className="text-muted font-bold animate-pulse text-xs tracking-widest uppercase">FETCHING GAINS...</p>
      </div>
    );
  }

  if (groupedWorkouts.length === 0) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-sm mx-auto">
        <div className="w-24 h-24 bg-secondary/30 rounded-full flex items-center justify-center mb-8 relative">
          <Activity className="w-12 h-12 text-muted" />
           <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping" />
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4 italic">LOGBOOK EMPTY</h2>
        <p className="text-muted text-sm font-medium mb-10 leading-relaxed">Your journey hasn't hit the paper yet. Start a session to track your growth.</p>
        <button 
           onClick={() => window.location.href = '/log'}
           className="w-full py-5 bg-primary text-black font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 group"
        >
          START FIRST SESSION
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-6"
      >
        <div className="w-16 h-16 bg-primary rounded-[20px] flex items-center justify-center text-black shadow-xl shrink-0">
          <Clock className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">TRAINING <span className="text-primary not-italic">LOGS</span></h1>
          <p className="text-muted mt-2 font-black uppercase text-[10px] tracking-[0.2em] px-1">DAILY SESSION HISTORY</p>
        </div>
      </motion.div>

      <div className="space-y-8">
        {groupedWorkouts.map((group, idx) => (
          <motion.div
            key={group.date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass rounded-[40px] overflow-hidden transition-all duration-500 hover:border-primary/20 shadow-2xl relative"
          >
            <button 
              onClick={() => toggleExpand(group.date)}
              className="w-full p-8 flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-6">
                 <div className="flex flex-col items-center justify-center w-20 h-20 bg-secondary/80 rounded-[28px] border border-white/5 group-hover:border-primary/30 transition-all">
                    <span className="text-2xl font-black text-white leading-none">{format(new Date(group.date), "dd")}</span>
                    <span className="text-[10px] font-black uppercase text-primary tracking-widest mt-1">{format(new Date(group.date), "MMM")}</span>
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                       {group.exercises.length} <span className="text-primary italic">Exercises</span> Recorded
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {Array.from(new Set(group.exercises.map(e => e.muscle_group))).map(mg => (
                            <span key={mg} className="text-[10px] bg-white/5 text-muted px-4 py-1.5 rounded-full font-black uppercase border border-white/5 tracking-widest shadow-sm">{mg}</span>
                        ))}
                    </div>
                 </div>
              </div>
              
              <div className="p-4 rounded-full bg-secondary/50 group-hover:bg-primary/10 transition-all duration-500 shrink-0 border border-white/5">
                <ChevronDown className={cn("w-6 h-6 text-primary transition-transform duration-500", expandedDates.has(group.date) && "rotate-180")} />
              </div>
            </button>

            <AnimatePresence>
              {expandedDates.has(group.date) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-8 pt-0 space-y-8">
                    <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
                    {group.exercises.map((ex, exIdx) => (
                      <div key={`${ex.id}-${exIdx}`} className="relative pl-12">
                        <div className="absolute left-[3px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/40 via-primary/10 to-transparent" />
                        <div className="absolute left-0 top-3 w-2 h-2 bg-primary rounded-full shadow-[0_0_15px_var(--primary)]" />
                        
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 p-8 bg-white/5 rounded-[40px] border border-white/5 hover:bg-white/[0.07] transition-all">
                          <div className="flex items-center gap-6 shrink-0">
                             <div className="w-16 h-16 bg-secondary/80 rounded-2xl flex items-center justify-center text-primary shadow-xl border border-white/5">
                                <Dumbbell className="w-8 h-8" />
                             </div>
                             <div>
                                <h4 className="text-xl font-black text-white uppercase tracking-tight leading-none">{ex.name}</h4>
                                <span className="text-[10px] text-primary font-black uppercase tracking-[0.3em] inline-block mt-2">{ex.muscle_group}</span>
                             </div>
                          </div>

                          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {ex.sets.map((set, sIdx) => (
                              <div key={set.id} className="bg-background/40 p-5 rounded-3xl border border-white/5 flex flex-col items-center hover:border-primary/20 transition-all">
                                <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2">SET {sIdx + 1}</span>
                                <div className="text-xl font-black text-white flex items-baseline gap-1 italic">
                                   {set.weight}<span className="text-primary text-[10px] not-italic font-black uppercase tracking-tighter">KG</span>
                                   <XIcon className="mx-2 text-muted w-3 h-3 translate-y-[-2px] not-italic" />
                                   {set.reps}<span className="text-primary text-[10px] not-italic font-black uppercase tracking-tighter">REP</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function XIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    )
}
