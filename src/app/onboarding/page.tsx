"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Weight, ArrowUp, Activity, User, Calendar, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { DAYS_OF_WEEK } from "@/lib/streak-utils";

export default function Onboarding() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: "",
    height: "",
    weight: "",
    workout_days: [] as string[],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (data && !error) {
        setFormData({
          age: data.age?.toString() || "",
          height: data.height?.toString() || "",
          weight: data.weight?.toString() || "",
          workout_days: data.workout_days || [],
        });
      }
    }
    fetchProfile();
  }, [user]);

  const calculateBMI = (): string => {
    const h = (parseFloat(formData.height) || 0) / 100;
    const w = parseFloat(formData.weight) || 0;
    if (!h || !w) return "0";
    return (w / (h * h)).toFixed(1);
  };

  const bmi = calculateBMI();

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal Weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id, // Store Clerk User ID directly
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        bmi: parseFloat(calculateBMI()),
        workout_days: formData.workout_days,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Supabase Error:", error);
      alert(`Error saving profile: ${error.message}`);
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4 md:px-0 pb-12">
      <div className="w-full max-w-xl">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center mb-6 md:mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4 md:mb-6">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={cn(
                  "w-8 md:w-12 h-1.5 rounded-full transition-all duration-500",
                  step === s ? "bg-primary w-12 md:w-20" : s < step ? "bg-primary/40" : "bg-white/10"
                )}
                aria-label={`Go to step ${s}`}
              />
            ))}
          </div>
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-[0_0_15px_rgba(196,251,109,0.1)]">
            PHASE 0{step}: {step === 1 ? "BIOMETRICS" : step === 2 ? "ANALYSIS" : "SCHEDULE"}
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3 md:mb-4 italic uppercase tracking-tighter leading-none">
            {step === 3 ? "STREAK" : "ESTABLISH"} <span className="text-primary not-italic">{step === 3 ? "ACTIVATION" : "LEGACY"}</span>
          </h1>
          <p className="text-muted text-xs md:text-base max-w-[280px] md:max-w-sm mx-auto font-medium">
            {step === 3 
              ? "Set your training commitment to begin tracking your performance streak." 
              : "Link your vitals to MYGYM to synchronize your journey."}
          </p>
        </motion.div>

        <div className="glass rounded-[24px] md:rounded-[32px] p-6 md:p-10 relative overflow-hidden shadow-2xl border border-white/5">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 md:space-y-8"
              >
                <div className="group relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    type="number"
                    placeholder="Age"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full bg-secondary/30 border border-border rounded-xl md:rounded-2xl p-4 pl-12 text-sm md:text-lg focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                </div>

                <div className="group relative">
                  <ArrowUp className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    type="number"
                    placeholder="Height (cm)"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full bg-secondary/30 border border-border rounded-xl md:rounded-2xl p-4 pl-12 text-sm md:text-lg focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                </div>

                <div className="group relative">
                   <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    type="number"
                    placeholder="Weight (kg)"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full bg-secondary/30 border border-border rounded-xl md:rounded-2xl p-4 pl-12 text-sm md:text-lg focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                </div>

                <button
                  disabled={!formData.age || !formData.height || !formData.weight}
                  onClick={() => setStep(2)}
                  className="w-full py-4 md:py-5 bg-primary text-black font-black text-sm md:text-lg rounded-xl md:rounded-2xl hover:bg-white hover:scale-[1.02] shadow-[0_4px_30px_rgba(196,251,109,0.2)] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:scale-100 uppercase tracking-widest"
                >
                  NEXT STEP
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-8 md:space-y-10"
              >
                <div className="relative inline-block">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] md:border-[10px] border-primary/20 flex items-center justify-center mx-auto relative overflow-hidden">
                    <motion.div 
                      className="absolute bottom-0 w-full bg-primary/20"
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.min(parseFloat(bmi) * 2, 100)}%` }}
                    />
                    <div className="relative">
                      <span className="text-3xl md:text-5xl font-black text-white">{bmi}</span>
                      <p className="text-[8px] md:text-[10px] font-black uppercase text-primary tracking-widest mt-1">BMI SCORE</p>
                    </div>
                  </div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-primary text-black p-1.5 md:p-2 rounded-lg md:rounded-xl shadow-xl"
                  >
                    <Activity className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight italic">
                    {getBMICategory(parseFloat(bmi))}
                  </h3>
                  <p className="text-muted text-xs md:text-sm max-w-[240px] md:max-w-xs mx-auto">
                    Your BMI is a reliable indicator of body fatness for most people.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 md:py-5 bg-secondary border border-border text-white font-bold rounded-xl md:rounded-2xl hover:bg-accent transition-all text-xs md:text-sm uppercase tracking-widest"
                  >
                    BACK
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-[2] py-4 md:py-5 bg-primary text-black font-black text-xs md:text-lg rounded-xl md:rounded-2xl hover:bg-white hover:scale-[1.02] shadow-[0_4px_30px_rgba(196,251,109,0.2)] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-widest"
                  >
                    SET SCHEDULE
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 md:space-y-8"
              >
                <div className="text-center space-y-3 md:space-y-4 mb-6 md:mb-8">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto text-primary">
                    <Calendar className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white uppercase italic">COMMIT TO YOUR DAYS</h3>
                  <p className="text-muted text-[10px] md:text-sm max-w-[240px] md:max-w-xs mx-auto uppercase tracking-widest leading-loose">
                    Your streak depends on this commitment.
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-2 md:gap-3">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = formData.workout_days.includes(day);
                    return (
                      <button
                        key={day}
                        onClick={() => {
                          const newDays = isSelected
                            ? formData.workout_days.filter(d => d !== day)
                            : [...formData.workout_days, day];
                          setFormData({ ...formData, workout_days: newDays });
                        }}
                        className={cn(
                          "py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-sm transition-all border-2 flex flex-col items-center justify-center gap-1 md:gap-2",
                          isSelected 
                            ? "bg-primary border-primary text-black scale-[1.05] shadow-[0_0_20px_rgba(196,251,109,0.2)]" 
                            : "bg-secondary/30 border-white/5 text-muted hover:border-white/10"
                        )}
                      >
                        <span className="uppercase tracking-tighter">{day}</span>
                        {isSelected && <Check className="w-3 h-3" />}
                      </button>
                    )
                  })}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-4 md:py-5 bg-secondary border border-border text-white font-bold rounded-xl md:rounded-2xl hover:bg-accent transition-all text-xs md:text-sm uppercase tracking-widest"
                  >
                    BACK
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || formData.workout_days.length === 0}
                    className="flex-[2] py-4 md:py-5 bg-primary text-black font-black text-xs md:text-lg rounded-xl md:rounded-2xl hover:bg-white hover:scale-[1.02] shadow-[0_4px_30px_rgba(196,251,109,0.2)] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale uppercase tracking-widest"
                  >
                    {loading ? "SAVING..." : "ACTIVATE"}
                    {!loading && <ArrowRight className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
