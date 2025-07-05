
import { useRouter } from 'expo-router';
import { Button, Text, TextInput, View } from 'react-native';

export default function CreateCharacterScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Create Character</Text>
      <TextInput placeholder="Character Name" />
      <Button title="Create" onPress={() => router.back()} />
    </View>
  );
}
