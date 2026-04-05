"use client";

import { useEffect, useState, useMemo } from "react";
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
  X,
  Trash2,
  Edit2
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

interface WorkoutSession {
  id: string;
  date: string;
  exercises: Exercise[];
}

interface GroupedWorkout {
  date: string;
  sessions: WorkoutSession[];
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
            const grouped = data.reduce((acc: any, curr: any) => {
                const dateKey = curr.date;
                if (!acc[dateKey]) {
                    acc[dateKey] = {
                        date: dateKey,
                        sessions: []
                    };
                }
                acc[dateKey].sessions.push(curr);
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

  const handleDelete = async (workoutId: string) => {
    if (!confirm("Are you sure you want to delete this workout session? This action cannot be undone.")) return;
    
    try {
      const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", workoutId);

      if (error) throw error;

      // Refresh data
      setGroupedWorkouts(prev => {
        return prev.map(group => ({
          ...group,
          sessions: group.sessions.filter(s => s.id !== workoutId)
        })).filter(group => group.sessions.length > 0);
      });

    } catch (err) {
      console.error("Delete Error:", err);
      alert("Failed to delete workout. Please try again.");
    }
  };

  const handleEdit = (workoutId: string) => {
    window.location.href = `/log?edit=${workoutId}`;
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
       <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-sm mx-auto px-6">
        <div className="w-24 h-24 bg-secondary/30 rounded-full flex items-center justify-center mb-8 relative">
          <Activity className="w-12 h-12 text-muted" />
           <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping" />
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4 italic">LOGBOOK EMPTY</h2>
        <p className="text-muted text-sm font-medium mb-10 leading-relaxed">Your journey hasn't hit the paper yet. Start a session to track your growth.</p>
        <button 
           onClick={() => window.location.href = '/log'}
           className="w-full py-5 bg-primary text-black font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 group uppercase text-xs tracking-widest"
        >
          START FIRST SESSION
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 md:space-y-12 pb-24 scroll-smooth overscroll-y-contain">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-4 md:gap-6 px-4 md:px-0"
      >
        <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-[16px] md:rounded-[20px] flex items-center justify-center text-black shadow-xl shrink-0">
          <Clock className="w-6 h-6 md:w-8 md:h-8" />
        </div>
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-white uppercase italic tracking-tighter">TRAINING <span className="text-primary not-italic">LOGS</span></h1>
          <p className="text-muted mt-1 font-black uppercase text-[8px] md:text-[10px] tracking-[0.2em]">DAILY SESSION HISTORY</p>
        </div>
      </motion.div>

      <div className="space-y-6 md:space-y-8 px-2 md:px-0">
        {groupedWorkouts.map((group, idx) => (
          <motion.div
            key={group.date}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass rounded-[32px] md:rounded-[40px] overflow-hidden transition-all duration-300 hover:border-primary/20 shadow-2xl relative"
          >
            <button 
              onClick={() => toggleExpand(group.date)}
              className="w-full p-5 md:p-8 flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-4 md:gap-6">
                 <div className="flex flex-col items-center justify-center w-14 h-14 md:w-20 md:h-20 bg-secondary/80 rounded-[20px] md:rounded-[28px] border border-white/5 group-hover:border-primary/30 transition-all shrink-0">
                    <span className="text-lg md:text-2xl font-black text-white leading-none">{format(new Date(group.date), "dd")}</span>
                    <span className="text-[8px] md:text-[10px] font-black uppercase text-primary tracking-widest mt-1">{format(new Date(group.date), "MMM")}</span>
                 </div>
                  <div>
                    <h3 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight mb-1 md:mb-2">
                       {group.sessions.reduce((acc, s) => acc + s.exercises.length, 0)} <span className="text-primary italic">Exercises</span>
                    </h3>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                        {Array.from(new Set(group.sessions.flatMap(s => s.exercises.map(e => e.muscle_group)))).slice(0, 3).map(mg => (
                            <span key={mg} className="text-[7px] md:text-[10px] bg-white/5 text-muted px-2 md:px-4 py-1 md:py-1.5 rounded-full font-black uppercase border border-white/5 tracking-widest leading-none">{mg}</span>
                        ))}
                    </div>
                 </div>
              </div>
              
              <div className="p-3 md:p-4 rounded-full bg-secondary/50 group-hover:bg-primary/10 transition-all duration-300 shrink-0 border border-white/5">
                <ChevronDown className={cn("w-4 h-4 md:w-6 md:h-6 text-primary transition-transform duration-500", expandedDates.has(group.date) && "rotate-180")} />
              </div>
            </button>

            <AnimatePresence mode="popLayout">
              {expandedDates.has(group.date) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "circOut" }}
                  className="overflow-hidden will-change-[height,opacity]"
                >
                  <div className="p-5 md:p-8 pt-0 space-y-6 md:space-y-8">
                    <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4 md:mb-8" />
                    {group.sessions.map((session, sIdx) => (
                      <div key={session.id} className="space-y-6">
                        {group.sessions.length > 1 && (
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-[10px] font-black uppercase text-primary tracking-widest italic bg-primary/5 px-3 py-1 rounded-full border border-primary/20">Session {sIdx + 1}</span>
                                <div className="flex-1 h-[1px] bg-white/5" />
                            </div>
                        )}
                        
                        <div className="flex justify-end gap-2 mb-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEdit(session.id); }}
                            className="p-2 bg-white/5 hover:bg-primary/10 text-muted hover:text-primary rounded-xl transition-all border border-white/5 group"
                            title="Edit Session"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(session.id); }}
                            className="p-2 bg-white/5 hover:bg-red-400/10 text-muted hover:text-red-400 rounded-xl transition-all border border-white/5 group"
                            title="Delete Session"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {session.exercises.map((ex, exIdx) => (
                          <div key={`${ex.id}-${exIdx}`} className="relative pl-6 md:pl-12">
                            <div className="absolute left-[2px] md:left-[3px] top-0 bottom-0 w-[1px] md:w-[2px] bg-gradient-to-b from-primary/40 via-primary/5 to-transparent" />
                            <div className="absolute left-[-2px] md:left-0 top-3 w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full shadow-[0_0_15px_var(--primary)]" />
                            
                            <div className="flex flex-col gap-4 md:gap-8 p-4 md:p-8 bg-white/5 rounded-[24px] md:rounded-[40px] border border-white/5 hover:bg-white/[0.07] transition-all">
                              <div className="flex items-center gap-3 md:gap-6 shrink-0">
                                 <div className="w-10 h-10 md:w-16 md:h-16 bg-secondary/80 rounded-xl md:rounded-2xl flex items-center justify-center text-primary shadow-xl border border-white/5">
                                    <Dumbbell className="w-5 h-5 md:w-8 md:h-8" />
                                 </div>
                                 <div>
                                    <h4 className="text-sm md:text-xl font-black text-white uppercase tracking-tight leading-none">{ex.name || "Strength Exercise"}</h4>
                                    <span className="text-[7px] md:text-[10px] text-primary font-black uppercase tracking-[0.2em] inline-block mt-1 md:mt-2 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/20 leading-none">{ex.muscle_group}</span>
                                 </div>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
                                {ex.sets.map((set, setIdx) => (
                                  <div key={set.id} className="bg-background/40 p-3 md:p-5 rounded-xl md:rounded-3xl border border-white/5 flex flex-col items-center hover:border-primary/20 transition-all">
                                    <span className="text-[7px] md:text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1 md:mb-2">SET {setIdx + 1}</span>
                                    <div className="text-xs md:text-xl font-black text-white flex items-baseline gap-0.5 md:gap-1 italic">
                                       {set.weight}<span className="text-primary text-[7px] md:text-[10px] not-italic font-black uppercase tracking-tighter">KG</span>
                                       <XIcon className="mx-1 md:mx-2 text-muted w-2 h-2 md:w-3 md:h-3 translate-y-[-1px] md:translate-y-[-2px] not-italic" />
                                       {set.reps}<span className="text-primary text-[7px] md:text-[10px] not-italic font-black uppercase tracking-tighter">REP</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
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
