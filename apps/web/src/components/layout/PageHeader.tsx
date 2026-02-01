import { cn } from '@/lib/utils';
import { Typography } from '@/components/ui/typography';

type PageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      <Typography variant="h1">{title}</Typography>
      {description && (
        <Typography variant="muted" className="mt-1">{description}</Typography>
      )}
    </div>
  );
}
