import {
  House,
  Folder,
  Users,
  CreditCard,
  CurrencyDollar,
  Money,
  ListChecks,
  FileText,
  ChartBar,
  GridFour,
  Gear,
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
  { id: 'dashboard', label: 'Dashboard', icon: House, href: '/' },
  { id: 'projects', label: 'Projects', icon: Folder, href: '/projects', badge: 12 },
  { id: 'team', label: 'Team Directory', icon: Users, href: '/team', badge: 24 },
  { id: 'credits', label: 'Credits Hub', icon: CreditCard, href: '/credits' },
];

export const managementSection: NavSection = {
  id: 'management',
  title: 'Management',
  items: [
    { id: 'expenses', label: 'Expenses', icon: CurrencyDollar, href: '/expenses' },
    { id: 'payments', label: 'Payments', icon: Money, href: '/payments' },
    { id: 'stages', label: 'Stages', icon: ListChecks, href: '/stages' },
    { id: 'documents', label: 'Documents', icon: FileText, href: '/documents' },
    { id: 'reports', label: 'Reports', icon: ChartBar, href: '/reports' },
  ],
};

export const settingsSection: NavSection = {
  id: 'settings',
  title: 'Settings',
  items: [
    { id: 'categories', label: 'Categories', icon: GridFour, href: '/categories' },
    { id: 'settings', label: 'Settings', icon: Gear, href: '/settings' },
  ],
};
