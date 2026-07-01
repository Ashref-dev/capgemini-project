'use client';

import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AiChat02Icon,
  Add01Icon,
  Menu01Icon,
  Link01Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons';

import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/toast';

interface AgentHeaderProps {
  activeThreadId: number | null;
  threadTitle: string | null;
  messageCount: number;
  onOpenDrawer: () => void;
  onNewThread: () => void;
}

function buildThreadUrl(threadId: number): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}${window.location.pathname}?thread=${threadId}`;
}

export function AgentHeader({
  activeThreadId,
  threadTitle,
  messageCount,
  onOpenDrawer,
  onNewThread,
}: AgentHeaderProps) {
  const [copied, setCopied] = React.useState(false);

  const copyLink = React.useCallback(() => {
    if (activeThreadId == null) return;
    const url = buildThreadUrl(activeThreadId);
    void navigator.clipboard.writeText(url).then(
      () => {
        setCopied(true);
        toast.success('Lien copié', {
          description: 'Le lien de la conversation est dans le presse-papiers.',
        });
        window.setTimeout(() => setCopied(false), 1600);
      },
      () =>
        toast.error('Copie impossible', {
          description: "Impossible d'accéder au presse-papiers.",
        }),
    );
  }, [activeThreadId]);

  const title =
    threadTitle?.trim() ||
    (activeThreadId ? 'Conversation' : 'Nouvelle conversation');

  return (
    <header className='flex h-14 items-center justify-between gap-2 border-b border-border bg-background px-3 sm:px-4'>
      <div className='flex min-w-0 items-center gap-2'>
        <button
          type='button'
          onClick={onOpenDrawer}
          aria-label="Ouvrir l'historique"
          className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 lg:hidden'
        >
          <HugeiconsIcon icon={Menu01Icon} className='h-4.5 w-4.5' />
        </button>

        <span className='hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20 sm:flex'>
          <HugeiconsIcon icon={AiChat02Icon} className='h-4 w-4 text-primary' />
        </span>

        <div className='min-w-0'>
          <h1 className='truncate text-sm font-semibold text-foreground'>
            {title}
          </h1>
          <div className='flex items-center gap-1.5'>
            <p className='truncate text-xs text-muted-foreground'>
              {activeThreadId != null
                ? `${messageCount} message${messageCount > 1 ? 's' : ''}`
                : 'Analyste partenariat IntelliConnect'}
            </p>
          </div>
        </div>
      </div>

      <div className='flex shrink-0 items-center gap-1.5'>
        {activeThreadId != null ? (
          <button
            type='button'
            onClick={copyLink}
            aria-label='Copier le lien de la conversation'
            className={cn(
              'inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
              copied ? 'text-primary' : 'text-foreground',
            )}
          >
            <HugeiconsIcon
              icon={copied ? Tick02Icon : Link01Icon}
              className='h-3.5 w-3.5'
            />
            <span className='hidden sm:inline'>
              {copied ? 'Copié' : 'Lien'}
            </span>
          </button>
        ) : null}
      </div>
    </header>
  );
}
