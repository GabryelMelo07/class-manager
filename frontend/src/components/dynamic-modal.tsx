import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface DynamicModalProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactElement<{ initialData?: any }>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: any;
  className?: string;
}

export function DynamicModal({
  trigger,
  title,
  description,
  children,
  open,
  onOpenChange,
  initialData,
  className
}: DynamicModalProps) {
  const shouldPassInitialData = 
    React.isValidElement(children) && 
    typeof children.type !== 'string';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={cn("sm:max-w-md max-h-screen overflow-y-auto", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="mt-4">
          {shouldPassInitialData
            ? React.cloneElement(children, { initialData })
            : children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
