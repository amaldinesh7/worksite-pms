import { useEffect, useRef } from 'react';
import { User, Gear, Bell, SignOut } from '@phosphor-icons/react';

import { useLogout } from '@worksite/data';

import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
}

export function ProfileMenu({ isOpen, onClose, isCollapsed }: ProfileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { logoutUser } = useAuthStore();
  const logoutMutation = useLogout();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Ignore logout API errors - still clear local state
    }
    logoutUser();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={cn(
        'absolute bottom-full mb-2 bg-white border border-neutral-200',
        'rounded-lg shadow-lg py-1 z-50',
        isCollapsed ? 'left-0 right-0' : 'left-3 right-3'
      )}
    >
      <a
        href="/profile"
        className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
      >
        <User className="mr-3 h-4 w-4 text-neutral-500" />
        <span>My Profile</span>
      </a>
      <a
        href="/account-settings"
        className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
      >
        <Gear className="mr-3 h-4 w-4 text-neutral-500" />
        <span>Account Settings</span>
      </a>
      <a
        href="/notifications"
        className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
      >
        <Bell className="mr-3 h-4 w-4 text-neutral-500" />
        <span>Notifications</span>
      </a>
      <div className="border-t border-neutral-200 my-1" />
      <button
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
        className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
      >
        <SignOut className="mr-3 h-4 w-4 text-neutral-500" />
        <span>{logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}</span>
      </button>
    </div>
  );
}
