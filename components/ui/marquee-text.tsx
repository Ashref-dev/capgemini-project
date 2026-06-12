'use client';

import { useRef, useEffect, forwardRef } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useAnimationFrame,
  useMotionValue,
} from 'framer-motion';
import { cn } from '@/lib/utils';

// Inline wrap — equivalent to @motionone/utils wrap, avoids direct dep
const wrap = (min: number, max: number, v: number): number => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

interface MarqueeTextProps {
  children: string;
  baseVelocity: number;
  clasname?: string;
  scrollDependent?: boolean;
  delay?: number;
}

const MarqueeText = forwardRef<HTMLDivElement, MarqueeTextProps>(({
  children,
  baseVelocity = -5,
  clasname,
  scrollDependent = false,
  delay = 0,
}, ref) => {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 2], {
    clamp: false,
  });

  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  const directionFactor = useRef<number>(1);
  const hasStarted = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      hasStarted.current = true;
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useAnimationFrame((t, delta) => {
    if (!hasStarted.current) return;

    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (scrollDependent) {
      if (velocityFactor.get() < 0) {
        directionFactor.current = -1;
      } else if (velocityFactor.get() > 0) {
        directionFactor.current = 1;
      }
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div ref={ref} className='overflow-hidden whitespace-nowrap flex flex-nowrap'>
      <motion.div
        className='flex whitespace-nowrap gap-10 flex-nowrap'
        style={{ x }}
      >
        <span className={cn(`block text-[4vw]`, clasname)}>{children}</span>
        <span className={cn(`block text-[4vw]`, clasname)}>{children}</span>
        <span className={cn(`block text-[4vw]`, clasname)}>{children}</span>
        <span className={cn(`block text-[4vw]`, clasname)}>{children}</span>
      </motion.div>
    </div>
  );
});

MarqueeText.displayName = 'MarqueeText';

export default MarqueeText;
