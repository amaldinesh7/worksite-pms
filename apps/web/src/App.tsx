import { YStack, Text, Button } from '@worksite/ui';

export default function App() {
  return (
    <YStack
      flex={1}
      padding="$4"
      gap="$4"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      backgroundColor="$background"
    >
      <Text fontSize={32} fontWeight="bold" color="$text">
        Welcome to Worksite Web
      </Text>
      <Text fontSize={16} color="$textSecondary">
        Your universal app is running!
      </Text>
      <Button size="$4" theme="active" onPress={() => alert('Hello from Worksite!')}>
        Click Me
      </Button>
    </YStack>
  );
}
