import {
  HouseIcon,
  FolderIcon,
  UsersFourIcon,
  TagIcon,
  AddressBookIcon,
  ShieldCheckeredIcon
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
  { id: 'my-company', label: 'My Company', icon: HouseIcon, href: '/' },
  { id: 'projects', label: 'Projects', icon: FolderIcon, href: '/projects' },
  { id: 'parties', label: 'Parties', icon: AddressBookIcon, href: '/parties' },
  { id: 'team', label: 'Team Directory', icon: UsersFourIcon, href: '/team' },
];

export const settingsSection: NavSection = {
  id: 'settings',
  title: 'Settings',
  items: [
    { id: 'categories', label: 'Categories', icon: TagIcon, href: '/categories' },
    { id: 'roles', label: 'Roles & Permissions', icon: ShieldCheckeredIcon, href: '/settings/roles' },
  ],
};
