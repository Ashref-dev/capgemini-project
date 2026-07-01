'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CapgeminiLogo } from '@/components/icons';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Home01Icon,
  UserGroupIcon,
  Building06Icon,
  ContactBookIcon,
  AnalyticsUpIcon,
  AiChat02Icon,
  Calendar03Icon,
  Briefcase01Icon,
  UserAdd01Icon,
  UserIcon,
  MortarboardIcon,
  ArrowLeft01Icon,
  Menu01Icon,
} from '@hugeicons/core-free-icons';

const ICON_SIZE = 18;
const ICON_STROKE = 2.2;

interface NavItem {
  label: string;
  href: string;
  icon: typeof UserGroupIcon;
  roles?: string[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Principal',
    items: [
      { label: 'Tableau de bord', href: '/dashboard', icon: Home01Icon },
      {
        label: 'Partenaires',
        href: '/dashboard/partners',
        icon: Building06Icon,
      },
      { label: 'Contacts', href: '/dashboard/contacts', icon: ContactBookIcon },
      { label: 'Projets', href: '/dashboard/projects', icon: Briefcase01Icon },
      {
        label: 'Demandes',
        href: '/dashboard/partnership-requests',
        icon: UserAdd01Icon,
        roles: ['admin', 'manager'],
      },
    ],
  },
  {
    label: 'Analyses',
    items: [
      { label: 'Dashboard BI', href: '/dashboard/bi', icon: AnalyticsUpIcon },
    ],
  },
  {
    label: 'IA & Outils',
    items: [
      { label: 'AI Agent', href: '/dashboard/agent', icon: AiChat02Icon },
    ],
  },
  {
    label: 'Ressources Humaines',
    items: [
      {
        label: 'Employés',
        href: '/dashboard/hr/employees',
        icon: UserGroupIcon,
        roles: ['rh', 'admin'],
      },
      {
        label: 'Recrutements',
        href: '/dashboard/hr/recruitments',
        icon: MortarboardIcon,
        roles: ['rh', 'admin'],
      },
      {
        label: 'Événements',
        href: '/dashboard/hr/events',
        icon: Calendar03Icon,
        roles: ['rh', 'admin', 'manager'],
      },
    ],
  },
  {
    label: 'Compte',
    items: [
      { label: 'Mon Profil', href: '/dashboard/profile', icon: UserIcon },
    ],
  },
];

function getVisibleGroups(userRole?: string): NavGroup[] {
  const filterItems = (items: NavItem[]) =>
    items.filter((item) => !item.roles || item.roles.includes(userRole || ''));
  return navGroups
    .map((g) => ({ ...g, items: filterItems(g.items) }))
    .filter((g) => g.items.length > 0);
}

function isItemActive(href: string, pathname: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(href + '/');
}

function SidebarLogo({ open }: { open: boolean }) {
  return (
    <div className='flex h-16 items-center gap-3 border-b border-sidebar-border bg-sidebar px-4'>
      <Link
        href='/dashboard'
        className='shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50'
      >
        <AnimatePresence initial={false} mode='wait'>
          {open ? (
            <motion.div
              key='full'
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className='flex flex-col gap-0.5 overflow-hidden whitespace-nowrap'
            >
              <CapgeminiLogo size='sm' />
              <span className='text-[9px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/50'>
                Capgemini Tunisie
              </span>
            </motion.div>
          ) : (
            <motion.div
              key='small'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='flex items-center justify-center'
            >
              <div className='flex size-8 items-center justify-center'>
                <svg
                  width='100%'
                  height='100%'
                  viewBox='0 0 50 46'
                  preserveAspectRatio='xMidYMid meet'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                  role='img'
                  aria-label='Capgemini Tunisie'
                >
                  <path
                    d='M41.134 8.75567C44.734 12.0621 47.445 15.9622 48.783 20.4119C46.529 18.157 42.88 17.3569 39.802 18.0734C36.405 18.8638 34.116 21.6626 32.326 24.4667C30.398 27.4848 28.854 30.7316 26.826 33.6882C24.904 36.4891 22.519 39.001 19.386 40.4278C16.144 41.9042 12.507 42.117 9.13098 40.9729C3.70098 38.7762 0 33.3042 0 27.4477C0 12.4758 20.646 7.1441 26.607 0L26.609 0.000847042C27.003 0.156252 27.395 0.315692 27.784 0.479022C32.626 2.51053 37.246 5.20278 41.134 8.75567Z'
                    fill='#0058AB'
                  />
                  <path
                    d='M41.719 19.6788C44.67 19.5397 47.547 20.714 48.915 23.4492C49.951 25.5641 49.88 27.9535 49.157 30.1519C48.018 33.6147 45.194 36.3944 41.678 37.3952C37.666 38.5375 33.656 37.3012 31.005 34.0914C31.301 38.2684 34.623 41.039 38.744 40.9857C36.103 43.5928 32.247 44.8457 28.676 45.4854C26.72 45.8356 24.711 46.0173 22.724 45.9407C20.966 45.873 18.927 45.6354 17.456 44.5756C20.636 43.6134 23.469 41.7816 25.723 39.3511C27.756 37.1592 29.275 34.594 30.687 31.9759C32.152 29.2592 33.412 26.3795 35.206 23.8564C36.792 21.6268 38.87 19.8131 41.719 19.6788Z'
                    fill='#0058AB'
                  />
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>
    </div>
  );
}

interface SidebarNavProps {
  groups: NavGroup[];
  pathname: string;
  open: boolean;
  idPrefix: string;
  onNavigate?: () => void;
}

function SidebarNav({
  groups,
  pathname,
  open,
  idPrefix,
  onNavigate,
}: SidebarNavProps) {
  const reduceMotion = useReducedMotion();
  // Critically damped spring: the highlight glides between items with no
  // overshoot. Reduced motion snaps it instantly instead of animating.
  const pillTransition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 380, damping: 32 };

  return (
    <nav className='flex-1 space-y-6 overflow-y-auto overflow-x-hidden px-2 py-3'>
      {groups.map((group) => (
        <div key={group.label}>
          <AnimatePresence initial={false}>
            {open && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className='mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-sidebar-foreground/45'
              >
                {group.label}
              </motion.p>
            )}
          </AnimatePresence>
          <div className='space-y-1'>
            {group.items.map((item) => {
              const isActive = isItemActive(item.href, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  title={!open ? item.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'group relative flex h-10 items-center gap-3 rounded-md text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50',
                    open ? 'px-3' : 'justify-center px-0',
                    isActive
                      ? 'text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-foreground/[0.05] hover:text-sidebar-foreground',
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId={`${idPrefix}-active-pill`}
                      transition={pillTransition}
                      className='absolute inset-0 rounded-md bg-sidebar-accent ring-1 ring-inset ring-sidebar-primary/20'
                    />
                  )}
                  <HugeiconsIcon
                    icon={item.icon}
                    size={ICON_SIZE}
                    strokeWidth={ICON_STROKE}
                    className={cn(
                      'relative z-10 shrink-0 transition-transform duration-150',
                      isActive
                        ? 'text-sidebar-primary'
                        : 'text-sidebar-foreground/60 group-hover:scale-110 group-hover:text-sidebar-foreground',
                    )}
                  />
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          'relative z-10 overflow-hidden whitespace-nowrap',
                          isActive && 'font-semibold',
                        )}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

interface DashboardSidebarProps {
  userRole?: string;
}

export function DashboardSidebar({ userRole }: DashboardSidebarProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(true);

  const visibleGroups = getVisibleGroups(userRole);

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-out md:flex',
        open ? 'w-64' : 'w-16',
      )}
    >
      <SidebarLogo open={open} />

      <SidebarNav
        groups={visibleGroups}
        pathname={pathname}
        open={open}
        idPrefix='sidebar'
      />

      {/* Toggle collapse */}
      <button
        type='button'
        onClick={() => setOpen(!open)}
        className='group flex min-h-[48px] w-full items-center border-t border-sidebar-border text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sidebar-ring/50'
        aria-label={open ? 'Réduire le menu' : 'Agrandir le menu'}
      >
        <div className='grid w-16 shrink-0 place-content-center'>
          <motion.div
            animate={{ rotate: open ? 0 : 180 }}
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: 'easeOut' }}
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={ICON_SIZE}
              strokeWidth={ICON_STROKE}
              className='text-sidebar-foreground/60 transition-colors group-hover:text-sidebar-foreground'
            />
          </motion.div>
        </div>
        <AnimatePresence initial={false}>
          {open && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className='text-sm font-medium'
            >
              Réduire
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </aside>
  );
}

export function DashboardMobileSidebar({ userRole }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const visibleGroups = getVisibleGroups(userRole);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type='button'
        onClick={() => setOpen(true)}
        className='flex h-9 w-9 items-center justify-center rounded-md border border-sidebar-border bg-sidebar text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50 md:hidden'
        aria-label='Ouvrir le menu'
      >
        <HugeiconsIcon icon={Menu01Icon} size={20} strokeWidth={ICON_STROKE} />
      </button>
      <SheetContent
        side='left'
        className='flex w-72 max-w-[85vw] flex-col gap-0 border-sidebar-border bg-sidebar p-0'
      >
        <SheetTitle className='sr-only'>Menu de navigation</SheetTitle>
        <SidebarLogo open />
        <SidebarNav
          groups={visibleGroups}
          pathname={pathname}
          open
          idPrefix='sidebar-mobile'
          onNavigate={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
