import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Tooltip } from './Tooltip';
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
        <span className="ml-2 px-1.5 py-0.5 rounded bg-neutral-600 text-xs">{item.badge}</span>
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
        'flex items-center rounded-lg',
        'transition-colors duration-150',
        isCollapsed ? 'px-3 py-2 justify-center' : 'px-3 py-2',
        isActive ? 'bg-neutral-100 text-neutral-800' : 'text-neutral-600 hover:bg-neutral-50'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon
        className={cn(
          'h-5 w-5 shrink-0',
          isActive ? 'text-neutral-700' : 'text-neutral-500',
          !isCollapsed && 'mr-3'
        )}
        weight={isActive ? 'fill' : 'regular'}
      />

      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge !== undefined && (
            <span
              className={cn(
                'ml-auto px-2 py-0.5 rounded-full',
                'text-xs font-medium',
                'bg-neutral-200 text-neutral-700'
              )}
            >
              {item.badge}
            </span>
          )}
        </>
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
