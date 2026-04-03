"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Weight, ArrowUp, Activity, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Onboarding() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: "",
    height: "",
    weight: "",
  });
  const [loading, setLoading] = useState(false);

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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)]">
      <div className="w-full max-w-xl">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-4 shadow-[0_0_15px_rgba(196,251,109,0.1)]">
            PHASE 01: BIOMETRICS
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 italic uppercase tracking-tighter">
            ESTABLISH YOUR <span className="text-primary not-italic">LEGACY</span>
          </h1>
          <p className="text-muted text-lg max-w-sm mx-auto font-medium">
            Link your vitals to MYGYM to synchronize your journey.
          </p>
        </motion.div>

        <div className="glass rounded-[32px] p-10 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="group relative">
                  <User className="absolute left-4 top-4 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    type="number"
                    placeholder="Age"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full bg-secondary/30 border border-border rounded-2xl p-4 pl-12 text-lg focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                </div>

                <div className="group relative">
                  <ArrowUp className="absolute left-4 top-4 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    type="number"
                    placeholder="Height (cm)"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full bg-secondary/30 border border-border rounded-2xl p-4 pl-12 text-lg focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                </div>

                <div className="group relative">
                   <Weight className="absolute left-4 top-4 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    type="number"
                    placeholder="Weight (kg)"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full bg-secondary/30 border border-border rounded-2xl p-4 pl-12 text-lg focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                </div>

                <button
                  disabled={!formData.age || !formData.height || !formData.weight}
                  onClick={() => setStep(2)}
                  className="w-full py-5 bg-primary text-black font-black text-lg rounded-2xl hover:bg-white hover:scale-[1.02] shadow-[0_4px_30px_rgba(196,251,109,0.2)] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:scale-100"
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
                className="text-center space-y-10"
              >
                <div className="relative inline-block">
                  <div className="w-40 h-40 rounded-full border-[10px] border-primary/20 flex items-center justify-center mx-auto relative overflow-hidden">
                    <motion.div 
                      className="absolute bottom-0 w-full bg-primary/20"
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.min(parseFloat(bmi) * 2, 100)}%` }}
                    />
                    <div className="relative">
                      <span className="text-5xl font-black text-white">{bmi}</span>
                      <p className="text-[10px] font-black uppercase text-primary tracking-widest mt-1">BMI SCORE</p>
                    </div>
                  </div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-primary text-black p-2 rounded-xl shadow-xl"
                  >
                    <Activity className="w-5 h-5" />
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                    {getBMICategory(parseFloat(bmi))}
                  </h3>
                  <p className="text-muted max-w-xs mx-auto">
                    Your BMI is a reliable indicator of body fatness for most people.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-5 bg-secondary border border-border text-white font-bold rounded-2xl hover:bg-accent transition-all"
                  >
                    GO BACK
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-[2] py-5 bg-primary text-black font-black text-lg rounded-2xl hover:bg-white hover:scale-[1.02] shadow-[0_4px_30px_rgba(196,251,109,0.2)] active:scale-95 transition-all duration-300"
                  >
                    {loading ? "SAVING..." : "COMPLETE PROFILE"}
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
