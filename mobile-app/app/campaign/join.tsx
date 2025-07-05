
import { useRouter } from 'expo-router';
import { Button, Text, TextInput, View } from 'react-native';

export default function JoinCampaignScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Join Campaign</Text>
      <TextInput placeholder="Campaign Code" />
      <Button title="Join" onPress={() => router.back()} />
    </View>
  );
}
