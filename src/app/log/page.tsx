"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Dumbbell, 
  Save, 
  X,
  PlusCircle,
  AlertCircle,
  ChevronDown,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

const MUSCLE_GROUPS = [
  "Chest", "Back", "Biceps", "Triceps", "Shoulders", "Legs", "Abs"
];

interface Set {
  reps: string;
  weight: string;
}

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: Set[];
}

export default function LogWorkout() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [exercises, setExercises] = useState<Exercise[]>([
    { id: Math.random().toString(), name: "", muscleGroup: "Chest", sets: [{ reps: "", weight: "" }] }
  ]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    async function fetchWorkoutForEdit() {
      if (!editId || !user) return;
      setLoading(true);
      setIsEditMode(true);
      
      try {
        const { data, error } = await supabase
          .from("workouts")
          .select(`
            date,
            exercises (
              id,
              name,
              muscle_group,
              sets (
                reps,
                weight
              )
            )
          `)
          .eq("id", editId)
          .single();

        if (error) throw error;

        if (data) {
          setDate(data.date);
          const mappedExercises = data.exercises.map((ex: any) => ({
            id: ex.id || Math.random().toString(),
            name: ex.name,
            muscleGroup: ex.muscle_group,
            sets: ex.sets.map((s: any) => ({
              reps: s.reps.toString(),
              weight: s.weight.toString()
            }))
          }));
          setExercises(mappedExercises);
        }
      } catch (err) {
        console.error("Error fetching workout for edit:", err);
        alert("Failed to load workout for editing.");
      } finally {
        setLoading(false);
      }
    }
    fetchWorkoutForEdit();
  }, [editId, user]);

  const addExercise = () => {
    setExercises([...exercises, { 
      id: Math.random().toString(), 
      name: "", 
      muscleGroup: "Chest", 
      sets: [{ reps: "", weight: "" }] 
    }]);
  };

  const removeExercise = (id: string) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter(e => e.id !== id));
    }
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(e => 
      e.id === exerciseId ? { ...e, sets: [...e.sets, { reps: "", weight: "" }] } : e
    ));
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setExercises(exercises.map(e => {
        if (e.id === exerciseId && e.sets.length > 1) {
            const newSets = [...e.sets];
            newSets.splice(setIndex, 1);
            return { ...e, sets: newSets };
        }
        return e;
    }));
  };

  const updateExercise = (id: string, field: string, value: string) => {
    setExercises(exercises.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const updateSet = (exerciseId: string, setIndex: number, field: string, value: string) => {
    setExercises(exercises.map(e => {
      if (e.id === exerciseId) {
        const newSets = [...e.sets];
        newSets[setIndex] = { ...newSets[setIndex], [field]: value };
        return { ...e, sets: newSets };
      }
      return e;
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let workoutId = editId;

      if (isEditMode && editId) {
        // Update existing workout date
        const { error: updateError } = await supabase
          .from("workouts")
          .update({ date: date })
          .eq("id", editId);
        
        if (updateError) throw updateError;

        // Delete existing exercises (cascade will handle sets)
        const { error: deleteError } = await supabase
          .from("exercises")
          .delete()
          .eq("workout_id", editId);
        
        if (deleteError) throw deleteError;
      } else {
        // Create new profile if not exists
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({ id: user.id }, { onConflict: 'id' });

        if (profileError) throw new Error(`Profile creation failed: ${profileError.message}`);

        // Insert new workout
        const { data: workout, error: workoutError } = await supabase
          .from("workouts")
          .insert({
            user_id: user.id,
            date: date,
          })
          .select()
          .single();

        if (workoutError) throw workoutError;
        workoutId = workout.id;
      }

      // Insert exercises and sets
      for (const ex of exercises) {
        const { data: exercise, error: exerciseError } = await supabase
          .from("exercises")
          .insert({
            workout_id: workoutId,
            name: ex.name || "Untitled Exercise",
            muscle_group: ex.muscleGroup,
          })
          .select()
          .single();

        if (exerciseError) throw exerciseError;

        for (const set of ex.sets) {
          if (set.reps && set.weight) {
            const { error: setError } = await supabase
              .from("sets")
              .insert({
                exercise_id: exercise.id,
                reps: parseInt(set.reps),
                weight: parseFloat(set.weight),
              });
            if (setError) throw setError;
          }
        }
      }

      router.push("/history");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(`Error saving workout: ${err.message || 'Check console'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 px-4 md:px-0 pb-20">
       {!loading && (
           <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-3 text-[10px] md:text-sm font-bold text-primary italic uppercase tracking-widest">
               <AlertCircle className="w-4 h-4 shrink-0" />
               Recording gains to your personal database
           </div>
       )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white italic lowercase tracking-tighter uppercase">
            {isEditMode ? "EDIT" : "LOG"} <span className="text-primary not-italic">SESSION</span>
          </h1>
          <p className="text-muted mt-1 text-xs md:text-base font-medium">
            {isEditMode ? "Correcting your progress for the records." : "Record your victory for the history books."}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full sm:w-auto bg-white/5 border border-white/5 text-white text-xs font-black rounded-xl px-4 py-4 focus:outline-none uppercase tracking-widest"
          />
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-4 bg-primary text-black font-black rounded-xl shadow-[0_10px_30px_rgba(196,251,109,0.2)] flex items-center justify-center gap-2 disabled:opacity-50 text-xs md:text-sm uppercase tracking-widest"
          >
            <Save className="w-4 h-4" />
            {loading ? "SAVING..." : isEditMode ? "UPDATE SESSION" : "SAVE SESSION"}
          </motion.button>
        </div>
      </motion.div>

      {isEditMode && (
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft className="w-3 h-3" /> CANCEL EDIT
        </button>
      )}

      <div className="space-y-6">
        <AnimatePresence initial={false}>
          {exercises.map((ex, exIdx) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="glass rounded-[24px] md:rounded-[32px] p-6 md:p-8 border border-white/5 relative group shadow-2xl"
            >
              <button 
                onClick={() => removeExercise(ex.id)}
                className="absolute top-4 right-4 p-2 text-muted hover:text-red-400 transition-colors z-10"
                title="Remove Exercise"
              >
                <Trash2 className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted tracking-widest px-1">EXERCISE NAME</label>
                  <div className="relative">
                    <Dumbbell className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text"
                      placeholder="e.g. Bench Press"
                      value={ex.name}
                      onChange={(e) => updateExercise(ex.id, 'name', e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-black focus:outline-none focus:border-primary/50 text-xs md:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted tracking-widest px-1">MUSCLE GROUP</label>
                   <div className="relative">
                    <select 
                      value={ex.muscleGroup}
                      onChange={(e) => updateExercise(ex.id, 'muscleGroup', e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white font-black focus:outline-none appearance-none text-xs md:text-sm cursor-pointer"
                    >
                      {MUSCLE_GROUPS.map(mg => (
                        <option key={mg} value={mg} className="bg-[#121212] text-white py-2">
                          {mg}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                   </div>
                </div>
              </div>

              {/* Sets */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] inline-flex items-center gap-2 italic">
                    <div className="w-1.5 h-3 bg-primary rounded-full" />
                    PERFORMANCE METRICS
                   </h3>
                </div>

                <div className="space-y-3">
                  {ex.sets.map((set, setIdx) => (
                    <motion.div 
                        key={setIdx} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 md:gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 group/set"
                    >
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-secondary/50 rounded-xl flex items-center justify-center text-[10px] md:text-xs font-black text-primary shrink-0">
                        {setIdx + 1}
                      </div>

                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] font-black text-muted uppercase tracking-[0.2em] md:hidden">WEIGHT (KG)</label>
                          <input 
                            type="number"
                            placeholder="KG"
                            value={set.weight}
                            onChange={(e) => updateSet(ex.id, setIdx, 'weight', e.target.value)}
                            className="w-full bg-transparent border-b border-white/10 py-1 md:py-2 text-center text-white font-black focus:border-primary outline-none transition-colors text-sm"
                          />
                        </div>
                         <div className="flex flex-col gap-1">
                          <label className="text-[8px] font-black text-muted uppercase tracking-[0.2em] md:hidden">REPS</label>
                          <input 
                            type="number"
                            placeholder="REPS"
                            value={set.reps}
                            onChange={(e) => updateSet(ex.id, setIdx, 'reps', e.target.value)}
                            className="w-full bg-transparent border-b border-white/10 py-1 md:py-2 text-center text-white font-black focus:border-primary outline-none transition-colors text-sm"
                          />
                        </div>
                      </div>

                      <button 
                        onClick={() => removeSet(ex.id, setIdx)}
                        className="p-2 text-muted hover:text-red-400 group-hover/set:opacity-100 transition-opacity"
                        title="Remove Set"
                      >
                         <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>

                <motion.button 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => addSet(ex.id)}
                  className="w-full py-4 border border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 text-muted hover:text-primary hover:border-primary/30 transition-all text-[10px] font-black uppercase tracking-widest bg-white/5"
                >
                  <PlusCircle className="w-4 h-4" />
                  ADD NEW SET
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addExercise}
          className="w-full py-6 glass rounded-[24px] md:rounded-[32px] flex items-center justify-center gap-3 text-white hover:text-primary transition-all border border-dashed border-white/10 group shadow-xl"
        >
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-sm md:text-lg font-black uppercase tracking-widest italic">ADD EXERCISE</span>
        </motion.button>
      </div>
    </div>
  );
}
