import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Tooltip } from './Tooltip';
import { Typography } from '@/components/ui/typography';
import type { NavItem } from './navigation';

interface NavItemButtonProps {
  item: NavItem;
  isCollapsed: boolean;
  isActive?: boolean;
  onClick?: (href: string) => void;
}

export function NavItemButton({
  item,
  isCollapsed,
  isActive: isActiveProp,
  onClick,
}: NavItemButtonProps) {
  const Icon = item.icon;
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  // Use prop if provided, otherwise derive from current location
  const isActive =
    isActiveProp ??
    (item.href === '/'
      ? location.pathname === '/'
      : location.pathname === item.href || location.pathname.startsWith(`${item.href}/`));

  const handleClick = () => {
    onClick?.(item.href);
  };

  const tooltipContent = (
    <>
      {item.label}
      {item.badge !== undefined && (
        <Typography
          variant="paragraph-mini"
          as="span"
          className="ml-2 px-1.5 py-0.5 rounded bg-neutral-600"
        >
          {item.badge}
        </Typography>
      )}
    </>
  );

  const linkContent = (
    <Link
      to={item.href}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'flex items-center gap-2 rounded-lg',
        'transition-colors duration-150',
        isCollapsed ? 'px-3 py-2 justify-center' : 'px-3 py-2',
        // States: Idle → text-muted-foreground, Hover → bg-black/5, Active → bg-secondary + text-foreground
        isActive
          ? 'bg-secondary text-foreground'
          : 'text-muted-foreground hover:bg-black/5'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Icon - 20x20 for 36px total nav item height */}
      <Icon
        className={cn(
          'h-5 w-5 shrink-0 text-muted-foreground',
          // isActive ? 'text-foreground' : 'text-muted-foreground'
        )}
        weight={isActive ? 'fill' : 'regular'}
      />

      {!isCollapsed && (
        <Typography
          variant={isActive ? 'paragraph-small-medium' : 'paragraph-small'}
          as="span"
          className="flex-1 truncate"
        >
          {item.label}
        </Typography>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip content={tooltipContent} show={isHovered}>
        {linkContent}
      </Tooltip>
    );
  }

  return linkContent;
}
