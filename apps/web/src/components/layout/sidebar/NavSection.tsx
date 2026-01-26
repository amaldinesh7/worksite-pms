import { NavItemButton } from './NavItemButton';
import type { NavSection as NavSectionType } from './navigation';

interface NavSectionProps {
  section: NavSectionType;
  isCollapsed: boolean;
  onItemClick?: (href: string) => void;
}

export function NavSection({ section, isCollapsed, onItemClick }: NavSectionProps) {
  return (
    <div className="pt-[17px] border-t border-neutral-200">
      {!isCollapsed && section.title && (
        <h4 className="px-3 text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
          {section.title}
        </h4>
      )}
      <nav className="space-y-1">
        {section.items.map((item) => (
          <NavItemButton
            key={item.id}
            item={item}
            isCollapsed={isCollapsed}
            onClick={onItemClick}
          />
        ))}
      </nav>
    </div>
  );
}
