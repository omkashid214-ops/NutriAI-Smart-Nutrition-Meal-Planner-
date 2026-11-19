import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Leaf } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1250;
    let rafId = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (elapsed < duration) {
        rafId = requestAnimationFrame(tick);
      } else {
        onComplete();
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#14532D] text-white flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        <div className="w-20 h-20 rounded-[26px] bg-[#E6F4EC] text-[#14532D] flex items-center justify-center shadow-lg mb-6">
          <Leaf className="w-10 h-10 stroke-[2.2]" />
        </div>

        <h1 className="font-display text-4xl font-bold tracking-tight text-white mb-2">
          NutriAI
        </h1>
        <p className="text-sm text-[#D1E7D8] leading-relaxed mb-10">
          Smart Nutrition &amp; Personalized Meal Planner
        </p>

        <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-[#A7F3C0] rounded-full transition-transform duration-100 origin-left"
            style={{ transform: `scaleX(${progress / 100})` }}
          />
        </div>
        <span className="font-mono text-xs tabular-nums text-[#C4E4CE]">
          Loading nutrition engine · {progress}%
        </span>
      </motion.div>
    </div>
  );
};
