import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  icon: ReactNode;
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AuthCard({ icon, title, subtitle, children, footer, className }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-8">
      <Card className={cn('w-full max-w-md', className)}>
        <CardContent className="pt-8 pb-6 px-8 flex flex-col items-center text-center">
          {/* Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              {icon}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-normal text-neutral-900">{title}</h1>
          <p className="text-sm text-neutral-500 mt-2">{subtitle}</p>

          {/* Content */}
          <div className="w-full mt-8">{children}</div>

          {/* Footer */}
          {footer && <div className="mt-6 text-xs text-neutral-500">{footer}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
