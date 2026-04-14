"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/frontend/components/ui/button';
import { Card } from '@/frontend/components/ui/card';
import { CapgeminiLogo } from '@/frontend/components/icons';
import { ThemeToggle } from '@/frontend/components/theme-toggle';
import Link from 'next/link';
import { HugeiconsIcon } from "@hugeicons/react";
import { UserAdd01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/frontend/lib/utils";
import { AnimatedBackground } from "@/frontend/components/ui/animated-background";
import { WhyCapgemini } from "@/frontend/components/why-capgemini";
import { Footer } from "@/frontend/components/footer";

export default function Page() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className='min-h-screen relative overflow-hidden bg-transparent selection:bg-purple-100 dark:selection:bg-purple-900/50'>
      <AnimatedBackground />

      {/* Header */}
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
          scrolled 
            ? "bg-white/70 dark:bg-black/70 backdrop-blur-md py-3 shadow-sm border-border/10" 
            : "bg-transparent py-6"
        )}
      >
        <div className='max-w-7xl mx-auto px-4 flex items-center justify-between'>
          {/* Logo à gauche */}
          <Link href="/" className="flex items-center">
            <CapgeminiLogo size="md" />
          </Link>

          {/* Navigation au centre */}
          <nav className='hidden md:flex items-center gap-8'>
            <Link href="/" className="text-foreground/80 dark:text-foreground hover:text-primary dark:hover:text-primary transition-colors font-medium text-sm">
              Home
            </Link>
            <a href="#why-capgemini" className="text-foreground/80 dark:text-foreground hover:text-primary dark:hover:text-primary transition-colors font-medium text-sm">
              Why Capgemini
            </a>
            <Link href="/success-stories" className="text-foreground/80 dark:text-foreground hover:text-primary dark:hover:text-primary transition-colors font-medium text-sm">
              Success Stories
            </Link>
            <Link href="/solutions" className="text-foreground/80 dark:text-foreground hover:text-primary dark:hover:text-primary transition-colors font-medium text-sm">
              Solutions
            </Link>
          </nav>

          {/* Actions à droite */}
          <div className='flex items-center gap-4'>
            <ThemeToggle variant="ghost" size="icon" />
            <Link href='/auth/sign-in'>
              <Button className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/20 transition-all hover:scale-105">
                <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Glassmorphism */}
      <main className='relative z-10 flex items-center justify-center min-h-screen px-4 pt-20 pb-10'>
        <div className='max-w-7xl mx-auto w-full'>
          {/* Glassmorphism Container - plus transparent et adaptable */}
          <div className='relative bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-3xl border border-white/20 dark:border-white/5 shadow-2xl p-8 md:p-12 lg:p-16 overflow-hidden transition-all duration-300 hover:bg-white/15 dark:hover:bg-black/15 font-sans group'>
            
            {/* Gradient Blob Effect */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none opacity-50 dark:opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none opacity-50 dark:opacity-20 animate-pulse delay-700"></div>

            {/* Content Wrapper */}
            <div className="relative z-10 flex flex-col items-center text-center">
              
              {/* Announcement Badge */}
              <div className='inline-flex items-center gap-2 bg-primary/5 dark:bg-primary/10 backdrop-blur-sm text-primary dark:text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-primary/10 hover:border-primary/20 transition-all hover:scale-105 cursor-default'>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Together, we build more
                <Link href="/solutions" className="flex items-center gap-1 ml-1 hover:underline font-semibold">
                  Read more
                  <HugeiconsIcon icon={ArrowRight01Icon} className="w-3 h-3" />
                </Link>
              </div>

              {/* Main Title - Responsive Typography using fluid text */}
              <h1 className='w-full max-w-6xl text-[2.5rem] sm:text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] font-bold text-foreground dark:text-white mb-6 leading-[1.1] tracking-tight antialiased'>
                Transforming connections
                <span className='block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-primary dark:from-blue-400 dark:via-indigo-400 dark:to-blue-300 pb-2'>
                  into opportunities
                </span>
              </h1>

              {/* Subtitle - New Font Style */}
              <p className='text-lg sm:text-xl md:text-2xl text-muted-foreground dark:text-gray-400 mb-10 max-w-3xl leading-relaxed font-light'>
                Great ideas grow with the right partners. Join us to accelerate your digital transformation journey.
              </p>

              {/* Action Buttons */}
              <div className='flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center'>
                <Link href='/success-stories/apply'>
                  <Button size='lg' className='w-full sm:w-auto h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 rounded-full hover:scale-105 transition-all duration-300 font-semibold'>
                    Devenir partenaire
                  </Button>
                </Link>
                <Link href='/auth/sign-in'>
                  <Button size='lg' variant='outline' className='w-full sm:w-auto h-14 px-8 text-lg border-primary/20 bg-white/40 dark:bg-black/40 hover:bg-white/60 dark:hover:bg-black/60 backdrop-blur-sm text-foreground dark:text-white rounded-full transition-all duration-300 group font-medium'>
                    Se connecter
                    <HugeiconsIcon icon={ArrowRight01Icon} className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Why Capgemini Section */}
      <WhyCapgemini />

      {/* Footer */}
      <Footer />
    </div>
  );
}
