import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';

export default function Page() {
  return (
    <div className='relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-background text-foreground selection:bg-blue-100 selection:text-blue-900'>
      {/* Background Image with Overlay */}
      <div className='absolute inset-0 z-0 select-none'>
        <Image
          src='/landing-bg.png'
          alt='Abstract Background'
          fill
          className='object-cover opacity-30 dark:opacity-20 pointer-events-none'
          priority
        />
        <div className='absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/90 z-10' />
      </div>

      {/* Main Content */}
      <main className='relative z-20 flex flex-col items-center text-center px-4 md:px-6 max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-10'>
        {/* Subtle Label */}
        <div className='inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300 backdrop-blur-sm shadow-sm hover:bg-blue-100 transition-colors cursor-default'>
          <span className='flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse'></span>
          Next Generation Interface
        </div>

        {/* Hero Title */}
        <h1 className='text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 drop-shadow-sm pb-2'>
          Capgemini Project
        </h1>

        {/* Subtitle */}
        <p className='max-w-2xl text-lg md:text-xl text-muted-foreground/90 font-light leading-relaxed'>
          Experience the future of digital innovation. Minimalist design meets
          powerful functionality in an interface built to inspire.
        </p>

        {/* CTA Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto'>
          <Button
            size='lg'
            className='h-12 px-8 text-base bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02]'
          >
            Get Started
          </Button>
          <Button
            size='lg'
            variant='outline'
            className='h-12 px-8 text-base rounded-full border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-300 backdrop-blur-sm bg-background/50 group'
          >
            Learn More
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className='ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform'
            />
          </Button>
        </div>
      </main>

      {/* Footer / Decorations */}
      <div className='absolute bottom-8 left-0 right-0 flex justify-center z-20'>
        <p className='text-xs text-muted-foreground/50 uppercase tracking-widest font-mono'>
          Engineered for Excellence
        </p>
      </div>
    </div>
  );
}
