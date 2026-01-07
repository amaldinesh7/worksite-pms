import { Stack } from 'expo-router';
import { TamaguiProvider } from '@worksite/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <TamaguiProvider>
      <QueryClientProvider client={queryClient}>
        <Stack />
      </QueryClientProvider>
    </TamaguiProvider>
  );
}
