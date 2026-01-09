/// <reference types="nativewind/types" />
/// <reference types="react-native-css-interop/types" />

import 'react-native';
import 'react-native-safe-area-context';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface PressableProps {
    className?: string;
  }
}

declare module 'react-native-safe-area-context' {
  interface NativeSafeAreaViewProps {
    className?: string;
  }
}
