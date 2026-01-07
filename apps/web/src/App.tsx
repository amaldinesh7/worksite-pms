import { YStack, Text, Button } from '@worksite/ui';

export default function App() {
  return (
    <YStack flex={1} padding="$4" gap="$4">
      <Text fontSize="$8" fontWeight="bold">Welcome to Worksite Web</Text>
      <Button onPress={() => alert('Hello!')}>Click Me</Button>
    </YStack>
  );
}
