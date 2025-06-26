'use client';

import * as React from 'react';
import { Info } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface InfoTooltipProps {
  message: string;
  className?: string;
  iconClassName?: string;
}

export function InfoTooltip({
  message,
  className,
  iconClassName,
}: InfoTooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn('inline-flex items-center justify-center', className)}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          aria-label="More information"
        >
          <Info
            className={cn(
              'h-4 w-4 text-muted-foreground hover:text-foreground transition-colors',
              iconClassName
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 text-sm" side="top" align="center">
        {message}
      </PopoverContent>
    </Popover>
  );
}
