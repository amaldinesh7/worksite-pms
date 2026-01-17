import {
  HouseIcon,
  FolderIcon,
  UsersIcon,
  CurrencyDollarIcon,
  MoneyIcon,
  FileTextIcon,
  ChartBarIcon,
  GridFourIcon,
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
  { id: 'team', label: 'Team Directory', icon: UsersIcon, href: '/team', badge: 24 },
  { id: 'credits-hub', label: 'Credits Hub', icon: UsersIcon, href: '/team', badge: 24 },
];

export const managementSection: NavSection = {
  id: 'management',
  title: 'Management',
  items: [
    { id: 'parties', label: 'Parties', icon: UsersIcon, href: '/parties' },
    { id: 'expenses', label: 'Expenses', icon: CurrencyDollarIcon, href: '/expenses' },
    { id: 'payments', label: 'Payments', icon: MoneyIcon, href: '/payments' },
    { id: 'documents', label: 'Documents', icon: FileTextIcon, href: '/documents' },
    { id: 'reports', label: 'Reports', icon: ChartBarIcon, href: '/reports' },
  ],
};

export const settingsSection: NavSection = {
  id: 'settings',
  title: 'Settings',
  items: [{ id: 'categories', label: 'Categories', icon: GridFourIcon, href: '/categories' }],
};
