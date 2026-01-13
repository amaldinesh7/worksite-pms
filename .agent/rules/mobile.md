# Mobile Rules

Mobile-specific rules for the Expo app (apps/mobile).

## UI & Styling

- **React Native + Expo Router**: Framework and navigation.
- **NativeWind ONLY**: All styling must use NativeWind (Tailwind for React Native).
- **No Inline Styles**: Strictly no `style` prop with objects.
- **No StyleSheet.create**: Avoid unless absolutely unavoidable for native-only properties.
- **Reusable Components**: Build UI components to be reusable across different screens.

## Navigation

- **Expo Router**: Follow folder-based routing conventions.
- **Standard Stacks**: Avoid custom navigation implementations unless required.

## Data Management

- **TanStack Query**: Use for all server data fetching.
- **Loading/Error States**: Every screen must handle loading, empty, and error states gracefully.
