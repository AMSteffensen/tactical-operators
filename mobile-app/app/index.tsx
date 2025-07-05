
import { Link } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function CharacterListScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Characters</Text>
      <Link href="/character/create" asChild>
        <Button title="Create Character" />
      </Link>
      <Link href="/campaign/join" asChild>
        <Button title="Join Campaign" />
      </Link>
    </View>
  );
}
