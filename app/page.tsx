import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CapgeminiLogo } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';

export default function Page() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/10'>
      {/* Header */}
      <header className='border-b border-border/50 backdrop-blur-sm'>
        <div className='max-w-6xl mx-auto px-4 py-6 flex items-center justify-between'>
          <Link href="/" className="flex items-center">
            <CapgeminiLogo size="md" />
          </Link>
          <nav className='flex items-center gap-4'>
            <ThemeToggle variant="ghost" size="icon" />
            <Link href='/auth/sign-in'>
              <Button variant='ghost'>Sign In</Button>
            </Link>
            <Link href='/auth/sign-up'>
              <Button>Sign Up</Button>
            </Link>
            <Link href='/examples'>
              <Button variant='outline'>Exemples</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className='max-w-6xl mx-auto px-4 py-20'>
        <div className='text-center mb-16'>
          <h1 className='text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight'>
            Welcome to Your
            <span className='block text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary'>
              Professional Dashboard
            </span>
          </h1>
          <p className='text-xl text-muted-foreground mb-8 max-w-2xl mx-auto'>
            A modern, fully-featured application with authentication, database integration,
            and professional UI components built with Next.js, Drizzle ORM, and better-auth.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link href='/auth/sign-up'>
              <Button size='lg' className='text-lg px-8'>
                Get Started Free
              </Button>
            </Link>
            <Link href='/auth/sign-in'>
              <Button size='lg' variant='outline' className='text-lg px-8'>
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className='grid md:grid-cols-3 gap-6 my-20'>
          <Card className='p-8 hover:shadow-lg transition-shadow'>
            <div className='text-4xl mb-4'>🔐</div>
            <h3 className='text-xl font-semibold text-foreground mb-2'>
              Secure Authentication
            </h3>
            <p className='text-muted-foreground'>
              Email/password authentication with industry-standard security practices
            </p>
          </Card>

          <Card className='p-8 hover:shadow-lg transition-shadow'>
            <div className='text-4xl mb-4'>💾</div>
            <h3 className='text-xl font-semibold text-foreground mb-2'>
              Database Powered
            </h3>
            <p className='text-muted-foreground'>
              PostgreSQL with Drizzle ORM for type-safe queries and migrations
            </p>
          </Card>

          <Card className='p-8 hover:shadow-lg transition-shadow'>
            <div className='text-4xl mb-4'>🎨</div>
            <h3 className='text-xl font-semibold text-foreground mb-2'>
              Beautiful UI
            </h3>
            <p className='text-muted-foreground'>
              27+ shadcn/ui components with Tailwind CSS and custom styling
            </p>
          </Card>
        </div>

        {/* Stats Section */}
        <div className='grid md:grid-cols-4 gap-6 my-20'>
          <Card className='p-6 border-primary/20 bg-primary/5'>
            <div className='text-3xl font-bold text-primary mb-2'>27+</div>
            <p className='text-muted-foreground'>UI Components</p>
          </Card>
          <Card className='p-6 border-secondary/20 bg-secondary/5'>
            <div className='text-3xl font-bold text-secondary mb-2'>5</div>
            <p className='text-muted-foreground'>API Endpoints</p>
          </Card>
          <Card className='p-6 border-accent/20 bg-accent/5'>
            <div className='text-3xl font-bold text-accent mb-2'>2</div>
            <p className='text-muted-foreground'>Database Tables</p>
          </Card>
          <Card className='p-6 border-foreground/10 bg-foreground/5'>
            <div className='text-3xl font-bold text-foreground mb-2'>100%</div>
            <p className='text-muted-foreground'>Type-Safe</p>
          </Card>
        </div>

        {/* Stack Section */}
        <Card className='p-12 mb-20'>
          <h2 className='text-3xl font-bold text-foreground mb-8 text-center'>
            Built With Modern Stack
          </h2>
          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div>
              <div className='font-semibold text-foreground mb-2'>Frontend</div>
              <ul className='text-sm text-muted-foreground space-y-1'>
                <li>Next.js 16.1</li>
                <li>React 19</li>
                <li>Tailwind CSS 4</li>
              </ul>
            </div>
            <div>
              <div className='font-semibold text-foreground mb-2'>Authentication</div>
              <ul className='text-sm text-muted-foreground space-y-1'>
                <li>better-auth 1.4</li>
                <li>Email/Password</li>
                <li>OAuth Ready</li>
              </ul>
            </div>
            <div>
              <div className='font-semibold text-foreground mb-2'>Database</div>
              <ul className='text-sm text-muted-foreground space-y-1'>
                <li>PostgreSQL 17</li>
                <li>Drizzle ORM</li>
                <li>Type-Safe</li>
              </ul>
            </div>
            <div>
              <div className='font-semibold text-foreground mb-2'>Development</div>
              <ul className='text-sm text-muted-foreground space-y-1'>
                <li>TypeScript</li>
                <li>Bun Runtime</li>
                <li>Turbopack</li>
              </ul>
            </div>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className='border-t border-border/50 py-8 text-center text-muted-foreground'>
        <p>Built with ❤️ using Next.js, React, and modern web technologies</p>
      </footer>
    </div>
  );
}
