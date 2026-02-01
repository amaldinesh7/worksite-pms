import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { LogoIcon } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AuthCard({ title, subtitle, children, footer, className }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-8">
      <Card className={cn('w-full max-w-md', className)}>
        <CardContent className="pt-8 pb-6 px-8 flex flex-col items-center text-center">
          {/* Worksite Logo */}
          <div className="mb-6">
            <LogoIcon className="w-16 h-16" />
          </div>

          {/* Title */}
          <Typography variant="h2" className="border-none pb-0 text-foreground">
            {title}
          </Typography>
          <Typography variant="muted" className="mt-2">
            {subtitle}
          </Typography>

          {/* Content */}
          <div className="w-full mt-8">{children}</div>

          {/* Footer */}
          {footer && <div className="mt-6 text-xs text-neutral-500">{footer}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
