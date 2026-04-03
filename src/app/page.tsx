"use client";

import { useAuth, SignInButton, SignUpButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowRight, Dumbbell, Zap, TrendingUp, Shield } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { isSignedIn } = useAuth();

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-y-auto overflow-x-hidden">
      <div className="relative min-h-screen">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-[50vw] h-[50vw] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] bg-primary/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />

        {/* Navigation */}
        <nav className="h-24 px-10 flex items-center justify-between border-b border-white/5 relative z-10 backdrop-blur-md">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-black font-black text-xl">MG</div>
              <span className="text-2xl font-black text-white italic tracking-tighter uppercase">MYGYM</span>
           </div>
           
           <div className="flex items-center gap-6">
              {!isSignedIn ? (
                <>
                  <SignInButton mode="modal">
                     <button className="text-white hover:text-primary transition-colors font-bold text-sm">LOGIN</button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="px-6 py-3 bg-primary text-black font-black rounded-xl hover:scale-105 transition-all text-sm uppercase tracking-widest">START NOW</button>
                  </SignUpButton>
                </>
              ) : (
                <Link href="/dashboard">
                  <button className="px-8 py-4 bg-primary text-black font-black rounded-xl hover:scale-105 transition-all flex items-center gap-2 uppercase tracking-widest text-xs">
                    DASHBOARD <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              )}
           </div>
        </nav>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-10 pt-32 pb-40 relative z-10">
          <div className="text-center space-y-8">
             <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/50 border border-white/5 rounded-full text-primary text-[10px] font-black uppercase tracking-[0.25em]"
             >
                <Zap className="w-3 h-3 fill-primary" />
                THE NEXT LEVEL OF TRAINING
             </motion.div>

             <motion.h1 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-[clamp(3rem,8vw,6rem)] font-black text-white leading-[0.9] italic uppercase tracking-tighter"
             >
                EVOLVE YOUR <br />
                <span className="text-primary not-italic stroke-text">PHYSIQUE</span>
             </motion.h1>

             <motion.p 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
               className="max-w-xl mx-auto text-muted text-xl font-medium"
             >
                MYGYM is the ultimate companion for elite athletes. Track every set, monitor every PR, and out-lift your past self.
             </motion.p>

             <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
               className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10"
             >
                {!isSignedIn ? (
                    <SignUpButton mode="modal">
                        <button className="w-full sm:w-auto px-12 py-6 bg-primary text-black font-black text-xl rounded-[24px] shadow-[0_20px_50px_rgba(196,251,109,0.3)] hover:scale-105 active:scale-95 transition-all group uppercase">
                        GET STARTED FREE
                        <ArrowRight className="inline-block ml-3 group-hover:translate-x-2 transition-transform" />
                        </button>
                    </SignUpButton>
                ) : (
                    <Link href="/dashboard" className="w-full sm:w-auto">
                        <button className="w-full px-12 py-6 bg-primary text-black font-black text-xl rounded-[24px] shadow-[0_20px_50px_rgba(196,251,109,0.3)] hover:scale-105 active:scale-95 transition-all uppercase">
                        GOTO DASHBOARD
                        </button>
                    </Link>
                )}
                <button className="w-full sm:w-auto px-10 py-6 bg-white/5 border border-white/10 text-white font-bold text-xl rounded-[24px] hover:bg-white/10 transition-all backdrop-blur-xl uppercase">
                   VIEW DEMO
                </button>
             </motion.div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-40">
             {[
               { icon: TrendingUp, title: "DATA VISUALIZATION", desc: "Watch your strength explode with our custom analytics engine." },
               { icon: Dumbbell, title: "ADVANCED LOGGING", desc: "Dynamic workout sheets built for speed and precision." },
               { icon: Shield, title: "ELITE PRIVACY", desc: "Your data is encrypted and synced across all your devices." }
             ].map((feat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-[40px] p-8 space-y-6 hover:border-primary/20 transition-all border border-white/5 group"
                >
                   <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:rotate-12 transition-transform">
                      <feat.icon className="w-7 h-7" />
                   </div>
                   <h3 className="text-xl font-black text-white italic uppercase tracking-tight">{feat.title}</h3>
                   <p className="text-muted font-medium">{feat.desc}</p>
                </motion.div>
             ))}
          </div>
        </main>
      </div>

      <style jsx>{`
        .stroke-text {
          -webkit-text-stroke: 2px #c4fb6d;
          color: transparent;
        }
      `}</style>
    </div>
  );
}
