import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import type { NativeSafeAreaViewProps } from 'react-native-safe-area-context';
import type { ComponentType, ReactNode } from 'react';

interface SafeAreaProps extends Omit<NativeSafeAreaViewProps, 'children'> {
  children?: ReactNode;
  className?: string;
}

// Type assertion to fix React 19 compatibility
const SafeAreaViewTyped = RNSafeAreaView as ComponentType<SafeAreaProps>;

/**
 * Typed wrapper for SafeAreaView to fix React 19 compatibility issues.
 * Use this instead of importing directly from react-native-safe-area-context.
 */
export function SafeArea({ children, ...props }: SafeAreaProps) {
  return <SafeAreaViewTyped {...props}>{children}</SafeAreaViewTyped>;
}
