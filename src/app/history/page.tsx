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

interface WorkoutWithExercises {
  id: string;
  date: string;
  exercises: {
    id: string;
    name: string;
    muscle_group: string;
    sets: {
      id: string;
      reps: number;
      weight: number;
    }[];
  }[];
}

export default function WorkoutHistory() {
  const { user } = useUser();
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());

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
            setWorkouts(data as any);
            if (data.length > 0) {
                setExpandedWorkouts(new Set([data[0].id]));
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

  const toggleExpand = (id: string) => {
    setExpandedWorkouts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
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

  if (workouts.length === 0) {
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
          <h1 className="text-4xl font-black text-white uppercase italic">TRAINING <span className="text-primary not-italic">LOGS</span></h1>
          <p className="text-muted mt-2 font-medium">Review your previous performances and track muscle growth.</p>
        </div>
      </motion.div>

      <div className="space-y-6">
        {workouts.map((workout, idx) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass rounded-[40px] overflow-hidden transition-all duration-300 hover:border-primary/20"
          >
            <button 
              onClick={() => toggleExpand(workout.id)}
              className="w-full p-8 flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-6">
                 <div className="flex flex-col items-center justify-center w-20 h-20 bg-secondary/80 rounded-[24px] border border-white/5">
                    <span className="text-2xl font-black text-white">{format(new Date(workout.date), "dd")}</span>
                    <span className="text-[10px] font-black uppercase text-primary tracking-widest">{format(new Date(workout.date), "MMM")}</span>
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                       {workout.exercises.length} Exercises Tracked
                    </h3>
                    <div className="flex gap-2">
                        {Array.from(new Set(workout.exercises.map(e => e.muscle_group))).map(mg => (
                            <span key={mg} className="text-[10px] bg-white/5 text-muted px-3 py-1 rounded-full font-black uppercase border border-white/5">{mg}</span>
                        ))}
                    </div>
                 </div>
              </div>
              
              <div className="p-4 rounded-full bg-secondary/50 transition-transform duration-500 shrink-0">
                <ChevronDown className={cn("w-6 h-6 text-primary transition-transform duration-300", expandedWorkouts.has(workout.id) && "rotate-180")} />
              </div>
            </button>

            <AnimatePresence>
              {expandedWorkouts.has(workout.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-8 pt-0 space-y-6">
                    <div className="h-[1px] bg-border/50 mb-8" />
                    {workout.exercises.map((ex) => (
                      <div key={ex.id} className="relative pl-10">
                        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-primary/50 to-transparent" />
                        <div className="absolute left-[-4px] top-2 w-[9px] h-[9px] bg-primary rounded-full shadow-[0_0_10px_var(--primary)]" />
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-white/5 rounded-[32px] border border-white/5">
                          <div className="flex items-center gap-4 shrink-0">
                             <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary">
                                <Dumbbell className="w-6 h-6" />
                             </div>
                             <div>
                                <h4 className="text-lg font-black text-white uppercase">{ex.name}</h4>
                                <span className="text-xs text-primary font-bold uppercase tracking-widest">{ex.muscle_group}</span>
                             </div>
                          </div>

                          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {ex.sets.map((set, sIdx) => (
                              <div key={set.id} className="bg-background/40 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                                <span className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">SET {sIdx + 1}</span>
                                <div className="text-lg font-black text-white">
                                   {set.weight}<span className="text-primary text-xs ml-1">KG</span>
                                   <XIcon className="mx-2 inline text-muted w-3 h-3" />
                                   {set.reps}<span className="text-primary text-xs ml-1">REPS</span>
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
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    )
}
