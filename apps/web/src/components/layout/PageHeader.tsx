import { cn } from '@/lib/utils';
import { TypographyH1, TypographyMuted } from '@/components/ui/typography';

type PageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      <TypographyH1>{title}</TypographyH1>
      {description && (
        <TypographyMuted className="mt-1">{description}</TypographyMuted>
      )}
    </div>
  );
}
