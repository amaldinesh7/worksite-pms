import { useState, useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  show: boolean;
}

export function Tooltip({ content, children, show }: TooltipProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 8,
      });
    }
  }, [show]);

  return (
    <div ref={triggerRef} className="relative">
      {children}
      {show && (
        <div
          className={cn(
            'fixed z-100 px-2.5 py-1.5',
            'rounded-md bg-neutral-800 text-xs text-white',
            'whitespace-nowrap shadow-lg',
            'pointer-events-none',
            '-translate-y-1/2'
          )}
          style={{ top: position.top, left: position.left }}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
}
