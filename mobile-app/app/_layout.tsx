
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Characters' }} />
      <Stack.Screen name="character/create" options={{ title: 'Create Character' }} />
      <Stack.Screen name="campaign/join" options={{ title: 'Join Campaign' }} />
    </Stack>
  );
}
