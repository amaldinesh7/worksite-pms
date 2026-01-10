import { View, Text, Pressable } from 'react-native';
import { SafeArea } from '../components/SafeArea';

export default function HomeScreen() {
  return (
    <SafeArea className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-3xl font-bold text-foreground">Worksite</Text>
        <Text className="mt-2 text-foreground-secondary">Construction Project Management</Text>
        <Pressable
          className="mt-4 rounded-lg bg-primary px-6 py-3 active:bg-primary-dark"
          onPress={() => alert('Hello from Worksite!')}
        >
          <Text className="font-semibold text-white">Click Me</Text>
        </Pressable>
      </View>
    </SafeArea>
  );
}
