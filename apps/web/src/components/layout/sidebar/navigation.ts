import {
  HouseIcon,
  FolderIcon,
  UsersIcon,
  GridFourIcon,
  ShieldIcon,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';

export interface NavItem {
  id: string;
  label: string;
  icon: Icon;
  href: string;
  badge?: number;
}

export interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

export const mainNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: HouseIcon, href: '/' },
  { id: 'projects', label: 'Projects', icon: FolderIcon, href: '/projects', badge: 12 },
  { id: 'parties', label: 'Parties', icon: UsersIcon, href: '/parties' },
  { id: 'team', label: 'Team Directory', icon: UsersIcon, href: '/team' },
];

export const settingsSection: NavSection = {
  id: 'settings',
  title: 'Settings',
  items: [
    { id: 'categories', label: 'Categories', icon: GridFourIcon, href: '/categories' },
    { id: 'roles', label: 'Roles & Permissions', icon: ShieldIcon, href: '/settings/roles' },
  ],
};
