# UI Architecture

> Auto-generated
> Last generated: 2026-01-25T23:59:34.214Z

---

## Overview

Worksite uses a **hybrid UI architecture** with shared design tokens and platform-specific components:

- **Web**: Tailwind CSS + shadcn/ui
- **Mobile**: NativeWind (Tailwind for React Native)
- **Shared**: Design tokens via `@worksite/ui`

## Design Tokens

Import tokens from `@worksite/ui/tokens`:

```typescript
import { colors, spacing, fontSize, tailwindTheme } from '@worksite/ui/tokens';
```

### Available Exports

- `colors`
- `spacing`
- `fontSize`
- `fontWeight`
- `fontFamily`
- `borderRadius`
- `boxShadow`
- `tailwindTheme`

## Web Components (shadcn/ui)

Located in `apps/web/src/components/ui/`

```typescript
import { Button } from '@/components/ui/button';
```

## Mobile Components (NativeWind)

Use React Native components with Tailwind classes:

```typescript
import { View, Text, Pressable } from 'react-native';

<View className="flex-1 bg-background p-4">
  <Text className="text-foreground font-bold">Hello</Text>
  <Pressable className="bg-primary rounded-lg px-4 py-2">
    <Text className="text-white">Click Me</Text>
  </Pressable>
</View>
```

## Tailwind Configuration

Both web and mobile use the same Tailwind theme from `@worksite/ui`:

```javascript
// tailwind.config.js
import { tailwindTheme } from '@worksite/ui/tokens';

export default {
  theme: {
    extend: tailwindTheme,
  },
};
```
