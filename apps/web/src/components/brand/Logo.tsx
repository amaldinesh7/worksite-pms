/**
 * Worksite Logo Component
 *
 * Provides the Worksite logo in different variants:
 * - icon: Just the symbol (for small spaces, favicons, auth cards)
 * - full-light: Full logo with light text (for dark backgrounds)
 * - full-dark: Full logo with dark text (for light backgrounds)
 */

import { cn } from '@/lib/utils';
import logoIcon from '@/assets/logo-icon.svg';
import logoMainLight from '@/assets/logo-main-light.svg';
import logoMainDark from '@/assets/logo-main-dark.svg';

export type LogoVariant = 'icon' | 'full-light' | 'full-dark';

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-6',
  md: 'h-8',
  lg: 'h-10',
  xl: 'h-16',
};

export function Logo({ variant = 'icon', className, size = 'md' }: LogoProps) {
  const logoSrc = {
    icon: logoIcon,
    'full-light': logoMainLight,
    'full-dark': logoMainDark,
  }[variant];

  const alt = variant === 'icon' ? 'Worksite' : 'Worksite Logo';

  return <img src={logoSrc} alt={alt} className={cn(sizeClasses[size], 'w-auto', className)} />;
}

/**
 * Logo Icon Component
 *
 * Inline SVG version for when you need more control (colors, animations, etc.)
 */
interface LogoIconProps {
  className?: string;
  bgClassName?: string;
  iconClassName?: string;
}

export function LogoIcon({
  className,
  bgClassName = 'fill-primary',
  iconClassName = 'fill-white',
}: LogoIconProps) {
  return (
    <svg viewBox="0 0 230 230" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="229.703" height="229.703" rx="40.6853" className={bgClassName} />
      <path
        d="M158.626 160.278C159.781 161.433 159.781 163.305 158.626 164.46L153.049 170.037C151.894 171.192 150.022 171.192 148.867 170.037L121.826 142.996V184.994C121.826 186.627 120.502 187.951 118.868 187.951H110.982C109.348 187.951 108.024 186.627 108.024 184.994V142.996L80.9832 170.037C79.8282 171.192 77.9556 171.192 76.8006 170.037L71.2239 164.46C70.0689 163.305 70.0689 161.433 71.2239 160.278L112.834 118.668C113.989 117.513 115.861 117.513 117.016 118.668L158.626 160.278ZM166.143 130.825C167.298 131.98 167.298 133.853 166.143 135.008L160.566 140.585C159.411 141.74 157.539 141.74 156.384 140.585L117.016 101.217C115.861 100.062 113.989 100.062 112.834 101.217L73.4661 140.585C72.3111 141.74 70.4385 141.74 69.2835 140.585L63.7068 135.008C62.5518 133.853 62.5518 131.98 63.7068 130.825L112.834 81.6985C113.989 80.5435 115.861 80.5435 117.016 81.6985L166.143 130.825ZM172.798 99.7711C173.953 100.926 173.953 102.799 172.798 103.954L167.221 109.53C166.066 110.685 164.193 110.685 163.038 109.53L117.016 63.5084C115.861 62.3534 113.989 62.3534 112.834 63.5084L66.8116 109.53C65.6566 110.685 63.784 110.685 62.629 109.53L57.0523 103.954C55.8973 102.799 55.8973 100.926 57.0523 99.7711L112.834 43.9898C113.989 42.8348 115.861 42.8348 117.016 43.9898L172.798 99.7711Z"
        className={iconClassName}
      />
    </svg>
  );
}

export default Logo;
